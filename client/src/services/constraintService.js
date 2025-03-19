/**
 * Constraint Service
 * Handles API calls and operations related to class optimization constraints
 */

import api from './api';

/**
 * Constraint types
 */
export const CONSTRAINT_TYPES = {
  MUST_BE_TOGETHER: 'must_be_together',
  MUST_BE_SEPARATE: 'must_be_separate',
  PREFERRED_TEACHER: 'preferred_teacher',
  AVOID_TEACHER: 'avoid_teacher',
  BALANCED_DISTRIBUTION: 'balanced_distribution',
  EQUAL_CLASS_SIZE: 'equal_class_size',
};

/**
 * Constraint priorities
 */
export const CONSTRAINT_PRIORITIES = {
  REQUIRED: 'required',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

const constraintService = {
  /**
   * Get all constraints for a specific academic year and grade
   * @param {string} academicYear - The academic year
   * @param {string} grade - The grade level
   * @returns {Promise} - API response with constraints
   */
  getConstraints: async (academicYear, grade) => {
    try {
      const response = await api.get(`/api/constraints?academicYear=${academicYear}&grade=${grade}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching constraints:', error);
      throw error;
    }
  },

  /**
   * Create a new constraint
   * @param {Object} constraintData - The constraint data
   * @returns {Promise} - API response with created constraint
   */
  createConstraint: async (constraintData) => {
    try {
      const response = await api.post('/api/constraints', constraintData);
      return response.data;
    } catch (error) {
      console.error('Error creating constraint:', error);
      throw error;
    }
  },

  /**
   * Update an existing constraint
   * @param {string} constraintId - The ID of the constraint to update
   * @param {Object} constraintData - The updated constraint data
   * @returns {Promise} - API response with updated constraint
   */
  updateConstraint: async (constraintId, constraintData) => {
    try {
      const response = await api.put(`/api/constraints/${constraintId}`, constraintData);
      return response.data;
    } catch (error) {
      console.error('Error updating constraint:', error);
      throw error;
    }
  },

  /**
   * Delete a constraint
   * @param {string} constraintId - The ID of the constraint to delete
   * @returns {Promise} - API response
   */
  deleteConstraint: async (constraintId) => {
    try {
      const response = await api.delete(`/api/constraints/${constraintId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting constraint:', error);
      throw error;
    }
  },

  /**
   * Validate constraint satisfaction
   * @param {Array} classes - Array of class objects with student lists
   * @param {Array} constraints - Array of constraint objects
   * @returns {Object} - Validation results
   */
  validateConstraints: (classes, constraints) => {
    if (!constraints || constraints.length === 0) {
      return { satisfied: true, violatedConstraints: [] };
    }

    const violatedConstraints = [];
    
    // Create a lookup for finding a student's class
    const studentClassMap = {};
    classes.forEach((cls, classIndex) => {
      cls.students.forEach(student => {
        studentClassMap[student._id] = classIndex;
      });
    });

    // Validate each constraint
    constraints.forEach(constraint => {
      let satisfied = true;
      
      switch (constraint.type) {
        case CONSTRAINT_TYPES.MUST_BE_TOGETHER:
          // Check if the students are in the same class
          const firstStudentClass = studentClassMap[constraint.students[0]];
          satisfied = constraint.students.every(studentId => 
            studentClassMap[studentId] === firstStudentClass
          );
          break;
          
        case CONSTRAINT_TYPES.MUST_BE_SEPARATE:
          // Check if the students are in different classes
          const studentClasses = new Set();
          constraint.students.forEach(studentId => {
            studentClasses.add(studentClassMap[studentId]);
          });
          satisfied = studentClasses.size === constraint.students.length;
          break;
          
        case CONSTRAINT_TYPES.PREFERRED_TEACHER:
          // Check if the student is in the preferred teacher's class
          satisfied = studentClassMap[constraint.student] === constraint.teacherClass;
          break;
          
        case CONSTRAINT_TYPES.AVOID_TEACHER:
          // Check if the student is not in the teacher's class
          satisfied = studentClassMap[constraint.student] !== constraint.teacherClass;
          break;
          
        case CONSTRAINT_TYPES.BALANCED_DISTRIBUTION:
          // This requires more complex analysis of class balance
          // For now, we'll assume it's satisfied
          satisfied = true;
          break;
          
        case CONSTRAINT_TYPES.EQUAL_CLASS_SIZE:
          // Check if class sizes are within acceptable range
          const sizes = classes.map(cls => cls.students.length);
          const min = Math.min(...sizes);
          const max = Math.max(...sizes);
          satisfied = (max - min) <= 2; // Allow difference of at most 2 students
          break;
          
        default:
          console.warn(`Unknown constraint type: ${constraint.type}`);
          satisfied = true;
      }
      
      if (!satisfied) {
        violatedConstraints.push({
          ...constraint,
          message: constraintService.generateViolationMessage(constraint, classes)
        });
      }
    });
    
    return {
      satisfied: violatedConstraints.length === 0,
      violatedConstraints
    };
  },

  /**
   * Generate a human-readable message explaining the constraint violation
   * @param {Object} constraint - The violated constraint
   * @param {Array} classes - Array of class objects
   * @returns {string} - Violation message
   */
  generateViolationMessage: (constraint, classes) => {
    switch (constraint.type) {
      case CONSTRAINT_TYPES.MUST_BE_TOGETHER:
        return `Students must be placed in the same class (${constraint.reason || 'Required'})`;
        
      case CONSTRAINT_TYPES.MUST_BE_SEPARATE:
        return `Students must be placed in different classes (${constraint.reason || 'Required'})`;
        
      case CONSTRAINT_TYPES.PREFERRED_TEACHER:
        return `Student should be placed with preferred teacher (${constraint.reason || 'Preference'})`;
        
      case CONSTRAINT_TYPES.AVOID_TEACHER:
        return `Student should not be placed with specific teacher (${constraint.reason || 'Preference'})`;
        
      case CONSTRAINT_TYPES.BALANCED_DISTRIBUTION:
        return `Classes should have balanced distribution for ${constraint.factor} (${constraint.reason || 'Balance'})`;
        
      case CONSTRAINT_TYPES.EQUAL_CLASS_SIZE:
        return `Class sizes should be approximately equal (${constraint.reason || 'Balance'})`;
        
      default:
        return `Constraint violation: ${constraint.type}`;
    }
  },

  /**
   * Apply constraints to optimize class assignments
   * @param {Array} students - Array of student objects
   * @param {Array} constraints - Array of constraint objects
   * @param {number} numClasses - Number of classes to create
   * @returns {Array} - Optimized class assignments
   */
  applyConstraints: (students, constraints, numClasses) => {
    // Clone the students array to avoid modifying the original
    const studentsCopy = [...students];
    
    // Initialize classes
    const classes = Array.from({ length: numClasses }, () => []);
    
    // Group students by must-be-together constraints
    const studentGroups = [];
    const processedStudents = new Set();
    
    // First, handle must-be-together constraints
    constraints
      .filter(c => c.type === CONSTRAINT_TYPES.MUST_BE_TOGETHER)
      .forEach(constraint => {
        const group = [];
        constraint.students.forEach(studentId => {
          const student = studentsCopy.find(s => s._id === studentId);
          if (student && !processedStudents.has(studentId)) {
            group.push(student);
            processedStudents.add(studentId);
          }
        });
        
        if (group.length > 0) {
          studentGroups.push(group);
        }
      });
    
    // Add remaining individual students
    studentsCopy.forEach(student => {
      if (!processedStudents.has(student._id)) {
        studentGroups.push([student]);
        processedStudents.add(student._id);
      }
    });
    
    // Sort groups by size (descending) to place larger groups first
    studentGroups.sort((a, b) => b.length - a.length);
    
    // Place groups into classes
    studentGroups.forEach(group => {
      // Find the class with the smallest number of students
      const smallestClass = classes.reduce(
        (min, current, index) => 
          current.length < classes[min].length ? index : min,
        0
      );
      
      // Add the group to the smallest class
      classes[smallestClass].push(...group);
    });
    
    // Apply must-be-separate constraints
    const mustBeSeparateConstraints = constraints.filter(
      c => c.type === CONSTRAINT_TYPES.MUST_BE_SEPARATE
    );
    
    // Simple swapping to try to satisfy must-be-separate constraints
    // This is a greedy approach and may not satisfy all constraints
    mustBeSeparateConstraints.forEach(constraint => {
      // Find classes containing the students in this constraint
      const studentClasses = {};
      constraint.students.forEach(studentId => {
        classes.forEach((classStudents, classIndex) => {
          const studentInClass = classStudents.find(s => s._id === studentId);
          if (studentInClass) {
            studentClasses[studentId] = classIndex;
          }
        });
      });
      
      // Check if students are in the same class
      const classIndices = Object.values(studentClasses);
      const uniqueClasses = new Set(classIndices);
      
      if (uniqueClasses.size < Object.keys(studentClasses).length) {
        // We have students who need to be separated
        // Try to move them to different classes
        const studentsToMove = [];
        const classStudentCounts = {};
        
        // Count students per class
        Object.entries(studentClasses).forEach(([studentId, classIndex]) => {
          if (!classStudentCounts[classIndex]) {
            classStudentCounts[classIndex] = [];
          }
          classStudentCounts[classIndex].push(studentId);
        });
        
        // For each class with multiple students from the constraint,
        // keep one and move the rest
        Object.entries(classStudentCounts).forEach(([classIndex, studentIds]) => {
          if (studentIds.length > 1) {
            // Keep the first student, move the rest
            for (let i = 1; i < studentIds.length; i++) {
              studentsToMove.push(studentIds[i]);
            }
          }
        });
        
        // Try to find a new class for each student to move
        studentsToMove.forEach(studentId => {
          const currentClassIndex = studentClasses[studentId];
          
          // Find all classes that don't have students from this constraint
          const availableClasses = [];
          for (let i = 0; i < numClasses; i++) {
            if (!Object.values(studentClasses).includes(i) || 
                (classStudentCounts[i] && classStudentCounts[i].length === 1 && classStudentCounts[i][0] !== studentId)) {
              availableClasses.push(i);
            }
          }
          
          if (availableClasses.length > 0) {
            // Sort available classes by size (ascending)
            availableClasses.sort((a, b) => classes[a].length - classes[b].length);
            
            // Find the student in the current class
            const studentIndex = classes[currentClassIndex].findIndex(s => s._id === studentId);
            if (studentIndex !== -1) {
              // Move student to the smallest available class
              const student = classes[currentClassIndex].splice(studentIndex, 1)[0];
              classes[availableClasses[0]].push(student);
            }
          }
        });
      }
    });
    
    return classes;
  }
};

export default constraintService; 