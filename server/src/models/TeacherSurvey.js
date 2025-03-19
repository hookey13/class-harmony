const mongoose = require('mongoose');

const teacherSurveySchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide a teacher ID']
  },
  classListId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClassList',
    required: [true, 'Please provide a class list ID']
  },
  schoolYear: {
    type: String,
    required: [true, 'Please provide a school year'],
    trim: true
  },
  gradeLevel: {
    type: String,
    required: [true, 'Please provide a grade level'],
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'reviewed'],
    default: 'draft'
  },
  preferredStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  challengingStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  studentNotes: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    notes: String,
    academicStrengths: String,
    academicWeaknesses: String,
    behavioralNotes: String,
    recommendedSupports: String
  }],
  studentPairings: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    pairingType: {
      type: String,
      enum: ['good', 'avoid'],
      required: true
    },
    pairedStudentIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    }]
  }],
  generalNotes: {
    type: String,
    trim: true
  },
  submittedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
teacherSurveySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Set submittedAt if status is changed to submitted
  if (this.isModified('status') && this.status === 'submitted' && !this.submittedAt) {
    this.submittedAt = Date.now();
  }
  
  next();
});

module.exports = mongoose.model('TeacherSurvey', teacherSurveySchema); 