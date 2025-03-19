const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Student = require('../models/Student');
const User = require('../models/User');
const Class = require('../models/Class');
const auth = require('../middleware/auth');
const { checkRole, customValidators } = require('../middleware/validate');
const { APIError } = require('../middleware/errorHandler');
const { uploadSingle, optimizeImage } = require('../middleware/upload');

// @route   GET /api/students
// @desc    Get all students (with pagination and filtering)
// @access  Private/Admin or Teacher
router.get('/', [auth, checkRole('admin', 'teacher')], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    if (req.query.grade) filter.grade = req.query.grade;
    if (req.query.currentClass) filter.currentClass = req.query.currentClass;
    if (req.query.schoolYear) filter.schoolYear = parseInt(req.query.schoolYear);
    if (req.query.search) {
      filter.$or = [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { studentId: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Get students with pagination
    const students = await Student.find(filter)
      .populate('parents', 'firstName lastName email')
      .populate('currentClass', 'name teacher')
      .sort({ lastName: 1, firstName: 1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Student.countDocuments(filter);

    res.json({
      students,
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

// @route   GET /api/students/parent
// @desc    Get students for logged in parent
// @access  Private/Parent
router.get('/parent', [auth, checkRole('parent')], async (req, res) => {
  try {
    const students = await Student.find({ parents: req.user._id })
      .populate('currentClass', 'name teacher')
      .populate({
        path: 'currentClass',
        populate: {
          path: 'teacher',
          select: 'firstName lastName email'
        }
      })
      .sort({ lastName: 1, firstName: 1 });

    res.json(students);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/students/:id
// @desc    Get student by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('parents', 'firstName lastName email phoneNumber')
      .populate('currentClass', 'name teacher')
      .populate({
        path: 'currentClass',
        populate: {
          path: 'teacher',
          select: 'firstName lastName email'
        }
      });
    
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    // Check if user is authorized to view this student
    if (req.user.role === 'parent' && !student.parents.some(parent => parent._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ msg: 'Not authorized to view this student' });
    }

    res.json(student);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Student not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST /api/students
// @desc    Create a new student
// @access  Private/Admin
router.post('/', [
  auth,
  checkRole('admin'),
  check('firstName', 'First name is required').not().isEmpty(),
  check('lastName', 'Last name is required').not().isEmpty(),
  check('grade', 'Grade is required').custom(customValidators.isValidGrade),
  check('dateOfBirth', 'Date of birth is required').isISO8601(),
  check('schoolYear', 'School year is required').isInt({ min: 2000, max: 2100 }),
  check('parents', 'At least one parent is required').isArray({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      firstName,
      lastName,
      grade,
      dateOfBirth,
      gender,
      schoolYear,
      parents,
      specialNeeds,
      academicRecord,
      behavioralRecord,
      learningStyle,
      notes
    } = req.body;

    // Validate parent IDs
    for (const parentId of parents) {
      if (!mongoose.Types.ObjectId.isValid(parentId)) {
        return res.status(400).json({ errors: [{ msg: 'Invalid parent ID' }] });
      }

      const parent = await User.findById(parentId);
      if (!parent || parent.role !== 'parent') {
        return res.status(400).json({ errors: [{ msg: `Parent with ID ${parentId} not found` }] });
      }
    }

    // Create new student
    const student = new Student({
      firstName,
      lastName,
      grade,
      dateOfBirth,
      gender,
      schoolYear,
      parents,
      specialNeeds,
      academicRecord,
      behavioralRecord,
      learningStyle,
      notes
    });

    // Generate student ID
    const lastStudent = await Student.findOne().sort({ createdAt: -1 });
    const lastId = lastStudent ? parseInt(lastStudent.studentId.slice(2)) : 0;
    student.studentId = `ST${(lastId + 1).toString().padStart(5, '0')}`;

    // Save student to database
    await student.save();

    res.status(201).json(student);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/students/:id
// @desc    Update student
// @access  Private/Admin
router.put('/:id', [
  auth,
  checkRole('admin'),
  check('firstName', 'First name is required').optional().not().isEmpty(),
  check('lastName', 'Last name is required').optional().not().isEmpty(),
  check('grade', 'Grade must be valid').optional().custom(customValidators.isValidGrade),
  check('dateOfBirth', 'Date of birth must be valid').optional().isISO8601(),
  check('schoolYear', 'School year must be valid').optional().isInt({ min: 2000, max: 2100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      firstName,
      lastName,
      grade,
      dateOfBirth,
      gender,
      schoolYear,
      parents,
      specialNeeds,
      academicRecord,
      behavioralRecord,
      learningStyle,
      notes,
      currentClass
    } = req.body;

    // Find student by ID
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    // Validate parent IDs if provided
    if (parents && Array.isArray(parents)) {
      for (const parentId of parents) {
        if (!mongoose.Types.ObjectId.isValid(parentId)) {
          return res.status(400).json({ errors: [{ msg: 'Invalid parent ID' }] });
        }

        const parent = await User.findById(parentId);
        if (!parent || parent.role !== 'parent') {
          return res.status(400).json({ errors: [{ msg: `Parent with ID ${parentId} not found` }] });
        }
      }
      student.parents = parents;
    }

    // Validate class ID if provided
    if (currentClass) {
      if (!mongoose.Types.ObjectId.isValid(currentClass)) {
        return res.status(400).json({ errors: [{ msg: 'Invalid class ID' }] });
      }

      const classObj = await Class.findById(currentClass);
      if (!classObj) {
        return res.status(400).json({ errors: [{ msg: 'Class not found' }] });
      }
      student.currentClass = currentClass;
    }

    // Update student fields
    if (firstName) student.firstName = firstName;
    if (lastName) student.lastName = lastName;
    if (grade) student.grade = grade;
    if (dateOfBirth) student.dateOfBirth = dateOfBirth;
    if (gender) student.gender = gender;
    if (schoolYear) student.schoolYear = schoolYear;
    if (specialNeeds) student.specialNeeds = specialNeeds;
    if (academicRecord) student.academicRecord = academicRecord;
    if (behavioralRecord) student.behavioralRecord = behavioralRecord;
    if (learningStyle) student.learningStyle = learningStyle;
    if (notes) student.notes = notes;

    await student.save();

    res.json(student);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Student not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/students/:id
// @desc    Delete student
// @access  Private/Admin
router.delete('/:id', [auth, checkRole('admin')], async (req, res) => {
  try {
    // Find student by ID
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    // Delete student
    await student.remove();

    res.json({ msg: 'Student deleted' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Student not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/students/:id/photo
// @desc    Upload student photo
// @access  Private/Admin
router.put('/:id/photo', [
  auth,
  checkRole('admin'),
  uploadSingle('photo'),
  optimizeImage()
], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    // Find student by ID
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    // Update student photo
    student.photo = req.fileMetadata;
    await student.save();

    res.json({ msg: 'Student photo updated', photo: student.photo });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Student not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET /api/students/stats/grade-distribution
// @desc    Get student grade distribution
// @access  Private/Admin or Teacher
router.get('/stats/grade-distribution', [auth, checkRole('admin', 'teacher')], async (req, res) => {
  try {
    const schoolYear = req.query.schoolYear || new Date().getFullYear();
    
    // Get counts by grade
    const gradeCounts = await Student.aggregate([
      { $match: { schoolYear: parseInt(schoolYear) } },
      { $group: { _id: '$grade', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Format the results
    const gradeDistribution = {};
    gradeCounts.forEach(item => {
      gradeDistribution[item._id] = item.count;
    });

    res.json({
      schoolYear,
      gradeDistribution
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/students/stats/gender-ratio
// @desc    Get student gender ratio
// @access  Private/Admin or Teacher
router.get('/stats/gender-ratio', [auth, checkRole('admin', 'teacher')], async (req, res) => {
  try {
    const schoolYear = req.query.schoolYear || new Date().getFullYear();
    const grade = req.query.grade;
    
    // Build match object
    const match = { schoolYear: parseInt(schoolYear) };
    if (grade) match.grade = grade;
    
    // Get counts by gender
    const genderCounts = await Student.aggregate([
      { $match: match },
      { $group: { _id: '$gender', count: { $sum: 1 } } }
    ]);

    // Format the results
    const genderRatio = {
      male: 0,
      female: 0,
      other: 0
    };
    
    genderCounts.forEach(item => {
      if (item._id && genderRatio.hasOwnProperty(item._id.toLowerCase())) {
        genderRatio[item._id.toLowerCase()] = item.count;
      }
    });

    const total = genderRatio.male + genderRatio.female + genderRatio.other;

    res.json({
      schoolYear,
      grade: grade || 'all',
      genderRatio,
      total,
      percentages: {
        male: total > 0 ? Math.round((genderRatio.male / total) * 100) : 0,
        female: total > 0 ? Math.round((genderRatio.female / total) * 100) : 0,
        other: total > 0 ? Math.round((genderRatio.other / total) * 100) : 0
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/students/stats/special-needs
// @desc    Get special needs statistics
// @access  Private/Admin or Teacher
router.get('/stats/special-needs', [auth, checkRole('admin', 'teacher')], async (req, res) => {
  try {
    const schoolYear = req.query.schoolYear || new Date().getFullYear();
    
    // Get total student count
    const totalStudents = await Student.countDocuments({ schoolYear: parseInt(schoolYear) });
    
    // Get students with special needs
    const specialNeedsCount = await Student.countDocuments({
      schoolYear: parseInt(schoolYear),
      'specialNeeds.hasSpecialNeeds': true
    });
    
    // Get counts by special needs type
    const specialNeedsTypes = await Student.aggregate([
      { 
        $match: { 
          schoolYear: parseInt(schoolYear),
          'specialNeeds.hasSpecialNeeds': true
        } 
      },
      { $unwind: '$specialNeeds.types' },
      { $group: { _id: '$specialNeeds.types.type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Format the results
    const typeDistribution = {};
    specialNeedsTypes.forEach(item => {
      typeDistribution[item._id] = item.count;
    });

    res.json({
      schoolYear,
      totalStudents,
      specialNeedsCount,
      specialNeedsPercentage: totalStudents > 0 ? Math.round((specialNeedsCount / totalStudents) * 100) : 0,
      typeDistribution
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router; 