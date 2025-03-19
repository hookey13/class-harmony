const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OptimizationConstraintSchema = new Schema({
  academicYear: {
    type: String,
    required: true,
  },
  grade: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['must_be_together', 'must_be_separate', 'prefer_teacher', 'avoid_teacher'],
    required: true
  },
  students: [{
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  }],
  teacher: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  description: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  }
});

// Create an index for faster lookups by academic year and grade
OptimizationConstraintSchema.index({ academicYear: 1, grade: 1 });

module.exports = mongoose.model('OptimizationConstraint', OptimizationConstraintSchema); 