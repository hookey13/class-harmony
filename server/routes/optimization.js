const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/validate');
const Student = require('../models/Student');
const Class = require('../models/Class');
const User = require('../models/User');
const TeacherPreference = require('../models/TeacherPreference');
const ParentPreference = require('../models/ParentPreference');
const OptimizationConstraint = require('../models/OptimizationConstraint');
const OptimizationResult = require('../models/OptimizationResult');
const optimizationService = require('../services/optimizationService');
const aiService = require('../services/aiService');
const teacherAssignmentService = require('../services/teacherAssignmentService');
const TeacherAssignment = require('../models/TeacherAssignment');

// Create a mongoose model for constraints
const OptimizationConstraint = mongoose.model('OptimizationConstraint', 
  new mongoose.Schema({
    type: {
      type: String,
      enum: ['keep_together', 'keep_separate'],
      required: true
    },
    studentIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    }],
    reason: {
      type: String,
      required: true
    },
    academicYear: {
      type: String,
      required: true
    },
    grade: {
      type: Number,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  })
);

// @route   POST /api/optimization/run
// @desc    Execute the class optimization algorithm
// @access  Private/Admin
router.post('/run', [
  auth,
  checkRole('admin'),
  check('academicYear', 'Academic year is required').not().isEmpty(),
  check('grade', 'Grade is required').isNumeric(),
  check('numberOfClasses', 'Number of classes is required').isNumeric(),
  check('strategy', 'Strategy is required').isString(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { academicYear, grade, numberOfClasses, strategy, weights, constraints } = req.body;
    
    // Fetch students for the given grade and academic year
    const students = await Student.find({ 
      grade: Number(grade), 
      schoolYear: academicYear 
    }).populate('parents', 'firstName lastName');
    
    if (students.length === 0) {
      return res.status(404).json({ msg: 'No students found for the selected grade and academic year' });
    }
    
    // Fetch parent preferences
    const parentPreferences = await ParentPreference.find({
      academicYear,
      grade: Number(grade),
      status: 'approved'
    }).populate('student', 'firstName lastName');
    
    // Fetch teacher preferences
    const teacherPreferences = await TeacherPreference.find({
      academicYear,
      grade: Number(grade),
      status: 'approved'
    }).populate('teacher', 'firstName lastName');
    
    // Fetch placement constraints
    let placementConstraints = [];
    if (Array.isArray(constraints) && constraints.length > 0) {
      // Use provided constraints
      placementConstraints = constraints;
    } else {
      // Fetch from database
      const dbConstraints = await OptimizationConstraint.find({
        academicYear,
        grade: Number(grade)
      });
      
      placementConstraints = dbConstraints.map(c => ({
        id: c._id,
        type: c.type,
        studentIds: c.studentIds,
        reason: c.reason
      }));
    }
    
    // Run optimization algorithm
    // This is a simplified placeholder - in a real implementation,
    // this would be a more sophisticated algorithm
    
    // Distribute students
    const classes = [];
    const studentsPerClass = Math.ceil(students.length / numberOfClasses);
    
    // Create empty classes
    for (let i = 0; i < numberOfClasses; i++) {
      classes.push({
        name: `Grade ${grade} - Class ${i + 1}`,
        students: [],
        balanceScores: {
          gender: 0,
          academic: 0,
          behavioral: 0,
          specialNeeds: 0,
          overall: 0
        }
      });
    }
    
    // Handle "keep together" constraints
    const keepTogetherGroups = placementConstraints
      .filter(c => c.type === 'keep_together')
      .map(c => c.studentIds);
    
    // Handle "keep separate" constraints
    const keepSeparateGroups = placementConstraints
      .filter(c => c.type === 'keep_separate')
      .map(c => c.studentIds);
    
    // Assign students with constraints first
    const assignedStudentIds = new Set();
    
    // Process "keep together" constraints
    for (const group of keepTogetherGroups) {
      // Find the class with the most room
      const targetClassIndex = classes
        .map((c, i) => ({ count: c.students.length, index: i }))
        .sort((a, b) => a.count - b.count)[0].index;
      
      // Assign all students in the group to the same class
      for (const studentId of group) {
        const student = students.find(s => s._id.toString() === studentId.toString());
        if (student && !assignedStudentIds.has(studentId.toString())) {
          classes[targetClassIndex].students.push(student);
          assignedStudentIds.add(studentId.toString());
        }
      }
    }
    
    // Distribute remaining students based on strategy
    const remainingStudents = students.filter(s => !assignedStudentIds.has(s._id.toString()));
    
    if (strategy === 'balanced') {
      // Sort students by academic level (high to low)
      remainingStudents.sort((a, b) => (b.academicLevel || 3) - (a.academicLevel || 3));
      
      // Distribute evenly across classes
      for (let i = 0; i < remainingStudents.length; i++) {
        // Find the class with fewest students
        const targetClassIndex = classes
          .map((c, i) => ({ count: c.students.length, index: i }))
          .sort((a, b) => a.count - b.count)[0].index;
        
        // Check "keep separate" constraints
        let violatesConstraint = false;
        
        for (const group of keepSeparateGroups) {
          if (group.includes(remainingStudents[i]._id.toString())) {
            // Check if any student in this "keep separate" group is already in the target class
            const conflict = classes[targetClassIndex].students.some(s => 
              group.includes(s._id.toString()) && 
              s._id.toString() !== remainingStudents[i]._id.toString()
            );
            
            if (conflict) {
              violatesConstraint = true;
              break;
            }
          }
        }
        
        if (violatesConstraint) {
          // Try next best class
          const alternativeClassIndex = classes
            .map((c, i) => ({ 
              count: c.students.length, 
              index: i,
              hasConflict: c.students.some(s => 
                keepSeparateGroups.some(group => 
                  group.includes(s._id.toString()) && 
                  group.includes(remainingStudents[i]._id.toString())
                )
              )
            }))
            .filter(c => !c.hasConflict)
            .sort((a, b) => a.count - b.count)[0]?.index;
          
          if (alternativeClassIndex !== undefined) {
            classes[alternativeClassIndex].students.push(remainingStudents[i]);
          } else {
            // No alternative, assign to the least populated class
            classes
              .sort((a, b) => a.students.length - b.students.length)[0]
              .students.push(remainingStudents[i]);
          }
        } else {
          // No constraint violation, assign to target class
          classes[targetClassIndex].students.push(remainingStudents[i]);
        }
      }
    } else if (strategy === 'academic_focus') {
      // Group by academic level
      const academicGroups = {};
      for (const student of remainingStudents) {
        const level = student.academicLevel || 3;
        if (!academicGroups[level]) {
          academicGroups[level] = [];
        }
        academicGroups[level].push(student);
      }
      
      // Distribute evenly across classes
      for (const level in academicGroups) {
        for (let i = 0; i < academicGroups[level].length; i++) {
          const targetClassIndex = i % numberOfClasses;
          classes[targetClassIndex].students.push(academicGroups[level][i]);
        }
      }
    } else if (strategy === 'parent_requests_priority') {
      // Sort students by whether they have parent requests
      remainingStudents.sort((a, b) => {
        const aHasRequests = parentPreferences.some(p => p.student._id.toString() === a._id.toString());
        const bHasRequests = parentPreferences.some(p => p.student._id.toString() === b._id.toString());
        return bHasRequests - aHasRequests;
      });
      
      // Process students with parent requests first
      for (let i = 0; i < remainingStudents.length; i++) {
        const student = remainingStudents[i];
        const preference = parentPreferences.find(p => p.student._id.toString() === student._id.toString());
        
        if (preference && preference.preferredClassmates?.length > 0) {
          // Try to find a class with preferred classmates
          let assigned = false;
          
          for (let j = 0; j < classes.length; j++) {
            const classHasPreferred = classes[j].students.some(s => 
              preference.preferredClassmates.includes(s._id.toString())
            );
            
            if (classHasPreferred) {
              classes[j].students.push(student);
              assigned = true;
              break;
            }
          }
          
          if (!assigned) {
            // Assign to least populated class
            classes
              .sort((a, b) => a.students.length - b.students.length)[0]
              .students.push(student);
          }
        } else {
          // No preference, assign to least populated class
          classes
            .sort((a, b) => a.students.length - b.students.length)[0]
            .students.push(student);
        }
      }
    } else {
      // Default strategy - simple distribution
      for (let i = 0; i < remainingStudents.length; i++) {
        const targetClass = i % numberOfClasses;
        classes[targetClass].students.push(remainingStudents[i]);
      }
    }
    
    // Calculate balance scores for each class
    for (let i = 0; i < classes.length; i++) {
      // Calculate gender balance
      const maleCount = classes[i].students.filter(s => s.gender === 'Male').length;
      const femaleCount = classes[i].students.filter(s => s.gender === 'Female').length;
      const totalCount = classes[i].students.length;
      
      const genderBalance = totalCount > 0 ? 
        Math.min(maleCount, femaleCount) / (Math.max(maleCount, femaleCount) || 1) : 0;
      
      // Calculate academic balance (standard deviation of academic levels)
      const academicLevels = classes[i].students.map(s => s.academicLevel || 3);
      const avgAcademic = academicLevels.reduce((sum, level) => sum + level, 0) / 
        (academicLevels.length || 1);
      
      const academicStdDev = Math.sqrt(
        academicLevels.reduce((sum, level) => sum + Math.pow(level - avgAcademic, 2), 0) / 
        (academicLevels.length || 1)
      );
      
      const academicBalance = 1 - (academicStdDev / 4); // Normalize to 0-1 scale
      
      // Calculate behavioral balance (standard deviation of behavioral levels)
      const behavioralLevels = classes[i].students.map(s => s.behavioralLevel || 3);
      const avgBehavioral = behavioralLevels.reduce((sum, level) => sum + level, 0) / 
        (behavioralLevels.length || 1);
      
      const behavioralStdDev = Math.sqrt(
        behavioralLevels.reduce((sum, level) => sum + Math.pow(level - avgBehavioral, 2), 0) / 
        (behavioralLevels.length || 1)
      );
      
      const behavioralBalance = 1 - (behavioralStdDev / 4); // Normalize to 0-1 scale
      
      // Calculate special needs distribution
      const specialNeedsCount = classes[i].students.filter(s => s.specialNeeds).length;
      const avgSpecialNeeds = (students.filter(s => s.specialNeeds).length / students.length) * 
        classes[i].students.length;
      
      const specialNeedsBalance = avgSpecialNeeds > 0 ? 
        1 - Math.min(Math.abs(specialNeedsCount - avgSpecialNeeds) / avgSpecialNeeds, 1) : 1;
      
      // Calculate overall balance score (weighted average)
      const { 
        genderBalance: genderWeight = 1, 
        academicBalance: academicWeight = 1,
        behavioralBalance: behavioralWeight = 1,
        specialNeedsDistribution: specialNeedsWeight = 1
      } = weights || {};
      
      const totalWeight = genderWeight + academicWeight + behavioralWeight + specialNeedsWeight;
      
      const overallBalance = (
        genderBalance * genderWeight +
        academicBalance * academicWeight +
        behavioralBalance * behavioralWeight +
        specialNeedsBalance * specialNeedsWeight
      ) / (totalWeight || 1);
      
      // Update class balance scores
      classes[i].balanceScores = {
        gender: Math.round(genderBalance * 100) / 100,
        academic: Math.round(academicBalance * 100) / 100,
        behavioral: Math.round(behavioralBalance * 100) / 100,
        specialNeeds: Math.round(specialNeedsBalance * 100) / 100,
        overall: Math.round(overallBalance * 100) / 100
      };
    }
    
    // Save optimization result for later use
    const optimizationResult = {
      timestamp: new Date(),
      academicYear,
      grade: Number(grade),
      strategy,
      numberOfClasses,
      totalStudents: students.length,
      constraints: placementConstraints.length,
      parentPreferences: parentPreferences.length,
      teacherPreferences: teacherPreferences.length,
      classes: classes.map(c => ({
        ...c,
        studentCount: c.students.length
      })),
      balanceScore: classes.reduce((sum, c) => sum + c.balanceScores.overall, 0) / classes.length
    };
    
    res.json({
      message: 'Optimization completed successfully',
      runId: new Date().getTime().toString(),
      timestamp: new Date(),
      classes,
      stats: {
        totalStudents: students.length,
        averageClassSize: Math.round(students.length / numberOfClasses * 10) / 10,
        balanceScore: Math.round(optimizationResult.balanceScore * 100) / 100,
        constraintsApplied: placementConstraints.length,
        parentPreferencesApplied: parentPreferences.length
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/optimization/results/:id
// @desc    Get optimization results by ID
// @access  Private/Admin
router.get('/results/:id', [auth, checkRole('admin')], async (req, res) => {
  try {
    const { id } = req.params;
    
    // In a full implementation, you would store and retrieve optimization results
    // from a database. For now, we'll return a mock response.
    if (id !== 'latest') {
      return res.status(404).json({ msg: 'Optimization result not found' });
    }
    
    const mockResult = {
      id: 'latest',
      timestamp: new Date().toISOString(),
      academicYear: '2023-2024',
      grade: 3,
      classes: [
        {
          name: 'Class 3A',
          teacher: {
            id: '60d0fe4f5311236168a109ca',
            name: 'Ms. Johnson'
          },
          studentCount: 22,
          genderRatio: { male: 12, female: 10 },
          specialNeeds: 3,
          satisfiedPreferences: {
            teacher: 90,
            parent: 85
          }
        },
        {
          name: 'Class 3B',
          teacher: {
            id: '60d0fe4f5311236168a109cb',
            name: 'Mr. Davis'
          },
          studentCount: 23,
          genderRatio: { male: 11, female: 12 },
          specialNeeds: 2,
          satisfiedPreferences: {
            teacher: 88,
            parent: 82
          }
        }
      ],
      overallSatisfaction: 86,
      unplacedStudents: []
    };
    
    res.json(mockResult);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/optimization/apply
// @desc    Apply optimization results to create classes
// @access  Private/Admin
router.post('/apply', [
  auth,
  checkRole('admin'),
  check('classes', 'Classes are required').isArray(),
  check('academicYear', 'Academic year is required').not().isEmpty(),
  check('grade', 'Grade is required').isNumeric(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { classes, academicYear, grade } = req.body;
    
    // Get existing classes for this academic year and grade
    const existingClasses = await Class.find({ academicYear, grade });
    
    const createdClasses = [];
    const updatedClasses = [];
    
    // For each optimized class
    for (let i = 0; i < classes.length; i++) {
      const optimizedClass = classes[i];
      const className = optimizedClass.name || `Grade ${grade} - Class ${i + 1}`;
      const studentIds = optimizedClass.students.map(s => s._id);
      
      // Check if we have an existing class to update
      let existingClass = null;
      if (i < existingClasses.length) {
        existingClass = existingClasses[i];
      }
      
      if (existingClass) {
        // Update existing class
        existingClass.name = className;
        existingClass.students = studentIds;
        if (optimizedClass.teacher) {
          existingClass.teacher = optimizedClass.teacher;
        }
        await existingClass.save();
        updatedClasses.push(existingClass);
      } else {
        // Create new class
        const newClass = new Class({
          name: className,
          academicYear,
          grade,
          students: studentIds,
          teacher: optimizedClass.teacher || null,
          status: 'active'
        });
        await newClass.save();
        createdClasses.push(newClass);
      }
    }
    
    // If we had more existing classes than optimized classes, delete the excess
    if (existingClasses.length > classes.length) {
      for (let i = classes.length; i < existingClasses.length; i++) {
        await Class.findByIdAndDelete(existingClasses[i]._id);
      }
    }
    
    res.json({
      success: true,
      message: `Successfully applied optimization: ${createdClasses.length} classes created, ${updatedClasses.length} classes updated`,
      createdCount: createdClasses.length,
      updatedCount: updatedClasses.length
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/optimization/constraints
// @desc    Get optimization constraints
// @access  Private/Admin
router.get('/constraints', [
  auth,
  checkRole(['admin', 'teacher']),
], async (req, res) => {
  try {
    const { academicYear, grade } = req.query;
    
    if (!academicYear || grade === undefined) {
      return res.status(400).json({ error: 'Academic year and grade are required' });
    }
    
    const constraints = await OptimizationConstraint.find({
      academicYear,
      grade
    }).populate('students');
    
    res.json(constraints);
  } catch (error) {
    console.error('Error fetching optimization constraints:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/optimization/constraints
// @desc    Create optimization constraint
// @access  Private/Admin
router.post('/constraints', [
  auth,
  checkRole('admin'),
  check('type', 'Type is required').isIn(['keep_together', 'keep_separate']),
  check('studentIds', 'Student IDs are required').isArray({ min: 2 }),
  check('reason', 'Reason is required').not().isEmpty(),
  check('academicYear', 'Academic year is required').not().isEmpty(),
  check('grade', 'Grade is required').isNumeric()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { type, studentIds, reason, academicYear, grade } = req.body;
    
    // Verify all students exist
    const students = await Student.find({ _id: { $in: studentIds } });
    if (students.length !== studentIds.length) {
      return res.status(400).json({ msg: 'One or more student IDs are invalid' });
    }
    
    // Create constraint
    const constraint = new OptimizationConstraint({
      type,
      studentIds,
      reason,
      academicYear,
      grade: Number(grade),
      createdBy: req.user.id
    });
    
    await constraint.save();
    
    // Populate student details for response
    await constraint.populate('studentIds', 'firstName lastName grade specialNeeds');
    
    // Format for frontend
    const formattedConstraint = {
      id: constraint._id,
      type: constraint.type,
      studentIds: constraint.studentIds.map(s => s._id),
      students: constraint.studentIds.map(s => ({
        _id: s._id,
        firstName: s.firstName,
        lastName: s.lastName,
        grade: s.grade,
        specialNeeds: s.specialNeeds
      })),
      reason: constraint.reason,
      academicYear: constraint.academicYear,
      grade: constraint.grade,
      createdAt: constraint.createdAt
    };
    
    res.status(201).json(formattedConstraint);
  } catch (error) {
    console.error('Error creating optimization constraint:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/optimization/constraints/:id
// @desc    Delete optimization constraint
// @access  Private/Admin
router.delete('/constraints/:id', [
  auth,
  checkRole('admin')
], async (req, res) => {
  try {
    const constraint = await OptimizationConstraint.findById(req.params.id);
    
    if (!constraint) {
      return res.status(404).json({ error: 'Constraint not found' });
    }
    
    await constraint.remove();
    res.json({ message: 'Constraint removed' });
  } catch (error) {
    console.error('Error deleting optimization constraint:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/optimization/stats
// @desc    Get statistics for optimization
// @access  Private/Admin
router.get('/stats', [
  auth,
  checkRole('admin'),
  check('academicYear', 'Academic year is required').not().isEmpty().optional(),
  check('grade', 'Grade must be a number').isNumeric().optional(),
], async (req, res) => {
  try {
    const { academicYear, grade } = req.query;
    
    // Build filter
    const filter = {};
    if (academicYear) filter.academicYear = academicYear;
    if (grade) filter.grade = Number(grade);
    
    // Get student counts
    const studentCount = await Student.countDocuments({
      ...filter,
      isActive: true
    });
    
    // Get teacher counts with approved preferences
    const teacherPreferenceCount = await TeacherPreference.countDocuments({
      ...filter,
      submissionStatus: 'approved'
    });
    
    // Get parent preference counts
    const parentPreferenceCount = await ParentPreference.countDocuments({
      ...filter,
      submissionStatus: { $in: ['submitted', 'approved'] }
    });
    
    // Get class counts
    const classCount = await Class.countDocuments(filter);
    
    // Get specific statuses
    const parentPreferenceStatuses = await ParentPreference.aggregate([
      { $match: filter },
      { $group: { _id: '$submissionStatus', count: { $sum: 1 } } }
    ]);
    
    const teacherPreferenceStatuses = await TeacherPreference.aggregate([
      { $match: filter },
      { $group: { _id: '$submissionStatus', count: { $sum: 1 } } }
    ]);
    
    // Format parent preference statuses
    const parentStatuses = {
      draft: 0,
      submitted: 0,
      approved: 0,
      rejected: 0,
      needs_clarification: 0
    };
    
    parentPreferenceStatuses.forEach(status => {
      if (parentStatuses.hasOwnProperty(status._id)) {
        parentStatuses[status._id] = status.count;
      }
    });
    
    // Format teacher preference statuses
    const teacherStatuses = {
      draft: 0,
      submitted: 0,
      approved: 0,
      rejected: 0,
      needs_clarification: 0
    };
    
    teacherPreferenceStatuses.forEach(status => {
      if (teacherStatuses.hasOwnProperty(status._id)) {
        teacherStatuses[status._id] = status.count;
      }
    });
    
    // Return statistics
    res.json({
      studentCount,
      teacherPreferenceCount,
      parentPreferenceCount,
      classCount,
      avgClassSize: classCount > 0 ? Math.round(studentCount / classCount) : 0,
      parentPreferenceStatuses: parentStatuses,
      teacherPreferenceStatuses: teacherStatuses,
      readiness: {
        status: determineReadinessStatus(studentCount, teacherPreferenceCount, parentPreferenceCount),
        studentReadiness: studentCount > 0 ? 100 : 0,
        teacherReadiness: studentCount > 0 ? (teacherPreferenceCount / Math.ceil(studentCount / 25)) * 100 : 0,
        parentReadiness: studentCount > 0 ? (parentPreferenceCount / studentCount) * 100 : 0
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Helper function to determine readiness status
function determineReadinessStatus(studentCount, teacherPreferenceCount, parentPreferenceCount) {
  if (studentCount === 0) return 'No students available';
  
  const estimatedClassCount = Math.ceil(studentCount / 25);
  const teacherReadinessPercentage = (teacherPreferenceCount / estimatedClassCount) * 100;
  const parentReadinessPercentage = (parentPreferenceCount / studentCount) * 100;
  
  if (teacherReadinessPercentage < 50) return 'Insufficient teacher preferences';
  if (parentReadinessPercentage < 30) return 'Low parent preference submission';
  if (teacherReadinessPercentage >= 100 && parentReadinessPercentage >= 60) return 'Ready for optimization';
  if (teacherReadinessPercentage >= 80 && parentReadinessPercentage >= 50) return 'Almost ready';
  
  return 'More data needed';
}

// @route   POST /api/optimization/ai-suggestions
// @desc    Get AI-powered suggestions for class optimization
// @access  Private/Admin
router.post('/ai-suggestions', [
  auth,
  checkRole('admin'),
  check('classes', 'Classes are required').isArray(),
  check('academicYear', 'Academic year is required').not().isEmpty(),
  check('grade', 'Grade is required').isNumeric(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { classes, academicYear, grade } = req.body;
    
    // Analyze classes
    const suggestions = [];
    
    // Check for class size imbalance
    const classSizes = classes.map(c => c.students.length);
    const avgClassSize = classSizes.reduce((sum, size) => sum + size, 0) / classSizes.length;
    const maxSizeDiff = Math.max(...classSizes) - Math.min(...classSizes);
    
    if (maxSizeDiff >= 3) {
      suggestions.push({
        type: 'class_size',
        description: 'Balance class sizes',
        impact: 'High',
        details: `There's a significant difference in class sizes (${maxSizeDiff} students). Consider moving students from larger to smaller classes.`
      });
    }
    
    // Check for gender imbalance
    for (let i = 0; i < classes.length; i++) {
      const classObj = classes[i];
      const maleCount = classObj.students.filter(s => s.gender === 'Male').length;
      const femaleCount = classObj.students.filter(s => s.gender === 'Female').length;
      const genderRatio = Math.min(maleCount, femaleCount) / Math.max(maleCount, femaleCount);
      
      if (genderRatio < 0.7) {
        suggestions.push({
          type: 'gender_balance',
          description: `Improve gender balance in Class ${i+1}`,
          impact: 'Medium',
          details: `Class ${i+1} has ${maleCount} males and ${femaleCount} females. Consider rebalancing for better gender distribution.`
        });
      }
    }
    
    // Check for special needs concentration
    const specialNeedsCounts = classes.map(c => 
      c.students.filter(s => s.specialNeeds).length
    );
    const avgSpecialNeeds = specialNeedsCounts.reduce((sum, count) => sum + count, 0) / classes.length;
    const maxSpecialNeedsDiff = Math.max(...specialNeedsCounts) - Math.min(...specialNeedsCounts);
    
    if (maxSpecialNeedsDiff >= 2) {
      const maxIndex = specialNeedsCounts.indexOf(Math.max(...specialNeedsCounts));
      const minIndex = specialNeedsCounts.indexOf(Math.min(...specialNeedsCounts));
      
      suggestions.push({
        type: 'special_needs',
        description: 'Redistribute students with special needs',
        impact: 'High',
        details: `Class ${maxIndex+1} has ${specialNeedsCounts[maxIndex]} students with special needs, while Class ${minIndex+1} has only ${specialNeedsCounts[minIndex]}. Consider moving some students to balance support needs.`
      });
    }
    
    // Check for academic level imbalance
    const academicAverages = classes.map(c => {
      const levels = c.students.map(s => s.academicLevel || 3);
      return levels.reduce((sum, level) => sum + level, 0) / levels.length;
    });
    
    const maxAcademicDiff = Math.max(...academicAverages) - Math.min(...academicAverages);
    
    if (maxAcademicDiff >= 0.7) {
      const maxIndex = academicAverages.indexOf(Math.max(...academicAverages));
      const minIndex = academicAverages.indexOf(Math.min(...academicAverages));
      
      suggestions.push({
        type: 'academic_balance',
        description: 'Balance academic levels between classes',
        impact: 'Medium',
        details: `Class ${maxIndex+1} has a higher average academic level (${academicAverages[maxIndex].toFixed(1)}) than Class ${minIndex+1} (${academicAverages[minIndex].toFixed(1)}). Consider moving some higher-performing students to balance academic distribution.`
      });
    }
    
    // Get specific student movement suggestions
    if (suggestions.length > 0) {
      const studentSuggestions = [];
      
      // Find potential student swaps that would improve balance
      for (let i = 0; i < classes.length; i++) {
        for (let j = i+1; j < classes.length; j++) {
          for (let si = 0; si < classes[i].students.length; si++) {
            for (let sj = 0; sj < classes[j].students.length; sj++) {
              // Check if swap would improve balance
              // This is a simplified check - in a real implementation, you would analyze more factors
              const student1 = classes[i].students[si];
              const student2 = classes[j].students[sj];
              
              // Simple examples - suggest swapping to improve specific imbalances
              // Gender balance
              if (student1.gender !== student2.gender) {
                const maleCount1 = classes[i].students.filter(s => s.gender === 'Male').length;
                const femaleCount1 = classes[i].students.filter(s => s.gender === 'Female').length;
                const maleCount2 = classes[j].students.filter(s => s.gender === 'Male').length;
                const femaleCount2 = classes[j].students.filter(s => s.gender === 'Female').length;
                
                if ((student1.gender === 'Male' && maleCount1 > femaleCount1 && maleCount2 < femaleCount2) ||
                    (student1.gender === 'Female' && femaleCount1 > maleCount1 && femaleCount2 < maleCount2)) {
                  studentSuggestions.push({
                    type: 'student_swap',
                    description: `Swap ${student1.firstName} ${student1.lastName} with ${student2.firstName} ${student2.lastName}`,
                    impact: 'Medium',
                    details: 'This swap would improve gender balance in both classes.'
                  });
                  
                  // Limit to just a few suggestions
                  if (studentSuggestions.length >= 3) break;
                }
              }
              
              // Special needs balance
              if (student1.specialNeeds !== student2.specialNeeds) {
                const specialNeeds1 = classes[i].students.filter(s => s.specialNeeds).length;
                const specialNeeds2 = classes[j].students.filter(s => s.specialNeeds).length;
                
                if ((student1.specialNeeds && specialNeeds1 > specialNeeds2) ||
                    (student2.specialNeeds && specialNeeds2 > specialNeeds1)) {
                  studentSuggestions.push({
                    type: 'student_swap',
                    description: `Swap ${student1.firstName} ${student1.lastName} with ${student2.firstName} ${student2.lastName}`,
                    impact: 'High',
                    details: 'This swap would better distribute students with special needs.'
                  });
                  
                  // Limit to just a few suggestions
                  if (studentSuggestions.length >= 3) break;
                }
              }
            }
            
            if (studentSuggestions.length >= 3) break;
          }
          
          if (studentSuggestions.length >= 3) break;
        }
        
        if (studentSuggestions.length >= 3) break;
      }
      
      // Add student suggestions if found
      suggestions.push(...studentSuggestions);
    }
    
    // Return suggestions
    res.json({
      suggestions,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

/**
 * @route   POST /api/ai/insights
 * @desc    Get AI insights for class optimization
 * @access  Private (Admin)
 */
router.post('/ai/insights', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { classData } = req.body;
    
    if (!classData || !classData.classes) {
      return res.status(400).json({ error: 'Class data is required' });
    }
    
    const insights = await aiService.generateInsights(classData);
    res.json(insights);
  } catch (error) {
    console.error('Error generating AI insights:', error);
    res.status(500).json({ error: 'Error generating AI insights' });
  }
});

/**
 * @route   POST /api/ai/suggestions
 * @desc    Get AI suggestions for class optimization
 * @access  Private (Admin)
 */
router.post('/ai/suggestions', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { classData, classId } = req.body;
    
    if (!classData || !classData.classes) {
      return res.status(400).json({ error: 'Class data is required' });
    }
    
    const suggestions = await aiService.generateSuggestions(classData, classId);
    res.json(suggestions);
  } catch (error) {
    console.error('Error generating AI suggestions:', error);
    res.status(500).json({ error: 'Error generating AI suggestions' });
  }
});

/**
 * @route   POST /api/ai/constraints/analysis
 * @desc    Get AI constraint analysis for class optimization
 * @access  Private (Admin)
 */
router.post('/ai/constraints/analysis', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { classData } = req.body;
    
    if (!classData) {
      return res.status(400).json({ error: 'Class data is required' });
    }
    
    const analysis = await aiService.analyzeConstraints(classData);
    res.json(analysis);
  } catch (error) {
    console.error('Error generating constraint analysis:', error);
    res.status(500).json({ error: 'Error generating constraint analysis' });
  }
});

/**
 * @route   POST /api/optimization/assign-teachers
 * @desc    Assign teachers to optimized classes
 * @access  Private (Admin)
 */
router.post('/assign-teachers', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { academicYear, grade, classes } = req.body;
    
    if (!academicYear || grade === undefined || !classes) {
      return res.status(400).json({ error: 'Academic year, grade, and classes are required' });
    }
    
    const result = await teacherAssignmentService.getTeacherAssignments(
      academicYear,
      grade,
      classes
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error assigning teachers to classes:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   GET /api/optimization/teacher-compatibility/:teacherId
 * @desc    Get compatibility score for a specific teacher with a class
 * @access  Private (Admin)
 */
router.post('/teacher-compatibility', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { teacherId, classData } = req.body;
    
    if (!teacherId || !classData) {
      return res.status(400).json({ error: 'Teacher ID and class data are required' });
    }
    
    // Get teacher with preferences
    const teachers = await teacherAssignmentService.getAvailableTeachers(
      classData.academicYear,
      classData.grade
    );
    
    const teacher = teachers.find(t => t.id.toString() === teacherId.toString());
    
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    
    const compatibilityScore = teacherAssignmentService.calculateCompatibilityScore(
      teacher,
      classData
    );
    
    res.json({
      teacherId,
      teacherName: teacher.name,
      classId: classData._id || classData.id,
      className: classData.name,
      compatibilityScore,
      compatibilityDetails: {
        academicDistribution: getAcademicDistribution(classData.students),
        behavioralDistribution: getBehavioralDistribution(classData.students),
        genderDistribution: getGenderDistribution(classData.students),
        specialNeedsCount: classData.students.filter(s => s.specialNeeds).length
      }
    });
  } catch (error) {
    console.error('Error calculating teacher compatibility:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper functions for calculating distributions
const getAcademicDistribution = (students) => {
  const distribution = {
    advanced: 0,
    proficient: 0,
    developing: 0,
    needsSupport: 0
  };
  
  students.forEach(student => {
    switch(student.academicLevel) {
      case 'advanced':
        distribution.advanced++;
        break;
      case 'proficient':
        distribution.proficient++;
        break;
      case 'developing':
        distribution.developing++;
        break;
      case 'needsSupport':
        distribution.needsSupport++;
        break;
      default:
        break;
    }
  });
  
  // Convert to percentages
  const total = students.length;
  return {
    advanced: (distribution.advanced / total) * 100,
    proficient: (distribution.proficient / total) * 100,
    developing: (distribution.developing / total) * 100,
    needsSupport: (distribution.needsSupport / total) * 100
  };
};

const getBehavioralDistribution = (students) => {
  const distribution = {
    excellent: 0,
    good: 0,
    satisfactory: 0,
    needsImprovement: 0
  };
  
  students.forEach(student => {
    switch(student.behavioralLevel) {
      case 'excellent':
        distribution.excellent++;
        break;
      case 'good':
        distribution.good++;
        break;
      case 'satisfactory':
        distribution.satisfactory++;
        break;
      case 'needsImprovement':
        distribution.needsImprovement++;
        break;
      default:
        break;
    }
  });
  
  // Convert to percentages
  const total = students.length;
  return {
    excellent: (distribution.excellent / total) * 100,
    good: (distribution.good / total) * 100,
    satisfactory: (distribution.satisfactory / total) * 100,
    needsImprovement: (distribution.needsImprovement / total) * 100
  };
};

const getGenderDistribution = (students) => {
  const distribution = {
    male: 0,
    female: 0,
    nonBinary: 0,
    other: 0
  };
  
  students.forEach(student => {
    switch(student.gender) {
      case 'male':
        distribution.male++;
        break;
      case 'female':
        distribution.female++;
        break;
      case 'nonBinary':
        distribution.nonBinary++;
        break;
      case 'other':
        distribution.other++;
        break;
      default:
        break;
    }
  });
  
  // Convert to percentages
  const total = students.length;
  return {
    male: (distribution.male / total) * 100,
    female: (distribution.female / total) * 100,
    nonBinary: (distribution.nonBinary / total) * 100,
    other: (distribution.other / total) * 100
  };
};

/**
 * @route   POST /api/optimization/save-teacher-assignments
 * @desc    Save teacher assignments for classes
 * @access  Private (Admin)
 */
router.post('/save-teacher-assignments', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { academicYear, grade, assignments } = req.body;
    
    if (!academicYear || grade === undefined || !assignments || !Array.isArray(assignments)) {
      return res.status(400).json({ error: 'Academic year, grade, and assignments array are required' });
    }
    
    // Save assignments to database
    const savedAssignments = [];
    
    for (const assignment of assignments) {
      const { classId, teacherId } = assignment;
      
      if (!classId || !teacherId) {
        continue;
      }
      
      // Find existing assignment or create new one
      let teacherAssignment = await TeacherAssignment.findOne({
        academicYear,
        grade,
        classId
      });
      
      if (teacherAssignment) {
        teacherAssignment.teacherId = teacherId;
        await teacherAssignment.save();
      } else {
        teacherAssignment = await TeacherAssignment.create({
          academicYear,
          grade,
          classId,
          teacherId,
          assignedAt: new Date()
        });
      }
      
      savedAssignments.push(teacherAssignment);
    }
    
    res.json({
      message: 'Teacher assignments saved successfully',
      savedAssignments
    });
  } catch (error) {
    console.error('Error saving teacher assignments:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Export the router
module.exports = router; 