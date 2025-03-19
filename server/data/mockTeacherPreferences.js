// Mock data for teacher preferences to use in development
module.exports = [
  {
    teacherId: '60d0fe4f5311236168a109ca',
    teacherName: 'Ms. Johnson',
    academicYear: '2023-2024',
    grade: 3,
    teachingStyle: 'collaborative',
    classroomEnvironment: 'structured',
    specialtyAreas: ['science', 'technology', 'math'],
    studentPreferences: {
      academicLevels: {
        advanced: 0.3,
        proficient: 0.4,
        developing: 0.2,
        needsSupport: 0.1
      },
      behavioralNeeds: {
        excellent: 0.3,
        good: 0.4,
        satisfactory: 0.2,
        needsImprovement: 0.1
      }
    },
    classComposition: {
      preferredSize: {
        min: 18,
        ideal: 22,
        max: 25
      },
      genderBalance: true
    },
    specialEducationPreferences: {
      experienceWith: ['adhd', 'dyslexia'],
      comfortable: true,
      maximumStudents: 4
    },
    additionalConsiderations: 'Prefers working with students who enjoy hands-on project-based learning'
  },
  {
    teacherId: '60d0fe4f5311236168a109cb',
    teacherName: 'Mr. Martinez',
    academicYear: '2023-2024',
    grade: 3,
    teachingStyle: 'traditional',
    classroomEnvironment: 'flexible',
    specialtyAreas: ['language arts', 'social studies', 'arts'],
    studentPreferences: {
      academicLevels: {
        advanced: 0.2,
        proficient: 0.3,
        developing: 0.3,
        needsSupport: 0.2
      },
      behavioralNeeds: {
        excellent: 0.2,
        good: 0.3,
        satisfactory: 0.3,
        needsImprovement: 0.2
      }
    },
    classComposition: {
      preferredSize: {
        min: 15,
        ideal: 20,
        max: 24
      },
      genderBalance: true
    },
    specialEducationPreferences: {
      experienceWith: ['autism', 'emotional behavioral'],
      comfortable: true,
      maximumStudents: 5
    },
    additionalConsiderations: 'Strong focus on creative writing and cultural education'
  },
  {
    teacherId: '60d0fe4f5311236168a109cc',
    teacherName: 'Mrs. Chen',
    academicYear: '2023-2024',
    grade: 3,
    teachingStyle: 'inquiry-based',
    classroomEnvironment: 'creative',
    specialtyAreas: ['math', 'science', 'critical thinking'],
    studentPreferences: {
      academicLevels: {
        advanced: 0.4,
        proficient: 0.3,
        developing: 0.2,
        needsSupport: 0.1
      },
      behavioralNeeds: {
        excellent: 0.4,
        good: 0.3,
        satisfactory: 0.2,
        needsImprovement: 0.1
      }
    },
    classComposition: {
      preferredSize: {
        min: 20,
        ideal: 24,
        max: 28
      },
      genderBalance: false
    },
    specialEducationPreferences: {
      experienceWith: ['gifted', 'adhd'],
      comfortable: true,
      maximumStudents: 3
    },
    additionalConsiderations: 'Emphasizes logical reasoning and problem-solving skills'
  },
  {
    teacherId: '60d0fe4f5311236168a109cd',
    teacherName: 'Mr. Williams',
    academicYear: '2023-2024',
    grade: 3,
    teachingStyle: 'differentiated',
    classroomEnvironment: 'nurturing',
    specialtyAreas: ['reading', 'writing', 'social emotional learning'],
    studentPreferences: {
      academicLevels: {
        advanced: 0.1,
        proficient: 0.2,
        developing: 0.4,
        needsSupport: 0.3
      },
      behavioralNeeds: {
        excellent: 0.1,
        good: 0.2,
        satisfactory: 0.4,
        needsImprovement: 0.3
      }
    },
    classComposition: {
      preferredSize: {
        min: 15,
        ideal: 18,
        max: 22
      },
      genderBalance: true
    },
    specialEducationPreferences: {
      experienceWith: ['dyslexia', 'processing disorders', 'emotional behavioral'],
      comfortable: true,
      maximumStudents: 8
    },
    additionalConsiderations: 'Specializes in supporting struggling learners and building confidence'
  },
  {
    teacherId: '60d0fe4f5311236168a109ce',
    teacherName: 'Ms. Garcia',
    academicYear: '2023-2024',
    grade: 3,
    teachingStyle: 'project-based',
    classroomEnvironment: 'energetic',
    specialtyAreas: ['steam', 'technology', 'innovation'],
    studentPreferences: {
      academicLevels: {
        advanced: 0.25,
        proficient: 0.25,
        developing: 0.25,
        needsSupport: 0.25
      },
      behavioralNeeds: {
        excellent: 0.25,
        good: 0.25,
        satisfactory: 0.25,
        needsImprovement: 0.25
      }
    },
    classComposition: {
      preferredSize: {
        min: 18,
        ideal: 22,
        max: 26
      },
      genderBalance: true
    },
    specialEducationPreferences: {
      experienceWith: ['adhd', 'gifted', 'autism'],
      comfortable: true,
      maximumStudents: 6
    },
    additionalConsiderations: 'Values diversity of thinking and approaches to problem-solving'
  }
]; 