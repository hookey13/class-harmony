const mongoose = require('mongoose');

const parentRequestSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Please provide a student ID']
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  classListId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClassList',
    required: [true, 'Please provide a class list ID']
  },
  type: {
    type: String,
    enum: ['teacher', 'classmate', 'separation'],
    required: [true, 'Please provide a request type']
  },
  targetTeacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  targetStudentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  },
  reason: {
    type: String,
    trim: true,
    required: [true, 'Please provide a reason for the request']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'declined'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewNotes: {
    type: String,
    trim: true
  },
  reviewedAt: {
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
parentRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Set reviewedAt if status is changed from pending
  if (this.isModified('status') && this.status !== 'pending' && !this.reviewedAt) {
    this.reviewedAt = Date.now();
  }
  
  next();
});

module.exports = mongoose.model('ParentRequest', parentRequestSchema); 