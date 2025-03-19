const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleCheck');
const Student = require('../models/Student');
const Class = require('../models/Class');
const ParentPreference = require('../models/ParentPreference');
const TeacherSurvey = require('../models/TeacherSurvey');
const OptimizationResult = require('../models/OptimizationResult');
const PDFDocument = require('pdfkit');
const { Parser } = require('json2csv');

// Get analytics data
router.get('/', [auth, isAdmin], async (req, res) => {
  try {
    const { grade, dateRange } = req.query;
    const dateFilter = getDateFilter(dateRange);

    // Fetch class distribution data
    const classDistribution = await Class.aggregate([
      { $match: grade !== 'all' ? { grade } : {} },
      {
        $project: {
          className: '$name',
          studentCount: { $size: '$students' },
          targetSize: '$targetSize',
          boys: {
            $size: {
              $filter: {
                input: '$students',
                as: 'student',
                cond: { $eq: ['$$student.gender', 'male'] }
              }
            }
          },
          girls: {
            $size: {
              $filter: {
                input: '$students',
                as: 'student',
                cond: { $eq: ['$$student.gender', 'female'] }
              }
            }
          }
        }
      }
    ]);

    // Fetch student demographics
    const studentDemographics = await Student.aggregate([
      { $match: grade !== 'all' ? { grade } : {} },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          specialNeeds: { $sum: { $cond: ['$specialNeeds', 1, 0] } },
          ell: { $sum: { $cond: ['$isELL', 1, 0] } },
          gifted: { $sum: { $cond: ['$isGifted', 1, 0] } },
          behavioralSupport: { $sum: { $cond: ['$needsBehavioralSupport', 1, 0] } }
        }
      },
      {
        $project: {
          _id: 0,
          demographics: [
            { name: 'Special Needs', value: '$specialNeeds' },
            { name: 'ELL', value: '$ell' },
            { name: 'Gifted', value: '$gifted' },
            { name: 'Behavioral Support', value: '$behavioralSupport' }
          ]
        }
      }
    ]);

    // Fetch optimization scores over time
    const optimizationScores = await Class.aggregate([
      { $match: grade !== 'all' ? { grade } : {} },
      { $match: { updatedAt: { $gte: dateFilter } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$updatedAt'
            }
          },
          academicBalance: { $avg: '$metrics.academicBalance' },
          behavioralBalance: { $avg: '$metrics.behavioralBalance' },
          specialNeeds: { $avg: '$metrics.specialNeedsDistribution' }
        }
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          academicBalance: { $round: ['$academicBalance', 2] },
          behavioralBalance: { $round: ['$behavioralBalance', 2] },
          specialNeeds: { $round: ['$specialNeeds', 2] }
        }
      },
      { $sort: { date: 1 } }
    ]);

    // Fetch parent request metrics
    const requestMetrics = await ParentPreference.aggregate([
      { $match: grade !== 'all' ? { grade } : {} },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          status: '$_id',
          value: '$count'
        }
      }
    ]);

    // Fetch teacher survey stats
    const teacherSurveyStats = await TeacherSurvey.aggregate([
      { $match: grade !== 'all' ? { grade } : {} },
      {
        $group: {
          _id: '$grade',
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          grade: '$_id',
          completed: 1,
          pending: 1
        }
      },
      { $sort: { grade: 1 } }
    ]);

    res.json({
      classDistribution,
      studentDemographics: studentDemographics[0]?.demographics || [],
      optimizationScores,
      requestMetrics,
      teacherSurveyStats
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

// Export analytics data as PDF
router.get('/export/pdf', [auth, isAdmin], async (req, res) => {
  try {
    const { grade, dateRange } = req.query;
    
    // Create PDF document
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=class-harmony-analytics.pdf');
    doc.pipe(res);

    // Add content to PDF
    doc.fontSize(25).text('Class Harmony Analytics Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Grade: ${grade === 'all' ? 'All Grades' : grade}`);
    doc.text(`Time Range: ${dateRange}`);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`);
    doc.moveDown();

    // Fetch and add data sections
    const data = await fetchAnalyticsData(grade, dateRange);
    
    // Class Distribution
    doc.fontSize(16).text('Class Distribution');
    doc.moveDown();
    data.classDistribution.forEach(cls => {
      doc.fontSize(12).text(`${cls.className}: ${cls.studentCount} students`);
    });
    doc.moveDown();

    // Demographics
    doc.fontSize(16).text('Student Demographics');
    doc.moveDown();
    data.studentDemographics.forEach(demo => {
      doc.fontSize(12).text(`${demo.name}: ${demo.value}`);
    });
    doc.moveDown();

    // Optimization Scores
    doc.fontSize(16).text('Recent Optimization Scores');
    doc.moveDown();
    data.optimizationScores.slice(-5).forEach(score => {
      doc.fontSize(12).text(
        `${score.date}: Academic: ${score.academicBalance}, Behavioral: ${score.behavioralBalance}`
      );
    });

    doc.end();
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF report' });
  }
});

// Export analytics data as CSV
router.get('/export/csv', [auth, isAdmin], async (req, res) => {
  try {
    const { grade, dateRange } = req.query;
    const data = await fetchAnalyticsData(grade, dateRange);

    const fields = [
      'className',
      'studentCount',
      'targetSize',
      'academicBalance',
      'behavioralBalance',
      'specialNeeds'
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(data.classDistribution);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=class-harmony-analytics.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error generating CSV:', error);
    res.status(500).json({ error: 'Failed to generate CSV report' });
  }
});

// Get predictive analytics data
router.get('/predictions', [auth, isAdmin], async (req, res) => {
  try {
    const { grade } = req.query;
    const matchGrade = grade !== 'all' ? { grade } : {};

    // Fetch historical data for predictions
    const [
      classHistory,
      studentHistory,
      teacherSurveys,
      parentPreferences
    ] = await Promise.all([
      Class.find(matchGrade)
        .populate('students')
        .populate('teacher')
        .sort('-createdAt')
        .limit(10),
      Student.find(matchGrade)
        .populate('academicHistory')
        .populate('behavioralHistory'),
      TeacherSurvey.find(matchGrade),
      ParentPreference.find(matchGrade)
    ]);

    // Generate class placement predictions
    const classPlacementPredictions = generateClassPlacementPredictions(
      classHistory,
      studentHistory,
      teacherSurveys,
      parentPreferences
    );

    // Generate student performance predictions
    const studentPerformancePredictions = generateStudentPerformancePredictions(
      studentHistory
    );

    // Generate class balance projections
    const classBalanceProjections = generateClassBalanceProjections(
      classHistory
    );

    // Generate risk assessments
    const riskAssessments = generateRiskAssessments(
      classHistory,
      studentHistory,
      teacherSurveys,
      parentPreferences
    );

    // Generate recommended actions
    const recommendedActions = generateRecommendedActions(
      riskAssessments,
      classPlacementPredictions,
      studentPerformancePredictions
    );

    // Calculate overall model confidence
    const modelConfidence = calculateModelConfidence(
      classPlacementPredictions,
      studentPerformancePredictions,
      classBalanceProjections
    );

    res.json({
      classPlacementPredictions,
      studentPerformancePredictions,
      classBalanceProjections,
      riskAssessments,
      recommendedActions,
      modelConfidence
    });
  } catch (error) {
    console.error('Error generating predictions:', error);
    res.status(500).json({ error: 'Failed to generate predictions' });
  }
});

/**
 * @route   GET /api/analytics/multi-year
 * @desc    Get analytics data across multiple academic years
 * @access  Private (Admin only)
 */
router.get('/multi-year', [auth, isAdmin], async (req, res) => {
  try {
    const { years, grades, metrics } = req.query;
    
    // Parse arrays from query params if they're strings
    const selectedYears = Array.isArray(years) ? years : JSON.parse(years || '[]');
    const selectedGrades = Array.isArray(grades) ? grades : JSON.parse(grades || '["all"]');
    const selectedMetrics = Array.isArray(metrics) ? metrics : JSON.parse(metrics || '[]');
    
    const multiYearData = await fetchMultiYearData(selectedYears, selectedGrades, selectedMetrics);
    
    res.json(multiYearData);
  } catch (error) {
    console.error('Error fetching multi-year analytics data:', error);
    res.status(500).json({ error: 'Failed to fetch multi-year analytics data' });
  }
});

/**
 * @route   GET /api/analytics/multi-year/export/:format
 * @desc    Export multi-year analytics data in specified format
 * @access  Private (Admin only)
 */
router.get('/multi-year/export/:format', [auth, isAdmin], async (req, res) => {
  try {
    const { format } = req.params;
    const { years, grades, metrics } = req.query;
    
    // Parse arrays from query params
    const selectedYears = Array.isArray(years) ? years : JSON.parse(years || '[]');
    const selectedGrades = Array.isArray(grades) ? grades : JSON.parse(grades || '["all"]');
    const selectedMetrics = Array.isArray(metrics) ? metrics : JSON.parse(metrics || '[]');
    
    const multiYearData = await fetchMultiYearData(selectedYears, selectedGrades, selectedMetrics);
    
    // Export data in the requested format
    switch (format.toLowerCase()) {
      case 'csv':
        const csvFields = ['year', ...selectedMetrics];
        const json2csvParser = new Parser({ fields: csvFields });
        const csvData = json2csvParser.parse(multiYearData.trends);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=multi-year-analytics.csv');
        return res.send(csvData);
        
      case 'xlsx':
        // In a real implementation, use a library like exceljs to create Excel files
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=multi-year-analytics.xlsx');
        return res.send("Excel export would be implemented here");
        
      case 'pdf':
        // Create a PDF document
        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=multi-year-analytics.pdf');
        
        doc.pipe(res);
        doc.fontSize(20).text('Multi-Year Analytics Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Selected Years: ${selectedYears.join(', ')}`);
        doc.moveDown();
        doc.text(`Selected Grades: ${selectedGrades.join(', ')}`);
        doc.moveDown();
        doc.text(`Selected Metrics: ${selectedMetrics.join(', ')}`);
        doc.moveDown();
        
        // Add data tables
        if (multiYearData.trends && multiYearData.trends.length > 0) {
          doc.fontSize(16).text('Metrics Trends', { underline: true });
          doc.moveDown();
          
          // Create a table layout
          const tableTop = doc.y;
          let cellWidth = 100;
          let cellHeight = 30;
          let currX = doc.x;
          
          // Draw headers
          doc.fontSize(10).text('Year', currX, tableTop);
          currX += cellWidth;
          
          selectedMetrics.forEach(metric => {
            doc.text(metric, currX, tableTop);
            currX += cellWidth;
          });
          
          // Draw data rows
          let currY = tableTop + cellHeight;
          multiYearData.trends.forEach(trend => {
            currX = doc.x;
            doc.text(trend.year, currX, currY);
            currX += cellWidth;
            
            selectedMetrics.forEach(metric => {
              doc.text(trend[metric]?.toFixed(2) || 'N/A', currX, currY);
              currX += cellWidth;
            });
            
            currY += cellHeight;
          });
        }
        
        doc.end();
        return;
      
      default:
        return res.status(400).json({ error: 'Unsupported export format' });
    }
  } catch (error) {
    console.error('Error exporting multi-year analytics data:', error);
    res.status(500).json({ error: 'Failed to export multi-year analytics data' });
  }
});

// Helper function to get date filter based on range
function getDateFilter(range) {
  const now = new Date();
  switch (range) {
    case 'week':
      return new Date(now.setDate(now.getDate() - 7));
    case 'month':
      return new Date(now.setMonth(now.getMonth() - 1));
    case 'quarter':
      return new Date(now.setMonth(now.getMonth() - 3));
    case 'year':
      return new Date(now.setFullYear(now.getFullYear() - 1));
    default:
      return new Date(now.setMonth(now.getMonth() - 1)); // Default to last month
  }
}

// Helper function to fetch analytics data
async function fetchAnalyticsData(grade, dateRange) {
  const dateFilter = getDateFilter(dateRange);
  const matchGrade = grade !== 'all' ? { grade } : {};

  const [
    classDistribution,
    studentDemographics,
    optimizationScores,
    requestMetrics,
    teacherSurveyStats
  ] = await Promise.all([
    Class.aggregate([
      { $match: matchGrade },
      {
        $project: {
          className: '$name',
          studentCount: { $size: '$students' },
          targetSize: '$targetSize',
          academicBalance: '$metrics.academicBalance',
          behavioralBalance: '$metrics.behavioralBalance',
          specialNeeds: '$metrics.specialNeedsDistribution'
        }
      }
    ]),
    Student.aggregate([
      { $match: matchGrade },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          specialNeeds: { $sum: { $cond: ['$specialNeeds', 1, 0] } },
          ell: { $sum: { $cond: ['$isELL', 1, 0] } },
          gifted: { $sum: { $cond: ['$isGifted', 1, 0] } }
        }
      }
    ]),
    Class.aggregate([
      { $match: { ...matchGrade, updatedAt: { $gte: dateFilter } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' }
          },
          academicBalance: { $avg: '$metrics.academicBalance' },
          behavioralBalance: { $avg: '$metrics.behavioralBalance' }
        }
      },
      { $sort: { _id: 1 } }
    ]),
    ParentPreference.aggregate([
      { $match: matchGrade },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    TeacherSurvey.aggregate([
      { $match: matchGrade },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])
  ]);

  return {
    classDistribution,
    studentDemographics: studentDemographics[0] || { total: 0, specialNeeds: 0, ell: 0, gifted: 0 },
    optimizationScores,
    requestMetrics,
    teacherSurveyStats
  };
}

// Helper function to generate class placement predictions
function generateClassPlacementPredictions(classHistory, studentHistory, teacherSurveys, parentPreferences) {
  const predictions = [];

  // Analyze historical class performance
  const historicalPerformance = analyzeHistoricalPerformance(classHistory);

  // Analyze student compatibility
  const studentCompatibility = analyzeStudentCompatibility(studentHistory, teacherSurveys);

  // Analyze parent preferences
  const preferenceImpact = analyzeParentPreferences(parentPreferences);

  // Generate predictions based on analyses
  predictions.push({
    title: 'Optimal Class Size Distribution',
    description: 'Based on historical performance and current student needs',
    confidence: calculateConfidence(historicalPerformance),
    impact: 'High'
  });

  predictions.push({
    title: 'Student Grouping Recommendations',
    description: 'Suggested student groupings based on compatibility analysis',
    confidence: calculateConfidence(studentCompatibility),
    impact: 'Medium'
  });

  predictions.push({
    title: 'Parent Preference Impact',
    description: 'Projected impact of accommodating parent preferences',
    confidence: calculateConfidence(preferenceImpact),
    impact: 'Medium'
  });

  return predictions;
}

// Helper function to generate student performance predictions
function generateStudentPerformancePredictions(studentHistory) {
  return studentHistory.map(student => ({
    id: student._id,
    currentScore: calculateCurrentScore(student),
    projectedScore: predictFutureScore(student),
    confidence: calculatePredictionConfidence(student)
  }));
}

// Helper function to generate class balance projections
function generateClassBalanceProjections(classHistory) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map(month => ({
    month,
    academicBalance: predictAcademicBalance(classHistory, month),
    behavioralBalance: predictBehavioralBalance(classHistory, month)
  }));
}

// Helper function to generate risk assessments
function generateRiskAssessments(classHistory, studentHistory, teacherSurveys, parentPreferences) {
  const risks = [];

  // Analyze class size risks
  const classSizeRisks = analyzeClassSizeRisks(classHistory);
  if (classSizeRisks) {
    risks.push({
      title: 'Class Size Imbalance Risk',
      description: classSizeRisks.description,
      severity: classSizeRisks.severity,
      probability: classSizeRisks.probability
    });
  }

  // Analyze academic balance risks
  const academicRisks = analyzeAcademicRisks(studentHistory);
  if (academicRisks) {
    risks.push({
      title: 'Academic Balance Risk',
      description: academicRisks.description,
      severity: academicRisks.severity,
      probability: academicRisks.probability
    });
  }

  // Analyze behavioral risks
  const behavioralRisks = analyzeBehavioralRisks(studentHistory, teacherSurveys);
  if (behavioralRisks) {
    risks.push({
      title: 'Behavioral Management Risk',
      description: behavioralRisks.description,
      severity: behavioralRisks.severity,
      probability: behavioralRisks.probability
    });
  }

  return risks;
}

// Helper function to generate recommended actions
function generateRecommendedActions(riskAssessments, classPlacementPredictions, studentPerformancePredictions) {
  const actions = [];

  // Generate actions based on high-risk assessments
  riskAssessments
    .filter(risk => risk.severity === 'high')
    .forEach(risk => {
      actions.push({
        title: `Address ${risk.title}`,
        description: generateActionDescription(risk),
        type: 'immediate',
        priority: 'High',
        impact: 'High'
      });
    });

  // Generate actions based on class placement predictions
  classPlacementPredictions
    .filter(pred => pred.confidence > 70)
    .forEach(pred => {
      actions.push({
        title: `Implement ${pred.title}`,
        description: generateActionDescription(pred),
        type: 'planned',
        priority: pred.impact === 'High' ? 'High' : 'Medium',
        impact: pred.impact
      });
    });

  return actions;
}

// Helper function to calculate model confidence
function calculateModelConfidence(classPlacementPredictions, studentPerformancePredictions, classBalanceProjections) {
  const confidenceScores = [
    ...classPlacementPredictions.map(p => p.confidence),
    ...studentPerformancePredictions.map(p => p.confidence),
    calculateProjectionConfidence(classBalanceProjections)
  ];

  return confidenceScores.reduce((acc, score) => acc + score, 0) / confidenceScores.length;
}

// Analysis helper functions
function analyzeHistoricalPerformance(classHistory) {
  // Implement historical performance analysis logic
  return {
    score: 0.85,
    confidence: 75
  };
}

function analyzeStudentCompatibility(studentHistory, teacherSurveys) {
  // Implement student compatibility analysis logic
  return {
    score: 0.78,
    confidence: 70
  };
}

function analyzeParentPreferences(parentPreferences) {
  // Implement parent preference analysis logic
  return {
    score: 0.82,
    confidence: 65
  };
}

function calculateConfidence(analysis) {
  return Math.round(analysis.confidence);
}

function calculateCurrentScore(student) {
  // Implement current score calculation logic
  return Math.random() * 100;
}

function predictFutureScore(student) {
  // Implement future score prediction logic
  return Math.min(100, calculateCurrentScore(student) * (1 + Math.random() * 0.2));
}

function calculatePredictionConfidence(student) {
  // Implement prediction confidence calculation logic
  return Math.round(60 + Math.random() * 30);
}

function predictAcademicBalance(classHistory, month) {
  // Implement academic balance prediction logic
  return 0.7 + Math.random() * 0.2;
}

function predictBehavioralBalance(classHistory, month) {
  // Implement behavioral balance prediction logic
  return 0.65 + Math.random() * 0.25;
}

function analyzeClassSizeRisks(classHistory) {
  // Implement class size risk analysis logic
  return {
    description: 'Potential overcrowding in advanced classes',
    severity: 'medium',
    probability: 65
  };
}

function analyzeAcademicRisks(studentHistory) {
  // Implement academic risk analysis logic
  return {
    description: 'Uneven distribution of high-performing students',
    severity: 'high',
    probability: 80
  };
}

function analyzeBehavioralRisks(studentHistory, teacherSurveys) {
  // Implement behavioral risk analysis logic
  return {
    description: 'Potential behavioral management challenges in specific classes',
    severity: 'medium',
    probability: 70
  };
}

function generateActionDescription(item) {
  // Implement action description generation logic
  return `Take necessary steps to address ${item.title.toLowerCase()} based on current data and historical patterns.`;
}

function calculateProjectionConfidence(projections) {
  // Implement projection confidence calculation logic
  return 70;
}

/**
 * Fetch multi-year analytics data from database
 * @param {Array} years - Array of academic years to analyze
 * @param {Array} grades - Array of grade levels to include
 * @param {Array} metrics - Array of metrics to calculate
 * @returns {Object} Multi-year analytics data
 */
async function fetchMultiYearData(years, grades, metrics) {
  try {
    // In a real implementation, we would query the database for each academic year
    // and compile the results into the return object
    
    // Example query for class balance metrics
    const classMetrics = [];
    
    for (const year of years) {
      let matchQuery = { academicYear: year };
      
      if (!grades.includes('all')) {
        matchQuery.grade = { $in: grades };
      }
      
      // Get optimization results for the selected academic years and grades
      const optimizationResults = await OptimizationResult.find(matchQuery)
        .sort({ createdAt: -1 })
        .populate('classes')
        .lean();
      
      // Calculate metrics for this academic year
      const yearMetrics = {
        year,
        academicBalance: 0,
        behavioralBalance: 0,
        genderBalance: 0,
        specialNeedsDistribution: 0,
        parentRequestsFulfilled: 0
      };
      
      // Process data from the database to calculate metrics
      // ... (calculation logic would go here)
      
      // For now, we'll use random data for demonstration
      yearMetrics.academicBalance = 70 + Math.random() * 20;
      yearMetrics.behavioralBalance = 65 + Math.random() * 25;
      yearMetrics.genderBalance = 80 + Math.random() * 15;
      yearMetrics.specialNeedsDistribution = 75 + Math.random() * 15;
      yearMetrics.parentRequestsFulfilled = 65 + Math.random() * 30;
      yearMetrics.teacherSatisfaction = 70 + Math.random() * 20;
      yearMetrics.studentPerformanceGrowth = 60 + Math.random() * 30;
      
      classMetrics.push(yearMetrics);
    }
    
    // Comparison data for metrics across years
    const comparisonData = metrics.map(metric => {
      const metricData = {
        metric: getMetricLabel(metric),
      };
      
      years.forEach(year => {
        const yearData = classMetrics.find(ym => ym.year === year);
        metricData[year] = yearData ? yearData[metric] : null;
      });
      
      return metricData;
    });
    
    // Student performance data
    const performanceMetrics = ['Reading', 'Math', 'Science', 'Social Studies', 'Art'];
    const performanceTrends = years.map(year => {
      const yearData = {
        year,
      };
      
      performanceMetrics.forEach(subject => {
        yearData[subject] = 70 + Math.random() * 20;
      });
      
      return yearData;
    });
    
    // Optimization impact data
    const optimizationImpact = years.map(year => {
      return {
        year,
        beforeOptimization: 50 + Math.random() * 20,
        afterOptimization: 70 + Math.random() * 20,
        improvement: 15 + Math.random() * 10,
      };
    });
    
    return {
      trends: classMetrics,
      comparison: comparisonData,
      performanceTrends,
      optimizationImpact
    };
  } catch (error) {
    console.error('Error in fetchMultiYearData:', error);
    throw error;
  }
}

/**
 * Get human-readable label for a metric
 * @param {string} metric - The metric key
 * @returns {string} Human-readable label
 */
function getMetricLabel(metric) {
  const metricLabels = {
    academicBalance: 'Academic Balance',
    behavioralBalance: 'Behavioral Balance',
    genderBalance: 'Gender Balance',
    specialNeedsDistribution: 'Special Needs Distribution',
    parentRequestsFulfilled: 'Parent Requests Fulfilled',
    teacherSatisfaction: 'Teacher Satisfaction',
    studentPerformanceGrowth: 'Student Growth'
  };
  
  return metricLabels[metric] || metric;
}

module.exports = router; 