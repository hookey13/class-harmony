const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OptimizationResultSchema = new Schema({
  academicYear: {
    type: String,
    required: true,
  },
  grade: {
    type: Number,
    required: true,
  },
  strategy: {
    type: String,
    enum: ['balanced', 'academic', 'behavioral', 'requests'],
    default: 'balanced'
  },
  numberOfClasses: {
    type: Number,
    required: true,
    min: 1
  },
  weights: {
    academicBalance: {
      type: Number,
      default: 0.2
    },
    behavioralBalance: {
      type: Number,
      default: 0.2
    },
    genderBalance: {
      type: Number, 
      default: 0.2
    },
    specialNeedsDistribution: {
      type: Number,
      default: 0.2
    },
    parentRequestsFulfilled: {
      type: Number,
      default: 0.2
    }
  },
  constraints: [{
    type: Schema.Types.ObjectId,
    ref: 'OptimizationConstraint'
  }],
  results: {
    classes: [{
      name: String,
      students: [{
        type: Schema.Types.ObjectId,
        ref: 'Student'
      }],
      teacher: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      balanceScores: {
        genderBalance: Number,
        academicBalance: Number,
        behavioralBalance: Number,
        specialNeedsDistribution: Number,
        overall: Number
      }
    }],
    parentRequestFulfillment: {
      total: Number,
      fulfilled: Number,
      fulfillmentRate: Number
    },
    optimizationScore: Number,
    iterations: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

// Create an index for faster lookups by academic year and grade
OptimizationResultSchema.index({ academicYear: 1, grade: 1, createdAt: -1 });

module.exports = mongoose.model('OptimizationResult', OptimizationResultSchema); 