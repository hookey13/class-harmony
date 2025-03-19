const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const ParentPreference = require('../models/ParentPreference');
const User = require('../models/User');
const Student = require('../models/Student');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/validate');
const { APIError } = require('../middleware/errorHandler');

// @route   GET /api/parent-preferences
// @desc    Get all parent preferences (with pagination and filtering)
// @access  Private/Admin
router.get('/', [auth, checkRole('admin')], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    if (req.query.academicYear) filter.academicYear = req.query.academicYear;
    if (req.query.submissionStatus) filter.submissionStatus = req.query.submissionStatus;
    if (req.query.parent) filter.parent = req.query.parent;
    if (req.query.student) filter.student = req.query.student;
    if (req.query.priority) filter.priority = parseInt(req.query.priority);

    // Get preferences with pagination
    const preferences = await ParentPreference.find(filter)
      .populate('parent', 'firstName lastName email')
      .populate('student', 'firstName lastName grade')
      .populate('teacherPreferences.preferredTeachers.teacher', 'firstName lastName')
      .populate('peerRelationships.preferredPeers.student', 'firstName lastName')
      .populate('peerRelationships.separateFrom.student', 'firstName lastName')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await ParentPreference.countDocuments(filter);

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

// @route   GET /api/parent-preferences/parent/:parentId
// @desc    Get preferences for a specific parent
// @access  Private/Admin or Parent (own preferences)
router.get('/parent/:parentId', auth, async (req, res) => {
  try {
    // Check if user is authorized
    if (req.user.role === 'parent' && req.user._id.toString() !== req.params.parentId) {
      return res.status(403).json({ msg: 'Not authorized to view these preferences' });
    }

    // Get preferences for parent
    const preferences = await ParentPreference.find({ parent: req.params.parentId })
      .populate('student', 'firstName lastName grade')
      .populate('teacherPreferences.preferredTeachers.teacher', 'firstName lastName')
      .populate('peerRelationships.preferredPeers.student', 'firstName lastName')
      .populate('peerRelationships.separateFrom.student', 'firstName lastName')
      .sort({ updatedAt: -1 });

    res.json(preferences);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Parent not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET /api/parent-preferences/student/:studentId
// @desc    Get preferences for a specific student
// @access  Private/Admin or Parent (own student)
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    // Find student to check authorization
    const student = await Student.findById(req.params.studentId);
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    // Check if user is authorized
    if (req.user.role === 'parent' && !student.parents.includes(req.user._id)) {
      return res.status(403).json({ msg: 'Not authorized to view preferences for this student' });
    }

    // Get preferences for student
    const preferences = await ParentPreference.find({ student: req.params.studentId })
      .populate('parent', 'firstName lastName email')
      .populate('teacherPreferences.preferredTeachers.teacher', 'firstName lastName')
      .populate('peerRelationships.preferredPeers.student', 'firstName lastName')
      .populate('peerRelationships.separateFrom.student', 'firstName lastName')
      .sort({ updatedAt: -1 });

    res.json(preferences);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Student not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET /api/parent-preferences/:id
// @desc    Get parent preference by ID
// @access  Private/Admin or Parent (own preference)
router.get('/:id', auth, async (req, res) => {
  try {
    const preference = await ParentPreference.findById(req.params.id)
      .populate('parent', 'firstName lastName email')
      .populate('student', 'firstName lastName grade')
      .populate('teacherPreferences.preferredTeachers.teacher', 'firstName lastName')
      .populate('peerRelationships.preferredPeers.student', 'firstName lastName')
      .populate('peerRelationships.separateFrom.student', 'firstName lastName')
      .populate('reviewNotes.reviewer', 'firstName lastName');
    
    if (!preference) {
      return res.status(404).json({ msg: 'Preference not found' });
    }

    // Check if user is authorized
    if (req.user.role === 'parent' && preference.parent._id.toString() !== req.user._id.toString()) {
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

// @route   POST /api/parent-preferences
// @desc    Create a new parent preference
// @access  Private/Parent or Admin
router.post('/', [
  auth,
  checkRole('admin', 'parent'),
  check('student', 'Student ID is required').isMongoId(),
  check('academicYear', 'Academic year is required').not().isEmpty(),
  check('learningEnvironment.preferredStyle', 'Preferred learning style is required').isIn(['visual', 'auditory', 'kinesthetic', 'reading/writing'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      student,
      academicYear,
      learningEnvironment,
      teacherPreferences,
      peerRelationships,
      academicFocus,
      specialConsiderations,
      schedule,
      previousExperiences,
      additionalComments,
      submissionStatus,
      priority
    } = req.body;

    // Determine parent ID
    let parentId;
    if (req.user.role === 'admin' && req.body.parent) {
      // Admin can create preferences for any parent
      parentId = req.body.parent;
      
      // Validate parent ID
      const parent = await User.findById(parentId);
      if (!parent || parent.role !== 'parent') {
        return res.status(400).json({ errors: [{ msg: 'Invalid parent ID' }] });
      }
    } else {
      // Parents can only create their own preferences
      parentId = req.user._id;
    }

    // Validate student ID and check if parent is associated with student
    const studentObj = await Student.findById(student);
    if (!studentObj) {
      return res.status(400).json({ errors: [{ msg: 'Student not found' }] });
    }

    if (req.user.role === 'parent' && !studentObj.parents.includes(req.user._id)) {
      return res.status(403).json({ errors: [{ msg: 'Not authorized to create preferences for this student' }] });
    }

    // Check if preference already exists for this parent, student, and academic year
    const existingPreference = await ParentPreference.findOne({
      parent: parentId,
      student,
      academicYear
    });

    if (existingPreference) {
      return res.status(400).json({ 
        errors: [{ msg: 'Preference already exists for this parent, student, and academic year' }] 
      });
    }

    // Validate teacher preferences if provided
    if (teacherPreferences && teacherPreferences.preferredTeachers) {
      for (const pref of teacherPreferences.preferredTeachers) {
        if (!mongoose.Types.ObjectId.isValid(pref.teacher)) {
          return res.status(400).json({ errors: [{ msg: 'Invalid teacher ID' }] });
        }

        const teacher = await User.findById(pref.teacher);
        if (!teacher || teacher.role !== 'teacher') {
          return res.status(400).json({ errors: [{ msg: `Teacher with ID ${pref.teacher} not found` }] });
        }
      }
    }

    // Validate peer preferences if provided
    if (peerRelationships) {
      // Check preferred peers
      if (peerRelationships.preferredPeers) {
        for (const pref of peerRelationships.preferredPeers) {
          if (!mongoose.Types.ObjectId.isValid(pref.student)) {
            return res.status(400).json({ errors: [{ msg: 'Invalid student ID in preferred peers' }] });
          }

          const peer = await Student.findById(pref.student);
          if (!peer) {
            return res.status(400).json({ errors: [{ msg: `Student with ID ${pref.student} not found` }] });
          }

          // Check if peer is the same as the student
          if (peer._id.toString() === student.toString()) {
            return res.status(400).json({ errors: [{ msg: 'Student cannot be their own peer' }] });
          }
        }
      }

      // Check separate from
      if (peerRelationships.separateFrom) {
        for (const pref of peerRelationships.separateFrom) {
          if (!mongoose.Types.ObjectId.isValid(pref.student)) {
            return res.status(400).json({ errors: [{ msg: 'Invalid student ID in separate from' }] });
          }

          const peer = await Student.findById(pref.student);
          if (!peer) {
            return res.status(400).json({ errors: [{ msg: `Student with ID ${pref.student} not found` }] });
          }

          // Check if peer is the same as the student
          if (peer._id.toString() === student.toString()) {
            return res.status(400).json({ errors: [{ msg: 'Student cannot be separated from themselves' }] });
          }
        }
      }

      // Check for conflicts between preferred and separate lists
      if (peerRelationships.preferredPeers && peerRelationships.separateFrom) {
        const preferredIds = peerRelationships.preferredPeers.map(p => p.student.toString());
        const separateIds = peerRelationships.separateFrom.map(p => p.student.toString());
        
        const conflicts = preferredIds.filter(id => separateIds.includes(id));
        if (conflicts.length > 0) {
          return res.status(400).json({ 
            errors: [{ msg: 'Conflict detected: Same student appears in both preferred and separate lists' }] 
          });
        }
      }
    }

    // Create new preference
    const preference = new ParentPreference({
      parent: parentId,
      student,
      academicYear,
      learningEnvironment,
      teacherPreferences,
      peerRelationships,
      academicFocus,
      specialConsiderations,
      schedule,
      previousExperiences,
      additionalComments,
      submissionStatus: submissionStatus || 'draft',
      priority: priority || 3
    });

    // If status is submitted, set submission date
    if (preference.submissionStatus === 'submitted') {
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

// @route   PUT /api/parent-preferences/:id
// @desc    Update parent preference
// @access  Private/Parent (own preference) or Admin
router.put('/:id', [
  auth,
  checkRole('admin', 'parent')
], async (req, res) => {
  try {
    // Find preference by ID
    const preference = await ParentPreference.findById(req.params.id);
    if (!preference) {
      return res.status(404).json({ msg: 'Preference not found' });
    }

    // Check if user is authorized
    if (req.user.role === 'parent' && preference.parent.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: 'Not authorized to update this preference' });
    }

    // Parents can only update draft or needs_clarification preferences
    if (req.user.role === 'parent' && 
        !['draft', 'needs_clarification'].includes(preference.submissionStatus)) {
      return res.status(400).json({ 
        msg: 'Cannot update preference that has been submitted, reviewed, or approved' 
      });
    }

    const {
      learningEnvironment,
      teacherPreferences,
      peerRelationships,
      academicFocus,
      specialConsiderations,
      schedule,
      previousExperiences,
      additionalComments,
      submissionStatus,
      priority,
      reviewNotes
    } = req.body;

    // Update fields
    if (learningEnvironment) preference.learningEnvironment = learningEnvironment;
    if (teacherPreferences) preference.teacherPreferences = teacherPreferences;
    if (peerRelationships) preference.peerRelationships = peerRelationships;
    if (academicFocus) preference.academicFocus = academicFocus;
    if (specialConsiderations) preference.specialConsiderations = specialConsiderations;
    if (schedule) preference.schedule = schedule;
    if (previousExperiences) preference.previousExperiences = previousExperiences;
    if (additionalComments) preference.additionalComments = additionalComments;
    
    // Handle status changes
    if (submissionStatus && submissionStatus !== preference.submissionStatus) {
      // Parents can only change status to draft or submitted
      if (req.user.role === 'parent' && !['draft', 'submitted'].includes(submissionStatus)) {
        return res.status(400).json({ msg: 'Parents can only set status to draft or submitted' });
      }
      
      preference.submissionStatus = submissionStatus;
      
      if (submissionStatus === 'submitted') {
        preference.submissionDate = new Date();
      }
    }

    // Update priority (admin only)
    if (priority && req.user.role === 'admin') {
      preference.priority = priority;
    }

    // Add review note (admin only)
    if (reviewNotes && req.user.role === 'admin') {
      if (!Array.isArray(preference.reviewNotes)) {
        preference.reviewNotes = [];
      }
      
      preference.reviewNotes.push({
        reviewer: req.user._id,
        notes: reviewNotes.notes,
        date: new Date(),
        status: reviewNotes.status || 'pending'
      });
    }

    // Update last updated timestamp
    preference.lastUpdated = new Date();

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

// @route   DELETE /api/parent-preferences/:id
// @desc    Delete parent preference
// @access  Private/Admin
router.delete('/:id', [auth, checkRole('admin')], async (req, res) => {
  try {
    // Find preference by ID
    const preference = await ParentPreference.findById(req.params.id);
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

// @route   GET /api/parent-preferences/year/:academicYear
// @desc    Get all preferences for a specific academic year
// @access  Private/Admin
router.get('/year/:academicYear', [auth, checkRole('admin')], async (req, res) => {
  try {
    const { academicYear } = req.params;
    const status = req.query.status || ['submitted', 'reviewed', 'approved'];

    // Get preferences for academic year
    const preferences = await ParentPreference.find({
      academicYear,
      submissionStatus: { $in: Array.isArray(status) ? status : [status] }
    })
      .populate('parent', 'firstName lastName email')
      .populate('student', 'firstName lastName grade')
      .sort({ priority: 1, updatedAt: -1 });

    res.json(preferences);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/parent-preferences/available-teachers/:grade
// @desc    Get available teachers for a specific grade
// @access  Private/Parent or Admin
router.get('/available-teachers/:grade', auth, async (req, res) => {
  try {
    const { grade } = req.params;
    const academicYear = req.query.academicYear || new Date().getFullYear().toString();

    // Find teachers who have preferences for this grade and academic year
    const teacherPreferences = await mongoose.model('TeacherPreference').find({
      grade: parseInt(grade),
      academicYear,
      status: 'approved'
    }).populate('teacher', 'firstName lastName email');

    // Extract teacher information
    const teachers = teacherPreferences.map(pref => ({
      _id: pref.teacher._id,
      firstName: pref.teacher.firstName,
      lastName: pref.teacher.lastName,
      teachingStyle: pref.teachingStyle.primary,
      classroomEnvironment: pref.classroomEnvironment
    }));

    res.json(teachers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/parent-preferences/potential-peers/:studentId
// @desc    Get potential peers for a specific student
// @access  Private/Parent or Admin
router.get('/potential-peers/:studentId', auth, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Find student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    // Check if user is authorized
    if (req.user.role === 'parent' && !student.parents.includes(req.user._id)) {
      return res.status(403).json({ msg: 'Not authorized to view potential peers for this student' });
    }

    // Find potential peers (students in the same grade)
    const peers = await Student.find({
      _id: { $ne: studentId }, // Exclude the current student
      grade: student.grade,
      isActive: true
    })
      .select('firstName lastName')
      .sort({ lastName: 1, firstName: 1 });

    res.json(peers);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Student not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET /api/parent-preferences/stats/submission-status
// @desc    Get submission status statistics
// @access  Private/Admin
router.get('/stats/submission-status', [auth, checkRole('admin')], async (req, res) => {
  try {
    const academicYear = req.query.academicYear || new Date().getFullYear().toString();
    
    // Get counts by status
    const statusCounts = await ParentPreference.aggregate([
      { $match: { academicYear } },
      { $group: { _id: '$submissionStatus', count: { $sum: 1 } } }
    ]);

    // Get total parent count
    const parentCount = await User.countDocuments({ role: 'parent', isActive: true });
    
    // Get count of students
    const studentCount = await Student.countDocuments({ isActive: true });
    
    // Get count of students with preferences
    const studentsWithPreferences = await ParentPreference.distinct('student', { 
      academicYear,
      submissionStatus: { $in: ['submitted', 'reviewed', 'approved'] }
    });

    // Format the results
    const statusStats = {
      draft: 0,
      submitted: 0,
      reviewed: 0,
      approved: 0,
      denied: 0,
      needs_clarification: 0
    };
    
    statusCounts.forEach(item => {
      if (statusStats.hasOwnProperty(item._id)) {
        statusStats[item._id] = item.count;
      }
    });

    res.json({
      academicYear,
      statusStats,
      studentCount,
      studentsWithPreferences: studentsWithPreferences.length,
      completionRate: studentCount > 0 ? 
        Math.round((studentsWithPreferences.length / studentCount) * 100) : 0
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/parent-preferences/stats/learning-styles
// @desc    Get learning style distribution
// @access  Private/Admin
router.get('/stats/learning-styles', [auth, checkRole('admin')], async (req, res) => {
  try {
    const academicYear = req.query.academicYear || new Date().getFullYear().toString();
    
    // Get counts by preferred learning style
    const learningStyles = await ParentPreference.aggregate([
      { $match: { academicYear, submissionStatus: { $in: ['submitted', 'reviewed', 'approved'] } } },
      { $group: { _id: '$learningEnvironment.preferredStyle', count: { $sum: 1 } } }
    ]);

    // Format the results
    const styleDistribution = {
      visual: 0,
      auditory: 0,
      kinesthetic: 0,
      'reading/writing': 0
    };
    
    learningStyles.forEach(item => {
      if (styleDistribution.hasOwnProperty(item._id)) {
        styleDistribution[item._id] = item.count;
      }
    });

    res.json({
      academicYear,
      styleDistribution
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/parent-preferences/placement-status/:studentId
// @desc    Get placement status for a specific student
// @access  Private/Parent or Admin
router.get('/placement-status/:studentId', auth, async (req, res) => {
  try {
    const { studentId } = req.params;
    const academicYear = req.query.academicYear || new Date().getFullYear().toString();
    
    // Find student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    // Check if user is authorized
    if (req.user.role === 'parent' && !student.parents.includes(req.user._id)) {
      return res.status(403).json({ msg: 'Not authorized to view placement status for this student' });
    }

    // Check if student has a current class assignment
    if (student.currentClass) {
      // Get class details
      const classDetails = await mongoose.model('Class').findById(student.currentClass)
        .populate('teacher', 'firstName lastName email');
      
      if (classDetails && classDetails.academicYear === academicYear) {
        return res.json({
          status: 'placed',
          class: classDetails,
          placementDate: student.updatedAt
        });
      }
    }

    // Check if parent has submitted preferences
    const preference = await ParentPreference.findOne({
      student: studentId,
      academicYear
    });

    if (!preference) {
      return res.json({
        status: 'no_preferences',
        message: 'No preferences have been submitted for this student'
      });
    }

    // Return status based on preference submission status
    let status;
    switch (preference.submissionStatus) {
      case 'draft':
        status = 'preferences_draft';
        break;
      case 'submitted':
        status = 'preferences_submitted';
        break;
      case 'reviewed':
        status = 'preferences_reviewed';
        break;
      case 'approved':
        status = 'preferences_approved';
        break;
      case 'denied':
        status = 'preferences_denied';
        break;
      case 'needs_clarification':
        status = 'preferences_needs_clarification';
        break;
      default:
        status = 'unknown';
    }

    res.json({
      status,
      preference,
      message: `Preferences are currently in ${preference.submissionStatus} status`
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Student not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router; 