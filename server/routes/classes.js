const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Class = require('../models/Class');
const User = require('../models/User');
const Student = require('../models/Student');
const auth = require('../middleware/auth');
const { checkRole, customValidators } = require('../middleware/validate');
const { APIError } = require('../middleware/errorHandler');

// @route   GET /api/classes
// @desc    Get all classes (with pagination and filtering)
// @access  Private/Admin or Teacher
router.get('/', [auth, checkRole('admin', 'teacher')], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    if (req.query.grade) filter.grade = parseInt(req.query.grade);
    if (req.query.academicYear) filter.academicYear = req.query.academicYear;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.teacher) filter.teacher = req.query.teacher;
    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: 'i' };
    }

    // For teachers, only show their classes
    if (req.user.role === 'teacher') {
      filter.teacher = req.user._id;
    }

    // Get classes with pagination
    const classes = await Class.find(filter)
      .populate('teacher', 'firstName lastName email')
      .sort({ grade: 1, name: 1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Class.countDocuments(filter);

    res.json({
      classes,
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

// @route   GET /api/classes/:id
// @desc    Get class by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const classObj = await Class.findById(req.params.id)
      .populate('teacher', 'firstName lastName email')
      .populate('students', 'firstName lastName grade');
    
    if (!classObj) {
      return res.status(404).json({ msg: 'Class not found' });
    }

    // Check if user is authorized to view this class
    if (req.user.role === 'teacher' && classObj.teacher._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: 'Not authorized to view this class' });
    }

    if (req.user.role === 'parent') {
      // Check if parent has a student in this class
      const hasStudentInClass = await Student.exists({
        parents: req.user._id,
        currentClass: classObj._id
      });

      if (!hasStudentInClass) {
        return res.status(403).json({ msg: 'Not authorized to view this class' });
      }
    }

    res.json(classObj);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Class not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST /api/classes
// @desc    Create a new class
// @access  Private/Admin
router.post('/', [
  auth,
  checkRole('admin'),
  check('name', 'Name is required').not().isEmpty(),
  check('academicYear', 'Academic year is required').not().isEmpty(),
  check('grade', 'Grade is required').isInt({ min: 0, max: 12 }),
  check('teacher', 'Teacher ID is required').isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      academicYear,
      grade,
      teacher,
      capacity,
      schedule,
      specialPrograms,
      optimizationPreferences,
      status,
      notes
    } = req.body;

    // Validate teacher ID
    const teacherObj = await User.findById(teacher);
    if (!teacherObj || teacherObj.role !== 'teacher') {
      return res.status(400).json({ errors: [{ msg: 'Invalid teacher ID' }] });
    }

    // Create new class
    const classObj = new Class({
      name,
      academicYear,
      grade,
      teacher,
      students: [],
      capacity: capacity || {
        min: 15,
        max: 30,
        optimal: 25
      },
      schedule,
      specialPrograms,
      optimizationPreferences,
      status: status || 'draft',
      notes
    });

    // Save class to database
    await classObj.save();

    res.status(201).json(classObj);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/classes/:id
// @desc    Update class
// @access  Private/Admin
router.put('/:id', [
  auth,
  checkRole('admin'),
  check('name', 'Name is required').optional().not().isEmpty(),
  check('grade', 'Grade must be valid').optional().isInt({ min: 0, max: 12 }),
  check('teacher', 'Teacher ID must be valid').optional().isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      academicYear,
      grade,
      teacher,
      capacity,
      schedule,
      specialPrograms,
      optimizationPreferences,
      status,
      notes
    } = req.body;

    // Find class by ID
    const classObj = await Class.findById(req.params.id);
    if (!classObj) {
      return res.status(404).json({ msg: 'Class not found' });
    }

    // Validate teacher ID if provided
    if (teacher) {
      const teacherObj = await User.findById(teacher);
      if (!teacherObj || teacherObj.role !== 'teacher') {
        return res.status(400).json({ errors: [{ msg: 'Invalid teacher ID' }] });
      }
      classObj.teacher = teacher;
    }

    // Update class fields
    if (name) classObj.name = name;
    if (academicYear) classObj.academicYear = academicYear;
    if (grade !== undefined) classObj.grade = grade;
    if (capacity) classObj.capacity = capacity;
    if (schedule) classObj.schedule = schedule;
    if (specialPrograms) classObj.specialPrograms = specialPrograms;
    if (optimizationPreferences) classObj.optimizationPreferences = optimizationPreferences;
    if (status) classObj.status = status;
    if (notes) {
      if (!Array.isArray(classObj.notes)) {
        classObj.notes = [];
      }
      
      classObj.notes.push({
        content: notes,
        author: req.user._id,
        date: new Date()
      });
    }

    await classObj.save();

    res.json(classObj);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Class not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/classes/:id
// @desc    Delete class
// @access  Private/Admin
router.delete('/:id', [auth, checkRole('admin')], async (req, res) => {
  try {
    // Find class by ID
    const classObj = await Class.findById(req.params.id);
    if (!classObj) {
      return res.status(404).json({ msg: 'Class not found' });
    }

    // Check if class has students
    if (classObj.students.length > 0) {
      return res.status(400).json({ msg: 'Cannot delete class with assigned students' });
    }

    // Delete class
    await classObj.remove();

    res.json({ msg: 'Class deleted' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Class not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/classes/:id/add-student/:studentId
// @desc    Add student to class
// @access  Private/Admin
router.put('/:id/add-student/:studentId', [auth, checkRole('admin')], async (req, res) => {
  try {
    // Find class by ID
    const classObj = await Class.findById(req.params.id);
    if (!classObj) {
      return res.status(404).json({ msg: 'Class not found' });
    }

    // Find student by ID
    const student = await Student.findById(req.params.studentId);
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    // Check if student is already in the class
    if (classObj.students.includes(student._id)) {
      return res.status(400).json({ msg: 'Student already in class' });
    }

    // Check if class is at capacity
    if (classObj.students.length >= classObj.capacity.max) {
      return res.status(400).json({ msg: 'Class is at maximum capacity' });
    }

    // Check if student grade matches class grade
    if (student.grade !== classObj.grade) {
      return res.status(400).json({ msg: 'Student grade does not match class grade' });
    }

    // Add student to class
    classObj.students.push(student._id);
    await classObj.save();

    // Update student's current class
    student.currentClass = classObj._id;
    student.currentTeacher = classObj.teacher;
    await student.save();

    // Update class profile
    await classObj.updateClassProfile();

    res.json({ msg: 'Student added to class', class: classObj });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Class or student not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/classes/:id/remove-student/:studentId
// @desc    Remove student from class
// @access  Private/Admin
router.put('/:id/remove-student/:studentId', [auth, checkRole('admin')], async (req, res) => {
  try {
    // Find class by ID
    const classObj = await Class.findById(req.params.id);
    if (!classObj) {
      return res.status(404).json({ msg: 'Class not found' });
    }

    // Find student by ID
    const student = await Student.findById(req.params.studentId);
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    // Check if student is in the class
    if (!classObj.students.includes(student._id)) {
      return res.status(400).json({ msg: 'Student not in class' });
    }

    // Remove student from class
    classObj.students = classObj.students.filter(
      id => id.toString() !== student._id.toString()
    );
    await classObj.save();

    // Update student's current class
    if (student.currentClass && student.currentClass.toString() === classObj._id.toString()) {
      student.currentClass = null;
      student.currentTeacher = null;
      await student.save();
    }

    // Update class profile
    await classObj.updateClassProfile();

    res.json({ msg: 'Student removed from class', class: classObj });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Class or student not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET /api/classes/teacher/:teacherId
// @desc    Get classes by teacher
// @access  Private/Admin or Teacher
router.get('/teacher/:teacherId', auth, async (req, res) => {
  try {
    // Check if user is authorized
    if (req.user.role === 'teacher' && req.user._id.toString() !== req.params.teacherId) {
      return res.status(403).json({ msg: 'Not authorized to view these classes' });
    }

    // Find classes by teacher
    const classes = await Class.find({ teacher: req.params.teacherId })
      .populate('teacher', 'firstName lastName email')
      .sort({ academicYear: -1, grade: 1, name: 1 });

    res.json(classes);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Teacher not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET /api/classes/grade/:grade/year/:academicYear
// @desc    Get classes by grade and academic year
// @access  Private/Admin or Teacher
router.get('/grade/:grade/year/:academicYear', [auth, checkRole('admin', 'teacher')], async (req, res) => {
  try {
    const { grade, academicYear } = req.params;

    // Find classes by grade and academic year
    const classes = await Class.find({
      grade: parseInt(grade),
      academicYear,
      status: 'active'
    })
      .populate('teacher', 'firstName lastName email')
      .sort({ name: 1 });

    res.json(classes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/classes/stats/distribution
// @desc    Get class size distribution
// @access  Private/Admin
router.get('/stats/distribution', [auth, checkRole('admin')], async (req, res) => {
  try {
    const academicYear = req.query.academicYear || new Date().getFullYear().toString();
    
    // Get class size distribution by grade
    const classSizes = await Class.aggregate([
      { $match: { academicYear, status: 'active' } },
      {
        $group: {
          _id: '$grade',
          classes: { $push: { name: '$name', size: { $size: '$students' } } },
          totalStudents: { $sum: { $size: '$students' } },
          avgClassSize: { $avg: { $size: '$students' } },
          minClassSize: { $min: { $size: '$students' } },
          maxClassSize: { $max: { $size: '$students' } },
          classCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      academicYear,
      distribution: classSizes
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/classes/:id/roster
// @desc    Get class roster with detailed student info
// @access  Private/Admin or Teacher
router.get('/:id/roster', auth, async (req, res) => {
  try {
    const classObj = await Class.findById(req.params.id)
      .populate('teacher', 'firstName lastName email');
    
    if (!classObj) {
      return res.status(404).json({ msg: 'Class not found' });
    }

    // Check if user is authorized to view this class
    if (req.user.role === 'teacher' && classObj.teacher._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: 'Not authorized to view this class' });
    }

    // Get detailed student info
    const students = await Student.find({ _id: { $in: classObj.students } })
      .populate('parents', 'firstName lastName email phoneNumber')
      .sort({ lastName: 1, firstName: 1 });

    res.json({
      class: classObj,
      students
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Class not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router; 