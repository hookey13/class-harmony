/**
 * Mock Data Generator for Class Harmony
 * 
 * This file provides a comprehensive set of mock data for the application,
 * including 600 students, teachers, and their preferences.
 */

import { v4 as uuidv4 } from 'uuid';

// Helper function to generate a random integer between min and max (inclusive)
const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Helper function to generate a random item from an array
const getRandomItem = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

// Helper function to generate a random boolean with a given probability
const getRandomBoolean = (probability = 0.5) => {
  return Math.random() < probability;
};

// Helper to generate a random date in the past year
const getRandomPastDate = (maxDaysAgo = 365) => {
  const today = new Date();
  const daysAgo = getRandomInt(1, maxDaysAgo);
  const pastDate = new Date(today);
  pastDate.setDate(today.getDate() - daysAgo);
  return pastDate.toISOString();
};

// Mock First Names
const firstNames = [
  'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles',
  'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua',
  'Kenneth', 'Kevin', 'Brian', 'George', 'Timothy', 'Ronald', 'Edward', 'Jason', 'Jeffrey', 'Ryan',
  'Jacob', 'Gary', 'Nicholas', 'Eric', 'Jonathan', 'Stephen', 'Larry', 'Justin', 'Scott', 'Brandon',
  'Benjamin', 'Samuel', 'Gregory', 'Alexander', 'Frank', 'Patrick', 'Raymond', 'Jack', 'Dennis', 'Jerry',
  'Tyler', 'Aaron', 'Jose', 'Adam', 'Nathan', 'Henry', 'Douglas', 'Zachary', 'Peter', 'Kyle',
  'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen',
  'Lisa', 'Nancy', 'Betty', 'Margaret', 'Sandra', 'Ashley', 'Kimberly', 'Emily', 'Donna', 'Michelle',
  'Carol', 'Amanda', 'Dorothy', 'Melissa', 'Deborah', 'Stephanie', 'Rebecca', 'Sharon', 'Laura', 'Cynthia',
  'Kathleen', 'Amy', 'Angela', 'Shirley', 'Anna', 'Brenda', 'Pamela', 'Emma', 'Nicole', 'Helen',
  'Samantha', 'Katherine', 'Christine', 'Debra', 'Rachel', 'Carolyn', 'Janet', 'Catherine', 'Maria', 'Heather',
  'Diane', 'Ruth', 'Julie', 'Olivia', 'Joyce', 'Virginia', 'Victoria', 'Kelly', 'Lauren', 'Christina',
  'Joan', 'Evelyn', 'Judith', 'Megan', 'Andrea', 'Cheryl', 'Hannah', 'Jacqueline', 'Martha', 'Gloria',
  'Teresa', 'Ann', 'Sara', 'Madison', 'Frances', 'Kathryn', 'Janice', 'Jean', 'Abigail', 'Alice',
  'Julia', 'Judy', 'Sophia', 'Grace', 'Denise', 'Amber', 'Doris', 'Marilyn', 'Danielle', 'Beverly',
  'Isabella', 'Theresa', 'Diana', 'Natalie', 'Brittany', 'Charlotte', 'Marie', 'Kayla', 'Alexis', 'Lori'
];

// Mock Last Names
const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor',
  'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson',
  'Clark', 'Rodriguez', 'Lewis', 'Lee', 'Walker', 'Hall', 'Allen', 'Young', 'Hernandez', 'King',
  'Wright', 'Lopez', 'Hill', 'Scott', 'Green', 'Adams', 'Baker', 'Gonzalez', 'Nelson', 'Carter',
  'Mitchell', 'Perez', 'Roberts', 'Turner', 'Phillips', 'Campbell', 'Parker', 'Evans', 'Edwards', 'Collins',
  'Stewart', 'Sanchez', 'Morris', 'Rogers', 'Reed', 'Cook', 'Morgan', 'Bell', 'Murphy', 'Bailey',
  'Rivera', 'Cooper', 'Richardson', 'Cox', 'Howard', 'Ward', 'Torres', 'Peterson', 'Gray', 'Ramirez',
  'James', 'Watson', 'Brooks', 'Kelly', 'Sanders', 'Price', 'Bennett', 'Wood', 'Barnes', 'Ross',
  'Henderson', 'Coleman', 'Jenkins', 'Perry', 'Powell', 'Long', 'Patterson', 'Hughes', 'Flores', 'Washington',
  'Butler', 'Simmons', 'Foster', 'Gonzales', 'Bryant', 'Alexander', 'Russell', 'Griffin', 'Diaz', 'Hayes'
];

// Generate mock schools
const generateSchools = () => {
  return [
    {
      id: 'school1',
      name: 'Washington Elementary School',
      address: '123 Education Lane',
      city: 'Springfield',
      state: 'IL',
      zipCode: '12345',
      phone: '(555) 123-4567',
      website: 'www.springfieldschools.edu',
      principalName: 'Dr. Sarah Johnson',
      principalEmail: 'sjohnson@springfieldschools.edu',
      active: true,
      subscription: 'pro',
      subscriptionStart: '2023-01-01',
      subscriptionEnd: '2024-01-01',
      maxStudents: 1000,
      schoolYear: '2023-2024',
      enrollmentCount: 600,
      classroomCount: 30,
      districtId: '1',
      grades: ['K', '1', '2', '3', '4', '5']
    }
  ];
};

// Generate mock grade levels
const generateGradeLevels = () => {
  return [
    { id: 'grade1', name: 'Kindergarten', code: 'K', schoolId: 'school1' },
    { id: 'grade2', name: 'Grade 1', code: '1', schoolId: 'school1' },
    { id: 'grade3', name: 'Grade 2', code: '2', schoolId: 'school1' },
    { id: 'grade4', name: 'Grade 3', code: '3', schoolId: 'school1' },
    { id: 'grade5', name: 'Grade 4', code: '4', schoolId: 'school1' },
    { id: 'grade6', name: 'Grade 5', code: '5', schoolId: 'school1' }
  ];
};

// Generate mock teachers
const generateTeachers = () => {
  const teachers = [
    { id: 'teacher1', firstName: 'Sarah', lastName: 'Johnson', email: 'sjohnson@springfield.edu', grade: 'K', schoolId: 'school1', specialties: ['Art', 'Music'], yearsExperience: 8 },
    { id: 'teacher2', firstName: 'Robert', lastName: 'Chen', email: 'rchen@springfield.edu', grade: 'K', schoolId: 'school1', specialties: ['Science', 'Math'], yearsExperience: 5 },
    { id: 'teacher3', firstName: 'Jennifer', lastName: 'Taylor', email: 'jtaylor@springfield.edu', grade: 'K', schoolId: 'school1', specialties: ['Reading', 'Social Studies'], yearsExperience: 12 },
    { id: 'teacher4', firstName: 'Michael', lastName: 'Brown', email: 'mbrown@springfield.edu', grade: 'K', schoolId: 'school1', specialties: ['Math', 'Physical Education'], yearsExperience: 3 },
    
    { id: 'teacher5', firstName: 'Emily', lastName: 'Davis', email: 'edavis@springfield.edu', grade: '1', schoolId: 'school1', specialties: ['Reading', 'Writing'], yearsExperience: 10 },
    { id: 'teacher6', firstName: 'James', lastName: 'Wilson', email: 'jwilson@springfield.edu', grade: '1', schoolId: 'school1', specialties: ['Math', 'Science'], yearsExperience: 7 },
    { id: 'teacher7', firstName: 'Linda', lastName: 'Martinez', email: 'lmartinez@springfield.edu', grade: '1', schoolId: 'school1', specialties: ['ESL', 'Social Studies'], yearsExperience: 15 },
    { id: 'teacher8', firstName: 'Thomas', lastName: 'Anderson', email: 'tanderson@springfield.edu', grade: '1', schoolId: 'school1', specialties: ['Technology', 'Math'], yearsExperience: 4 },
    
    { id: 'teacher9', firstName: 'Patricia', lastName: 'Lee', email: 'plee@springfield.edu', grade: '2', schoolId: 'school1', specialties: ['Reading', 'Art'], yearsExperience: 9 },
    { id: 'teacher10', firstName: 'Richard', lastName: 'Garcia', email: 'rgarcia@springfield.edu', grade: '2', schoolId: 'school1', specialties: ['Math', 'Music'], yearsExperience: 6 },
    { id: 'teacher11', firstName: 'Mary', lastName: 'White', email: 'mwhite@springfield.edu', grade: '2', schoolId: 'school1', specialties: ['Science', 'Social Studies'], yearsExperience: 11 },
    { id: 'teacher12', firstName: 'David', lastName: 'Harris', email: 'dharris@springfield.edu', grade: '2', schoolId: 'school1', specialties: ['Technology', 'Physical Education'], yearsExperience: 5 },
    
    { id: 'teacher13', firstName: 'Elizabeth', lastName: 'Clark', email: 'eclark@springfield.edu', grade: '3', schoolId: 'school1', specialties: ['Reading', 'Writing'], yearsExperience: 14 },
    { id: 'teacher14', firstName: 'Joseph', lastName: 'Young', email: 'jyoung@springfield.edu', grade: '3', schoolId: 'school1', specialties: ['Math', 'Science'], yearsExperience: 8 },
    { id: 'teacher15', firstName: 'Susan', lastName: 'Walker', email: 'swalker@springfield.edu', grade: '3', schoolId: 'school1', specialties: ['Social Studies', 'Art'], yearsExperience: 6 },
    { id: 'teacher16', firstName: 'Charles', lastName: 'Allen', email: 'callen@springfield.edu', grade: '3', schoolId: 'school1', specialties: ['ESL', 'Technology'], yearsExperience: 3 },
    
    { id: 'teacher17', firstName: 'Margaret', lastName: 'King', email: 'mking@springfield.edu', grade: '4', schoolId: 'school1', specialties: ['Reading', 'Social Studies'], yearsExperience: 12 },
    { id: 'teacher18', firstName: 'Steven', lastName: 'Wright', email: 'swright@springfield.edu', grade: '4', schoolId: 'school1', specialties: ['Math', 'Science'], yearsExperience: 9 },
    { id: 'teacher19', firstName: 'Jessica', lastName: 'Scott', email: 'jscott@springfield.edu', grade: '4', schoolId: 'school1', specialties: ['Art', 'Music'], yearsExperience: 7 },
    { id: 'teacher20', firstName: 'Christopher', lastName: 'Green', email: 'cgreen@springfield.edu', grade: '4', schoolId: 'school1', specialties: ['Technology', 'Physical Education'], yearsExperience: 5 },
    
    { id: 'teacher21', firstName: 'Nancy', lastName: 'Adams', email: 'nadams@springfield.edu', grade: '5', schoolId: 'school1', specialties: ['Reading', 'Writing'], yearsExperience: 15 },
    { id: 'teacher22', firstName: 'Mark', lastName: 'Baker', email: 'mbaker@springfield.edu', grade: '5', schoolId: 'school1', specialties: ['Math', 'Science'], yearsExperience: 11 },
    { id: 'teacher23', firstName: 'Karen', lastName: 'Nelson', email: 'knelson@springfield.edu', grade: '5', schoolId: 'school1', specialties: ['Social Studies', 'ESL'], yearsExperience: 9 },
    { id: 'teacher24', firstName: 'Daniel', lastName: 'Carter', email: 'dcarter@springfield.edu', grade: '5', schoolId: 'school1', specialties: ['Technology', 'Art'], yearsExperience: 6 }
  ];
  
  return teachers;
};

// Generate mock teacher preferences
const generateTeacherPreferences = (teachers, students) => {
  const preferences = [];
  
  teachers.forEach(teacher => {
    // For each teacher, create preferences for 10-20 students
    const numPreferences = getRandomInt(10, 20);
    const studentPool = students.filter(s => s.grade === teacher.grade);
    
    if (studentPool.length === 0) return;
    
    // Create a set to avoid duplicate students
    const selectedStudents = new Set();
    
    // Try to select unique students
    for (let i = 0; i < numPreferences && selectedStudents.size < studentPool.length; i++) {
      let student = getRandomItem(studentPool);
      
      // Avoid duplicates
      while (selectedStudents.has(student.id) && selectedStudents.size < studentPool.length) {
        student = getRandomItem(studentPool);
      }
      
      selectedStudents.add(student.id);
      
      // Determine preference type
      const preferenceType = getRandomBoolean(0.7) ? 'positive' : 'negative';
      
      // Create preference record
      preferences.push({
        id: `pref-${uuidv4().substring(0, 8)}`,
        teacherId: teacher.id,
        studentId: student.id,
        type: preferenceType,
        reason: preferenceType === 'positive' 
          ? getRandomItem([
              'Works well with my teaching style',
              'Shows great potential',
              'Would benefit from my expertise',
              'Has shown improvement under my guidance',
              'Good fit for classroom dynamics'
            ])
          : getRandomItem([
              'Behavioral challenges I may not be equipped to handle',
              'Learning style conflicts with my teaching approach',
              'May need specific support I cannot provide',
              'Past difficulties in similar classroom settings',
              'May be better with a different teaching style'
            ]),
        academicYear: '2023-2024',
        createdAt: getRandomPastDate(120),
        schoolId: 'school1'
      });
    }
  });
  
  return preferences;
};

// Generate mock students (600 total)
const generateStudents = () => {
  const students = [];
  const academicLevels = ['Advanced', 'Proficient', 'Basic', 'Below Basic'];
  const behaviorLevels = ['High', 'Medium', 'Low'];
  const specialNeeds = ['None', 'IEP', '504 Plan', 'ELL', 'Gifted'];
  
  // Distribution of students per grade (approximately 100 per grade)
  const gradeDistribution = {
    'K': 100,
    '1': 100,
    '2': 100,
    '3': 100,
    '4': 100,
    '5': 100
  };
  
  // Generate students for each grade
  Object.entries(gradeDistribution).forEach(([grade, count]) => {
    for (let i = 0; i < count; i++) {
      const gender = getRandomBoolean() ? 'Male' : 'Female';
      const specialNeed = getRandomBoolean(0.2) ? getRandomItem(specialNeeds.slice(1)) : 'None';
      
      students.push({
        id: `s${grade}-${i + 1}`,
        firstName: getRandomItem(firstNames),
        lastName: getRandomItem(lastNames),
        gender: gender,
        academicLevel: getRandomItem(academicLevels),
        behaviorLevel: getRandomItem(behaviorLevels),
        specialNeeds: specialNeed !== 'None' ? specialNeed : null,
        grade: grade,
        schoolId: 'school1',
        notes: getRandomBoolean(0.3) ? getRandomItem([
          'Excels in math and science',
          'Struggles with reading comprehension',
          'Very creative in art class',
          'Works well in groups',
          'Prefers independent work',
          'Has difficulty focusing for long periods',
          'Natural leader among peers',
          'Shy but participates when encouraged',
          'Responds well to positive reinforcement',
          'Recently moved from another district'
        ]) : null,
        parentName: `${getRandomItem(firstNames)} ${getRandomItem(lastNames)}`,
        parentEmail: `parent${i}@example.com`,
        parentPhone: `(555) ${getRandomInt(100, 999)}-${getRandomInt(1000, 9999)}`
      });
    }
  });
  
  return students;
};

// Generate mock class lists
const generateClassLists = () => {
  return [
    { id: 'cl1', name: '2023-2024 Class List', gradeLevel: 'K', schoolId: 'school1', status: 'active', academicYear: '2023-2024' },
    { id: 'cl2', name: '2023-2024 Class List', gradeLevel: '1', schoolId: 'school1', status: 'active', academicYear: '2023-2024' },
    { id: 'cl3', name: '2023-2024 Class List', gradeLevel: '2', schoolId: 'school1', status: 'active', academicYear: '2023-2024' },
    { id: 'cl4', name: '2023-2024 Class List', gradeLevel: '3', schoolId: 'school1', status: 'active', academicYear: '2023-2024' },
    { id: 'cl5', name: '2023-2024 Class List', gradeLevel: '4', schoolId: 'school1', status: 'active', academicYear: '2023-2024' },
    { id: 'cl6', name: '2023-2024 Class List', gradeLevel: '5', schoolId: 'school1', status: 'draft', academicYear: '2023-2024' },
  ];
};

// Generate mock classes
const generateClasses = (students) => {
  const classes = [];
  const teachersByGrade = {
    'K': ['teacher1', 'teacher2', 'teacher3', 'teacher4'],
    '1': ['teacher5', 'teacher6', 'teacher7', 'teacher8'],
    '2': ['teacher9', 'teacher10', 'teacher11', 'teacher12'],
    '3': ['teacher13', 'teacher14', 'teacher15', 'teacher16'],
    '4': ['teacher17', 'teacher18', 'teacher19', 'teacher20'],
    '5': ['teacher21', 'teacher22', 'teacher23', 'teacher24']
  };
  
  const classListIds = {
    'K': 'cl1',
    '1': 'cl2',
    '2': 'cl3',
    '3': 'cl4',
    '4': 'cl5',
    '5': 'cl6'
  };
  
  // For each grade level
  Object.entries(teachersByGrade).forEach(([grade, teacherIds]) => {
    // Get students for this grade
    const gradeStudents = students.filter(s => s.grade === grade);
    
    // Calculate students per class (evenly distributed)
    const studentsPerClass = Math.floor(gradeStudents.length / teacherIds.length);
    
    // Shuffle students to randomize distribution
    const shuffledStudents = [...gradeStudents].sort(() => 0.5 - Math.random());
    
    // Create classes for each teacher
    teacherIds.forEach((teacherId, index) => {
      // Get students for this class
      const startIndex = index * studentsPerClass;
      const endIndex = (index === teacherIds.length - 1) 
        ? gradeStudents.length 
        : startIndex + studentsPerClass;
      
      const classStudents = shuffledStudents.slice(startIndex, endIndex);
      
      // Create class
      classes.push({
        id: `class-${grade}-${index + 1}`,
        name: `Class ${grade}-${index + 1}`,
        teacherId: teacherId,
        gradeLevel: grade,
        classListId: classListIds[grade],
        schoolId: 'school1',
        students: classStudents.map(s => s.id)
      });
    });
  });
  
  return classes;
};

// Generate mock parent requests
const generateParentRequests = (students) => {
  const requests = [];
  const requestTypes = ['teacher', 'placement', 'separation'];
  
  // For about 20% of students, create a parent request
  const selectedStudents = students.filter(() => getRandomBoolean(0.2));
  
  selectedStudents.forEach(student => {
    const requestType = getRandomItem(requestTypes);
    
    // Find other students in the same grade
    const sameGradeStudents = students.filter(s => 
      s.grade === student.grade && s.id !== student.id
    );
    
    // If no other students in the same grade, skip
    if (sameGradeStudents.length === 0 && (requestType === 'placement' || requestType === 'separation')) {
      return;
    }
    
    let requestDetails = '';
    let friendStudentId = null;
    let avoidStudentId = null;
    let teacherId = null;
    
    if (requestType === 'teacher') {
      // Request a specific teacher
      teacherId = `teacher${getRandomInt(1, 24)}`;
      requestDetails = `Requesting specific teacher assignment`;
    } else if (requestType === 'placement') {
      // Request placement with another student
      const friendStudent = getRandomItem(sameGradeStudents);
      friendStudentId = friendStudent.id;
      requestDetails = `Please place with ${friendStudent.firstName} ${friendStudent.lastName}`;
    } else if (requestType === 'separation') {
      // Request separation from another student
      const avoidStudent = getRandomItem(sameGradeStudents);
      avoidStudentId = avoidStudent.id;
      requestDetails = `Please do not place with ${avoidStudent.firstName} ${avoidStudent.lastName}`;
    }
    
    // Determine status
    const statuses = ['pending', 'approved', 'declined'];
    const status = getRandomItem(statuses);
    
    // Create request
    requests.push({
      id: `pr-${uuidv4().substring(0, 8)}`,
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      parentName: student.parentName || `Parent of ${student.firstName}`,
      parentEmail: student.parentEmail || 'parent@example.com',
      requestType: requestType,
      requestDetails: requestDetails,
      teacherId: teacherId,
      friendStudentId: friendStudentId,
      avoidStudentId: avoidStudentId,
      status: status,
      schoolId: 'school1',
      gradeLevel: student.grade,
      createdAt: getRandomPastDate(90),
      updatedAt: status !== 'pending' ? getRandomPastDate(30) : null,
      declineReason: status === 'declined' ? getRandomItem([
        'Unable to accommodate due to class balancing requirements',
        'Conflicts with other placement constraints',
        'Not aligned with student's academic needs',
        'Teacher recommendation suggests different placement'
      ]) : null
    });
  });
  
  return requests;
};

// Generate mock teacher surveys
const generateTeacherSurveys = (teachers, students) => {
  const surveys = [];
  
  teachers.forEach(teacher => {
    // Get students for this grade
    const gradeStudents = students.filter(s => s.grade === teacher.grade);
    
    // Skip if no students in this grade
    if (gradeStudents.length === 0) return;
    
    // Randomly select 50-80% of students to include in survey
    const selectedCount = Math.floor(gradeStudents.length * (getRandomInt(50, 80) / 100));
    const shuffledStudents = [...gradeStudents].sort(() => 0.5 - Math.random());
    const selectedStudents = shuffledStudents.slice(0, selectedCount);
    
    // Create survey
    const survey = {
      id: `survey-${teacher.id}`,
      teacherId: teacher.id,
      teacherName: `${teacher.firstName} ${teacher.lastName}`,
      schoolId: 'school1',
      gradeLevel: teacher.grade,
      academicYear: '2023-2024',
      status: getRandomBoolean(0.8) ? 'completed' : 'in-progress',
      submittedDate: getRandomPastDate(60),
      studentRatings: [],
      comments: getRandomItem([
        'Looking forward to a great year with balanced classes',
        'Please consider student learning styles when creating classes',
        'I have several students who would benefit from specific groupings',
        'Thank you for taking teacher input into consideration',
        'I have noted several students with potential conflicts'
      ])
    };
    
    // Add student ratings
    selectedStudents.forEach(student => {
      survey.studentRatings.push({
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        academicRating: getRandomInt(1, 5),
        behaviorRating: getRandomInt(1, 5),
        socialRating: getRandomInt(1, 5),
        notes: getRandomBoolean(0.3) ? getRandomItem([
          'Works well independently',
          'Needs regular encouragement',
          'Excellent peer leader',
          'Struggles with group work',
          'Has made significant progress this year',
          'Would benefit from additional challenges',
          'Needs consistent structure',
          'Responds well to positive reinforcement'
        ]) : ''
      });
    });
    
    surveys.push(survey);
  });
  
  return surveys;
};

// Generate all mock data
const generateMockData = () => {
  const schools = generateSchools();
  const gradeLevels = generateGradeLevels();
  const teachers = generateTeachers();
  const students = generateStudents();
  const classLists = generateClassLists();
  const classes = generateClasses(students);
  const parentRequests = generateParentRequests(students);
  const teacherPreferences = generateTeacherPreferences(teachers, students);
  const teacherSurveys = generateTeacherSurveys(teachers, students);
  
  return {
    schools,
    gradeLevels,
    teachers,
    students,
    classLists,
    classes,
    parentRequests,
    teacherPreferences,
    teacherSurveys
  };
};

export default generateMockData;