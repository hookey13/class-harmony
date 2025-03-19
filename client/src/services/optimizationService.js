import axios from 'axios';
import api from './api';
import constraintService from './constraintService';

// Default weights for different optimization factors
const DEFAULT_WEIGHTS = {
  academicBalance: 1.0,
  behavioralBalance: 1.0,
  genderBalance: 1.0,
  specialNeedsDistribution: 1.5,
  classSize: 2.0,
  parentRequests: 1.8,
  teacherPreferences: 1.6,
  studentRelationships: 1.7
};

/**
 * Fetches available optimization constraints from the backend
 */
const fetchConstraints = async () => {
  try {
    const response = await axios.get('/api/optimization/constraints');
    return response.data;
  } catch (error) {
    console.error('Error fetching optimization constraints:', error);
    throw error;
  }
};

/**
 * Fetches optimization statistics from the backend
 */
const fetchOptimizationStats = async (academicYear, grade) => {
  try {
    const response = await axios.get('/api/optimization/stats', {
      params: { academicYear, grade }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching optimization stats:', error);
    throw error;
  }
};

/**
 * Run optimization on the server
 * @param {string} academicYear - The academic year
 * @param {string} grade - The grade level
 * @param {number} numberOfClasses - Number of classes to create
 * @param {string} strategy - Optimization strategy
 * @param {Object} weights - Weights for different optimization factors
 * @param {Array} constraints - Array of constraint objects
 * @returns {Promise<Object>} - API response with optimized classes
 */
const runServerOptimization = async (academicYear, grade, numberOfClasses, strategy, weights, constraints = []) => {
  try {
    const response = await axios.post('/api/optimization/optimize', {
      academicYear,
      grade,
      numberOfClasses,
      strategy,
      weights,
      constraints
    });
    
    return response.data;
  } catch (error) {
    console.error('Server optimization error:', error);
    throw error;
  }
};

/**
 * Optimize classes on the client side if server optimization fails
 * @param {Array} students - Array of student objects
 * @param {number} numberOfClasses - Number of classes to create
 * @param {Object} weights - Weights for different optimization factors
 * @param {Array} constraints - Array of constraint objects
 * @param {Array} initialDistribution - Optional initial distribution of students
 * @returns {Array} - Array of class objects
 */
const optimizeClasses = (students, numberOfClasses, weights, constraints = [], initialDistribution = null) => {
  if (!students || students.length === 0) {
    throw new Error('No students provided for optimization');
  }

  // Clone students to avoid modifying the original
  const studentsCopy = [...students];
  
  // Initialize classes - either with provided initial distribution or empty
  let classes = [];
  
  if (initialDistribution && Array.isArray(initialDistribution)) {
    // Use provided initial distribution
    classes = initialDistribution.map(classStudents => ({
      students: [...classStudents],
      balanceScores: null // Will be calculated later
    }));
  } else {
    // Create empty classes
    classes = Array.from({ length: numberOfClasses }, () => ({
    students: [],
      balanceScores: null
    }));
    
    // Shuffle students to get a random starting point
    for (let i = studentsCopy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [studentsCopy[i], studentsCopy[j]] = [studentsCopy[j], studentsCopy[i]];
    }
    
    // Initial distribution - assign students round-robin
    studentsCopy.forEach((student, index) => {
    const classIndex = index % numberOfClasses;
    classes[classIndex].students.push(student);
  });
  }

  // Optimization iterations
  const MAX_ITERATIONS = 100;
  let currentScore = calculateTotalBalanceScore(classes, weights);
  let improved = true;
  let iteration = 0;

  while (improved && iteration < MAX_ITERATIONS) {
    improved = false;
    iteration++;

    // Try swapping students between classes
    for (let i = 0; i < classes.length; i++) {
      for (let j = i + 1; j < classes.length; j++) {
        for (let si = 0; si < classes[i].students.length; si++) {
          for (let sj = 0; sj < classes[j].students.length; sj++) {
            // Create a deep copy of classes for testing the swap
            const testClasses = classes.map(cls => ({
              students: [...cls.students],
              balanceScores: null
            }));
            
            // Swap students
            const temp = testClasses[i].students[si];
            testClasses[i].students[si] = testClasses[j].students[sj];
            testClasses[j].students[sj] = temp;
            
            // Check if the swap violates any constraints
            if (constraints && constraints.length > 0) {
              const validationResult = constraintService.validateConstraints(testClasses, constraints);
              if (!validationResult.satisfied) {
                // Skip this swap if it violates constraints
              continue;
              }
            }
            
            // Calculate new score
            const newScore = calculateTotalBalanceScore(testClasses, weights);
            
            // If new score is better, keep the swap
            if (newScore > currentScore) {
              // Apply the swap to the real classes
              const temp = classes[i].students[si];
              classes[i].students[si] = classes[j].students[sj];
              classes[j].students[sj] = temp;
              
              currentScore = newScore;
              improved = true;
              break;
            }
          }
          if (improved) break;
        }
        if (improved) break;
      }
      if (improved) break;
    }
  }
  
  // Calculate final balance scores for each class
  classes.forEach(cls => {
    cls.balanceScores = calculateClassBalance(cls.students, weights);
  });
  
  return classes;
};

/**
 * Calculate overall balance score based on weights
 * @param {Array} classes - Array of class objects
 * @param {Object} weights - Weights for different factors
 * @returns {number} - Total balance score
 */
const calculateTotalBalanceScore = (classes, weights) => {
  let totalScore = 0;
  
  for (const cls of classes) {
    const balanceScores = calculateClassBalance(cls.students, weights);
    
    // Calculate weighted sum
    const classScore = 
      (balanceScores.genderBalance * weights.genderBalance) +
      (balanceScores.academicBalance * weights.academicBalance) +
      (balanceScores.behavioralBalance * weights.behavioralBalance) +
      (balanceScores.specialNeedsDistribution * weights.specialNeedsDistribution);
    
    totalScore += classScore;
  }
  
  // Add penalty for uneven class sizes
  const sizes = classes.map(cls => cls.students.length);
  const minSize = Math.min(...sizes);
  const maxSize = Math.max(...sizes);
  const sizeDiffPenalty = (maxSize - minSize) * 0.1;
  
  return totalScore - sizeDiffPenalty;
};

/**
 * Fetches students for a specific grade and academic year
 */
const fetchStudentsForGrade = async (grade, academicYear) => {
  try {
    const response = await axios.get('/api/students', {
      params: {
        grade,
        academicYear,
        limit: 100
      }
    });
    return response.data.students || [];
  } catch (error) {
    console.error('Error fetching students:', error);
    throw error;
  }
};

/**
 * Calculates a balance score for a class based on various factors
 * This version works for either a class object or an array of students
 * @param {Array|Object} studentsOrClass - Either an array of students or a class object with students array
 * @param {Object} weights - Weights for different factors
 * @returns {number} - Balance score from 0-100
 */
const calculateClassBalance = (studentsOrClass, weights = null) => {
  // Handle both array of students or class object
  const students = Array.isArray(studentsOrClass) 
    ? studentsOrClass 
    : (studentsOrClass?.students || []);
  
  if (!students || students.length === 0) return 100; // Empty class is perfectly balanced
  
  // Default weights if not provided
  const balanceWeights = weights || {
    genderBalance: 1,
    academicBalance: 1,
    behavioralBalance: 1,
    specialNeedsDistribution: 1
  };
  
  // Calculate gender balance
  const maleCount = students.filter(s => s.gender === 'Male').length;
  const femaleCount = students.filter(s => s.gender === 'Female').length;
  const genderRatio = Math.min(maleCount, femaleCount) / Math.max(maleCount, femaleCount) || 0;
  const genderBalance = genderRatio * 100; // Convert to 0-100 scale
  
  // Calculate academic level distribution
  const academicLevels = {
    'Advanced': 0,
    'Proficient': 0,
    'Basic': 0,
    'Below Basic': 0
  };
  
  students.forEach(student => {
    const level = student.academicLevel || 'Proficient';
    if (academicLevels[level] !== undefined) {
      academicLevels[level]++;
    } else {
      academicLevels['Proficient']++; // Default
    }
  });
  
  // Calculate academic distribution score (0-100)
  const academicTotal = students.length;
  const academicDeviation = 
    Math.abs((academicLevels['Advanced'] / academicTotal) - 0.25) +
    Math.abs((academicLevels['Proficient'] / academicTotal) - 0.5) +
    Math.abs((academicLevels['Basic'] / academicTotal) - 0.2) +
    Math.abs((academicLevels['Below Basic'] / academicTotal) - 0.05);
  
  const academicBalance = Math.max(0, 100 - (academicDeviation * 100));
  
  // Calculate behavioral level distribution
  const behaviorLevels = {
    'High': 0,
    'Medium': 0,
    'Low': 0
  };
  
  students.forEach(student => {
    const level = student.behaviorLevel || 'Medium';
    if (behaviorLevels[level] !== undefined) {
      behaviorLevels[level]++;
    } else {
      behaviorLevels['Medium']++; // Default
    }
  });
  
  // Calculate behavior distribution score (0-100)
  const behaviorDeviation = 
    Math.abs((behaviorLevels['High'] / academicTotal) - 0.15) * 2 + // Weight high-needs more
    Math.abs((behaviorLevels['Medium'] / academicTotal) - 0.35) +
    Math.abs((behaviorLevels['Low'] / academicTotal) - 0.5) * 0.5; // Weight low-needs less
  
  const behaviorBalance = Math.max(0, 100 - (behaviorDeviation * 100));
  
  // Calculate special needs distribution
  const specialNeedsCount = students.filter(s => s.specialNeeds).length;
  const specialNeedsRatio = specialNeedsCount / students.length;
  const idealSpecialNeedsRatio = 0.15; // Assume 15% is ideal
  const specialNeedsDeviation = Math.abs(specialNeedsRatio - idealSpecialNeedsRatio);
  const specialNeedsBalance = Math.max(0, 100 - (specialNeedsDeviation * 500)); // More sensitive to deviations
  
  // Calculate total weighted balance score
  const totalWeight = 
    balanceWeights.genderBalance + 
    balanceWeights.academicBalance + 
    balanceWeights.behavioralBalance + 
    balanceWeights.specialNeedsDistribution;
  
  const weightedScore = (
    (genderBalance * balanceWeights.genderBalance) +
    (academicBalance * balanceWeights.academicBalance) +
    (behaviorBalance * balanceWeights.behavioralBalance) +
    (specialNeedsBalance * balanceWeights.specialNeedsDistribution)
  ) / totalWeight;
  
  return Math.round(weightedScore);
};

/**
 * Fetches parent requests for a specific academic year and grade
 */
const fetchParentRequests = async (academicYear, grade) => {
  try {
    const response = await axios.get('/api/parent-preferences', {
      params: {
        academicYear,
        grade,
        submissionStatus: ['submitted', 'approved']
      }
    });
    
    return processParentRequests(response.data.preferences || []);
  } catch (error) {
    console.error('Error fetching parent requests:', error);
    return {
      requests: [],
      fulfilled: 0,
      total: 0
    };
  }
};

/**
 * Processes parent preferences into a format usable by the UI
 */
const processParentRequests = (preferences) => {
  const requests = [];
  let total = 0;
  let fulfilled = 0;
  
  preferences.forEach(pref => {
    // Teacher preferences
    if (pref.teacherPreferences?.preferredTeachers) {
      pref.teacherPreferences.preferredTeachers.forEach(teacher => {
        total++;
        const fulfilled = teacher.fulfilled || false;
        if (fulfilled) fulfilled++;
        
        requests.push({
          id: `${pref._id}-teacher-${teacher.teacher._id || teacher.teacher}`,
          studentName: `${pref.student.firstName} ${pref.student.lastName}`,
          targetName: teacher.teacher.firstName ? `${teacher.teacher.firstName} ${teacher.teacher.lastName}` : 'Unknown Teacher',
          type: 'teacher',
          fulfilled
        });
      });
    }
    
    // Peer preferences
    if (pref.peerRelationships?.preferredPeers) {
      pref.peerRelationships.preferredPeers.forEach(peer => {
        total++;
        const fulfilled = peer.fulfilled || false;
        if (fulfilled) fulfilled++;
        
        requests.push({
          id: `${pref._id}-peer-${peer.student._id || peer.student}`,
          studentName: `${pref.student.firstName} ${pref.student.lastName}`,
          targetName: peer.student.firstName ? `${peer.student.firstName} ${peer.student.lastName}` : 'Unknown Student',
          type: 'classmate',
          fulfilled
        });
      });
    }
  });

  return {
    requests,
    fulfilled,
    total
  };
};

/**
 * Calculate gender balance score for a given set of classes
 * @param {Array} classes - Array of class objects
 * @returns {number} - Gender balance score (0-100)
 */
const calculateGenderBalance = (classData) => {
  if (!classData || !classData.classes || classData.classes.length === 0) {
    return 0;
  }

  const classes = classData.classes;
  const totalClasses = classes.length;
  
  // Calculate gender ratios for each class
  const genderRatios = classes.map(classObj => {
    const students = classObj.students || [];
    const totalStudents = students.length;
    
    if (totalStudents === 0) return 1; // Perfect balance for empty classes
    
    const maleCount = students.filter(s => s.gender === 'Male' || s.gender === 'male').length;
    const femaleCount = students.filter(s => s.gender === 'Female' || s.gender === 'female').length;
    
    const maleRatio = maleCount / totalStudents;
    const femaleRatio = femaleCount / totalStudents;
    
    // Calculate deviation from 50/50 balance
    // 0 means perfect balance, 1 means all one gender
    const deviation = Math.abs(maleRatio - femaleRatio);
    return 1 - deviation;
  });
  
  // Average balance across all classes
  const averageBalance = genderRatios.reduce((sum, ratio) => sum + ratio, 0) / totalClasses;
  
  // Convert to a 0-100 scale
  return Math.round(averageBalance * 100);
};

/**
 * Calculate academic balance score for a given set of classes
 * @param {Array} classes - Array of class objects
 * @returns {number} - Academic balance score (0-100)
 */
const calculateAcademicBalance = (classData) => {
  if (!classData || !classData.classes || classData.classes.length === 0) {
    return 0;
  }

  const classes = classData.classes;
  const totalClasses = classes.length;
  
  // Calculate academic distribution for each class
  const academicBalances = classes.map(classObj => {
    const students = classObj.students || [];
    const totalStudents = students.length;
    
    if (totalStudents === 0) return 1; // Perfect balance for empty classes
    
    // Count students at each academic level (1-5)
    const levelCounts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
    students.forEach(student => {
      const level = student.academicLevel;
      if (level >= 1 && level <= 5) {
        levelCounts[level]++;
      }
    });
    
    // Calculate ideal distribution - should be even across levels
    const idealCount = totalStudents / 5;
    
    // Calculate deviation from ideal distribution
    let totalDeviation = 0;
    for (let level = 1; level <= 5; level++) {
      totalDeviation += Math.abs(levelCounts[level] - idealCount);
    }
    
    // Normalize deviation (0 = perfect balance, 1 = worst balance)
    const normalizedDeviation = totalDeviation / (totalStudents * 0.8); // Scale factor
    
    // Convert to balance score (1 = perfect, 0 = worst)
    return Math.max(0, 1 - normalizedDeviation);
  });
  
  // Average balance across all classes
  const averageBalance = academicBalances.reduce((sum, balance) => sum + balance, 0) / totalClasses;
  
  // Convert to a 0-100 scale
  return Math.round(averageBalance * 100);
};

/**
 * Calculate behavioral balance score for a given set of classes
 * @param {Array} classes - Array of class objects
 * @returns {number} - Behavioral balance score (0-100)
 */
const calculateBehavioralBalance = (classData) => {
  if (!classData || !classData.classes || classData.classes.length === 0) {
    return 0;
  }

  const classes = classData.classes;
  const totalClasses = classes.length;
  
  // Calculate behavioral distribution for each class
  const behavioralBalances = classes.map(classObj => {
    const students = classObj.students || [];
    const totalStudents = students.length;
    
    if (totalStudents === 0) return 1; // Perfect balance for empty classes
    
    // Count students with challenging behavior (levels 1-2)
    const challengingCount = students.filter(s => 
      s.behavioralLevel === 1 || s.behavioralLevel === 2
    ).length;
    
    // Calculate percentage of challenging students
    const challengingPercentage = challengingCount / totalStudents;
    
    // Ideal: No more than 20% of students with challenging behavior in a class
    const balance = challengingPercentage <= 0.2 
      ? 1  // Perfect balance (20% or less)
      : Math.max(0, 1 - ((challengingPercentage - 0.2) * 2.5)); // Penalize higher percentages
    
    return balance;
  });
  
  // Average balance across all classes
  const averageBalance = behavioralBalances.reduce((sum, balance) => sum + balance, 0) / totalClasses;
  
  // Convert to a 0-100 scale
  return Math.round(averageBalance * 100);
};

/**
 * Calculate special needs distribution score for a given set of classes
 * @param {Array} classes - Array of class objects
 * @returns {number} - Special needs distribution score (0-100)
 */
const calculateSpecialNeedsDistribution = (classData) => {
  if (!classData || !classData.classes || classData.classes.length === 0) {
    return 0;
  }

  const classes = classData.classes;
  const totalClasses = classes.length;
  
  // Calculate special needs distribution for each class
  const specialNeedsBalances = classes.map(classObj => {
    const students = classObj.students || [];
    const totalStudents = students.length;
    
    if (totalStudents === 0) return 1; // Perfect balance for empty classes
    
    // Count students with special needs
    const specialNeedsCount = students.filter(s => s.specialNeeds).length;
    
    // Calculate percentage of special needs students
    const specialNeedsPercentage = specialNeedsCount / totalStudents;
    
    // Ideal: Between 10-25% special needs students per class
    if (specialNeedsPercentage >= 0.1 && specialNeedsPercentage <= 0.25) {
      return 1; // Perfect balance
    } else if (specialNeedsPercentage < 0.1) {
      return 0.5 + (specialNeedsPercentage * 5); // Scale from 0.5 to 1.0
    } else {
      return Math.max(0, 1 - ((specialNeedsPercentage - 0.25) * 2)); // Penalize higher percentages
    }
  });
  
  // Average balance across all classes
  const averageBalance = specialNeedsBalances.reduce((sum, balance) => sum + balance, 0) / totalClasses;
  
  // Convert to a 0-100 scale
  return Math.round(averageBalance * 100);
};

/**
 * Apply optimization results to create or update classes
 * @param {Object} optimizedClasses - The optimized class configuration
 * @param {string} academicYear - The academic year
 * @param {string} grade - The grade level
 * @returns {Promise<Object>} - API response with results
 */
const applyOptimizationResults = async (optimizedClasses, academicYear, grade) => {
  try {
    const response = await axios.post('/api/optimization/apply', {
      optimizedClasses,
      academicYear,
      grade
    });
    
    return response.data;
  } catch (error) {
    console.error('Error applying optimization results:', error);
    throw error;
  }
};

/**
 * Get AI suggestions for optimizing class placements
 * @param {Object} classData - Current class data
 * @param {string} academicYear - The academic year
 * @param {string} grade - The grade level
 * @returns {Promise<Object>} - API response with AI suggestions
 */
const getAISuggestions = async (classData, academicYear, grade) => {
  try {
    const response = await axios.post('/api/ai/suggestions', {
      classData,
      academicYear,
      grade
    });
    return response.data;
  } catch (error) {
    console.error('Error getting AI suggestions:', error);
    
    // Return mock data for development purposes
    return {
      suggestions: [
        {
          type: 'swap',
          studentA: {
            id: classData.classes[0].students[0]?.id || 'student1',
            name: `${classData.classes[0].students[0]?.firstName || 'John'} ${classData.classes[0].students[0]?.lastName || 'Doe'}`,
            currentClass: 'Class 1'
          },
          studentB: {
            id: classData.classes[1].students[0]?.id || 'student2',
            name: `${classData.classes[1].students[0]?.firstName || 'Jane'} ${classData.classes[1].students[0]?.lastName || 'Smith'}`,
            currentClass: 'Class 2'
          },
          reason: 'This swap would improve gender balance and academic distribution between classes.',
          impact: {
            genderBalance: '+7%',
            academicBalance: '+5%',
            behavioralBalance: '+2%',
            specialNeedsDistribution: '0%',
            parentRequestsFulfilled: '0%'
          }
        },
        {
          type: 'move',
          student: {
            id: classData.classes[2].students[0]?.id || 'student3',
            name: `${classData.classes[2].students[0]?.firstName || 'Alex'} ${classData.classes[2].students[0]?.lastName || 'Johnson'}`,
            currentClass: 'Class 3'
          },
          targetClass: 'Class 1',
          reason: 'Moving this student would better balance behavioral needs distribution.',
          impact: {
            genderBalance: '0%',
            academicBalance: '+1%',
            behavioralBalance: '+8%',
            specialNeedsDistribution: '+3%',
            parentRequestsFulfilled: '0%'
          }
        }
      ],
      insights: [
        {
          type: 'gender',
          message: 'Gender distribution is slightly imbalanced in Class 2.',
          severity: 'medium',
          affectedClasses: ['Class 2']
        },
        {
          type: 'academic',
          message: 'Academic abilities are well-distributed overall.',
          severity: 'low',
          affectedClasses: []
        },
        {
          type: 'behavioral',
          message: 'There is a high concentration of students with behavioral needs in Class 3.',
          severity: 'high',
          affectedClasses: ['Class 3']
        }
      ]
    };
  }
};

// Main function to export
const optimizationService = {
  fetchConstraints,
  fetchOptimizationStats,
  runServerOptimization,
  optimizeClasses,
  fetchStudentsForGrade,
  calculateClassBalance,
  calculateTotalBalanceScore,
  fetchParentRequests,
  applyOptimizationResults,
  getAISuggestions,
  calculateGenderBalance,
  calculateAcademicBalance,
  calculateBehavioralBalance,
  calculateSpecialNeedsDistribution
};

export { calculateClassBalance };
export default optimizationService; 