const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
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
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  capacity: {
    min: {
      type: Number,
      required: true,
      default: 15
    },
    max: {
      type: Number,
      required: true,
      default: 30
    },
    optimal: {
      type: Number,
      required: true,
      default: 25
    }
  },
  classProfile: {
    academicDistribution: {
      advanced: {
        type: Number,
        default: 0
      },
      proficient: {
        type: Number,
        default: 0
      },
      developing: {
        type: Number,
        default: 0
      },
      needs_support: {
        type: Number,
        default: 0
      }
    },
    behavioralDistribution: {
      excellent: {
        type: Number,
        default: 0
      },
      good: {
        type: Number,
        default: 0
      },
      fair: {
        type: Number,
        default: 0
      },
      needs_improvement: {
        type: Number,
        default: 0
      }
    },
    specialEducation: {
      iepCount: {
        type: Number,
        default: 0
      },
      plan504Count: {
        type: Number,
        default: 0
      }
    },
    genderDistribution: {
      male: {
        type: Number,
        default: 0
      },
      female: {
        type: Number,
        default: 0
      },
      other: {
        type: Number,
        default: 0
      }
    }
  },
  schedule: {
    startTime: String,
    endTime: String,
    days: [String]
  },
  specialPrograms: [{
    name: String,
    description: String
  }],
  optimizationPreferences: {
    academicBalance: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    },
    behavioralBalance: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    },
    genderBalance: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    },
    specialEducationBalance: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    }
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'archived'],
    default: 'draft'
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
    }
  }]
}, {
  timestamps: true
});

// Virtual for current class size
classSchema.virtual('currentSize').get(function() {
  return this.students.length;
});

// Virtual for checking if class is at capacity
classSchema.virtual('isAtCapacity').get(function() {
  return this.students.length >= this.capacity.max;
});

// Method to check if student can be added
classSchema.methods.canAddStudent = function() {
  return this.students.length < this.capacity.max;
};

// Method to calculate class balance metrics
classSchema.methods.calculateBalanceMetrics = async function() {
  await this.populate('students');
  
  const totalStudents = this.students.length;
  if (totalStudents === 0) return null;

  return {
    academicBalance: this.classProfile.academicDistribution,
    behavioralBalance: this.classProfile.behavioralDistribution,
    specialEducationRatio: (this.classProfile.specialEducation.iepCount + 
      this.classProfile.specialEducation.plan504Count) / totalStudents,
    genderRatio: {
      male: this.classProfile.genderDistribution.male / totalStudents,
      female: this.classProfile.genderDistribution.female / totalStudents,
      other: this.classProfile.genderDistribution.other / totalStudents
    }
  };
};

// Method to update class profile based on current students
classSchema.methods.updateClassProfile = async function() {
  await this.populate('students');
  
  // Reset distributions
  this.classProfile.academicDistribution = {
    advanced: 0,
    proficient: 0,
    developing: 0,
    needs_support: 0
  };
  
  this.classProfile.behavioralDistribution = {
    excellent: 0,
    good: 0,
    fair: 0,
    needs_improvement: 0
  };
  
  this.classProfile.specialEducation = {
    iepCount: 0,
    plan504Count: 0
  };
  
  this.classProfile.genderDistribution = {
    male: 0,
    female: 0,
    other: 0
  };
  
  // Update distributions based on current students
  this.students.forEach(student => {
    // Academic distribution
    this.classProfile.academicDistribution[student.academicProfile.academicLevel]++;
    
    // Behavioral distribution
    this.classProfile.behavioralDistribution[student.behavioralProfile.socialSkills]++;
    
    // Special education counts
    if (student.specialEducation.hasIEP) this.classProfile.specialEducation.iepCount++;
    if (student.specialEducation.has504) this.classProfile.specialEducation.plan504Count++;
    
    // Gender distribution (assuming gender field exists in student model)
    if (student.gender) {
      this.classProfile.genderDistribution[student.gender.toLowerCase()]++;
    }
  });
  
  await this.save();
};

// Static method to find classes by grade and year
classSchema.statics.findByGradeAndYear = function(grade, academicYear) {
  return this.find({ grade, academicYear, status: 'active' })
    .populate('teacher', 'firstName lastName')
    .populate('students', 'firstName lastName');
};

// Create indexes
classSchema.index({ grade: 1, academicYear: 1, status: 1 });
classSchema.index({ teacher: 1 });

const Class = mongoose.model('Class', classSchema);

module.exports = Class; 