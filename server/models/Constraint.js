/**
 * Constraint Model
 * Represents constraints for class optimization
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ConstraintSchema = new Schema({
  academicYear: {
    type: String,
    required: true
  },
  grade: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      'must_be_together',
      'must_be_separate',
      'preferred_teacher',
      'avoid_teacher',
      'balanced_distribution',
      'equal_class_size'
    ],
    required: true
  },
  priority: {
    type: String,
    enum: ['required', 'high', 'medium', 'low'],
    default: 'medium'
  },
  // For must_be_together and must_be_separate constraints
  students: [{
    type: Schema.Types.ObjectId,
    ref: 'Student'
  }],
  // For preferred_teacher and avoid_teacher constraints
  student: {
    type: Schema.Types.ObjectId,
    ref: 'Student'
  },
  teacher: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  // For balanced_distribution constraints
  factor: {
    type: String,
    enum: ['gender', 'academic_level', 'behavioral_level', 'special_needs']
  },
  // Common fields
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String
  },
  source: {
    type: String,
    enum: ['admin', 'teacher', 'parent', 'system'],
    default: 'admin'
  },
  active: {
    type: Boolean,
    default: true
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

// Create compound index for efficient queries
ConstraintSchema.index({ academicYear: 1, grade: 1, type: 1 });
ConstraintSchema.index({ students: 1 });
ConstraintSchema.index({ student: 1 });
ConstraintSchema.index({ active: 1 });

module.exports = mongoose.model('Constraint', ConstraintSchema);
