const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  grade: {
    type: Number,
    required: true,
    min: 0,
    max: 12
  },
  parents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  currentClass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  },
  currentTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  academicProfile: {
    learningStyle: {
      type: String,
      enum: ['visual', 'auditory', 'kinesthetic', 'reading/writing'],
      required: true
    },
    academicLevel: {
      type: String,
      enum: ['advanced', 'proficient', 'developing', 'needs_support'],
      required: true
    },
    strengths: [String],
    challenges: [String],
    interests: [String]
  },
  behavioralProfile: {
    socialSkills: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'needs_improvement'],
      required: true
    },
    behavioralNotes: [String],
    specialConsiderations: [String]
  },
  specialEducation: {
    hasIEP: {
      type: Boolean,
      default: false
    },
    has504: {
      type: Boolean,
      default: false
    },
    accommodations: [String],
    supportServices: [String]
  },
  classHistory: [{
    academicYear: String,
    grade: Number,
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class'
    }
  }],
  relationships: {
    preferredPeers: [{
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
      },
      strength: {
        type: String,
        enum: ['strong', 'moderate', 'weak'],
        default: 'moderate'
      }
    }],
    separateFrom: [{
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
      },
      reason: String
    }]
  },
  attendance: {
    absences: {
      type: Number,
      default: 0
    },
    tardies: {
      type: Number,
      default: 0
    }
  },
  notes: [{
    content: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    date: {
      type: Date,
      default: Date.now
    },
    category: {
      type: String,
      enum: ['academic', 'behavioral', 'medical', 'general']
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Virtual for full name
studentSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for age
studentSchema.virtual('age').get(function() {
  return Math.floor((new Date() - this.dateOfBirth) / (365.25 * 24 * 60 * 60 * 1000));
});

// Method to get current academic performance
studentSchema.methods.getCurrentPerformance = async function() {
  // This could be expanded to include more detailed academic metrics
  return {
    academicLevel: this.academicProfile.academicLevel,
    attendance: this.attendance,
    behavioralStatus: this.behavioralProfile.socialSkills
  };
};

// Method to check peer compatibility
studentSchema.methods.isPeerCompatible = function(otherStudentId) {
  const separateFromIds = this.relationships.separateFrom.map(sep => sep.student.toString());
  return !separateFromIds.includes(otherStudentId.toString());
};

// Static method to find students by grade
studentSchema.statics.findByGrade = function(grade) {
  return this.find({ grade, isActive: true })
    .populate('currentTeacher', 'firstName lastName')
    .populate('currentClass', 'name');
};

// Static method to find students needing class placement
studentSchema.statics.findNeedingPlacement = function(grade) {
  return this.find({
    grade,
    isActive: true,
    currentClass: null
  });
};

// Create indexes
studentSchema.index({ grade: 1, isActive: 1 });
studentSchema.index({ 'parents': 1 });
studentSchema.index({ lastName: 1, firstName: 1 });

const Student = mongoose.model('Student', studentSchema);

module.exports = Student; 