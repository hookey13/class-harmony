const mongoose = require('mongoose');

const teacherPreferenceSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  grade: {
    type: Number,
    required: true,
    min: 0,
    max: 12
  },
  teachingStyle: {
    primary: {
      type: String,
      enum: ['visual', 'auditory', 'kinesthetic', 'reading/writing'],
      required: true
    },
    secondary: {
      type: String,
      enum: ['visual', 'auditory', 'kinesthetic', 'reading/writing']
    }
  },
  classroomEnvironment: {
    noiseLevel: {
      type: String,
      enum: ['low', 'moderate', 'high'],
      required: true
    },
    structureLevel: {
      type: String,
      enum: ['highly_structured', 'moderately_structured', 'flexible'],
      required: true
    },
    groupWorkFrequency: {
      type: String,
      enum: ['rare', 'occasional', 'frequent'],
      required: true
    }
  },
  specialtyAreas: [{
    subject: String,
    proficiencyLevel: {
      type: String,
      enum: ['expert', 'proficient', 'familiar'],
      default: 'proficient'
    }
  }],
  studentPreferences: {
    academicDistribution: {
      advanced: {
        preferred: {
          type: Number,
          min: 0,
          max: 100
        },
        maximum: {
          type: Number,
          min: 0,
          max: 100
        }
      },
      proficient: {
        preferred: {
          type: Number,
          min: 0,
          max: 100
        },
        maximum: {
          type: Number,
          min: 0,
          max: 100
        }
      },
      developing: {
        preferred: {
          type: Number,
          min: 0,
          max: 100
        },
        maximum: {
          type: Number,
          min: 0,
          max: 100
        }
      },
      needs_support: {
        preferred: {
          type: Number,
          min: 0,
          max: 100
        },
        maximum: {
          type: Number,
          min: 0,
          max: 100
        }
      }
    },
    behavioralDistribution: {
      excellent: {
        preferred: {
          type: Number,
          min: 0,
          max: 100
        },
        maximum: {
          type: Number,
          min: 0,
          max: 100
        }
      },
      good: {
        preferred: {
          type: Number,
          min: 0,
          max: 100
        },
        maximum: {
          type: Number,
          min: 0,
          max: 100
        }
      },
      fair: {
        preferred: {
          type: Number,
          min: 0,
          max: 100
        },
        maximum: {
          type: Number,
          min: 0,
          max: 100
        }
      },
      needs_improvement: {
        preferred: {
          type: Number,
          min: 0,
          max: 100
        },
        maximum: {
          type: Number,
          min: 0,
          max: 100
        }
      }
    }
  },
  specialEducationPreferences: {
    maxIEPStudents: {
      type: Number,
      min: 0
    },
    max504Students: {
      type: Number,
      min: 0
    },
    specializedSupports: [{
      type: String,
      enum: ['reading', 'math', 'behavioral', 'emotional', 'physical', 'other']
    }]
  },
  classComposition: {
    preferredClassSize: {
      type: Number,
      required: true
    },
    minimumClassSize: {
      type: Number,
      required: true
    },
    maximumClassSize: {
      type: Number,
      required: true
    },
    genderBalance: {
      importance: {
        type: Number,
        min: 1,
        max: 5,
        default: 3
      },
      preferredRatio: {
        male: {
          type: Number,
          min: 0,
          max: 100
        },
        female: {
          type: Number,
          min: 0,
          max: 100
        },
        other: {
          type: Number,
          min: 0,
          max: 100
        }
      }
    }
  },
  additionalConsiderations: [{
    category: {
      type: String,
      enum: ['academic', 'behavioral', 'social', 'other']
    },
    description: String,
    importance: {
      type: Number,
      min: 1,
      max: 5
    }
  }],
  status: {
    type: String,
    enum: ['draft', 'submitted', 'approved'],
    default: 'draft'
  },
  submissionDate: Date,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalDate: Date,
  notes: [{
    content: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Virtual to check if preferences are complete
teacherPreferenceSchema.virtual('isComplete').get(function() {
  return this.status !== 'draft';
});

// Method to validate distribution percentages
teacherPreferenceSchema.methods.validateDistributions = function() {
  const validateGroup = (group) => {
    const total = Object.values(group).reduce((sum, val) => sum + val.preferred, 0);
    return Math.abs(total - 100) <= 0.01; // Allow for small floating-point differences
  };

  return {
    academicValid: validateGroup(this.studentPreferences.academicDistribution),
    behavioralValid: validateGroup(this.studentPreferences.behavioralDistribution)
  };
};

// Method to check compatibility with a student
teacherPreferenceSchema.methods.isCompatibleWithStudent = function(student) {
  // Check learning style compatibility
  const learningStyleMatch = 
    this.teachingStyle.primary === student.academicProfile.learningStyle ||
    this.teachingStyle.secondary === student.academicProfile.learningStyle;

  // Check special education capacity
  const specialEdCompatible = 
    (!student.specialEducation.hasIEP || this.specialEducationPreferences.maxIEPStudents > 0) &&
    (!student.specialEducation.has504 || this.specialEducationPreferences.max504Students > 0);

  return learningStyleMatch && specialEdCompatible;
};

// Static method to find active preferences by academic year
teacherPreferenceSchema.statics.findActiveByYear = function(academicYear) {
  return this.find({
    academicYear,
    status: 'approved'
  }).populate('teacher', 'firstName lastName');
};

// Create indexes
teacherPreferenceSchema.index({ teacher: 1, academicYear: 1 }, { unique: true });
teacherPreferenceSchema.index({ status: 1, academicYear: 1 });

const TeacherPreference = mongoose.model('TeacherPreference', teacherPreferenceSchema);

module.exports = TeacherPreference; 