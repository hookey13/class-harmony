/**
 * Learning Plan Routes
 * Handles API endpoints for learning plans
 */

const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const teacherAuth = require('../middleware/teacherAuth');
const LearningPlan = require('../models/LearningPlan');
const Student = require('../models/Student');

/**
 * @route   GET /api/learning-plans
 * @desc    Get all learning plans for a teacher
 * @access  Private (Teacher)
 */
router.get('/', [auth, teacherAuth], async (req, res) => {
  try {
    const { academicYear, studentId, status, planType } = req.query;
    
    // Build query filter
    const filter = { teacher: req.user.id };
    
    if (academicYear) filter.academicYear = academicYear;
    if (studentId) filter.student = studentId;
    if (status) filter.status = status;
    if (planType) filter.planType = planType;
    
    const learningPlans = await LearningPlan.find(filter)
      .populate('student', 'firstName lastName studentId grade')
      .populate('teacher', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(learningPlans);
  } catch (err) {
    console.error('Error fetching learning plans:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   GET /api/learning-plans/:id
 * @desc    Get a specific learning plan
 * @access  Private (Teacher)
 */
router.get('/:id', [auth, teacherAuth], async (req, res) => {
  try {
    const learningPlan = await LearningPlan.findById(req.params.id)
      .populate('student', 'firstName lastName studentId grade academicLevel behavioralLevel specialNeeds iep plan504')
      .populate('teacher', 'name email')
      .populate('createdBy', 'name')
      .populate('reviews.reviewer', 'name');
    
    if (!learningPlan) {
      return res.status(404).json({ error: 'Learning plan not found' });
    }
    
    // Check if the requesting user is the teacher assigned to this plan
    if (learningPlan.teacher._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to access this learning plan' });
    }
    
    res.json(learningPlan);
  } catch (err) {
    console.error('Error fetching learning plan:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   POST /api/learning-plans
 * @desc    Create a new learning plan
 * @access  Private (Teacher)
 */
router.post('/', [
  auth, 
  teacherAuth,
  [
    check('student', 'Student is required').not().isEmpty(),
    check('academicYear', 'Academic year is required').not().isEmpty(),
    check('title', 'Title is required').not().isEmpty(),
    check('planType', 'Plan type is required').isIn(['standard', 'intervention', 'enrichment', 'iep_aligned', 'behavior_focused'])
  ]
], async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const {
      student,
      academicYear,
      title,
      planType,
      overview,
      strengthsAndNeeds,
      goals,
      accommodations,
      classId,
      parentInput,
      status
    } = req.body;
    
    // Verify that the student exists
    const studentExists = await Student.findById(student);
    
    if (!studentExists) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Create new learning plan
    const newLearningPlan = new LearningPlan({
      student,
      academicYear,
      title,
      planType,
      overview,
      strengthsAndNeeds,
      goals,
      accommodations,
      parentInput,
      status: status || 'draft',
      createdBy: req.user.id,
      teacher: req.user.id,
      classId
    });
    
    const learningPlan = await newLearningPlan.save();
    
    res.json(learningPlan);
  } catch (err) {
    console.error('Error creating learning plan:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   PUT /api/learning-plans/:id
 * @desc    Update a learning plan
 * @access  Private (Teacher)
 */
router.put('/:id', [auth, teacherAuth], async (req, res) => {
  try {
    const {
      title,
      planType,
      overview,
      strengthsAndNeeds,
      goals,
      accommodations,
      parentInput,
      status
    } = req.body;
    
    // Find the learning plan
    let learningPlan = await LearningPlan.findById(req.params.id);
    
    if (!learningPlan) {
      return res.status(404).json({ error: 'Learning plan not found' });
    }
    
    // Check if the requesting user is the teacher assigned to this plan
    if (learningPlan.teacher.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this learning plan' });
    }
    
    // Update fields
    if (title) learningPlan.title = title;
    if (planType) learningPlan.planType = planType;
    if (overview) learningPlan.overview = overview;
    if (strengthsAndNeeds) learningPlan.strengthsAndNeeds = strengthsAndNeeds;
    if (goals) learningPlan.goals = goals;
    if (accommodations) learningPlan.accommodations = accommodations;
    if (parentInput) learningPlan.parentInput = parentInput;
    if (status) learningPlan.status = status;
    
    learningPlan.updatedAt = Date.now();
    
    const updatedLearningPlan = await learningPlan.save();
    
    res.json(updatedLearningPlan);
  } catch (err) {
    console.error('Error updating learning plan:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   POST /api/learning-plans/:id/goals
 * @desc    Add a goal to a learning plan
 * @access  Private (Teacher)
 */
router.post('/:id/goals', [
  auth, 
  teacherAuth,
  [
    check('area', 'Area is required').isIn(['academic', 'behavioral', 'social', 'other']),
    check('description', 'Description is required').not().isEmpty(),
    check('measurableOutcomes', 'Measurable outcomes are required').not().isEmpty(),
    check('timeline.targetDate', 'Target date is required').isISO8601()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const {
      area,
      description,
      measurableOutcomes,
      strategies,
      timeline,
      status
    } = req.body;
    
    // Find the learning plan
    let learningPlan = await LearningPlan.findById(req.params.id);
    
    if (!learningPlan) {
      return res.status(404).json({ error: 'Learning plan not found' });
    }
    
    // Check if the requesting user is the teacher assigned to this plan
    if (learningPlan.teacher.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this learning plan' });
    }
    
    // Create new goal
    const newGoal = {
      area,
      description,
      measurableOutcomes,
      strategies: strategies || [],
      timeline: {
        startDate: timeline.startDate || Date.now(),
        targetDate: timeline.targetDate
      },
      status: status || 'not_started',
      progress: []
    };
    
    // Add goal to learning plan
    learningPlan.goals.push(newGoal);
    learningPlan.updatedAt = Date.now();
    
    const updatedLearningPlan = await learningPlan.save();
    
    res.json(updatedLearningPlan);
  } catch (err) {
    console.error('Error adding goal to learning plan:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   PUT /api/learning-plans/:id/goals/:goalId
 * @desc    Update a goal in a learning plan
 * @access  Private (Teacher)
 */
router.put('/:id/goals/:goalId', [auth, teacherAuth], async (req, res) => {
  try {
    const {
      area,
      description,
      measurableOutcomes,
      strategies,
      timeline,
      status
    } = req.body;
    
    // Find the learning plan
    let learningPlan = await LearningPlan.findById(req.params.id);
    
    if (!learningPlan) {
      return res.status(404).json({ error: 'Learning plan not found' });
    }
    
    // Check if the requesting user is the teacher assigned to this plan
    if (learningPlan.teacher.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this learning plan' });
    }
    
    // Find the goal
    const goalIndex = learningPlan.goals.findIndex(goal => goal._id.toString() === req.params.goalId);
    
    if (goalIndex === -1) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    // Update goal fields
    if (area) learningPlan.goals[goalIndex].area = area;
    if (description) learningPlan.goals[goalIndex].description = description;
    if (measurableOutcomes) learningPlan.goals[goalIndex].measurableOutcomes = measurableOutcomes;
    if (strategies) learningPlan.goals[goalIndex].strategies = strategies;
    if (timeline) {
      if (timeline.startDate) learningPlan.goals[goalIndex].timeline.startDate = timeline.startDate;
      if (timeline.targetDate) learningPlan.goals[goalIndex].timeline.targetDate = timeline.targetDate;
    }
    if (status) learningPlan.goals[goalIndex].status = status;
    
    learningPlan.updatedAt = Date.now();
    
    const updatedLearningPlan = await learningPlan.save();
    
    res.json(updatedLearningPlan);
  } catch (err) {
    console.error('Error updating goal in learning plan:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   POST /api/learning-plans/:id/goals/:goalId/progress
 * @desc    Add progress note to a goal
 * @access  Private (Teacher)
 */
router.post('/:id/goals/:goalId/progress', [
  auth, 
  teacherAuth,
  [
    check('note', 'Note is required').not().isEmpty(),
    check('statusUpdate', 'Status update is required').isIn(['on_track', 'ahead', 'behind', 'needs_revision'])
  ]
], async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { note, statusUpdate } = req.body;
    
    // Find the learning plan
    let learningPlan = await LearningPlan.findById(req.params.id);
    
    if (!learningPlan) {
      return res.status(404).json({ error: 'Learning plan not found' });
    }
    
    // Check if the requesting user is the teacher assigned to this plan
    if (learningPlan.teacher.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this learning plan' });
    }
    
    // Find the goal
    const goalIndex = learningPlan.goals.findIndex(goal => goal._id.toString() === req.params.goalId);
    
    if (goalIndex === -1) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    // Add progress note
    const progressNote = {
      date: Date.now(),
      note,
      statusUpdate
    };
    
    learningPlan.goals[goalIndex].progress.push(progressNote);
    
    // Update goal status if needed
    if (statusUpdate === 'needs_revision') {
      learningPlan.goals[goalIndex].status = 'revised';
    } else if (learningPlan.goals[goalIndex].status === 'not_started') {
      learningPlan.goals[goalIndex].status = 'in_progress';
    }
    
    learningPlan.updatedAt = Date.now();
    
    const updatedLearningPlan = await learningPlan.save();
    
    res.json(updatedLearningPlan);
  } catch (err) {
    console.error('Error adding progress note:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   POST /api/learning-plans/:id/review
 * @desc    Add a review to a learning plan
 * @access  Private (Teacher)
 */
router.post('/:id/review', [
  auth, 
  teacherAuth,
  [
    check('notes', 'Notes are required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { notes, adjustments } = req.body;
    
    // Find the learning plan
    let learningPlan = await LearningPlan.findById(req.params.id);
    
    if (!learningPlan) {
      return res.status(404).json({ error: 'Learning plan not found' });
    }
    
    // Check if the requesting user is the teacher assigned to this plan
    if (learningPlan.teacher.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this learning plan' });
    }
    
    // Add review
    const review = {
      date: Date.now(),
      reviewer: req.user.id,
      notes,
      adjustments: adjustments || ''
    };
    
    learningPlan.reviews.push(review);
    learningPlan.updatedAt = Date.now();
    
    const updatedLearningPlan = await learningPlan.save();
    
    res.json(updatedLearningPlan);
  } catch (err) {
    console.error('Error adding review:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   DELETE /api/learning-plans/:id
 * @desc    Delete a learning plan
 * @access  Private (Teacher)
 */
router.delete('/:id', [auth, teacherAuth], async (req, res) => {
  try {
    // Find the learning plan
    const learningPlan = await LearningPlan.findById(req.params.id);
    
    if (!learningPlan) {
      return res.status(404).json({ error: 'Learning plan not found' });
    }
    
    // Check if the requesting user is the teacher who created this plan
    if (learningPlan.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this learning plan' });
    }
    
    // Check if the plan is not in draft status
    if (learningPlan.status !== 'draft') {
      return res.status(400).json({ error: 'Only draft learning plans can be deleted' });
    }
    
    await learningPlan.remove();
    
    res.json({ message: 'Learning plan deleted successfully' });
  } catch (err) {
    console.error('Error deleting learning plan:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   GET /api/learning-plans/student/:studentId
 * @desc    Get all learning plans for a specific student
 * @access  Private (Teacher)
 */
router.get('/student/:studentId', [auth, teacherAuth], async (req, res) => {
  try {
    const { academicYear } = req.query;
    
    // Build query filter
    const filter = { 
      student: req.params.studentId,
      teacher: req.user.id
    };
    
    if (academicYear) filter.academicYear = academicYear;
    
    const learningPlans = await LearningPlan.find(filter)
      .populate('student', 'firstName lastName studentId grade')
      .sort({ createdAt: -1 });
    
    res.json(learningPlans);
  } catch (err) {
    console.error('Error fetching student learning plans:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
