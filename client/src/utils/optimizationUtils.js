// Utility functions for class optimization algorithm

/**
 * Calculate the overall score for a class assignment based on various factors
 * @param {Object} assignment - The class assignment to evaluate
 * @param {Object} weights - The weights for different optimization factors
 * @param {Array} parentPreferences - Array of parent preferences
 * @param {Array} teacherSurveys - Array of teacher survey responses
 * @returns {number} - The calculated score
 */
export const calculateAssignmentScore = (assignment, weights, parentPreferences, teacherSurveys) => {
  const scores = {
    academicBalance: calculateAcademicBalance(assignment) * weights.academicBalance,
    behavioralBalance: calculateBehavioralBalance(assignment) * weights.behavioralBalance,
    specialNeeds: calculateSpecialNeedsDistribution(assignment) * weights.specialNeeds,
    genderBalance: calculateGenderBalance(assignment) * weights.genderBalance,
    parentPreferences: calculateParentPreferencesSatisfaction(assignment, parentPreferences) * weights.parentPreferences,
    teacherPreferences: calculateTeacherPreferencesSatisfaction(assignment, teacherSurveys) * weights.teacherPreferences,
    classSize: calculateClassSizeBalance(assignment) * weights.classSize
  };

  return Object.values(scores).reduce((sum, score) => sum + score, 0);
};

/**
 * Calculate how well parent preferences are satisfied in a class assignment
 * @param {Object} assignment - The class assignment to evaluate
 * @param {Array} parentPreferences - Array of parent preferences
 * @returns {number} - Score between 0 and 1
 */
export const calculateParentPreferencesSatisfaction = (assignment, parentPreferences) => {
  let totalPreferences = 0;
  let satisfiedPreferences = 0;

  assignment.classes.forEach(classGroup => {
    const studentsInClass = new Set(classGroup.studentIds);

    // Check each student's parent preferences
    classGroup.studentIds.forEach(studentId => {
      const preferences = parentPreferences.find(pref => pref.studentId === studentId);
      if (!preferences) return;

      // Teacher preferences
      if (preferences.teacherPreferences.length > 0) {
        totalPreferences++;
        if (preferences.teacherPreferences.some(pref => pref.teacherId === classGroup.teacherId)) {
          satisfiedPreferences++;
        }
      }

      // Peer preferences
      preferences.peerPreferences.forEach(peerPref => {
        totalPreferences++;
        const peerInClass = studentsInClass.has(peerPref.studentId);
        
        if ((peerPref.type === 'together' && peerInClass) ||
            (peerPref.type === 'separate' && !peerInClass)) {
          satisfiedPreferences++;
        }
      });

      // Learning style match
      if (preferences.learningStyle) {
        totalPreferences++;
        const teacher = assignment.teachers.find(t => t.id === classGroup.teacherId);
        if (teacher && isLearningStyleCompatible(preferences.learningStyle, teacher.teachingStyle)) {
          satisfiedPreferences++;
        }
      }
    });
  });

  return totalPreferences > 0 ? satisfiedPreferences / totalPreferences : 1;
};

/**
 * Check if a learning style is compatible with a teaching style
 * @param {string} learningStyle - Student's learning style
 * @param {string} teachingStyle - Teacher's teaching style
 * @returns {boolean} - Whether the styles are compatible
 */
const isLearningStyleCompatible = (learningStyle, teachingStyle) => {
  const compatibilityMatrix = {
    visual: ['visual_aids', 'multimedia', 'mixed'],
    auditory: ['lecture', 'discussion', 'mixed'],
    kinesthetic: ['hands_on', 'interactive', 'mixed'],
    mixed: ['mixed', 'balanced', 'flexible']
  };

  return compatibilityMatrix[learningStyle]?.includes(teachingStyle) || false;
};

/**
 * Calculate academic balance score for a class
 * @param {Object} assignment - The class assignment to evaluate
 * @returns {number} - Score between 0 and 1
 */
export const calculateAcademicBalance = (assignment) => {
  let totalVariance = 0;

  assignment.classes.forEach(classGroup => {
    const academicLevels = classGroup.studentIds.map(id => {
      const student = assignment.students.find(s => s.id === id);
      return student.academicLevel || 2; // Default to middle level if not specified
    });

    const mean = academicLevels.reduce((sum, level) => sum + level, 0) / academicLevels.length;
    const variance = academicLevels.reduce((sum, level) => sum + Math.pow(level - mean, 2), 0) / academicLevels.length;
    totalVariance += variance;
  });

  const averageVariance = totalVariance / assignment.classes.length;
  return 1 / (1 + averageVariance); // Convert to 0-1 score, lower variance = higher score
};

/**
 * Calculate behavioral balance score for a class
 * @param {Object} assignment - The class assignment to evaluate
 * @returns {number} - Score between 0 and 1
 */
export const calculateBehavioralBalance = (assignment) => {
  let totalVariance = 0;

  assignment.classes.forEach(classGroup => {
    const behavioralScores = classGroup.studentIds.map(id => {
      const student = assignment.students.find(s => s.id === id);
      return student.behavioralScore || 2; // Default to middle score if not specified
    });

    const mean = behavioralScores.reduce((sum, score) => sum + score, 0) / behavioralScores.length;
    const variance = behavioralScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / behavioralScores.length;
    totalVariance += variance;
  });

  const averageVariance = totalVariance / assignment.classes.length;
  return 1 / (1 + averageVariance);
};

/**
 * Calculate special needs distribution score
 * @param {Object} assignment - The class assignment to evaluate
 * @returns {number} - Score between 0 and 1
 */
export const calculateSpecialNeedsDistribution = (assignment) => {
  const classScores = assignment.classes.map(classGroup => {
    const specialNeedsCount = classGroup.studentIds.filter(id => {
      const student = assignment.students.find(s => s.id === id);
      return student.hasSpecialNeeds;
    }).length;

    return specialNeedsCount / classGroup.studentIds.length;
  });

  const mean = classScores.reduce((sum, score) => sum + score, 0) / classScores.length;
  const variance = classScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / classScores.length;

  return 1 / (1 + variance * 10); // Scaled variance for more sensitivity
};

/**
 * Calculate gender balance score
 * @param {Object} assignment - The class assignment to evaluate
 * @returns {number} - Score between 0 and 1
 */
export const calculateGenderBalance = (assignment) => {
  let totalDeviation = 0;

  assignment.classes.forEach(classGroup => {
    const genderCounts = classGroup.studentIds.reduce((counts, id) => {
      const student = assignment.students.find(s => s.id === id);
      counts[student.gender] = (counts[student.gender] || 0) + 1;
      return counts;
    }, {});

    const totalStudents = classGroup.studentIds.length;
    const idealRatio = totalStudents / Object.keys(genderCounts).length;
    
    const deviation = Object.values(genderCounts).reduce((sum, count) => 
      sum + Math.abs(count - idealRatio), 0) / totalStudents;
    
    totalDeviation += deviation;
  });

  const averageDeviation = totalDeviation / assignment.classes.length;
  return 1 - averageDeviation;
};

/**
 * Calculate teacher preferences satisfaction score
 * @param {Object} assignment - The class assignment to evaluate
 * @param {Array} teacherSurveys - Array of teacher survey responses
 * @returns {number} - Score between 0 and 1
 */
export const calculateTeacherPreferencesSatisfaction = (assignment, teacherSurveys) => {
  let totalPreferences = 0;
  let satisfiedPreferences = 0;

  assignment.classes.forEach(classGroup => {
    const teacherSurvey = teacherSurveys.find(survey => survey.teacherId === classGroup.teacherId);
    if (!teacherSurvey) return;

    const studentsInClass = new Set(classGroup.studentIds);

    // Student pairing preferences
    teacherSurvey.studentPairs.forEach(pair => {
      totalPreferences++;
      const student1InClass = studentsInClass.has(pair.student1);
      const student2InClass = studentsInClass.has(pair.student2);

      if ((pair.relationship === 'works_well' && student1InClass === student2InClass) ||
          (pair.relationship === 'should_separate' && student1InClass !== student2InClass)) {
        satisfiedPreferences++;
      }
    });

    // Special considerations
    teacherSurvey.specialConsiderations.forEach(consideration => {
      if (studentsInClass.has(consideration.studentId)) {
        totalPreferences++;
        // Add logic for specific consideration types
        satisfiedPreferences++; // Simplified for now
      }
    });
  });

  return totalPreferences > 0 ? satisfiedPreferences / totalPreferences : 1;
};

/**
 * Calculate class size balance score
 * @param {Object} assignment - The class assignment to evaluate
 * @returns {number} - Score between 0 and 1
 */
export const calculateClassSizeBalance = (assignment) => {
  const classSizes = assignment.classes.map(c => c.studentIds.length);
  const mean = classSizes.reduce((sum, size) => sum + size, 0) / classSizes.length;
  const maxDeviation = Math.max(...classSizes.map(size => Math.abs(size - mean)));
  
  return 1 - (maxDeviation / mean);
};

/**
 * Generate initial class assignments
 * @param {Array} students - Array of students
 * @param {Array} teachers - Array of teachers
 * @param {number} classCount - Number of classes to create
 * @returns {Object} - Initial class assignment
 */
export const generateInitialAssignment = (students, teachers, classCount) => {
  const shuffledStudents = [...students].sort(() => Math.random() - 0.5);
  const classSize = Math.floor(students.length / classCount);
  const remainder = students.length % classCount;

  const classes = Array.from({ length: classCount }, (_, index) => {
    const extraStudent = index < remainder ? 1 : 0;
    const startIdx = index * classSize + Math.min(index, remainder);
    const endIdx = startIdx + classSize + extraStudent;

    return {
      id: `class_${index + 1}`,
      teacherId: teachers[index]?.id,
      studentIds: shuffledStudents.slice(startIdx, endIdx).map(s => s.id)
    };
  });

  return { classes, students, teachers };
};

/**
 * Optimize class assignments using simulated annealing
 * @param {Object} initialAssignment - Initial class assignment
 * @param {Object} weights - Weights for different factors
 * @param {Array} parentPreferences - Array of parent preferences
 * @param {Array} teacherSurveys - Array of teacher survey responses
 * @param {Object} options - Algorithm options (temperature, cooling rate, etc.)
 * @returns {Object} - Optimized class assignment
 */
export const optimizeClassAssignment = (
  initialAssignment,
  weights,
  parentPreferences,
  teacherSurveys,
  options = { maxIterations: 1000, initialTemp: 100, coolingRate: 0.95 }
) => {
  let currentAssignment = JSON.parse(JSON.stringify(initialAssignment));
  let currentScore = calculateAssignmentScore(currentAssignment, weights, parentPreferences, teacherSurveys);
  let bestAssignment = JSON.parse(JSON.stringify(currentAssignment));
  let bestScore = currentScore;
  
  let temperature = options.initialTemp;
  
  for (let i = 0; i < options.maxIterations; i++) {
    const newAssignment = generateNeighborAssignment(currentAssignment);
    const newScore = calculateAssignmentScore(newAssignment, weights, parentPreferences, teacherSurveys);
    
    const delta = newScore - currentScore;
    
    if (delta > 0 || Math.random() < Math.exp(delta / temperature)) {
      currentAssignment = newAssignment;
      currentScore = newScore;
      
      if (newScore > bestScore) {
        bestAssignment = JSON.parse(JSON.stringify(newAssignment));
        bestScore = newScore;
      }
    }
    
    temperature *= options.coolingRate;
  }
  
  return {
    assignment: bestAssignment,
    score: bestScore,
    details: calculateDetailedScores(bestAssignment, weights, parentPreferences, teacherSurveys)
  };
};

/**
 * Generate a neighboring assignment by making small modifications
 * @param {Object} assignment - Current class assignment
 * @returns {Object} - New assignment with small changes
 */
const generateNeighborAssignment = (assignment) => {
  const newAssignment = JSON.parse(JSON.stringify(assignment));
  
  // Randomly choose between different modification types
  const modificationType = Math.random();
  
  if (modificationType < 0.4) {
    // Swap two random students between classes
    const class1Index = Math.floor(Math.random() * newAssignment.classes.length);
    let class2Index;
    do {
      class2Index = Math.floor(Math.random() * newAssignment.classes.length);
    } while (class2Index === class1Index);
    
    const class1 = newAssignment.classes[class1Index];
    const class2 = newAssignment.classes[class2Index];
    
    const student1Index = Math.floor(Math.random() * class1.studentIds.length);
    const student2Index = Math.floor(Math.random() * class2.studentIds.length);
    
    const temp = class1.studentIds[student1Index];
    class1.studentIds[student1Index] = class2.studentIds[student2Index];
    class2.studentIds[student2Index] = temp;
  } else if (modificationType < 0.7) {
    // Move one student to a different class
    const fromClassIndex = Math.floor(Math.random() * newAssignment.classes.length);
    let toClassIndex;
    do {
      toClassIndex = Math.floor(Math.random() * newAssignment.classes.length);
    } while (toClassIndex === fromClassIndex);
    
    const fromClass = newAssignment.classes[fromClassIndex];
    const toClass = newAssignment.classes[toClassIndex];
    
    if (fromClass.studentIds.length > toClass.studentIds.length) {
      const studentIndex = Math.floor(Math.random() * fromClass.studentIds.length);
      const student = fromClass.studentIds.splice(studentIndex, 1)[0];
      toClass.studentIds.push(student);
    }
  } else {
    // Swap teachers between classes
    const class1Index = Math.floor(Math.random() * newAssignment.classes.length);
    let class2Index;
    do {
      class2Index = Math.floor(Math.random() * newAssignment.classes.length);
    } while (class2Index === class1Index);
    
    const temp = newAssignment.classes[class1Index].teacherId;
    newAssignment.classes[class1Index].teacherId = newAssignment.classes[class2Index].teacherId;
    newAssignment.classes[class2Index].teacherId = temp;
  }
  
  return newAssignment;
};

/**
 * Calculate detailed scores for each optimization factor
 * @param {Object} assignment - Class assignment
 * @param {Object} weights - Weights for different factors
 * @param {Array} parentPreferences - Array of parent preferences
 * @param {Array} teacherSurveys - Array of teacher survey responses
 * @returns {Object} - Detailed scores for each factor
 */
export const calculateDetailedScores = (assignment, weights, parentPreferences, teacherSurveys) => {
  return {
    academicBalance: {
      score: calculateAcademicBalance(assignment),
      weight: weights.academicBalance
    },
    behavioralBalance: {
      score: calculateBehavioralBalance(assignment),
      weight: weights.behavioralBalance
    },
    specialNeeds: {
      score: calculateSpecialNeedsDistribution(assignment),
      weight: weights.specialNeeds
    },
    genderBalance: {
      score: calculateGenderBalance(assignment),
      weight: weights.genderBalance
    },
    parentPreferences: {
      score: calculateParentPreferencesSatisfaction(assignment, parentPreferences),
      weight: weights.parentPreferences
    },
    teacherPreferences: {
      score: calculateTeacherPreferencesSatisfaction(assignment, teacherSurveys),
      weight: weights.teacherPreferences
    },
    classSize: {
      score: calculateClassSizeBalance(assignment),
      weight: weights.classSize
    }
  };
}; 