/**
 * AI Service for Class Harmony
 * Provides AI-powered insights and suggestions for class optimization
 */

// Integration point for GPT/AI services for generating insights

/**
 * Generate insights for class optimization
 * @param {Object} classData - Current class configuration data
 * @returns {Promise<Object>} - AI insights
 */
const generateInsights = async (classData) => {
  // In a production environment, this would connect to an AI service like OpenAI
  // For now, we'll use a rule-based approach to generate insights
  
  let balanceScore = 70; // Default balance score
  const insights = [];
  const classes = classData.classes || [];
  
  // Calculate overall balance score if metrics are provided
  if (classData.metrics) {
    const metrics = classData.metrics;
    const weights = {
      genderBalance: 0.2,
      academicBalance: 0.25,
      behavioralBalance: 0.25,
      specialNeedsDistribution: 0.2,
      parentRequestsFulfilled: 0.1
    };
    
    let weightedSum = 0;
    let totalWeight = 0;
    
    Object.keys(weights).forEach(key => {
      if (metrics[key] !== undefined) {
        weightedSum += metrics[key] * weights[key];
        totalWeight += weights[key];
      }
    });
    
    balanceScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 70;
  }
  
  // Analyze gender balance
  classes.forEach((classObj, index) => {
    const className = classObj.name || `Class ${index + 1}`;
    const students = classObj.students || [];
    
    if (students.length === 0) return;
    
    // Gender balance analysis
    const genderCounts = {
      male: 0,
      female: 0,
      other: 0
    };
    
    students.forEach(student => {
      if (student.gender === 'male') genderCounts.male++;
      else if (student.gender === 'female') genderCounts.female++;
      else genderCounts.other++;
    });
    
    const totalStudents = students.length;
    const malePercentage = (genderCounts.male / totalStudents) * 100;
    const femalePercentage = (genderCounts.female / totalStudents) * 100;
    
    // Check for significant gender imbalance
    if (Math.abs(malePercentage - femalePercentage) > 20) {
      insights.push({
        type: 'gender',
        message: `${className} has a gender imbalance with ${Math.round(malePercentage)}% male and ${Math.round(femalePercentage)}% female students.`,
        severity: 'medium',
        affectedClasses: [className]
      });
    }
    
    // Academic balance analysis
    const academicLevels = {
      1: 0, // Below grade level
      2: 0, // Approaching grade level
      3: 0, // At grade level
      4: 0, // Above grade level
      5: 0  // Well above grade level
    };
    
    students.forEach(student => {
      if (student.academicLevel >= 1 && student.academicLevel <= 5) {
        academicLevels[student.academicLevel]++;
      }
    });
    
    // Check for high concentration of academic levels
    const highAcademicConcentration = (academicLevels[4] + academicLevels[5]) / totalStudents > 0.7;
    const lowAcademicConcentration = (academicLevels[1] + academicLevels[2]) / totalStudents > 0.7;
    
    if (highAcademicConcentration) {
      insights.push({
        type: 'academic',
        message: `${className} has a high concentration of above-grade-level students.`,
        severity: 'medium',
        affectedClasses: [className]
      });
    } else if (lowAcademicConcentration) {
      insights.push({
        type: 'academic',
        message: `${className} has a high concentration of below-grade-level students.`,
        severity: 'medium',
        affectedClasses: [className]
      });
    }
    
    // Behavioral needs analysis
    const behavioralLevels = {
      1: 0, // Significant challenges
      2: 0, // Some challenges
      3: 0, // Average
      4: 0, // Good
      5: 0  // Excellent
    };
    
    students.forEach(student => {
      if (student.behavioralLevel >= 1 && student.behavioralLevel <= 5) {
        behavioralLevels[student.behavioralLevel]++;
      }
    });
    
    // Check for high concentration of behavioral challenges
    const highBehavioralChallenges = (behavioralLevels[1] + behavioralLevels[2]) / totalStudents > 0.4;
    
    if (highBehavioralChallenges) {
      insights.push({
        type: 'behavioral',
        message: `${className} has a high concentration of students with behavioral challenges.`,
        severity: 'high',
        affectedClasses: [className]
      });
    }
    
    // Special needs analysis
    const specialNeedsCount = students.filter(student => student.specialNeeds).length;
    const specialNeedsPercentage = (specialNeedsCount / totalStudents) * 100;
    
    if (specialNeedsPercentage > 30) {
      insights.push({
        type: 'special_needs',
        message: `${className} has a high concentration of students with special needs (${Math.round(specialNeedsPercentage)}%).`,
        severity: 'medium',
        affectedClasses: [className]
      });
    }
  });
  
  // Parent requests analysis
  if (classData.metrics && classData.metrics.parentRequestsFulfilled !== undefined) {
    const fulfillmentRate = classData.metrics.parentRequestsFulfilled;
    
    if (fulfillmentRate < 50) {
      insights.push({
        type: 'parent_requests',
        message: `Only ${Math.round(fulfillmentRate)}% of parent requests have been fulfilled.`,
        severity: 'medium',
        affectedClasses: []
      });
    } else if (fulfillmentRate >= 80) {
      insights.push({
        type: 'parent_requests',
        message: `${Math.round(fulfillmentRate)}% of parent requests have been fulfilled.`,
        severity: 'info',
        affectedClasses: []
      });
    }
  }
  
  // If no issues found, add positive insights
  if (insights.length === 0) {
    insights.push({
      type: 'general',
      message: 'All classes are well-balanced across all metrics.',
      severity: 'info',
      affectedClasses: []
    });
  }
  
  // Generate summary
  let summary = '';
  
  if (balanceScore >= 85) {
    summary = 'Classes are excellently balanced with optimal distribution of students.';
  } else if (balanceScore >= 70) {
    summary = 'Classes are generally well-balanced, with some minor opportunities for improvement.';
  } else if (balanceScore >= 50) {
    summary = 'Classes have moderate balance issues that could be addressed to improve overall distribution.';
  } else {
    summary = 'Classes have significant balance issues that require attention.';
  }
  
  return {
    balanceScore,
    insights,
    summary
  };
};

/**
 * Generate suggestions for improving class placement
 * @param {Object} classData - Current class configuration data
 * @param {string} classId - Target class ID for suggestions
 * @returns {Promise<Object>} - AI suggestions
 */
const generateSuggestions = async (classData, classId) => {
  const classes = classData.classes || [];
  const suggestions = [];
  const constraints = [];
  
  // Skip if we don't have at least two classes to work with
  if (classes.length < 2) {
    return {
      suggestions: [],
      constraints: [],
      summary: 'Unable to generate suggestions with fewer than two classes.'
    };
  }
  
  // Helper function to find student by id
  const findStudentById = (studentId) => {
    for (const cls of classes) {
      for (const student of cls.students) {
        if (student._id === studentId || student.id === studentId) {
          return { student, class: cls };
        }
      }
    }
    return null;
  };
  
  // Check class data for potential swaps to improve balance
  for (let i = 0; i < classes.length; i++) {
    const classA = classes[i];
    const classAName = classA.name || `Class ${i + 1}`;
    const studentsA = classA.students || [];
    
    for (let j = i + 1; j < classes.length; j++) {
      const classB = classes[j];
      const classBName = classB.name || `Class ${j + 1}`;
      const studentsB = classB.students || [];
      
      // Skip if class size difference is too large
      if (Math.abs(studentsA.length - studentsB.length) > 3) continue;
      
      // Look for gender balance improvements
      const genderA = { male: 0, female: 0, other: 0 };
      const genderB = { male: 0, female: 0, other: 0 };
      
      studentsA.forEach(s => {
        if (s.gender === 'male') genderA.male++;
        else if (s.gender === 'female') genderA.female++;
        else genderA.other++;
      });
      
      studentsB.forEach(s => {
        if (s.gender === 'male') genderB.male++;
        else if (s.gender === 'female') genderB.female++;
        else genderB.other++;
      });
      
      // If one class has more males and the other more females, suggest a swap
      if ((genderA.male > genderA.female && genderB.female > genderB.male) ||
          (genderA.female > genderA.male && genderB.male > genderB.female)) {
        
        // Find a male in class A and a female in class B (or vice versa)
        const maleInA = studentsA.find(s => s.gender === 'male');
        const femaleInB = studentsB.find(s => s.gender === 'female');
        
        if (maleInA && femaleInB && 
            !hasConstraint(maleInA, classData.constraints) && 
            !hasConstraint(femaleInB, classData.constraints)) {
          
          suggestions.push({
            type: 'swap',
            studentA: {
              id: maleInA._id || maleInA.id,
              name: `${maleInA.firstName} ${maleInA.lastName}`,
              currentClass: classAName
            },
            studentB: {
              id: femaleInB._id || femaleInB.id,
              name: `${femaleInB.firstName} ${femaleInB.lastName}`,
              currentClass: classBName
            },
            reason: 'This swap would improve gender balance in both classes.',
            impact: {
              genderBalance: '+8%',
              academicBalance: '0%',
              behavioralBalance: '0%',
              specialNeedsDistribution: '0%',
              parentRequestsFulfilled: '0%'
            }
          });
          continue;
        }
        
        const femaleInA = studentsA.find(s => s.gender === 'female');
        const maleInB = studentsB.find(s => s.gender === 'male');
        
        if (femaleInA && maleInB &&
            !hasConstraint(femaleInA, classData.constraints) && 
            !hasConstraint(maleInB, classData.constraints)) {
          
          suggestions.push({
            type: 'swap',
            studentA: {
              id: femaleInA._id || femaleInA.id,
              name: `${femaleInA.firstName} ${femaleInA.lastName}`,
              currentClass: classAName
            },
            studentB: {
              id: maleInB._id || maleInB.id,
              name: `${maleInB.firstName} ${maleInB.lastName}`,
              currentClass: classBName
            },
            reason: 'This swap would improve gender balance in both classes.',
            impact: {
              genderBalance: '+8%',
              academicBalance: '0%',
              behavioralBalance: '0%',
              specialNeedsDistribution: '0%',
              parentRequestsFulfilled: '0%'
            }
          });
          continue;
        }
      }
      
      // Look for academic balance improvements
      const academicLevelA = studentsA.reduce((sum, s) => sum + (s.academicLevel || 3), 0) / studentsA.length;
      const academicLevelB = studentsB.reduce((sum, s) => sum + (s.academicLevel || 3), 0) / studentsB.length;
      
      // If academic levels are significantly different, suggest a swap
      if (Math.abs(academicLevelA - academicLevelB) > 0.5) {
        // Determine which class has higher academic level
        const higherClass = academicLevelA > academicLevelB ? classA : classB;
        const lowerClass = academicLevelA > academicLevelB ? classB : classA;
        const higherClassName = academicLevelA > academicLevelB ? classAName : classBName;
        const lowerClassName = academicLevelA > academicLevelB ? classBName : classAName;
        
        // Find a high academic student in the higher class
        const highStudent = (academicLevelA > academicLevelB ? studentsA : studentsB)
          .find(s => (s.academicLevel || 3) >= 4 && !hasConstraint(s, classData.constraints));
        
        // Find a low academic student in the lower class
        const lowStudent = (academicLevelA > academicLevelB ? studentsB : studentsA)
          .find(s => (s.academicLevel || 3) <= 2 && !hasConstraint(s, classData.constraints));
        
        if (highStudent && lowStudent) {
          suggestions.push({
            type: 'swap',
            studentA: {
              id: highStudent._id || highStudent.id,
              name: `${highStudent.firstName} ${highStudent.lastName}`,
              currentClass: higherClassName
            },
            studentB: {
              id: lowStudent._id || lowStudent.id,
              name: `${lowStudent.firstName} ${lowStudent.lastName}`,
              currentClass: lowerClassName
            },
            reason: 'This swap would improve academic balance between the classes.',
            impact: {
              genderBalance: '0%',
              academicBalance: '+10%',
              behavioralBalance: '0%',
              specialNeedsDistribution: '0%',
              parentRequestsFulfilled: '0%'
            }
          });
          continue;
        }
      }
      
      // Look for behavioral balance improvements
      const behavioralLevelA = studentsA.reduce((sum, s) => sum + (s.behavioralLevel || 3), 0) / studentsA.length;
      const behavioralLevelB = studentsB.reduce((sum, s) => sum + (s.behavioralLevel || 3), 0) / studentsB.length;
      
      // If behavioral levels are significantly different, suggest a swap
      if (Math.abs(behavioralLevelA - behavioralLevelB) > 0.5) {
        // Determine which class has more behavioral challenges
        const challengingClass = behavioralLevelA < behavioralLevelB ? classA : classB;
        const betterClass = behavioralLevelA < behavioralLevelB ? classB : classA;
        const challengingClassName = behavioralLevelA < behavioralLevelB ? classAName : classBName;
        const betterClassName = behavioralLevelA < behavioralLevelB ? classBName : classAName;
        
        // Find a challenging student in the challenging class
        const challengingStudent = (behavioralLevelA < behavioralLevelB ? studentsA : studentsB)
          .find(s => (s.behavioralLevel || 3) <= 2 && !hasConstraint(s, classData.constraints));
        
        // Find a well-behaved student in the better-behaved class
        const betterStudent = (behavioralLevelA < behavioralLevelB ? studentsB : studentsA)
          .find(s => (s.behavioralLevel || 3) >= 4 && !hasConstraint(s, classData.constraints));
        
        if (challengingStudent && betterStudent) {
          suggestions.push({
            type: 'swap',
            studentA: {
              id: challengingStudent._id || challengingStudent.id,
              name: `${challengingStudent.firstName} ${challengingStudent.lastName}`,
              currentClass: challengingClassName
            },
            studentB: {
              id: betterStudent._id || betterStudent.id,
              name: `${betterStudent.firstName} ${betterStudent.lastName}`,
              currentClass: betterClassName
            },
            reason: 'This swap would improve behavioral balance between the classes.',
            impact: {
              genderBalance: '0%',
              academicBalance: '0%',
              behavioralBalance: '+12%',
              specialNeedsDistribution: '0%',
              parentRequestsFulfilled: '0%'
            }
          });
          continue;
        }
      }
      
      // Look for special needs distribution improvements
      const specialNeedsA = studentsA.filter(s => s.specialNeeds).length;
      const specialNeedsB = studentsB.filter(s => s.specialNeeds).length;
      
      // If special needs distribution is uneven, suggest a move (not a swap)
      if (Math.abs(specialNeedsA - specialNeedsB) >= 2) {
        // Determine which class has more special needs students
        const moreSpecialNeedsClass = specialNeedsA > specialNeedsB ? classA : classB;
        const lessSpecialNeedsClass = specialNeedsA > specialNeedsB ? classB : classA;
        const moreSpecialNeedsClassName = specialNeedsA > specialNeedsB ? classAName : classBName;
        const lessSpecialNeedsClassName = specialNeedsA > specialNeedsB ? classBName : classAName;
        
        // Find a special needs student in the class with more
        const specialNeedsStudent = (specialNeedsA > specialNeedsB ? studentsA : studentsB)
          .find(s => s.specialNeeds && !hasConstraint(s, classData.constraints));
        
        if (specialNeedsStudent) {
          suggestions.push({
            type: 'move',
            student: {
              id: specialNeedsStudent._id || specialNeedsStudent.id,
              name: `${specialNeedsStudent.firstName} ${specialNeedsStudent.lastName}`,
              currentClass: moreSpecialNeedsClassName
            },
            targetClass: lessSpecialNeedsClassName,
            reason: 'This move would better distribute students with special needs.',
            impact: {
              genderBalance: '0%',
              academicBalance: '0%',
              behavioralBalance: '0%',
              specialNeedsDistribution: '+15%',
              parentRequestsFulfilled: '0%'
            }
          });
        }
      }
    }
  }
  
  // Identify constraints that are affecting optimal placement
  if (classData.constraints) {
    const userConstraints = Array.isArray(classData.constraints) ? classData.constraints : [];
    
    userConstraints.forEach(constraint => {
      if (constraint.type === 'must_be_together') {
        const student1 = findStudentById(constraint.students[0]);
        const student2 = findStudentById(constraint.students[1]);
        
        if (student1 && student2) {
          constraints.push({
            student: {
              id: student1.student._id || student1.student.id,
              name: `${student1.student.firstName} ${student1.student.lastName}`,
              currentClass: student1.class.name
            },
            constraintType: 'placement',
            description: `Must be placed with ${student2.student.firstName} ${student2.student.lastName}`
          });
        }
      } else if (constraint.type === 'must_be_separate') {
        const student1 = findStudentById(constraint.students[0]);
        const student2 = findStudentById(constraint.students[1]);
        
        if (student1) {
          constraints.push({
            student: {
              id: student1.student._id || student1.student.id,
              name: `${student1.student.firstName} ${student1.student.lastName}`,
              currentClass: student1.class.name
            },
            constraintType: 'separation',
            description: student2 ? 
              `Must be separated from ${student2.student.firstName} ${student2.student.lastName}` :
              'Has a separation constraint'
          });
        }
      }
    });
  }
  
  // Generate summary based on number of suggestions
  let summary = '';
  
  if (suggestions.length === 0) {
    summary = 'No significant improvements can be suggested at this time. The classes appear to be well-balanced.';
  } else if (suggestions.length === 1) {
    summary = 'One suggested change could improve class balance.';
  } else {
    summary = `${suggestions.length} suggested changes could improve overall class balance.`;
  }
  
  return {
    suggestions,
    constraints,
    summary
  };
};

/**
 * Helper function to check if a student has constraints
 * @param {Object} student - Student object
 * @param {Array} constraints - Constraints array
 * @returns {boolean} - Whether the student has constraints
 */
const hasConstraint = (student, constraints) => {
  if (!constraints || !Array.isArray(constraints)) return false;
  
  const studentId = student._id || student.id;
  
  return constraints.some(constraint => {
    if (!constraint.students || !Array.isArray(constraint.students)) return false;
    
    return constraint.students.some(s => {
      const constraintStudentId = typeof s === 'string' ? s : (s._id || s.id);
      return constraintStudentId === studentId;
    });
  });
};

/**
 * Analyze constraints for class optimization
 * @param {Object} classData - Current class configuration data
 * @returns {Promise<Object>} - Constraint analysis
 */
const analyzeConstraints = async (classData) => {
  // In a production environment, this would connect to an AI service
  
  // Mock constraint analysis
  return {
    fulfilled: [
      {
        type: 'placement',
        description: 'Emma Davis and Sophia Martinez are placed together as requested',
        impact: 'positive'
      },
      {
        type: 'teacher_match',
        description: 'Noah Johnson is assigned to Ms. Thompson who specializes in his needs',
        impact: 'positive'
      }
    ],
    unfulfilled: [
      {
        type: 'separation',
        description: 'Jacob Anderson and Ethan Wilson couldn\'t be separated due to class balance constraints',
        impact: 'negative',
        reason: 'Would create significant imbalance in academic levels'
      }
    ],
    conflicts: [
      {
        type: 'conflicting_requests',
        description: 'Multiple parents requested exclusive placement with Emma Davis',
        resolution: 'Prioritized based on special needs considerations'
      }
    ]
  };
};

module.exports = {
  generateInsights,
  generateSuggestions,
  analyzeConstraints
}; 