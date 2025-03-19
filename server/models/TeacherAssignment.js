const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const teacherAssignmentSchema = new Schema({
  academicYear: {
    type: String,
    required: true
  },
  grade: {
    type: Number,
    required: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  compatibilityScore: {
    type: Number
  },
  assignmentNotes: {
    type: String
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  history: [{
    previousTeacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher'
    },
    changedAt: {
      type: Date
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String
    }
  }]
}, {
  timestamps: true
});

// Define index for faster lookups
teacherAssignmentSchema.index({ academicYear: 1, grade: 1, classId: 1 }, { unique: true });

// Method to record history when changing teacher assignment
teacherAssignmentSchema.methods.changeTeacher = async function(newTeacherId, userId, reason) {
  // Add current assignment to history
  this.history.push({
    previousTeacherId: this.teacherId,
    changedAt: new Date(),
    changedBy: userId,
    reason: reason || 'Assignment changed'
  });
  
  // Update teacher
  this.teacherId = newTeacherId;
  this.assignedBy = userId;
  this.assignedAt = new Date();
  
  return this.save();
};

// Static method to get all assignments for a specific academic year and grade
teacherAssignmentSchema.statics.getAssignmentsByYearAndGrade = function(academicYear, grade) {
  return this.find({ academicYear, grade })
    .populate('teacherId', 'name email teachingStyle specialtyAreas')
    .populate('classId', 'name students')
    .sort({ 'classId.name': 1 });
};

// Static method to get assignments for a specific teacher
teacherAssignmentSchema.statics.getAssignmentsByTeacher = function(teacherId, academicYear) {
  const query = { teacherId };
  
  if (academicYear) {
    query.academicYear = academicYear;
  }
  
  return this.find(query)
    .populate('classId', 'name students grade')
    .sort({ academicYear: -1, grade: 1 });
};

module.exports = mongoose.model('TeacherAssignment', teacherAssignmentSchema); 