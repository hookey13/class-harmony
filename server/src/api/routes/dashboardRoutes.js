const express = require('express');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// Import necessary models and controllers
const ClassList = require('../models/ClassList');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const ParentRequest = require('../models/ParentRequest');
const TeacherSurvey = require('../models/TeacherSurvey');

/**
 * @route   GET /api/dashboard/:schoolId
 * @desc    Get all dashboard data for a school
 * @access  Private
 */
router.get('/:schoolId', authenticate, async (req, res) => {
  try {
    const { schoolId } = req.params;
    
    // Fetch all dashboard data in parallel for better performance
    const [summary, optimizationMetrics, gradeLevelProgress, recentActivity, upcomingTasks] = await Promise.all([
      fetchSummaryData(schoolId),
      fetchOptimizationMetrics(schoolId),
      fetchGradeLevelProgress(schoolId),
      fetchRecentActivity(schoolId),
      fetchUpcomingTasks(schoolId)
    ]);
    
    res.json({
      summary,
      optimizationMetrics,
      gradeLevelProgress,
      recentActivity,
      upcomingTasks
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

/**
 * @route   GET /api/dashboard/summary/:schoolId
 * @desc    Get dashboard summary statistics
 * @access  Private
 */
router.get('/summary/:schoolId', authenticate, async (req, res) => {
  try {
    const { schoolId } = req.params;
    const summary = await fetchSummaryData(schoolId);
    
    res.json(summary);
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
});

/**
 * @route   GET /api/dashboard/optimization-metrics/:schoolId
 * @desc    Get optimization metrics for all class lists
 * @access  Private
 */
router.get('/optimization-metrics/:schoolId', authenticate, async (req, res) => {
  try {
    const { schoolId } = req.params;
    const metrics = await fetchOptimizationMetrics(schoolId);
    
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching optimization metrics:', error);
    res.status(500).json({ error: 'Failed to fetch optimization metrics' });
  }
});

/**
 * @route   GET /api/dashboard/class-balance/:classListId
 * @desc    Get class balance data for visualization
 * @access  Private
 */
router.get('/class-balance/:classListId', authenticate, async (req, res) => {
  try {
    const { classListId } = req.params;
    
    // Fetch class list with populated classes and students
    const classList = await ClassList.findById(classListId)
      .populate({
        path: 'classes',
        populate: {
          path: 'students',
          model: 'Student'
        }
      });
    
    if (!classList) {
      return res.status(404).json({ error: 'Class list not found' });
    }
    
    // Prepare data for visualization
    const classNames = classList.classes.map(c => c.name);
    const metrics = {
      gender: {
        labels: ['Male', 'Female'],
        datasets: classList.classes.map(c => {
          const males = c.students.filter(s => s.gender === 'male').length;
          const females = c.students.filter(s => s.gender === 'female').length;
          return { male: males, female: females };
        })
      },
      academic: {
        labels: ['High', 'Medium', 'Low'],
        datasets: classList.classes.map(c => {
          const high = c.students.filter(s => s.academicLevel === 'high').length;
          const medium = c.students.filter(s => s.academicLevel === 'medium').length;
          const low = c.students.filter(s => s.academicLevel === 'low').length;
          return { high, medium, low };
        })
      },
      behavior: {
        labels: ['Excellent', 'Good', 'Needs Improvement'],
        datasets: classList.classes.map(c => {
          const excellent = c.students.filter(s => s.behaviorLevel === 'excellent').length;
          const good = c.students.filter(s => s.behaviorLevel === 'good').length;
          const needsImprovement = c.students.filter(s => s.behaviorLevel === 'needsImprovement').length;
          return { excellent, good, needsImprovement };
        })
      },
      specialNeeds: {
        labels: ['IEP', 'ELL', '504', 'None'],
        datasets: classList.classes.map(c => {
          const iep = c.students.filter(s => s.specialNeeds?.includes('iep')).length;
          const ell = c.students.filter(s => s.specialNeeds?.includes('ell')).length;
          const plan504 = c.students.filter(s => s.specialNeeds?.includes('504')).length;
          const none = c.students.filter(s => !s.specialNeeds || s.specialNeeds.length === 0).length;
          return { iep, ell, plan504, none };
        })
      },
      // Add more metrics as needed
    };
    
    res.json({ classNames, metrics });
  } catch (error) {
    console.error('Error fetching class balance data:', error);
    res.status(500).json({ error: 'Failed to fetch class balance data' });
  }
});

/**
 * @route   GET /api/dashboard/parent-requests/:schoolId
 * @desc    Get parent request statistics and data
 * @access  Private
 */
router.get('/parent-requests/:schoolId', authenticate, async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { status, limit = 20 } = req.query;
    
    // Build query
    const query = { school: schoolId };
    if (status) {
      query.status = status;
    }
    
    // Fetch parent requests with related student data
    const requests = await ParentRequest.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('student', 'firstName lastName grade')
      .populate('parent', 'firstName lastName email');
    
    // Format the data for the frontend
    const formattedRequests = requests.map(req => ({
      id: req._id,
      studentName: `${req.student.firstName} ${req.student.lastName}`,
      parentName: `${req.parent.firstName} ${req.parent.lastName}`,
      reason: req.reason,
      status: req.status.toUpperCase(),
      date: formatDate(req.createdAt),
      grade: req.student.grade
    }));
    
    res.json(formattedRequests);
  } catch (error) {
    console.error('Error fetching parent requests:', error);
    res.status(500).json({ error: 'Failed to fetch parent requests' });
  }
});

/**
 * @route   GET /api/dashboard/grade-progress/:schoolId
 * @desc    Get grade level progress data
 * @access  Private
 */
router.get('/grade-progress/:schoolId', authenticate, async (req, res) => {
  try {
    const { schoolId } = req.params;
    const gradeLevelProgress = await fetchGradeLevelProgress(schoolId);
    
    res.json(gradeLevelProgress);
  } catch (error) {
    console.error('Error fetching grade level progress:', error);
    res.status(500).json({ error: 'Failed to fetch grade level progress' });
  }
});

/**
 * @route   GET /api/dashboard/activity/:schoolId
 * @desc    Get recent activity notifications
 * @access  Private
 */
router.get('/activity/:schoolId', authenticate, async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { limit = 5 } = req.query;
    
    const activity = await fetchRecentActivity(schoolId, parseInt(limit));
    res.json(activity);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
});

/**
 * @route   GET /api/dashboard/tasks/:schoolId
 * @desc    Get upcoming tasks for the dashboard
 * @access  Private
 */
router.get('/tasks/:schoolId', authenticate, async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { limit = 3 } = req.query;
    
    const tasks = await fetchUpcomingTasks(schoolId, parseInt(limit));
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching upcoming tasks:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming tasks' });
  }
});

// Helper functions for fetching different parts of the dashboard data

async function fetchSummaryData(schoolId) {
  // Fetch counts from various collections
  const [studentCount, teacherCount, parentRequestCount] = await Promise.all([
    Student.countDocuments({ school: schoolId }),
    Teacher.countDocuments({ school: schoolId }),
    ParentRequest.countDocuments({ school: schoolId })
  ]);
  
  // Fetch surveys
  const surveys = await TeacherSurvey.find({ school: schoolId });
  const completedSurveys = surveys.filter(s => s.status === 'completed').length;
  const pendingSurveys = surveys.filter(s => s.status === 'pending').length;
  
  // Fetch class lists
  const classLists = await ClassList.find({ school: schoolId });
  const completed = classLists.filter(list => list.status === 'active').length;
  const percentComplete = classLists.length > 0 
    ? Math.round((completed / classLists.length) * 100) 
    : 0;
  
  return {
    totalStudents: studentCount,
    totalTeachers: teacherCount,
    completedSurveys,
    pendingSurveys,
    parentRequests: parentRequestCount,
    percentComplete
  };
}

async function fetchOptimizationMetrics(schoolId) {
  // For now, return sample data
  // TODO: Implement real metrics calculation based on actual class lists
  
  return {
    genderBalance: 87,
    academicBalance: 92,
    behaviorBalance: 85,
    specialNeedsDistribution: 78,
    parentRequestsFulfilled: 83,
    descriptions: {
      genderBalance: "Measures how evenly gender is distributed across classes",
      academicBalance: "Balance of academic abilities across classes",
      behaviorBalance: "Distribution of behavior concerns across classes",
      specialNeedsDistribution: "How evenly special needs students are distributed",
      parentRequestsFulfilled: "Percentage of parent requests fulfilled"
    }
  };
}

async function fetchGradeLevelProgress(schoolId) {
  // Fetch students grouped by grade
  const students = await Student.find({ school: schoolId });
  const studentsByGrade = {};
  
  students.forEach(student => {
    if (!studentsByGrade[student.grade]) {
      studentsByGrade[student.grade] = 0;
    }
    studentsByGrade[student.grade]++;
  });
  
  // Fetch class lists
  const classLists = await ClassList.find({ school: schoolId });
  
  // Calculate progress for each grade level
  const grades = ['K', '1', '2', '3', '4', '5']; // Adjust based on your school's grades
  
  return grades.map(grade => {
    // Find class lists for this grade
    const relatedLists = classLists.filter(list => list.gradeLevel === grade);
    
    // Calculate progress
    let progress = 0;
    let status = 'planning';
    
    if (relatedLists.length > 0) {
      const activeList = relatedLists.find(list => list.status === 'active');
      const draftList = relatedLists.find(list => list.status === 'draft');
      
      if (activeList) {
        progress = 100;
        status = 'complete';
      } else if (draftList) {
        progress = 60;
        status = 'in-progress';
      } else {
        progress = 30;
        status = 'planning';
      }
    }
    
    return {
      id: grade,
      name: grade === 'K' ? 'Kindergarten' : `Grade ${grade}`,
      students: studentsByGrade[grade] || 0,
      progress,
      status
    };
  });
}

async function fetchRecentActivity(schoolId, limit = 5) {
  // In a real implementation, you would query from an Activity or Notification collection
  // For now, return sample data
  
  const mockActivities = [
    { id: 1, message: 'Teacher Sarah Johnson completed her survey', date: '2 hours ago', type: 'survey' },
    { id: 2, message: 'New parent request received for student Alex Chen', date: '4 hours ago', type: 'request' },
    { id: 3, message: '12 new students imported from PowerSchool', date: 'Yesterday', type: 'import' },
    { id: 4, message: 'Class list optimization complete for Grade 3', date: 'Yesterday', type: 'optimization' },
    { id: 5, message: 'Principal review requested for Grade 2 class list', date: '2 days ago', type: 'review' },
    { id: 6, message: 'Teacher James Wilson completed his survey', date: '3 days ago', type: 'survey' },
    { id: 7, message: 'New parent request received for student Emma Johnson', date: '3 days ago', type: 'request' },
  ];
  
  return mockActivities.slice(0, limit);
}

async function fetchUpcomingTasks(schoolId, limit = 3) {
  // In a real implementation, you would query from a Tasks collection
  // For now, return sample data
  
  const mockTasks = [
    { id: 1, task: 'Complete Grade 2 teacher surveys', due: '2 days', progress: 75 },
    { id: 2, task: 'Review parent requests for Grade 4', due: '3 days', progress: 30 },
    { id: 3, task: 'Finalize class lists for Grade 1', due: '1 week', progress: 50 },
    { id: 4, task: 'Import new students from district database', due: '1 week', progress: 0 },
    { id: 5, task: 'Send parent notifications for Grade 3', due: '2 weeks', progress: 10 },
  ];
  
  return mockTasks.slice(0, limit);
}

// Utility function to format dates
function formatDate(date) {
  const now = new Date();
  const diff = now - new Date(date);
  
  // Convert milliseconds to days
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) {
    // Check if it's within the last hour
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 7) {
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  } else if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  } else {
    const months = Math.floor(days / 30);
    return `${months} month${months !== 1 ? 's' : ''} ago`;
  }
}

module.exports = router; 