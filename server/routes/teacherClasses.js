/**
 * Teacher Class Routes
 * Handles API endpoints for teacher class management
 */

const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongoose').Types;
const auth = require('../middleware/auth');
const teacherAuth = require('../middleware/teacherAuth');
const TeacherAssignment = require('../models/TeacherAssignment');
const ParentPreference = require('../models/ParentPreference');
const Student = require('../models/Student');
const Class = require('../models/Class');

// Mock data for development
const USE_MOCK_DATA = true;
const mockClassData = require('../data/mockClasses');
const mockParentRequests = require('../data/mockParentRequests');

/**
 * @route   GET /api/teacher/classes
 * @desc    Get all classes assigned to a teacher
 * @access  Private (Teacher)
 */
router.get('/classes', [auth, teacherAuth], async (req, res) => {
  try {
    if (USE_MOCK_DATA) {
      // For development, return mock class data
      return res.json(mockClassData.filter(c => c.teacherId === req.user.id));
    }
    
    // Find teacher assignments
    const assignments = await TeacherAssignment.find({ teacherId: req.user.id })
      .populate({
        path: 'classId',
        populate: {
          path: 'students',
          model: 'Student'
        }
      });
    
    // Format response
    const classes = assignments.map(assignment => {
      const classData = assignment.classId;
      return {
        id: classData._id,
        name: classData.name,
        grade: classData.grade,
        academicYear: classData.academicYear,
        students: classData.students,
        compatibilityScore: assignment.compatibilityScore
      };
    });
    
    res.json(classes);
  } catch (err) {
    console.error('Error fetching teacher classes:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   GET /api/teacher/classes/:classId
 * @desc    Get details for a specific class
 * @access  Private (Teacher)
 */
router.get('/classes/:classId', [auth, teacherAuth], async (req, res) => {
  try {
    const { classId } = req.params;
    
    if (USE_MOCK_DATA) {
      // For development, return mock class data
      const classData = mockClassData.find(c => c.id === classId);
      
      if (!classData) {
        return res.status(404).json({ error: 'Class not found' });
      }
      
      // Check if this teacher is assigned to this class
      if (classData.teacherId !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized to access this class' });
      }
      
      return res.json(classData);
    }
    
    // Find class and check if teacher is assigned
    const assignment = await TeacherAssignment.findOne({
      teacherId: req.user.id,
      classId: ObjectId(classId)
    });
    
    if (!assignment) {
      return res.status(403).json({ error: 'Not authorized to access this class' });
    }
    
    // Get class data with students
    const classData = await Class.findById(classId)
      .populate('students');
    
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }
    
    // Calculate class metrics
    const metrics = calculateClassMetrics(classData.students);
    
    res.json({
      id: classData._id,
      name: classData.name,
      grade: classData.grade,
      academicYear: classData.academicYear,
      students: classData.students,
      metrics,
      compatibilityScore: assignment.compatibilityScore
    });
  } catch (err) {
    console.error('Error fetching class details:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   GET /api/teacher/parent-requests
 * @desc    Get parent requests for a specific class
 * @access  Private (Teacher)
 */
router.get('/parent-requests', [auth, teacherAuth], async (req, res) => {
  try {
    const { classId } = req.query;
    
    if (USE_MOCK_DATA) {
      // For development, return mock parent requests
      const requests = mockParentRequests.filter(request => 
        request.classId === classId
      );
      
      return res.json(requests);
    }
    
    // Verify teacher is assigned to this class
    const assignment = await TeacherAssignment.findOne({
      teacherId: req.user.id,
      classId: ObjectId(classId)
    });
    
    if (!assignment) {
      return res.status(403).json({ error: 'Not authorized to access this class' });
    }
    
    // Get class data to find students
    const classData = await Class.findById(classId);
    
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }
    
    // Get parent preferences related to students in this class
    const parentPreferences = await ParentPreference.find({
      academicYear: classData.academicYear,
      'student.grade': classData.grade
    }).populate('parent', 'name email');
    
    // Filter to only include preferences for students in this class
    const classStudentIds = classData.students.map(id => id.toString());
    const relevantPreferences = parentPreferences.filter(pref => 
      classStudentIds.includes(pref.student.toString())
    );
    
    // Format response
    const requests = await Promise.all(relevantPreferences.map(async (pref) => {
      const student = await Student.findById(pref.student);
      
      return {
        id: pref._id,
        parentId: pref.parent._id,
        parentName: pref.parent.name,
        studentId: student._id,
        studentName: `${student.firstName} ${student.lastName}`,
        classId,
        className: classData.name,
        classPreferences: pref.classmates.map(cm => ({
          studentId: cm.student,
          relationship: cm.relationship,
          priority: cm.priority
        })),
        teacherPreferences: pref.teachers.map(t => ({
          teacherId: t.teacher,
          reason: t.reason,
          priority: t.priority
        })),
        specialConsiderations: pref.specialConsiderations,
        fulfilled: checkIfFulfilled(pref, classData)
      };
    }));
    
    res.json(requests);
  } catch (err) {
    console.error('Error fetching parent requests:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   POST /api/teacher/students/:studentId/notes
 * @desc    Add a note to a student
 * @access  Private (Teacher)
 */
router.post('/students/:studentId/notes', [auth, teacherAuth], async (req, res) => {
  try {
    const { studentId } = req.params;
    const { note } = req.body;
    
    if (!note) {
      return res.status(400).json({ error: 'Note is required' });
    }
    
    if (USE_MOCK_DATA) {
      // For development, just return success
      return res.json({ success: true, message: 'Note added successfully' });
    }
    
    // Find student
    const student = await Student.findById(studentId);
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Verify teacher has access to this student (is assigned to a class with this student)
    const classes = await Class.find({ students: ObjectId(studentId) });
    const classIds = classes.map(c => c._id);
    
    const assignment = await TeacherAssignment.findOne({
      teacherId: req.user.id,
      classId: { $in: classIds }
    });
    
    if (!assignment) {
      return res.status(403).json({ error: 'Not authorized to add notes for this student' });
    }
    
    // Add note
    student.notes = student.notes || [];
    student.notes.push({
      content: note,
      addedBy: req.user.id,
      addedAt: Date.now()
    });
    
    await student.save();
    
    res.json({ success: true, message: 'Note added successfully' });
  } catch (err) {
    console.error('Error adding student note:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   GET /api/teacher/classes/:classId/export
 * @desc    Export class roster as PDF
 * @access  Private (Teacher)
 */
router.get('/classes/:classId/export', [auth, teacherAuth], async (req, res) => {
  try {
    const { classId } = req.params;
    const { format } = req.query;
    
    // This would normally generate a PDF and return it
    // But for this implementation, we'll just return a success message
    
    res.json({ 
      success: true, 
      message: `Class roster export as ${format} would be generated here`
    });
  } catch (err) {
    console.error('Error exporting class roster:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper function to calculate class metrics
function calculateClassMetrics(students) {
  if (!students || students.length === 0) {
    return {
      academicDistribution: { advanced: 0, proficient: 0, developing: 0, needsSupport: 0 },
      behavioralDistribution: { excellent: 0, good: 0, fair: 0, needsImprovement: 0 },
      genderDistribution: { male: 0, female: 0, other: 0 },
      specialNeeds: { iep: 0, plan504: 0, none: 100 }
    };
  }
  
  const totalStudents = students.length;
  
  // Academic distribution
  const academicCounts = {
    advanced: 0,
    proficient: 0,
    developing: 0,
    needsSupport: 0
  };
  
  // Behavioral distribution
  const behavioralCounts = {
    excellent: 0,
    good: 0,
    fair: 0,
    needsImprovement: 0
  };
  
  // Gender distribution
  const genderCounts = {
    male: 0,
    female: 0,
    other: 0
  };
  
  // Special needs
  const specialNeedsCounts = {
    iep: 0,
    plan504: 0,
    none: 0
  };
  
  // Count students in each category
  students.forEach(student => {
    // Academic
    if (student.academicLevel === 'advanced') academicCounts.advanced++;
    else if (student.academicLevel === 'proficient') academicCounts.proficient++;
    else if (student.academicLevel === 'developing') academicCounts.developing++;
    else academicCounts.needsSupport++;
    
    // Behavioral
    if (student.behavioralLevel === 'excellent') behavioralCounts.excellent++;
    else if (student.behavioralLevel === 'good') behavioralCounts.good++;
    else if (student.behavioralLevel === 'fair') behavioralCounts.fair++;
    else behavioralCounts.needsImprovement++;
    
    // Gender
    if (student.gender === 'male') genderCounts.male++;
    else if (student.gender === 'female') genderCounts.female++;
    else genderCounts.other++;
    
    // Special needs
    if (student.iep) specialNeedsCounts.iep++;
    else if (student.plan504) specialNeedsCounts.plan504++;
    else specialNeedsCounts.none++;
  });
  
  // Convert to percentages
  const academicDistribution = {};
  const behavioralDistribution = {};
  const genderDistribution = {};
  const specialNeeds = {};
  
  Object.keys(academicCounts).forEach(key => {
    academicDistribution[key] = Math.round((academicCounts[key] / totalStudents) * 100);
  });
  
  Object.keys(behavioralCounts).forEach(key => {
    behavioralDistribution[key] = Math.round((behavioralCounts[key] / totalStudents) * 100);
  });
  
  Object.keys(genderCounts).forEach(key => {
    genderDistribution[key] = Math.round((genderCounts[key] / totalStudents) * 100);
  });
  
  Object.keys(specialNeedsCounts).forEach(key => {
    specialNeeds[key] = Math.round((specialNeedsCounts[key] / totalStudents) * 100);
  });
  
  return {
    academicDistribution,
    behavioralDistribution,
    genderDistribution,
    specialNeeds
  };
}

// Helper function to check if parent preference is fulfilled
function checkIfFulfilled(preference, classData) {
  // For classmate preferences
  let classmatesFulfilled = true;
  
  if (preference.classmates && preference.classmates.length > 0) {
    const classStudentIds = classData.students.map(id => id.toString());
    
    for (const classmate of preference.classmates) {
      if (!classStudentIds.includes(classmate.student.toString())) {
        classmatesFulfilled = false;
        break;
      }
    }
  }
  
  // For teacher preferences
  let teacherFulfilled = true;
  
  if (preference.teachers && preference.teachers.length > 0) {
    teacherFulfilled = preference.teachers.some(teacher => 
      teacher.teacher.toString() === classData.teacher.toString()
    );
  }
  
  return classmatesFulfilled && teacherFulfilled;
}

module.exports = router;

