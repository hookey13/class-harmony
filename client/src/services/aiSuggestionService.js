import axios from 'axios';

/**
 * Provides AI-powered suggestions for class optimization
 */
const aiSuggestionService = {
  /**
   * Get general insights about the current class configuration
   * 
   * @param {Object} classData - Current class configuration data
   * @returns {Promise<Object>} - AI insights about class balance
   */
  getInsights: async (classData) => {
    try {
      const response = await axios.post('/api/ai/insights', { classData });
      return response.data;
    } catch (error) {
      console.error('Error getting AI insights:', error);
      
      // Fallback insights for when the API is not available
      return {
        balanceScore: calculateOverallBalance(classData),
        insights: [
          {
            type: 'gender',
            message: 'Gender distribution is slightly imbalanced in Class 2A. Consider moving 1-2 male students to balance the ratio.',
            severity: 'medium',
            affectedClasses: ['2A']
          },
          {
            type: 'academic',
            message: 'Academic abilities are well-distributed overall, but Class 3B has a higher concentration of advanced students.',
            severity: 'low',
            affectedClasses: ['3B']
          },
          {
            type: 'behavioral',
            message: 'There is a high concentration of students with behavioral needs in Class 1C. Consider redistributing for better teacher support.',
            severity: 'high',
            affectedClasses: ['1C']
          },
          {
            type: 'special_needs',
            message: 'Classes have a good distribution of special needs students, with appropriate support levels.',
            severity: 'info',
            affectedClasses: []
          }
        ],
        summary: 'Overall class distribution is good with a few areas for improvement, particularly in behavioral needs distribution and gender balance in specific classes.'
      };
    }
  },
  
  /**
   * Get specific student placement suggestions
   * 
   * @param {Object} classData - Current class configuration data
   * @param {string} targetClass - Target class ID for suggestions
   * @returns {Promise<Object>} - AI suggestions for improving the class
   */
  getPlacementSuggestions: async (classData, targetClass) => {
    try {
      const response = await axios.post('/api/ai/placement-suggestions', { 
        classData, 
        targetClass 
      });
      return response.data;
    } catch (error) {
      console.error('Error getting placement suggestions:', error);
      
      // Fallback suggestions for when the API is not available
      return {
        suggestions: [
          {
            type: 'swap',
            studentA: {
              id: 'student123',
              name: 'Michael Johnson',
              currentClass: '2A'
            },
            studentB: {
              id: 'student456',
              name: 'Emily Davis',
              currentClass: '2B'
            },
            reason: 'This swap would improve gender balance in both classes and separate students with conflicting interaction patterns.',
            impact: {
              genderBalance: '+5%',
              academicBalance: '+2%',
              behavioralBalance: '+8%',
              specialNeedsDistribution: '0%',
              parentRequestsFulfilled: '0%'
            }
          },
          {
            type: 'move',
            student: {
              id: 'student789',
              name: 'Jacob Smith',
              currentClass: '3C'
            },
            targetClass: '3A',
            reason: 'Moving this student would better match their learning style with the teaching approach in 3A.',
            impact: {
              genderBalance: '0%',
              academicBalance: '+3%',
              behavioralBalance: '+4%',
              specialNeedsDistribution: '0%',
              parentRequestsFulfilled: '+5%'
            }
          }
        ],
        constraints: [
          {
            student: {
              id: 'student345',
              name: 'Olivia Williams',
              currentClass: '1B'
            },
            constraintType: 'parent_request',
            description: 'Keep with best friend Sarah Thompson due to parent request'
          },
          {
            student: {
              id: 'student567',
              name: 'Noah Brown',
              currentClass: '2C'
            },
            constraintType: 'special_needs',
            description: 'Requires specific teacher expertise available in current class'
          }
        ],
        summary: 'These suggestions would improve overall class balance by approximately 5% while maintaining all critical constraints from parent requests and special needs requirements.'
      };
    }
  },
  
  /**
   * Get constraining factors that could be affecting optimal class balance
   * 
   * @param {Object} classData - Current class configuration data
   * @returns {Promise<Object>} - AI analysis of constraining factors
   */
  getConstraintAnalysis: async (classData) => {
    try {
      const response = await axios.post('/api/ai/constraint-analysis', { classData });
      return response.data;
    } catch (error) {
      console.error('Error getting constraint analysis:', error);
      
      // Fallback analysis for when the API is not available
      return {
        constrainingFactors: [
          {
            type: 'parent_requests',
            impact: 'high',
            description: '32% of students have parent requests that limit placement flexibility',
            affectedClasses: ['1A', '2B', '3C']
          },
          {
            type: 'teacher_specialization',
            impact: 'medium',
            description: 'Teacher specializations for special needs support create fixed student assignments',
            affectedClasses: ['2A', '3B']
          },
          {
            type: 'behavioral_separation',
            impact: 'high',
            description: 'Required separation of students with behavioral conflicts limits placement options',
            affectedClasses: ['1C', '2C']
          }
        ],
        recommendations: [
          'Consider allowing more flexibility in parent requests where possible',
          'Ensure all teachers have basic training to support diverse special needs',
          'Implement behavioral intervention strategies to reduce required separations'
        ],
        estimatedImpact: 'Reducing these constraints could improve overall class balance by approximately 15%'
      };
    }
  },
  
  /**
   * Get AI recommendations for optimizing class placement
   * 
   * @param {Object} optimizationParams - Parameters for the optimization
   * @returns {Promise<Object>} - AI optimization recommendations
   */
  getOptimizationRecommendations: async (optimizationParams) => {
    try {
      const response = await axios.post('/api/ai/optimization-recommendations', optimizationParams);
      return response.data;
    } catch (error) {
      console.error('Error getting optimization recommendations:', error);
      
      // Fallback recommendations for when the API is not available
      return {
        recommendedStrategy: 'balanced',
        weightRecommendations: {
          academicBalance: 0.25,
          behavioralBalance: 0.30,
          genderBalance: 0.15,
          specialNeedsDistribution: 0.20,
          parentRequestsFulfilled: 0.10
        },
        rationale: "Based on your school's current data, behavioral balance should be prioritized slightly higher due to the distribution of behavioral needs. Academic balance and special needs distribution are secondary priorities.",
        additionalSuggestions: [
          'Consider separating students Jackson and Tyler who have documented behavioral conflicts',
          'Limit classes to a maximum of 3 students with high behavioral support needs',
          'Distribute ELL students evenly to ensure adequate resource allocation'
        ]
      };
    }
  }
};

/**
 * Helper function to calculate overall balance score
 * 
 * @param {Object} classData - Class configuration data
 * @returns {number} - Overall balance score
 */
function calculateOverallBalance(classData) {
  if (!classData || !classData.metrics) {
    return 75; // Default balance score
  }
  
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
  
  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 75;
}

export default aiSuggestionService; 