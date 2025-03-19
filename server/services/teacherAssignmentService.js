/**
 * Teacher Assignment Service
 * Handles the logic for assigning teachers to optimized classes
 */

const TeacherAssignment = require('../models/TeacherAssignment');
const Teacher = require('../models/Teacher');
const TeacherPreference = require('../models/TeacherPreference');
// Import mock data for development
const mockTeacherPreferences = require('../data/mockTeacherPreferences');
const { ObjectId } = require('mongoose').Types;

// Use mock data flag - set to true for development, false for production
const USE_MOCK_DATA = true;

/**
 * Get available teachers with their preferences for a specific academic year and grade
 */
const getAvailableTeachers = async (academicYear, grade) => {
  if (USE_MOCK_DATA) {
    return mockTeacherPreferences.filter(tp => 
      tp.academicYear === academicYear && tp.grade === grade
    ).map(tp => ({
      id: tp.teacherId,
      name: tp.teacherName,
      teachingStyle: tp.teachingStyle,
      classroomEnvironment: tp.classroomEnvironment,
      specialtyAreas: tp.specialtyAreas,
      studentPreferences: tp.studentPreferences,
      classComposition: tp.classComposition,
      specialEducationPreferences: tp.specialEducationPreferences,
      additionalConsiderations: tp.additionalConsiderations
    }));
  }
  
  try {
    // Find teachers with approved preferences for the academic year and grade
    const teacherPreferences = await TeacherPreference.find({
      academicYear,
      grade,
      status: 'approved'
    }).populate('teacherId', 'name email');
    
    // Format and return the data
    return teacherPreferences.map(tp => ({
      id: tp.teacherId._id,
      name: tp.teacherId.name,
      teachingStyle: tp.teachingStyle,
      classroomEnvironment: tp.classroomEnvironment,
      specialtyAreas: tp.specialtyAreas,
      studentPreferences: tp.studentPreferences,
      classComposition: tp.classComposition,
      specialEducationPreferences: tp.specialEducationPreferences,
      additionalConsiderations: tp.additionalConsiderations
    }));
  } catch (error) {
    console.error('Error fetching available teachers:', error);
    return [];
  }
};

/**
 * Calculate compatibility score between a teacher and a class
 * @param {Object} teacher - Teacher data with preferences
 * @param {Object} classData - Class composition data
 * @returns {number} - Compatibility score (0-100)
 */
const calculateCompatibilityScore = (teacher, classData) => {
  if (!teacher || !teacher.preferences || !classData || !classData.students) {
    return 0;
  }
  
  const preferences = teacher.preferences;
  const students = classData.students;
  let totalScore = 0;
  let totalWeight = 0;
  
  // Class size match score (weight: 20)
  const classSizeWeight = 20;
  const classSizeScore = calculateClassSizeScore(
    students.length,
    preferences.classComposition.preferredClassSize,
    preferences.classComposition.minimumClassSize,
    preferences.classComposition.maximumClassSize
  );
  totalScore += classSizeScore * classSizeWeight;
  totalWeight += classSizeWeight;
  
  // Academic distribution score (weight: 25)
  const academicWeight = 25;
  const academicScore = calculateDistributionScore(
    getAcademicDistribution(students),
    preferences.studentPreferences.academicDistribution
  );
  totalScore += academicScore * academicWeight;
  totalWeight += academicWeight;
  
  // Behavioral distribution score (weight: 25)
  const behavioralWeight = 25;
  const behavioralScore = calculateDistributionScore(
    getBehavioralDistribution(students),
    preferences.studentPreferences.behavioralDistribution
  );
  totalScore += behavioralScore * behavioralWeight;
  totalWeight += behavioralWeight;
  
  // Special education match score (weight: 15)
  const specialEdWeight = 15;
  const specialEdScore = calculateSpecialEducationScore(
    students,
    preferences.specialEducationPreferences
  );
  totalScore += specialEdScore * specialEdWeight;
  totalWeight += specialEdWeight;
  
  // Gender balance score (weight: 15)
  const genderWeight = 15;
  const genderScore = calculateGenderBalanceScore(
    getGenderDistribution(students),
    preferences.classComposition.genderBalance
  );
  totalScore += genderScore * genderWeight;
  totalWeight += genderWeight;
  
  // Calculate final weighted score (0-100)
  const finalScore = totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0;
  return Math.round(finalScore);
};

/**
 * Calculate score for class size match (0-1)
 */
const calculateClassSizeScore = (actualSize, preferredSize, minSize, maxSize) => {
  // If outside min/max bounds, penalty is severe
  if (actualSize < minSize || actualSize > maxSize) {
    const distanceFromBound = Math.min(
      Math.abs(actualSize - minSize),
      Math.abs(actualSize - maxSize)
    );
    return Math.max(0, 1 - (distanceFromBound / 5)); // -0.2 per student out of bounds
  }
  
  // If within bounds but not preferred, smaller penalty
  const distanceFromPreferred = Math.abs(actualSize - preferredSize);
  return Math.max(0, 1 - (distanceFromPreferred / 10)); // -0.1 per student from preferred
};

/**
 * Calculate score for distribution match (academic/behavioral) (0-1)
 */
const calculateDistributionScore = (actualDistribution, preferredDistribution) => {
  let totalDeviation = 0;
  let count = 0;
  
  // Calculate deviation from preferred distribution
  Object.keys(preferredDistribution).forEach(level => {
    if (preferredDistribution[level].preferred !== undefined && 
        actualDistribution[level] !== undefined) {
      const deviation = Math.abs(
        actualDistribution[level] - preferredDistribution[level].preferred
      );
      totalDeviation += deviation;
      count++;
    }
  });
  
  // Check if any maximums are exceeded
  let maxPenalty = 0;
  Object.keys(preferredDistribution).forEach(level => {
    if (preferredDistribution[level].maximum !== undefined && 
        actualDistribution[level] !== undefined &&
        actualDistribution[level] > preferredDistribution[level].maximum) {
      const excessPercentage = actualDistribution[level] - preferredDistribution[level].maximum;
      maxPenalty += excessPercentage * 0.02; // 2% penalty per percentage point over max
    }
  });
  
  // Calculate average deviation and convert to score
  const avgDeviation = count > 0 ? totalDeviation / count : 0;
  const score = Math.max(0, 1 - (avgDeviation / 100) - maxPenalty);
  return score;
};

/**
 * Calculate score for special education needs match (0-1)
 */
const calculateSpecialEducationScore = (students, specialEdPreferences) => {
  if (!specialEdPreferences) return 0.5; // Neutral score if no preferences
  
  const iepCount = students.filter(s => s.hasIEP).length;
  const plan504Count = students.filter(s => s.has504Plan).length;
  
  let iepScore = 1;
  let plan504Score = 1;
  
  // Check IEP students against max preference
  if (specialEdPreferences.maxIEPStudents !== undefined) {
    if (iepCount > specialEdPreferences.maxIEPStudents) {
      const excess = iepCount - specialEdPreferences.maxIEPStudents;
      iepScore = Math.max(0, 1 - (excess * 0.2)); // -0.2 per student over max
    }
  }
  
  // Check 504 plan students against max preference
  if (specialEdPreferences.max504Students !== undefined) {
    if (plan504Count > specialEdPreferences.max504Students) {
      const excess = plan504Count - specialEdPreferences.max504Students;
      plan504Score = Math.max(0, 1 - (excess * 0.2)); // -0.2 per student over max
    }
  }
  
  // Combine scores (equal weight)
  return (iepScore + plan504Score) / 2;
};

/**
 * Calculate score for gender balance match (0-1)
 */
const calculateGenderBalanceScore = (actualDistribution, genderPreference) => {
  if (!genderPreference || !genderPreference.preferredRatio) {
    return 0.5; // Neutral score if no preference
  }
  
  const preferredRatio = genderPreference.preferredRatio;
  let totalDeviation = 0;
  let count = 0;
  
  // Calculate deviation from preferred gender distribution
  Object.keys(preferredRatio).forEach(gender => {
    if (preferredRatio[gender] !== undefined && actualDistribution[gender] !== undefined) {
      const deviation = Math.abs(actualDistribution[gender] - preferredRatio[gender]);
      totalDeviation += deviation;
      count++;
    }
  });
  
  // Calculate average deviation and convert to score
  const avgDeviation = count > 0 ? totalDeviation / count : 0;
  
  // Consider importance of gender balance to the teacher
  const importance = genderPreference.importance || 3;
  const importanceFactor = importance / 5;
  
  // Calculate score with importance consideration
  // Higher importance means more significant impact on score (both positive and negative)
  const baseScore = Math.max(0, 1 - (avgDeviation / 100));
  const scoreWithImportance = 0.5 + (baseScore - 0.5) * importanceFactor;
  
  return scoreWithImportance;
};

/**
 * Get academic distribution of students in a class
 * @param {Array} students - Array of student objects
 * @returns {Object} - Distribution percentages
 */
const getAcademicDistribution = (students) => {
  if (!students || students.length === 0) {
    return {
      advanced: 0,
      proficient: 0,
      developing: 0,
      needs_support: 0
    };
  }
  
  const totalStudents = students.length;
  const categories = {
    advanced: 0,
    proficient: 0,
    developing: 0,
    needs_support: 0
  };
  
  students.forEach(student => {
    // Map academic level (1-5) to categories
    const level = student.academicLevel || 3;
    if (level >= 5) {
      categories.advanced++;
    } else if (level === 4) {
      categories.proficient++;
    } else if (level === 3) {
      categories.developing++;
    } else {
      categories.needs_support++;
    }
  });
  
  // Convert to percentages
  Object.keys(categories).forEach(key => {
    categories[key] = (categories[key] / totalStudents) * 100;
  });
  
  return categories;
};

/**
 * Get behavioral distribution of students in a class
 * @param {Array} students - Array of student objects
 * @returns {Object} - Distribution percentages
 */
const getBehavioralDistribution = (students) => {
  if (!students || students.length === 0) {
    return {
      excellent: 0,
      good: 0,
      fair: 0,
      needs_improvement: 0
    };
  }
  
  const totalStudents = students.length;
  const categories = {
    excellent: 0,
    good: 0,
    fair: 0,
    needs_improvement: 0
  };
  
  students.forEach(student => {
    // Map behavioral level (1-5) to categories
    const level = student.behavioralLevel || 3;
    if (level >= 5) {
      categories.excellent++;
    } else if (level === 4) {
      categories.good++;
    } else if (level === 3) {
      categories.fair++;
    } else {
      categories.needs_improvement++;
    }
  });
  
  // Convert to percentages
  Object.keys(categories).forEach(key => {
    categories[key] = (categories[key] / totalStudents) * 100;
  });
  
  return categories;
};

/**
 * Get gender distribution of students in a class
 * @param {Array} students - Array of student objects
 * @returns {Object} - Distribution percentages
 */
const getGenderDistribution = (students) => {
  if (!students || students.length === 0) {
    return {
      male: 0,
      female: 0,
      other: 0
    };
  }
  
  const totalStudents = students.length;
  const genders = {
    male: 0,
    female: 0,
    other: 0
  };
  
  students.forEach(student => {
    const gender = student.gender ? student.gender.toLowerCase() : 'other';
    if (gender === 'male') {
      genders.male++;
    } else if (gender === 'female') {
      genders.female++;
    } else {
      genders.other++;
    }
  });
  
  // Convert to percentages
  Object.keys(genders).forEach(key => {
    genders[key] = (genders[key] / totalStudents) * 100;
  });
  
  return genders;
};

/**
 * Assign teachers to classes based on compatibility
 * @param {Array} teachers - Array of available teachers with preferences
 * @param {Array} classes - Array of optimized classes
 * @returns {Array} - Classes with assigned teachers and compatibility scores
 */
const assignTeachersToClasses = (teachers, classes) => {
  if (!teachers || !classes || teachers.length === 0 || classes.length === 0) {
    return classes;
  }
  
  // Calculate compatibility scores for all teacher-class combinations
  const compatibilityMatrix = [];
  
  teachers.forEach(teacher => {
    const teacherScores = [];
    
    classes.forEach(classData => {
      const score = calculateCompatibilityScore(teacher, classData);
      teacherScores.push({
        classId: classData.id || classData._id,
        score
      });
    });
    
    compatibilityMatrix.push({
      teacherId: teacher.id,
      teacher,
      scores: teacherScores
    });
  });
  
  // Use Hungarian algorithm to find optimal assignment (simplified version)
  // For small number of classes/teachers, we can use a greedy approach
  const assignedTeachers = new Set();
  const assignedClasses = new Set();
  const assignments = [];
  
  // Sort all possible assignments by score (descending)
  const allAssignments = [];
  compatibilityMatrix.forEach(teacherData => {
    teacherData.scores.forEach(classScore => {
      allAssignments.push({
        teacherId: teacherData.teacherId,
        teacher: teacherData.teacher,
        classId: classScore.classId,
        score: classScore.score
      });
    });
  });
  
  allAssignments.sort((a, b) => b.score - a.score);
  
  // Assign teachers to classes greedily based on highest compatibility scores
  allAssignments.forEach(assignment => {
    if (
      !assignedTeachers.has(assignment.teacherId) &&
      !assignedClasses.has(assignment.classId)
    ) {
      assignments.push(assignment);
      assignedTeachers.add(assignment.teacherId);
      assignedClasses.add(assignment.classId);
    }
  });
  
  // Add teacher assignments to classes
  const classesWithTeachers = classes.map(classData => {
    const assignment = assignments.find(
      a => a.classId === (classData.id || classData._id)
    );
    
    if (assignment) {
      return {
        ...classData,
        teacher: {
          id: assignment.teacherId,
          name: assignment.teacher.name,
          email: assignment.teacher.email,
          compatibilityScore: assignment.score
        }
      };
    }
    
    return classData;
  });
  
  return classesWithTeachers;
};

/**
 * Get recommended teacher assignments for classes
 * @param {string} academicYear - Academic year
 * @param {number} grade - Grade level
 * @param {Array} optimizedClasses - Array of optimized classes
 * @returns {Promise<Object>} - Optimization results with teacher assignments
 */
const getTeacherAssignments = async (academicYear, grade, optimizedClasses) => {
  try {
    const teachers = await getAvailableTeachers(academicYear, grade);
    
    if (!teachers || teachers.length === 0) {
      return {
        classes: optimizedClasses,
        message: 'No teacher preferences found for this grade and academic year.'
      };
    }
    
    const classesWithTeachers = assignTeachersToClasses(teachers, optimizedClasses);
    
    // Calculate overall compatibility score
    const assignedClasses = classesWithTeachers.filter(c => c.teacher);
    let overallCompatibility = 0;
    
    if (assignedClasses.length > 0) {
      overallCompatibility = assignedClasses.reduce(
        (sum, c) => sum + (c.teacher.compatibilityScore || 0), 
        0
      ) / assignedClasses.length;
    }
    
    return {
      classes: classesWithTeachers,
      teacherAssignmentScore: Math.round(overallCompatibility),
      assignedTeacherCount: assignedClasses.length,
      totalTeacherCount: teachers.length
    };
  } catch (error) {
    console.error('Error assigning teachers to classes:', error);
    throw error;
  }
};

module.exports = {
  getAvailableTeachers,
  calculateCompatibilityScore,
  assignTeachersToClasses,
  getTeacherAssignments
}; 