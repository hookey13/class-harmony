const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const Student = require('../models/Student');
const User = require('../models/User');
const Class = require('../models/Class');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/class_harmony')
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Define grade levels for our school
const gradeNumbers = [0, 1, 2, 3, 4, 5, 6]; // Prep is 0, 1st grade is 1, etc.
const gradeNames = ['Prep', '1', '2', '3', '4', '5', '6'];

// Configuration
const STUDENTS_PER_GRADE = {
  0: 60, // Prep
  1: 65, // Grade 1
  2: 65, // Grade 2
  3: 65, // Grade 3
  4: 65, // Grade 4
  5: 65, // Grade 5
  6: 65, // Grade 6
};

// Composite class configuration
const compositeClasses = [
  { name: '1-2 Composite', grades: [1, 2] },
  { name: '3-4 Composite', grades: [3, 4] },
  { name: '5-6 Composite', grades: [5, 6] },
];

// Learning styles, academic levels, social skills, etc.
const learningStyles = ['visual', 'auditory', 'kinesthetic', 'reading/writing'];
const academicLevels = ['advanced', 'proficient', 'developing', 'needs_support'];
const socialSkills = ['excellent', 'good', 'fair', 'needs_improvement'];
const strengths = [
  'Mathematics', 'Reading', 'Writing', 'Science', 'Art', 'Music', 
  'Physical Education', 'Critical Thinking', 'Communication', 'Creativity'
];
const challenges = [
  'Reading Comprehension', 'Mathematical Concepts', 'Writing Expression', 
  'Focus/Attention', 'Organization', 'Time Management', 'Test Anxiety',
  'Peer Relationships', 'Following Directions', 'Group Work'
];
const interests = [
  'Sports', 'Arts & Crafts', 'Reading', 'Science Experiments', 'Music',
  'Technology', 'Nature', 'Building/Construction', 'Animals', 'Drawing/Painting',
  'Dance', 'Cooking', 'Dinosaurs', 'Space', 'Video Games'
];
const specialConsiderations = [
  'Needs frequent breaks', 'Prefers quiet environment', 'Benefits from visual aids',
  'Needs extra time for tasks', 'Responds well to positive reinforcement',
  'Thrives with hands-on activities', 'Prefers structured routines'
];

// Current academic year
const CURRENT_YEAR = new Date().getFullYear().toString();

// Create a principal user
async function createPrincipal() {
  try {
    await User.deleteMany({ role: 'admin' });
    
    const principal = new User({
      email: 'principal@example.com',
      password: 'password123', // Will be hashed by pre-save hook
      firstName: 'School',
      lastName: 'Principal',
      role: 'admin',
      phoneNumber: '(555) 123-4567', // Fixed phone number format
      isActive: true
    });
    
    await principal.save();
    console.log('Principal user created:', principal.email);
    return principal;
  } catch (error) {
    console.error('Error creating principal:', error);
    throw error;
  }
}

// Create teachers
async function createTeachers() {
  try {
    await User.deleteMany({ role: 'teacher' });
    
    const teachers = [];
    // Create 15 teachers
    for (let i = 0; i < 15; i++) {
      const gender = Math.random() > 0.7 ? 'male' : 'female';
      const firstName = faker.person.firstName(gender);
      const lastName = faker.person.lastName();
      
      const teacher = new User({
        firstName,
        lastName,
        email: faker.internet.email({ firstName, lastName, provider: 'example.com' }).toLowerCase(),
        password: 'teacher123', // Will be hashed by pre-save hook
        role: 'teacher',
        phoneNumber: `(${faker.string.numeric(3)}) ${faker.string.numeric(3)}-${faker.string.numeric(4)}`, // Fixed phone format
        isActive: true
      });
      
      await teacher.save();
      teachers.push(teacher);
    }
    
    console.log(`${teachers.length} teachers created`);
    return teachers;
  } catch (error) {
    console.error('Error creating teachers:', error);
    throw error;
  }
}

// Create parents
async function createParents() {
  try {
    await User.deleteMany({ role: 'parent' });
    
    const parents = [];
    // Create 300 parents (assuming some students share parents)
    for (let i = 0; i < 300; i++) {
      const gender = Math.random() > 0.5 ? 'male' : 'female';
      const firstName = faker.person.firstName(gender);
      const lastName = faker.person.lastName();
      
      const parent = new User({
        firstName,
        lastName,
        email: faker.internet.email({ firstName, lastName, provider: 'example.com' }).toLowerCase(),
        password: 'parent123', // Will be hashed by pre-save hook
        role: 'parent',
        phoneNumber: `(${faker.string.numeric(3)}) ${faker.string.numeric(3)}-${faker.string.numeric(4)}`, // Fixed phone format
        isActive: true
      });
      
      await parent.save();
      parents.push(parent);
    }
    
    console.log(`${parents.length} parents created`);
    return parents;
  } catch (error) {
    console.error('Error creating parents:', error);
    throw error;
  }
}

// Create students for each grade
async function createStudents(parents) {
  try {
    await Student.deleteMany({});
    
    const students = [];
    const studentsByGrade = {};
    
    // Group parents into family units (1-3 children per family)
    const familyUnits = [];
    let parentIndex = 0;
    
    while (parentIndex < parents.length) {
      // Randomly decide if it's a two-parent family
      const isTwoParentFamily = Math.random() > 0.3;
      
      const familyParents = isTwoParentFamily && parentIndex + 1 < parents.length
        ? [parents[parentIndex]._id, parents[parentIndex + 1]._id]
        : [parents[parentIndex]._id];
      
      familyUnits.push({
        parents: familyParents,
        childCount: Math.floor(Math.random() * 3) + 1 // 1-3 children
      });
      
      parentIndex += isTwoParentFamily ? 2 : 1;
    }
    
    // For each grade level
    for (const grade of gradeNumbers) {
      const gradeStudentCount = STUDENTS_PER_GRADE[grade];
      studentsByGrade[grade] = [];
      
      let studentsCreated = 0;
      let familyIndex = 0;
      
      // Create students for this grade
      while (studentsCreated < gradeStudentCount && familyIndex < familyUnits.length) {
        const family = familyUnits[familyIndex];
        const childrenForThisGrade = Math.min(
          family.childCount,
          gradeStudentCount - studentsCreated
        );
        
        for (let i = 0; i < childrenForThisGrade; i++) {
          const gender = Math.random() > 0.5 ? 'male' : 'female';
          const firstName = faker.person.firstName(gender);
          const lastName = faker.person.lastName();
          
          // Calculate appropriate birth year based on grade
          const ageBase = 5 + grade; // Prep (grade 0) = 5 years old
          const birthYear = new Date().getFullYear() - ageBase;
          const birthDate = faker.date.between({ 
            from: new Date(birthYear, 0, 1), 
            to: new Date(birthYear, 11, 31)
          });
          
          // Randomly assign attributes
          const student = new Student({
            firstName,
            lastName,
            dateOfBirth: birthDate,
            grade,
            parents: family.parents,
            academicProfile: {
              learningStyle: faker.helpers.arrayElement(learningStyles),
              academicLevel: faker.helpers.arrayElement(academicLevels),
              strengths: faker.helpers.arrayElements(strengths, Math.floor(Math.random() * 3) + 1),
              challenges: faker.helpers.arrayElements(challenges, Math.floor(Math.random() * 2) + 1),
              interests: faker.helpers.arrayElements(interests, Math.floor(Math.random() * 4) + 1)
            },
            behavioralProfile: {
              socialSkills: faker.helpers.arrayElement(socialSkills),
              behavioralNotes: Math.random() > 0.7 ? [faker.lorem.sentence()] : [],
              specialConsiderations: Math.random() > 0.8 ? 
                faker.helpers.arrayElements(specialConsiderations, 1) : []
            },
            specialEducation: {
              hasIEP: Math.random() < 0.1, // 10% chance of having IEP
              has504: Math.random() < 0.05, // 5% chance of having 504 plan
              accommodations: [],
              supportServices: []
            },
            attendance: {
              absences: Math.floor(Math.random() * 8),
              tardies: Math.floor(Math.random() * 5)
            },
            isActive: true
          });
          
          // Fill in accommodations and support services if needed
          if (student.specialEducation.hasIEP || student.specialEducation.has504) {
            student.specialEducation.accommodations = [
              'Extended time on assignments',
              'Preferential seating',
              'Frequent breaks'
            ];
            student.specialEducation.supportServices = [
              'Resource room',
              'Speech therapy'
            ];
          }
          
          await student.save();
          students.push(student);
          studentsByGrade[grade].push(student);
          studentsCreated++;
        }
        
        familyIndex++;
      }
      
      console.log(`${studentsCreated} students created for grade ${gradeNames[grade]}`);
    }
    
    // Add peer relationships (after all students are created)
    for (const grade in studentsByGrade) {
      const gradeStudents = studentsByGrade[grade];
      
      for (const student of gradeStudents) {
        // Find students in the same grade for potential connections
        const otherStudents = gradeStudents.filter(s => 
          s._id.toString() !== student._id.toString()
        );
        
        if (otherStudents.length > 0) {
          // Add 1-3 preferred peers
          const peerCount = Math.floor(Math.random() * 3) + 1;
          const peers = faker.helpers.arrayElements(
            otherStudents,
            Math.min(peerCount, otherStudents.length)
          );
          
          student.relationships = {
            preferredPeers: peers.map(p => ({
              student: p._id,
              strength: faker.helpers.arrayElement(['strong', 'moderate', 'weak'])
            })),
            separateFrom: []
          };
          
          // Add 0-1 students to separate from
          if (Math.random() < 0.3) {
            const nonPeers = otherStudents.filter(
              s => !peers.find(p => p._id.toString() === s._id.toString())
            );
            
            if (nonPeers.length > 0) {
              const conflictStudent = faker.helpers.arrayElement(nonPeers);
              student.relationships.separateFrom = [{
                student: conflictStudent._id,
                reason: faker.helpers.arrayElement([
                  'Conflict history', 
                  'Negative influence', 
                  'Parental request',
                  'Distraction to each other'
                ])
              }];
            }
          }
          
          await student.save();
        }
      }
    }
    
    console.log(`Updated student relationships`);
    return { students, studentsByGrade };
  } catch (error) {
    console.error('Error creating students:', error);
    throw error;
  }
}

// Create class groups
async function createClasses(teachers, studentsByGrade) {
  try {
    await Class.deleteMany({});
    
    const classes = [];
    const teacherPool = [...teachers]; // Copy to work with
    
    // First, create Prep classes (non-composite)
    const prepStudents = studentsByGrade[0]; // Grade 0 is Prep
    
    // Distribute Prep students evenly among 3 classes
    const prepClassSize = Math.ceil(prepStudents.length / 3);
    for (let i = 0; i < 3; i++) {
      const teacher = teacherPool.pop(); // Assign a teacher
      const classStudents = prepStudents.slice(i * prepClassSize, (i + 1) * prepClassSize);
      
      const classGroup = new Class({
        name: `Prep ${String.fromCharCode(65 + i)}`, // Prep A, Prep B, Prep C
        academicYear: CURRENT_YEAR,
        grade: 0, // Prep
        teacher: teacher._id,
        students: classStudents.map(s => s._id),
        capacity: {
          min: 15,
          max: 25,
          optimal: 20
        },
        status: 'active'
      });
      
      // Update class profile
      updateClassProfile(classGroup, classStudents);
      
      await classGroup.save();
      classes.push(classGroup);
      
      // Update student records with current class and teacher
      for (const student of classStudents) {
        student.currentClass = classGroup._id;
        student.currentTeacher = teacher._id;
        await student.save();
      }
    }
    
    // Create single grade classes for grades 2, 4, 6
    const singleGradeClasses = [
      { grade: 2, name: '2A' },
      { grade: 4, name: '4A' },
      { grade: 6, name: '6A' }
    ];
    
    for (const gradeClass of singleGradeClasses) {
      const teacher = teacherPool.pop(); // Assign a teacher
      const gradeStudents = studentsByGrade[gradeClass.grade];
      const classSize = Math.ceil(gradeStudents.length / 2); // Half for single, half for composite
      
      // Take first set of students for single grade class
      const classStudents = gradeStudents.slice(0, classSize);
      
      const classGroup = new Class({
        name: gradeClass.name,
        academicYear: CURRENT_YEAR,
        grade: gradeClass.grade,
        teacher: teacher._id,
        students: classStudents.map(s => s._id),
        capacity: {
          min: 15,
          max: 28,
          optimal: 23
        },
        status: 'active'
      });
      
      // Update class profile
      updateClassProfile(classGroup, classStudents);
      
      await classGroup.save();
      classes.push(classGroup);
      
      // Update student records
      for (const student of classStudents) {
        student.currentClass = classGroup._id;
        student.currentTeacher = teacher._id;
        await student.save();
      }
    }
    
    // Create composite classes
    for (const composite of compositeClasses) {
      const teacher = teacherPool.pop(); // Assign a teacher
      const gradeA = composite.grades[0];
      const gradeB = composite.grades[1];
      
      // Get remaining students from both grades (those not yet assigned to classes)
      const studentsGradeA = studentsByGrade[gradeA].filter(s => !s.currentClass);
      const studentsGradeB = studentsByGrade[gradeB].filter(s => !s.currentClass);
      
      // Balance the classes - approximately equal numbers from each grade
      const totalStudents = [...studentsGradeA, ...studentsGradeB];
      
      const classGroup = new Class({
        name: composite.name,
        academicYear: CURRENT_YEAR,
        grade: gradeB, // Use the higher grade for reporting
        teacher: teacher._id,
        students: totalStudents.map(s => s._id),
        capacity: {
          min: 15,
          max: 28,
          optimal: 24
        },
        status: 'active'
      });
      
      // Update class profile
      updateClassProfile(classGroup, totalStudents);
      
      await classGroup.save();
      classes.push(classGroup);
      
      // Update student records
      for (const student of totalStudents) {
        student.currentClass = classGroup._id;
        student.currentTeacher = teacher._id;
        await student.save();
      }
    }
    
    console.log(`${classes.length} classes created`);
    return classes;
  } catch (error) {
    console.error('Error creating classes:', error);
    throw error;
  }
}

// Helper function to update class profile
function updateClassProfile(classGroup, students) {
  // Reset distributions
  classGroup.classProfile = {
    academicDistribution: {
      advanced: 0,
      proficient: 0,
      developing: 0,
      needs_support: 0
    },
    behavioralDistribution: {
      excellent: 0,
      good: 0,
      fair: 0,
      needs_improvement: 0
    },
    specialEducation: {
      iepCount: 0,
      plan504Count: 0
    },
    genderDistribution: {
      male: 0,
      female: 0,
      other: 0
    }
  };
  
  // Update distributions based on students
  students.forEach(student => {
    // Academic distribution
    classGroup.classProfile.academicDistribution[student.academicProfile.academicLevel]++;
    
    // Behavioral distribution
    classGroup.classProfile.behavioralDistribution[student.behavioralProfile.socialSkills]++;
    
    // Special education counts
    if (student.specialEducation.hasIEP) classGroup.classProfile.specialEducation.iepCount++;
    if (student.specialEducation.has504) classGroup.classProfile.specialEducation.plan504Count++;
    
    // Gender distribution
    const gender = student.gender?.toLowerCase() || 
                  (Math.random() > 0.5 ? 'male' : 'female');
    classGroup.classProfile.genderDistribution[gender]++;
  });
}

// Main function to seed all data
async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    
    // Create principal
    await createPrincipal();
    
    // Create teachers
    const teachers = await createTeachers();
    
    // Create parents
    const parents = await createParents();
    
    // Create students
    const { studentsByGrade } = await createStudents(parents);
    
    // Create classes
    await createClasses(teachers, studentsByGrade);
    
    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Database seeding failed:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedDatabase(); 