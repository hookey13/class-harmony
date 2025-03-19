/**
 * Constraint Routes
 * Handles API endpoints for optimization constraints
 */

const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const Constraint = require('../models/Constraint');
const Student = require('../models/Student');
const User = require('../models/User');

/**
 * @route   GET /api/constraints
 * @desc    Get all constraints for a specific academic year and grade
 * @access  Private (Admin)
 */
router.get('/', [auth, adminAuth], async (req, res) => {
  try {
    const { academicYear, grade } = req.query;

    if (!academicYear || !grade) {
      return res.status(400).json({ error: 'Academic year and grade are required' });
    }

    const constraints = await Constraint.find({ academicYear, grade, active: true })
      .populate('students', 'firstName lastName studentId')
      .populate('student', 'firstName lastName studentId')
      .populate('teacher', 'name email')
      .populate('createdBy', 'name')
      .sort({ type: 1, priority: 1 });

    res.json(constraints);
  } catch (err) {
    console.error('Error fetching constraints:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   GET /api/constraints/:id
 * @desc    Get a specific constraint
 * @access  Private (Admin)
 */
router.get('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const constraint = await Constraint.findById(req.params.id)
      .populate('students', 'firstName lastName studentId')
      .populate('student', 'firstName lastName studentId')
      .populate('teacher', 'name email')
      .populate('createdBy', 'name');

    if (!constraint) {
      return res.status(404).json({ error: 'Constraint not found' });
    }

    res.json(constraint);
  } catch (err) {
    console.error('Error fetching constraint:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   POST /api/constraints
 * @desc    Create a new constraint
 * @access  Private (Admin)
 */
router.post('/', [
  auth, 
  adminAuth,
  [
    check('academicYear', 'Academic year is required').not().isEmpty(),
    check('grade', 'Grade is required').not().isEmpty(),
    check('type', 'Valid constraint type is required').isIn([
      'must_be_together',
      'must_be_separate',
      'preferred_teacher',
      'avoid_teacher',
      'balanced_distribution',
      'equal_class_size'
    ]),
    check('priority', 'Valid priority is required').isIn(['required', 'high', 'medium', 'low'])
  ]
], async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      academicYear,
      grade,
      type,
      priority,
      students,
      student,
      teacher,
      factor,
      reason,
      source
    } = req.body;

    // Create constraint object
    const constraintFields = {
      academicYear,
      grade,
      type,
      priority,
      createdBy: req.user.id,
      reason: reason || '',
      source: source || 'admin'
    };

    // Add specific fields based on constraint type
    if (type === 'must_be_together' || type === 'must_be_separate') {
      if (!students || !Array.isArray(students) || students.length < 2) {
        return res.status(400).json({ error: 'At least two students are required for this constraint type' });
      }

      // Verify students exist
      for (const studentId of students) {
        const studentExists = await Student.findById(studentId);
        if (!studentExists) {
          return res.status(404).json({ error: `Student with ID ${studentId} not found` });
        }
        if (studentExists.grade !== grade) {
          return res.status(400).json({ error: `Student with ID ${studentId} is not in grade ${grade}` });
        }
      }

      constraintFields.students = students;
    } else if (type === 'preferred_teacher' || type === 'avoid_teacher') {
      if (!student) {
        return res.status(400).json({ error: 'Student ID is required for this constraint type' });
      }
      if (!teacher) {
        return res.status(400).json({ error: 'Teacher ID is required for this constraint type' });
      }

      // Verify student exists
      const studentExists = await Student.findById(student);
      if (!studentExists) {
        return res.status(404).json({ error: 'Student not found' });
      }
      if (studentExists.grade !== grade) {
        return res.status(400).json({ error: `Student is not in grade ${grade}` });
      }

      // Verify teacher exists
      const teacherExists = await User.findById(teacher);
      if (!teacherExists || teacherExists.role !== 'teacher') {
        return res.status(404).json({ error: 'Teacher not found' });
      }

      constraintFields.student = student;
      constraintFields.teacher = teacher;
    } else if (type === 'balanced_distribution') {
      if (!factor) {
        return res.status(400).json({ error: 'Factor is required for this constraint type' });
      }
      if (!['gender', 'academic_level', 'behavioral_level', 'special_needs'].includes(factor)) {
        return res.status(400).json({ error: 'Invalid factor for balanced distribution' });
      }

      constraintFields.factor = factor;
    }
    // equal_class_size doesn't need additional fields

    // Create new constraint
    const constraint = new Constraint(constraintFields);
    await constraint.save();

    res.json(constraint);
  } catch (err) {
    console.error('Error creating constraint:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   PUT /api/constraints/:id
 * @desc    Update a constraint
 * @access  Private (Admin)
 */
router.put('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const {
      priority,
      students,
      student,
      teacher,
      factor,
      reason,
      active
    } = req.body;

    // Find constraint
    let constraint = await Constraint.findById(req.params.id);

    if (!constraint) {
      return res.status(404).json({ error: 'Constraint not found' });
    }

    // Update fields
    if (priority) constraint.priority = priority;
    if (reason !== undefined) constraint.reason = reason;
    if (active !== undefined) constraint.active = active;

    // Update type-specific fields
    const type = constraint.type;
    
    if (type === 'must_be_together' || type === 'must_be_separate') {
      if (students && Array.isArray(students) && students.length >= 2) {
        // Verify students exist and are in the same grade
        for (const studentId of students) {
          const studentExists = await Student.findById(studentId);
          if (!studentExists) {
            return res.status(404).json({ error: `Student with ID ${studentId} not found` });
          }
          if (studentExists.grade !== constraint.grade) {
            return res.status(400).json({ error: `Student with ID ${studentId} is not in grade ${constraint.grade}` });
          }
        }
        constraint.students = students;
      }
    } else if (type === 'preferred_teacher' || type === 'avoid_teacher') {
      if (student) {
        // Verify student exists and is in the same grade
        const studentExists = await Student.findById(student);
        if (!studentExists) {
          return res.status(404).json({ error: 'Student not found' });
        }
        if (studentExists.grade !== constraint.grade) {
          return res.status(400).json({ error: `Student is not in grade ${constraint.grade}` });
        }
        constraint.student = student;
      }
      
      if (teacher) {
        // Verify teacher exists
        const teacherExists = await User.findById(teacher);
        if (!teacherExists || teacherExists.role !== 'teacher') {
          return res.status(404).json({ error: 'Teacher not found' });
        }
        constraint.teacher = teacher;
      }
    } else if (type === 'balanced_distribution') {
      if (factor) {
        if (!['gender', 'academic_level', 'behavioral_level', 'special_needs'].includes(factor)) {
          return res.status(400).json({ error: 'Invalid factor for balanced distribution' });
        }
        constraint.factor = factor;
      }
    }

    constraint.updatedAt = Date.now();

    await constraint.save();

    res.json(constraint);
  } catch (err) {
    console.error('Error updating constraint:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   DELETE /api/constraints/:id
 * @desc    Delete a constraint (soft delete by setting active to false)
 * @access  Private (Admin)
 */
router.delete('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const constraint = await Constraint.findById(req.params.id);

    if (!constraint) {
      return res.status(404).json({ error: 'Constraint not found' });
    }

    // Soft delete the constraint
    constraint.active = false;
    constraint.updatedAt = Date.now();
    
    await constraint.save();

    res.json({ message: 'Constraint disabled successfully' });
  } catch (err) {
    console.error('Error disabling constraint:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   DELETE /api/constraints/:id/permanent
 * @desc    Permanently delete a constraint
 * @access  Private (Admin)
 */
router.delete('/:id/permanent', [auth, adminAuth], async (req, res) => {
  try {
    const constraint = await Constraint.findById(req.params.id);

    if (!constraint) {
      return res.status(404).json({ error: 'Constraint not found' });
    }

    await Constraint.findByIdAndRemove(req.params.id);

    res.json({ message: 'Constraint permanently deleted' });
  } catch (err) {
    console.error('Error deleting constraint:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   GET /api/constraints/source/:source
 * @desc    Get constraints by source (admin, teacher, parent, system)
 * @access  Private (Admin)
 */
router.get('/source/:source', [auth, adminAuth], async (req, res) => {
  try {
    const { academicYear, grade } = req.query;
    const { source } = req.params;

    if (!['admin', 'teacher', 'parent', 'system'].includes(source)) {
      return res.status(400).json({ error: 'Invalid source' });
    }

    const filter = { source, active: true };
    
    if (academicYear) filter.academicYear = academicYear;
    if (grade) filter.grade = grade;

    const constraints = await Constraint.find(filter)
      .populate('students', 'firstName lastName studentId')
      .populate('student', 'firstName lastName studentId')
      .populate('teacher', 'name email')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json(constraints);
  } catch (err) {
    console.error('Error fetching constraints by source:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
