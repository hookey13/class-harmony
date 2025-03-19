const mongoose = require('mongoose');

const parentPreferenceSchema = new mongoose.Schema({
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  learningEnvironment: {
    preferredStyle: {
      type: String,
      enum: ['visual', 'auditory', 'kinesthetic', 'reading/writing'],
      required: true
    },
    classroomStructure: {
      type: String,
      enum: ['highly_structured', 'moderately_structured', 'flexible'],
      required: true
    },
    groupWorkPreference: {
      type: String,
      enum: ['individual', 'small_groups', 'mixed'],
      required: true
    },
    noiseLevel: {
      type: String,
      enum: ['low', 'moderate', 'high'],
      required: true
    }
  },
  teacherPreferences: {
    preferredTeachers: [{
      teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      reason: {
        type: String,
        required: true
      },
      priority: {
        type: Number,
        min: 1,
        max: 3,
        default: 2
      }
    }],
    teachingStylePreference: {
      type: String,
      enum: ['structured', 'creative', 'collaborative', 'independent'],
      required: true
    }
  },
  peerRelationships: {
    preferredPeers: [{
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
      },
      reason: {
        type: String,
        required: true
      },
      priority: {
        type: Number,
        min: 1,
        max: 3,
        default: 2
      }
    }],
    separateFrom: [{
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
      },
      reason: {
        type: String,
        required: true
      },
      priority: {
        type: Number,
        min: 1,
        max: 3,
        default: 2
      }
    }]
  },
  academicFocus: {
    subjects: [{
      name: {
        type: String,
        enum: ['math', 'reading', 'writing', 'science', 'social_studies', 'art', 'music', 'physical_education'],
        required: true
      },
      importance: {
        type: Number,
        min: 1,
        max: 5,
        required: true
      }
    }],
    academicSupport: {
      type: String,
      enum: ['advanced', 'grade_level', 'additional_support'],
      required: true
    }
  },
  specialConsiderations: {
    medicalNeeds: [{
      condition: String,
      requirements: String,
      documentationProvided: Boolean
    }],
    accommodations: [{
      type: String,
      description: String,
      required: Boolean
    }],
    socialEmotional: {
      concerns: [String],
      supportNeeded: String
    }
  },
  schedule: {
    beforeSchool: {
      type: Boolean,
      default: false
    },
    afterSchool: {
      type: Boolean,
      default: false
    },
    specialScheduling: String
  },
  previousExperiences: {
    lastYearExperience: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comments: String
    },
    successfulStrategies: [String],
    challengingAreas: [String]
  },
  additionalComments: String,
  submissionStatus: {
    type: String,
    enum: ['draft', 'submitted', 'reviewed', 'approved', 'denied'],
    default: 'draft'
  },
  reviewNotes: [{
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String,
    date: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'denied', 'needs_clarification']
    }
  }],
  submissionDate: Date,
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  priority: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  }
}, {
  timestamps: true
});

// Virtual to check if preferences are complete
parentPreferenceSchema.virtual('isComplete').get(function() {
  return this.submissionStatus !== 'draft';
});

// Method to validate peer preferences
parentPreferenceSchema.methods.validatePeerPreferences = function() {
  const preferredPeerIds = new Set(this.peerRelationships.preferredPeers.map(p => p.student.toString()));
  const separateFromIds = new Set(this.peerRelationships.separateFrom.map(p => p.student.toString()));
  
  // Check for conflicts between preferred and separate lists
  const conflicts = [...preferredPeerIds].filter(id => separateFromIds.has(id));
  
  return {
    hasConflicts: conflicts.length > 0,
    conflictingIds: conflicts
  };
};

// Method to check if preferences can be accommodated
parentPreferenceSchema.methods.canBeAccommodated = async function() {
  const constraints = [];
  
  // Check teacher availability
  if (this.teacherPreferences.preferredTeachers.length > 0) {
    const availableTeachers = await mongoose.model('User').countDocuments({
      _id: { $in: this.teacherPreferences.preferredTeachers.map(t => t.teacher) },
      isActive: true,
      role: 'teacher'
    });
    if (availableTeachers === 0) {
      constraints.push('No preferred teachers are available');
    }
  }
  
  // Check peer availability
  if (this.peerRelationships.preferredPeers.length > 0) {
    const availablePeers = await mongoose.model('Student').countDocuments({
      _id: { $in: this.peerRelationships.preferredPeers.map(p => p.student) },
      isActive: true,
      grade: this.student.grade
    });
    if (availablePeers === 0) {
      constraints.push('No preferred peers are in the same grade');
    }
  }
  
  return {
    canBeAccommodated: constraints.length === 0,
    constraints
  };
};

// Static method to find preferences by academic year
parentPreferenceSchema.statics.findByAcademicYear = function(academicYear) {
  return this.find({
    academicYear,
    submissionStatus: { $in: ['submitted', 'approved'] }
  })
    .populate('parent', 'firstName lastName')
    .populate('student', 'firstName lastName grade')
    .populate('teacherPreferences.preferredTeachers.teacher', 'firstName lastName');
};

// Static method to find conflicting preferences
parentPreferenceSchema.statics.findConflictingPreferences = async function(studentId) {
  const preferences = await this.find({
    $or: [
      { 'peerRelationships.preferredPeers.student': studentId },
      { 'peerRelationships.separateFrom.student': studentId }
    ]
  }).populate('student', 'firstName lastName');
  
  return preferences.map(pref => ({
    preference: pref,
    conflictType: pref.peerRelationships.preferredPeers.some(p => p.student.toString() === studentId)
      ? 'preferred'
      : 'separate'
  }));
};

// Create indexes
parentPreferenceSchema.index({ parent: 1, student: 1, academicYear: 1 }, { unique: true });
parentPreferenceSchema.index({ submissionStatus: 1, academicYear: 1 });
parentPreferenceSchema.index({ 'peerRelationships.preferredPeers.student': 1 });
parentPreferenceSchema.index({ 'peerRelationships.separateFrom.student': 1 });

const ParentPreference = mongoose.model('ParentPreference', parentPreferenceSchema);

module.exports = ParentPreference; 