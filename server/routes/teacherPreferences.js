const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const TeacherPreference = require('../models/TeacherPreference');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/validate');
const { APIError } = require('../middleware/errorHandler');

// @route   GET /api/teacher-preferences
// @desc    Get all teacher preferences (with pagination and filtering)
// @access  Private/Admin
router.get('/', [auth, checkRole('admin')], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    if (req.query.academicYear) filter.academicYear = req.query.academicYear;
    if (req.query.grade) filter.grade = parseInt(req.query.grade);
    if (req.query.status) filter.status = req.query.status;
    if (req.query.teacher) filter.teacher = req.query.teacher;

    // Get preferences with pagination
    const preferences = await TeacherPreference.find(filter)
      .populate('teacher', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await TeacherPreference.countDocuments(filter);

    res.json({
      preferences,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/teacher-preferences/teacher/:teacherId
// @desc    Get preferences for a specific teacher
// @access  Private/Admin or Teacher (own preferences)
router.get('/teacher/:teacherId', auth, async (req, res) => {
  try {
    // Check if user is authorized
    if (req.user.role === 'teacher' && req.user._id.toString() !== req.params.teacherId) {
      return res.status(403).json({ msg: 'Not authorized to view these preferences' });
    }

    // Get preferences for teacher
    const preferences = await TeacherPreference.find({ teacher: req.params.teacherId })
      .populate('teacher', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName')
      .sort({ academicYear: -1 });

    res.json(preferences);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Teacher not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET /api/teacher-preferences/:id
// @desc    Get teacher preference by ID
// @access  Private/Admin or Teacher (own preference)
router.get('/:id', auth, async (req, res) => {
  try {
    const preference = await TeacherPreference.findById(req.params.id)
      .populate('teacher', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName');
    
    if (!preference) {
      return res.status(404).json({ msg: 'Preference not found' });
    }

    // Check if user is authorized
    if (req.user.role === 'teacher' && preference.teacher._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: 'Not authorized to view this preference' });
    }

    res.json(preference);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Preference not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST /api/teacher-preferences
// @desc    Create a new teacher preference
// @access  Private/Teacher or Admin
router.post('/', [
  auth,
  checkRole('admin', 'teacher'),
  check('academicYear', 'Academic year is required').not().isEmpty(),
  check('grade', 'Grade is required').isInt({ min: 0, max: 12 }),
  check('teachingStyle.primary', 'Primary teaching style is required').isIn(['visual', 'auditory', 'kinesthetic', 'reading/writing'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      academicYear,
      grade,
      teachingStyle,
      classroomEnvironment,
      specialtyAreas,
      studentPreferences,
      specialEducationPreferences,
      classComposition,
      additionalConsiderations,
      status,
      notes
    } = req.body;

    // Determine teacher ID
    let teacherId;
    if (req.user.role === 'admin' && req.body.teacher) {
      // Admin can create preferences for any teacher
      teacherId = req.body.teacher;
      
      // Validate teacher ID
      const teacher = await User.findById(teacherId);
      if (!teacher || teacher.role !== 'teacher') {
        return res.status(400).json({ errors: [{ msg: 'Invalid teacher ID' }] });
      }
    } else {
      // Teachers can only create their own preferences
      teacherId = req.user._id;
    }

    // Check if preference already exists for this teacher, year, and grade
    const existingPreference = await TeacherPreference.findOne({
      teacher: teacherId,
      academicYear,
      grade
    });

    if (existingPreference) {
      return res.status(400).json({ 
        errors: [{ msg: 'Preference already exists for this teacher, academic year, and grade' }] 
      });
    }

    // Create new preference
    const preference = new TeacherPreference({
      teacher: teacherId,
      academicYear,
      grade,
      teachingStyle,
      classroomEnvironment,
      specialtyAreas,
      studentPreferences,
      specialEducationPreferences,
      classComposition,
      additionalConsiderations,
      status: status || 'draft',
      notes: notes ? [{
        content: notes,
        author: req.user._id,
        date: new Date()
      }] : []
    });

    // If admin is creating and status is approved, set approval fields
    if (req.user.role === 'admin' && status === 'approved') {
      preference.approvedBy = req.user._id;
      preference.approvalDate = new Date();
    }

    // If status is submitted, set submission date
    if (status === 'submitted') {
      preference.submissionDate = new Date();
    }

    // Save preference to database
    await preference.save();

    res.status(201).json(preference);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/teacher-preferences/:id
// @desc    Update teacher preference
// @access  Private/Teacher (own preference) or Admin
router.put('/:id', [
  auth,
  checkRole('admin', 'teacher')
], async (req, res) => {
  try {
    // Find preference by ID
    const preference = await TeacherPreference.findById(req.params.id);
    if (!preference) {
      return res.status(404).json({ msg: 'Preference not found' });
    }

    // Check if user is authorized
    if (req.user.role === 'teacher' && preference.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: 'Not authorized to update this preference' });
    }

    // Teachers can only update draft preferences
    if (req.user.role === 'teacher' && preference.status !== 'draft') {
      return res.status(400).json({ msg: 'Cannot update preference that has been submitted or approved' });
    }

    const {
      teachingStyle,
      classroomEnvironment,
      specialtyAreas,
      studentPreferences,
      specialEducationPreferences,
      classComposition,
      additionalConsiderations,
      status,
      notes
    } = req.body;

    // Update fields
    if (teachingStyle) preference.teachingStyle = teachingStyle;
    if (classroomEnvironment) preference.classroomEnvironment = classroomEnvironment;
    if (specialtyAreas) preference.specialtyAreas = specialtyAreas;
    if (studentPreferences) preference.studentPreferences = studentPreferences;
    if (specialEducationPreferences) preference.specialEducationPreferences = specialEducationPreferences;
    if (classComposition) preference.classComposition = classComposition;
    if (additionalConsiderations) preference.additionalConsiderations = additionalConsiderations;
    
    // Handle status changes
    if (status && status !== preference.status) {
      preference.status = status;
      
      if (status === 'submitted') {
        preference.submissionDate = new Date();
      }
      
      if (status === 'approved' && req.user.role === 'admin') {
        preference.approvedBy = req.user._id;
        preference.approvalDate = new Date();
      }
    }

    // Add note if provided
    if (notes) {
      if (!Array.isArray(preference.notes)) {
        preference.notes = [];
      }
      
      preference.notes.push({
        content: notes,
        author: req.user._id,
        date: new Date()
      });
    }

    await preference.save();

    res.json(preference);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Preference not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/teacher-preferences/:id
// @desc    Delete teacher preference
// @access  Private/Admin
router.delete('/:id', [auth, checkRole('admin')], async (req, res) => {
  try {
    // Find preference by ID
    const preference = await TeacherPreference.findById(req.params.id);
    if (!preference) {
      return res.status(404).json({ msg: 'Preference not found' });
    }

    // Delete preference
    await preference.remove();

    res.json({ msg: 'Preference deleted' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Preference not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET /api/teacher-preferences/year/:academicYear/grade/:grade
// @desc    Get all preferences for a specific academic year and grade
// @access  Private/Admin
router.get('/year/:academicYear/grade/:grade', [auth, checkRole('admin')], async (req, res) => {
  try {
    const { academicYear, grade } = req.params;

    // Get preferences for academic year and grade
    const preferences = await TeacherPreference.find({
      academicYear,
      grade: parseInt(grade),
      status: 'approved'
    })
      .populate('teacher', 'firstName lastName email')
      .sort({ updatedAt: -1 });

    res.json(preferences);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/teacher-preferences/stats/submission-status
// @desc    Get submission status statistics
// @access  Private/Admin
router.get('/stats/submission-status', [auth, checkRole('admin')], async (req, res) => {
  try {
    const academicYear = req.query.academicYear || new Date().getFullYear().toString();
    
    // Get counts by status
    const statusCounts = await TeacherPreference.aggregate([
      { $match: { academicYear } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get total teacher count
    const teacherCount = await User.countDocuments({ role: 'teacher', isActive: true });
    
    // Get count of teachers who have submitted preferences
    const teachersWithPreferences = await TeacherPreference.distinct('teacher', { 
      academicYear,
      status: { $in: ['submitted', 'approved'] }
    });

    // Format the results
    const statusStats = {
      draft: 0,
      submitted: 0,
      approved: 0
    };
    
    statusCounts.forEach(item => {
      if (statusStats.hasOwnProperty(item._id)) {
        statusStats[item._id] = item.count;
      }
    });

    res.json({
      academicYear,
      statusStats,
      teacherCount,
      teachersWithPreferences: teachersWithPreferences.length,
      completionRate: teacherCount > 0 ? 
        Math.round((teachersWithPreferences.length / teacherCount) * 100) : 0
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/teacher-preferences/stats/teaching-styles
// @desc    Get teaching style distribution
// @access  Private/Admin
router.get('/stats/teaching-styles', [auth, checkRole('admin')], async (req, res) => {
  try {
    const academicYear = req.query.academicYear || new Date().getFullYear().toString();
    
    // Get counts by primary teaching style
    const primaryStyles = await TeacherPreference.aggregate([
      { $match: { academicYear, status: 'approved' } },
      { $group: { _id: '$teachingStyle.primary', count: { $sum: 1 } } }
    ]);

    // Get counts by secondary teaching style
    const secondaryStyles = await TeacherPreference.aggregate([
      { $match: { academicYear, status: 'approved', 'teachingStyle.secondary': { $exists: true } } },
      { $group: { _id: '$teachingStyle.secondary', count: { $sum: 1 } } }
    ]);

    // Format the results
    const primaryDistribution = {
      visual: 0,
      auditory: 0,
      kinesthetic: 0,
      'reading/writing': 0
    };
    
    const secondaryDistribution = {
      visual: 0,
      auditory: 0,
      kinesthetic: 0,
      'reading/writing': 0
    };
    
    primaryStyles.forEach(item => {
      if (primaryDistribution.hasOwnProperty(item._id)) {
        primaryDistribution[item._id] = item.count;
      }
    });
    
    secondaryStyles.forEach(item => {
      if (secondaryDistribution.hasOwnProperty(item._id)) {
        secondaryDistribution[item._id] = item.count;
      }
    });

    res.json({
      academicYear,
      primaryDistribution,
      secondaryDistribution
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router; 