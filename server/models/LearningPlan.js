/**
 * Learning Plan Model
 * Represents an individualized learning plan for a student
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define goal schema
const GoalSchema = new Schema({
  area: {
    type: String,
    enum: ['academic', 'behavioral', 'social', 'other'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  measurableOutcomes: {
    type: String,
    required: true
  },
  strategies: [String],
  timeline: {
    startDate: {
      type: Date,
      default: Date.now
    },
    targetDate: {
      type: Date,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'revised'],
    default: 'not_started'
  },
  progress: [{
    date: {
      type: Date,
      default: Date.now
    },
    note: String,
    statusUpdate: {
      type: String,
      enum: ['on_track', 'ahead', 'behind', 'needs_revision'],
      default: 'on_track'
    }
  }]
});

// Define accommodation schema
const AccommodationSchema = new Schema({
  type: {
    type: String,
    enum: ['instructional', 'environmental', 'assessment', 'behavioral', 'other'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'as_needed', 'specific_times', 'continuous'],
    default: 'as_needed'
  },
  notes: String
});

// Define learning plan schema
const LearningPlanSchema = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teacher: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  classId: {
    type: Schema.Types.ObjectId,
    ref: 'Class'
  },
  planType: {
    type: String,
    enum: ['standard', 'intervention', 'enrichment', 'iep_aligned', 'behavior_focused'],
    default: 'standard'
  },
  title: {
    type: String,
    required: true
  },
  overview: String,
  strengthsAndNeeds: {
    strengths: [String],
    needsSupport: [String]
  },
  goals: [GoalSchema],
  accommodations: [AccommodationSchema],
  parentInput: {
    requested: {
      type: Boolean,
      default: false
    },
    dateRequested: Date,
    received: {
      type: Boolean,
      default: false
    },
    dateReceived: Date,
    notes: String
  },
  reviews: [{
    date: {
      type: Date,
      default: Date.now
    },
    reviewer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    notes: String,
    adjustments: String
  }],
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'archived'],
    default: 'draft'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create index for efficient queries
LearningPlanSchema.index({ student: 1, academicYear: 1 });
LearningPlanSchema.index({ teacher: 1 });
LearningPlanSchema.index({ status: 1 });

module.exports = mongoose.model('LearningPlan', LearningPlanSchema);
