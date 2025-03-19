const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Parent = require('../models/Parent');
const Student = require('../models/Student');
const Class = require('../models/Class');
const Teacher = require('../models/Teacher');
const ParentPreference = require('../models/ParentPreference');

// Middleware to check if user is a parent
const isParent = async (req, res, next) => {
  try {
    const parent = await Parent.findById(req.user.id);
    if (!parent) {
      return res.status(403).json({ error: 'Access denied. User is not a parent.' });
    }
    req.parent = parent;
    next();
  } catch (err) {
    console.error('Error in isParent middleware:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get parent's children and their class placements
router.get('/children', auth, isParent, async (req, res) => {
  try {
    const students = await Student.find({ parentId: req.parent._id })
      .select('firstName lastName grade currentClass specialNeeds')
      .populate({
        path: 'currentClass',
        select: 'teacherId roomNumber schedule studentCount',
        populate: {
          path: 'teacherId',
          select: 'firstName lastName'
        }
      });

    res.json(students);
  } catch (err) {
    console.error('Error fetching children:', err);
    res.status(500).json({ error: 'Failed to fetch children' });
  }
});

// Get parent's existing preferences
router.get('/preferences', auth, isParent, async (req, res) => {
  try {
    const preferences = await ParentPreference.find({ parentId: req.parent._id })
      .populate('studentId', 'firstName lastName grade')
      .populate('teacherPreferences.teacherId', 'firstName lastName')
      .populate('peerPreferences.studentId', 'firstName lastName');

    res.json(preferences);
  } catch (err) {
    console.error('Error fetching preferences:', err);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

// Submit parent preferences
router.post('/preferences', [
  auth,
  isParent,
  body('preferences').isObject(),
  body('preferences.*.learningStyle').isString(),
  body('preferences.*.teacherPreferences').isArray(),
  body('preferences.*.peerPreferences').isArray(),
  body('preferences.*.additionalNotes').isString(),
], async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { preferences } = req.body;
    const parentId = req.parent._id;

    // Verify all students belong to the parent
    const studentIds = Object.keys(preferences);
    const students = await Student.find({
      _id: { $in: studentIds },
      parentId: parentId
    });

    if (students.length !== studentIds.length) {
      return res.status(400).json({
        error: 'Invalid request. One or more students do not belong to this parent.'
      });
    }

    // Process each student's preferences
    const preferenceDocs = await Promise.all(
      studentIds.map(async (studentId) => {
        const studentPrefs = preferences[studentId];

        // Validate teacher preferences
        if (studentPrefs.teacherPreferences.length > 0) {
          const teacherIds = studentPrefs.teacherPreferences.map(p => p.teacherId);
          const validTeachers = await Teacher.find({ _id: { $in: teacherIds } });
          if (validTeachers.length !== teacherIds.length) {
            throw new Error(`Invalid teacher preference for student ${studentId}`);
          }
        }

        // Validate peer preferences
        if (studentPrefs.peerPreferences.length > 0) {
          const peerIds = studentPrefs.peerPreferences.map(p => p.studentId);
          const validPeers = await Student.find({ _id: { $in: peerIds } });
          if (validPeers.length !== peerIds.length) {
            throw new Error(`Invalid peer preference for student ${studentId}`);
          }
        }

        // Update or create preference document
        return await ParentPreference.findOneAndUpdate(
          { parentId, studentId },
          {
            parentId,
            studentId,
            learningStyle: studentPrefs.learningStyle,
            teacherPreferences: studentPrefs.teacherPreferences,
            peerPreferences: studentPrefs.peerPreferences,
            additionalNotes: studentPrefs.additionalNotes,
            updatedAt: new Date()
          },
          { upsert: true, new: true }
        );
      })
    );

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: preferenceDocs
    });
  } catch (err) {
    console.error('Error submitting preferences:', err);
    res.status(500).json({
      error: 'Failed to submit preferences',
      message: err.message
    });
  }
});

// Get available teachers for preference selection
router.get('/available-teachers', auth, isParent, async (req, res) => {
  try {
    const { gradeLevel } = req.query;
    
    let query = {};
    if (gradeLevel) {
      query.gradeLevel = gradeLevel;
    }

    const teachers = await Teacher.find(query)
      .select('firstName lastName gradeLevel subjects specialties')
      .sort('lastName firstName');

    res.json(teachers);
  } catch (err) {
    console.error('Error fetching available teachers:', err);
    res.status(500).json({ error: 'Failed to fetch available teachers' });
  }
});

// Get potential peer students for preference selection
router.get('/potential-peers/:studentId', auth, isParent, async (req, res) => {
  try {
    const student = await Student.findOne({
      _id: req.params.studentId,
      parentId: req.parent._id
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Find students in the same grade, excluding the current student
    const peers = await Student.find({
      _id: { $ne: student._id },
      grade: student.grade,
      schoolId: student.schoolId
    })
    .select('firstName lastName')
    .sort('lastName firstName');

    res.json(peers);
  } catch (err) {
    console.error('Error fetching potential peers:', err);
    res.status(500).json({ error: 'Failed to fetch potential peers' });
  }
});

// Get class placement status
router.get('/placement-status/:studentId', auth, isParent, async (req, res) => {
  try {
    const student = await Student.findOne({
      _id: req.params.studentId,
      parentId: req.parent._id
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    if (!student.currentClass) {
      return res.json({
        status: 'pending',
        message: 'Class placement is pending'
      });
    }

    const classPlacement = await Class.findById(student.currentClass)
      .populate('teacherId', 'firstName lastName')
      .select('roomNumber schedule studentCount');

    if (!classPlacement) {
      return res.status(404).json({ error: 'Class placement not found' });
    }

    res.json({
      status: 'placed',
      placement: {
        className: classPlacement.name,
        teacher: `${classPlacement.teacherId.firstName} ${classPlacement.teacherId.lastName}`,
        roomNumber: classPlacement.roomNumber,
        schedule: classPlacement.schedule,
        studentCount: classPlacement.studentCount
      }
    });
  } catch (err) {
    console.error('Error fetching placement status:', err);
    res.status(500).json({ error: 'Failed to fetch placement status' });
  }
});

// Update notification preferences
router.put('/notification-preferences', [
  auth,
  isParent,
  body('preferences').isObject(),
  body('preferences.emailNotifications').isBoolean(),
  body('preferences.pushNotifications').isBoolean(),
  body('preferences.placementUpdates').isBoolean(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const parent = await Parent.findByIdAndUpdate(
      req.parent._id,
      {
        notificationPreferences: req.body.preferences,
        updatedAt: new Date()
      },
      { new: true }
    );

    res.json({
      success: true,
      preferences: parent.notificationPreferences
    });
  } catch (err) {
    console.error('Error updating notification preferences:', err);
    res.status(500).json({ error: 'Failed to update notification preferences' });
  }
});

module.exports = router; 