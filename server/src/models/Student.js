const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please provide a first name'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Please provide a last name'],
    trim: true
  },
  studentId: {
    type: String,
    trim: true,
    unique: true
  },
  grade: {
    type: String,
    required: [true, 'Please provide a grade level'],
    trim: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
    required: [true, 'Please provide a gender']
  },
  dateOfBirth: {
    type: Date
  },
  academicLevel: {
    type: String,
    enum: ['Advanced', 'Proficient', 'Basic', 'Below Basic'],
    default: 'Proficient'
  },
  behaviorLevel: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Low'
  },
  specialNeeds: {
    type: Boolean,
    default: false
  },
  specialNeedsDetails: {
    type: String,
    trim: true
  },
  iep: {
    type: Boolean,
    default: false
  },
  ell: {
    type: Boolean,
    default: false
  },
  ellLevel: {
    type: Number,
    min: 1,
    max: 5
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: [true, 'Please provide a school ID']
  },
  notes: {
    type: String,
    trim: true
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
studentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Student', studentSchema); 