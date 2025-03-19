/**
 * API Service Layer
 * 
 * This module provides functions to interact with the backend API.
 * For demo purposes, it simulates API calls with localStorage.
 * In a production environment, these functions would make real HTTP requests.
 */
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

// Utility for handling localStorage with expiration
const storage = {
  // Set data in localStorage with optional expiration
  set: (key, value, ttl = null) => {
    const item = {
      value,
      expiry: ttl ? new Date().getTime() + ttl : null,
    };
    localStorage.setItem(key, JSON.stringify(item));
  },
  
  // Get data from localStorage, respecting expiration
  get: (key) => {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;
    
    try {
      const item = JSON.parse(itemStr);
      if (item.expiry && new Date().getTime() > item.expiry) {
        localStorage.removeItem(key);
        return null;
      }
      return item.value;
    } catch (err) {
      console.error('Error parsing stored item:', err);
      return null;
    }
  },
  
  // Remove data from localStorage
  remove: (key) => {
    localStorage.removeItem(key);
  }
};

// Initialize demo data if it doesn't exist
const initializeData = () => {
  // Only initialize if data doesn't exist
  if (!storage.get('initialized')) {
    console.log('Initializing demo data...');
    
    // Initialize users with demo credentials
    storage.set('users', [
      {
        id: 'user-001',
        email: 'demo@classharmony.com',
        name: 'Demo User',
        role: 'admin',
        schoolId: 'school-001'
      }
    ]);
    
    // Initialize schools
    storage.set('schools', [
      {
        id: 'school-001',
        name: 'Washington Elementary',
        district: 'Springfield School District',
        address: '123 School Street, Springfield',
        phone: '(555) 123-4567',
        website: 'www.springfieldsd.org/washington',
        gradeLevels: ['K', '1', '2', '3', '4', '5']
      }
    ]);
    
    // Sample schools
    const schools = [
      {
        id: 'school1',
        name: 'Washington Elementary School',
        address: '123 Education Ln',
        city: 'Springfield',
        state: 'IL',
        zipCode: '12345',
        phone: '(555) 123-4567',
        website: 'www.springfieldschools.edu',
        active: true,
        subscription: 'pro',
        subscriptionStart: '2023-01-01',
        subscriptionEnd: '2024-01-01',
        maxStudents: 1000,
        userId: '123'
      }
    ];
    
    // Sample grade levels
    const gradeLevels = [
      { id: 'grade1', name: 'Kindergarten', code: 'K', schoolId: 'school1' },
      { id: 'grade2', name: 'Grade 1', code: '1', schoolId: 'school1' },
      { id: 'grade3', name: 'Grade 2', code: '2', schoolId: 'school1' },
      { id: 'grade4', name: 'Grade 3', code: '3', schoolId: 'school1' },
      { id: 'grade5', name: 'Grade 4', code: '4', schoolId: 'school1' },
      { id: 'grade6', name: 'Grade 5', code: '5', schoolId: 'school1' }
    ];
    
    // Sample teachers
    const teachers = [
      { id: 'teacher1', firstName: 'Sarah', lastName: 'Johnson', email: 'sjohnson@springfield.edu', grade: '1', schoolId: 'school1' },
      { id: 'teacher2', firstName: 'Robert', lastName: 'Chen', email: 'rchen@springfield.edu', grade: '1', schoolId: 'school1' },
      { id: 'teacher3', firstName: 'Jennifer', lastName: 'Taylor', email: 'jtaylor@springfield.edu', grade: '1', schoolId: 'school1' },
      { id: 'teacher4', firstName: 'Michael', lastName: 'Brown', email: 'mbrown@springfield.edu', grade: '2', schoolId: 'school1' },
      { id: 'teacher5', firstName: 'Emily', lastName: 'Davis', email: 'edavis@springfield.edu', grade: '2', schoolId: 'school1' }
    ];
    
    // Sample students
    const students = [
      { id: 's1', firstName: 'John', lastName: 'Smith', gender: 'Male', academicLevel: 'Advanced', behaviorLevel: 'Medium', grade: '1', schoolId: 'school1' },
      { id: 's2', firstName: 'Emma', lastName: 'Johnson', gender: 'Female', academicLevel: 'Proficient', behaviorLevel: 'Low', grade: '1', schoolId: 'school1' },
      { id: 's3', firstName: 'Michael', lastName: 'Williams', gender: 'Male', academicLevel: 'Basic', behaviorLevel: 'High', specialNeeds: true, grade: '1', schoolId: 'school1' },
      { id: 's4', firstName: 'Sophia', lastName: 'Davis', gender: 'Female', academicLevel: 'Advanced', behaviorLevel: 'Low', grade: '1', schoolId: 'school1' },
      { id: 's5', firstName: 'William', lastName: 'Miller', gender: 'Male', academicLevel: 'Proficient', behaviorLevel: 'Medium', grade: '1', schoolId: 'school1' },
      { id: 's6', firstName: 'Olivia', lastName: 'Brown', gender: 'Female', academicLevel: 'Advanced', behaviorLevel: 'Low', grade: '1', schoolId: 'school1' },
      { id: 's7', firstName: 'James', lastName: 'Jones', gender: 'Male', academicLevel: 'Proficient', behaviorLevel: 'Medium', grade: '1', schoolId: 'school1' },
      { id: 's8', firstName: 'Ava', lastName: 'Garcia', gender: 'Female', academicLevel: 'Basic', behaviorLevel: 'Low', grade: '1', schoolId: 'school1' },
      { id: 's9', firstName: 'Alexander', lastName: 'Martinez', gender: 'Male', academicLevel: 'Advanced', behaviorLevel: 'High', grade: '1', schoolId: 'school1' },
      { id: 's10', firstName: 'Mia', lastName: 'Robinson', gender: 'Female', academicLevel: 'Proficient', behaviorLevel: 'Medium', specialNeeds: true, grade: '1', schoolId: 'school1' },
      { id: 's11', firstName: 'Ethan', lastName: 'Clark', gender: 'Male', academicLevel: 'Basic', behaviorLevel: 'High', grade: '1', schoolId: 'school1' },
      { id: 's12', firstName: 'Isabella', lastName: 'Rodriguez', gender: 'Female', academicLevel: 'Advanced', behaviorLevel: 'Low', grade: '1', schoolId: 'school1' },
      { id: 's13', firstName: 'Daniel', lastName: 'Lee', gender: 'Male', academicLevel: 'Proficient', behaviorLevel: 'Medium', grade: '1', schoolId: 'school1' },
      { id: 's14', firstName: 'Charlotte', lastName: 'Walker', gender: 'Female', academicLevel: 'Basic', behaviorLevel: 'Low', grade: '1', schoolId: 'school1' },
      { id: 's15', firstName: 'Benjamin', lastName: 'Hall', gender: 'Male', academicLevel: 'Advanced', behaviorLevel: 'High', specialNeeds: true, grade: '1', schoolId: 'school1' },
    ];
    
    // Sample class lists
    const classLists = [
      { id: 'cl1', name: '2023-2024 Class List', gradeLevel: '1', schoolId: 'school1', status: 'active', academicYear: '2023-2024' },
      { id: 'cl2', name: '2023-2024 Class List', gradeLevel: '2', schoolId: 'school1', status: 'active', academicYear: '2023-2024' },
      { id: 'cl3', name: '2023-2024 Class List', gradeLevel: '3', schoolId: 'school1', status: 'draft', academicYear: '2023-2024' },
    ];
    
    // Sample classes
    const classes = [
      {
        id: 'class1',
        name: 'Class 1A',
        teacherId: 'teacher1',
        gradeLevel: '1',
        classListId: 'cl1',
        schoolId: 'school1',
        students: ['s1', 's2', 's3', 's4', 's5']
      },
      {
        id: 'class2',
        name: 'Class 1B',
        teacherId: 'teacher2',
        gradeLevel: '1',
        classListId: 'cl1',
        schoolId: 'school1',
        students: ['s6', 's7', 's8', 's9', 's10']
      },
      {
        id: 'class3',
        name: 'Class 1C',
        teacherId: 'teacher3',
        gradeLevel: '1',
        classListId: 'cl1',
        schoolId: 'school1',
        students: ['s11', 's12', 's13', 's14', 's15']
      }
    ];
    
    // Sample parent requests
    const parentRequests = [
      {
        id: 'pr1',
        studentId: 's1',
        studentName: 'John Smith',
        parentName: 'David Smith',
        parentEmail: 'dsmith@example.com',
        requestType: 'teacher',
        requestDetails: 'Requesting Ms. Johnson as teacher',
        teacherId: 'teacher1',
        status: 'pending',
        schoolId: 'school1',
        gradeLevel: '1',
        createdAt: '2023-05-15T10:30:00Z'
      },
      {
        id: 'pr2',
        studentId: 's4',
        studentName: 'Sophia Davis',
        parentName: 'Emily Davis',
        parentEmail: 'edavis@example.com',
        requestType: 'placement',
        requestDetails: 'Please place with William Miller',
        friendStudentId: 's5',
        status: 'approved',
        schoolId: 'school1',
        gradeLevel: '1',
        createdAt: '2023-05-10T14:45:00Z',
        updatedAt: '2023-05-12T09:20:00Z'
      },
      {
        id: 'pr3',
        studentId: 's8',
        studentName: 'Ava Garcia',
        parentName: 'Marco Garcia',
        parentEmail: 'mgarcia@example.com',
        requestType: 'separation',
        requestDetails: 'Please do not place with Alexander Martinez',
        avoidStudentId: 's9',
        status: 'declined',
        schoolId: 'school1',
        gradeLevel: '1',
        createdAt: '2023-05-08T16:15:00Z',
        updatedAt: '2023-05-11T11:30:00Z',
        declineReason: 'Unable to accommodate due to class balancing requirements'
      }
    ];
    
    // Store all data
    storage.set('schools', schools);
    storage.set('gradeLevels', gradeLevels);
    storage.set('teachers', teachers);
    storage.set('students', students);
    storage.set('classLists', classLists);
    storage.set('classes', classes);
    storage.set('parentRequests', parentRequests);
    
    // Initialize notifications
    storage.set('notifications', [
      {
        id: 'notif-001',
        userId: 'user-001',
        type: 'studentImport',
        title: 'Student Import Completed',
        message: 'Successfully imported 24 students to Grade 3',
        read: false,
        createdAt: new Date(Date.now() - 5 * 60000).toISOString(), // 5 minutes ago
        updatedAt: new Date(Date.now() - 5 * 60000).toISOString()
      },
      {
        id: 'notif-002',
        userId: 'user-001',
        type: 'classOptimization',
        title: 'Class Optimization Complete',
        message: 'Successfully optimized 3 classes for Grade 4',
        read: true,
        createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), // 2 hours ago
        updatedAt: new Date(Date.now() - 1 * 3600000).toISOString() // 1 hour ago
      },
      {
        id: 'notif-003',
        userId: 'user-001',
        type: 'parentRequest',
        title: 'New Parent Request',
        message: 'New placement request from Johnson family for Emma Johnson',
        read: false,
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString(), // 1 day ago
        updatedAt: new Date(Date.now() - 1 * 86400000).toISOString()
      },
      {
        id: 'notif-004',
        userId: 'user-001',
        type: 'teacherSurvey',
        title: 'Teacher Survey Submitted',
        message: 'Ms. Wilson has submitted her class placement survey for Grade 2',
        read: false,
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), // 3 days ago
        updatedAt: new Date(Date.now() - 3 * 86400000).toISOString()
      },
      {
        id: 'notif-005',
        userId: 'user-001',
        type: 'system',
        title: 'Welcome to Class Harmony',
        message: 'Welcome to Class Harmony! Get started by importing your students.',
        read: true,
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString(), // 7 days ago
        updatedAt: new Date(Date.now() - 6 * 86400000).toISOString() // 6 days ago
      }
    ]);
    
    // Initialize notification preferences
    storage.set('notificationPreferences', {
      'user-001': {
        email: true,
        inApp: true,
        types: {
          studentImport: true,
          classOptimization: true,
          parentRequest: true,
          teacherSurvey: true,
          system: true
        }
      }
    });
    
    // Set as initialized
    storage.set('initialized', true);
  }
};

// Initialize data
initializeData();

// Simulate API latency
const simulateApiCall = (data, error = null, delay = 500) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    }, delay);
  });
};

// Helper to simulate API latency
const simulateNetworkDelay = () => {
  return new Promise((resolve) => {
    setTimeout(resolve, 500);
  });
};

// Sample users data
const users = [
  {
    id: 'usr-1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    role: 'admin',
    schoolId: 'school-1',
    active: true,
    lastLogin: '2023-09-15T10:30:00Z',
    dateCreated: '2023-08-01T09:00:00Z'
  },
  {
    id: 'usr-2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    role: 'principal',
    schoolId: 'school-1',
    active: true,
    lastLogin: '2023-09-14T14:45:00Z',
    dateCreated: '2023-08-01T09:15:00Z'
  },
  {
    id: 'usr-3',
    name: 'Michael Davis',
    email: 'michael.davis@example.com',
    role: 'teacher',
    schoolId: 'school-1',
    active: true,
    lastLogin: '2023-09-15T08:20:00Z',
    dateCreated: '2023-08-02T10:30:00Z'
  }
];

// Sample schools data
const schools = [
  {
    id: 'school-1',
    name: 'Westside Elementary',
    address: '123 School St, Springfield, IL',
    phone: '(555) 123-4567',
    principal: 'Sarah Johnson',
    website: 'http://westside.edu',
    grades: ['K', '1', '2', '3', '4', '5'],
    active: true
  },
  {
    id: 'school-2',
    name: 'Eastside Middle School',
    address: '456 Learning Ave, Springfield, IL',
    phone: '(555) 987-6543',
    principal: 'Robert Thompson',
    website: 'http://eastside.edu',
    grades: ['6', '7', '8'],
    active: true
  }
];

// API base URL - would be environment variable in production
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Helper function to get auth token
const getToken = () => {
  const token = storage.get('authToken');
  return token || '';
};

// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for API calls
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // Handle token refresh or logout on 401 Unauthorized
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh the token (in a real app)
        // const refreshToken = localStorage.getItem('refreshToken');
        // const response = await axios.post('/auth/refresh-token', { refreshToken });
        // const { token } = response.data;
        // localStorage.setItem('authToken', token);
        // originalRequest.headers['Authorization'] = `Bearer ${token}`;
        // return api(originalRequest);
        
        // For demo: just redirect to login
        window.location.href = '/login';
        return Promise.reject(error);
      } catch (refreshError) {
        // If refresh token fails, logout user
        localStorage.removeItem('authToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// API Methods
const apiMethods = {
  // AUTH ENDPOINTS
  
  // Get current user
  getCurrentUser: async () => {
    const token = storage.get('authToken');
    if (!token) return simulateApiCall(null, { message: 'Not authenticated' });
    
    const user = storage.get('currentUser');
    return simulateApiCall(user);
  },
  
  // SCHOOL ENDPOINTS
  
  // Get schools for current user
  getSchools: async () => {
    try {
      // Simulate API call
      await simulateNetworkDelay();
      
      // Get schools from localStorage or initialize with mock data
      let schools = JSON.parse(localStorage.getItem('schools') || '[]');
      
      if (schools.length === 0) {
        // Generate some mock schools if none exist
        schools = [
          {
            id: '1',
            name: 'Washington Elementary School',
            address: '123 Main St',
            city: 'Seattle',
            state: 'WA',
            zipCode: '98101',
            phone: '(206) 555-1234',
            website: 'https://washington.example.edu',
            principalName: 'Dr. Jane Smith',
            principalEmail: 'jsmith@washington.example.edu',
            schoolYear: '2023-2024',
            grades: ['K', '1', '2', '3', '4', '5'],
            status: 'active',
            districtId: '1',
            timezone: 'US/Pacific',
            enrollmentCount: 523,
            classroomCount: 24
          },
          {
            id: '2',
            name: 'Lincoln Middle School',
            address: '456 Oak Avenue',
            city: 'Portland',
            state: 'OR',
            zipCode: '97205',
            phone: '(503) 555-6789',
            website: 'https://lincoln.example.edu',
            principalName: 'Michael Johnson',
            principalEmail: 'mjohnson@lincoln.example.edu',
            schoolYear: '2023-2024',
            grades: ['6', '7', '8'],
            status: 'active',
            districtId: '2',
            timezone: 'US/Pacific',
            enrollmentCount: 687,
            classroomCount: 30
          },
          {
            id: '3',
            name: 'Roosevelt High School',
            address: '789 Pine Street',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94109',
            phone: '(415) 555-9876',
            website: 'https://roosevelt.example.edu',
            principalName: 'Dr. Robert Williams',
            principalEmail: 'rwilliams@roosevelt.example.edu',
            schoolYear: '2023-2024',
            grades: ['9', '10', '11', '12'],
            status: 'active',
            districtId: '3',
            timezone: 'US/Pacific',
            enrollmentCount: 1254,
            classroomCount: 48
          },
          {
            id: '4',
            name: 'Jefferson Academy',
            address: '321 Maple Road',
            city: 'Chicago',
            state: 'IL',
            zipCode: '60601',
            phone: '(312) 555-4321',
            website: 'https://jefferson.example.edu',
            principalName: 'Sarah Johnson',
            principalEmail: 'sjohnson@jefferson.example.edu',
            schoolYear: '2023-2024',
            grades: ['K', '1', '2', '3', '4', '5', '6', '7', '8'],
            status: 'active',
            districtId: '4',
            timezone: 'US/Central',
            enrollmentCount: 879,
            classroomCount: 36
          },
          {
            id: '5',
            name: 'Madison Preparatory School',
            address: '567 Elm Boulevard',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            phone: '(212) 555-8765',
            website: 'https://madison.example.edu',
            principalName: 'David Brown',
            principalEmail: 'dbrown@madison.example.edu',
            schoolYear: '2023-2024',
            grades: ['6', '7', '8', '9', '10', '11', '12'],
            status: 'active',
            districtId: '5',
            timezone: 'US/Eastern',
            enrollmentCount: 956,
            classroomCount: 42
          }
        ];
        
        // Save the mock schools to localStorage
        localStorage.setItem('schools', JSON.stringify(schools));
      }
      
      return schools;
    } catch (error) {
      console.error('Error fetching schools:', error);
      throw error;
    }
  },
  
  // Get school by id
  getSchool: async (id) => {
    const schools = storage.get('schools') || [];
    const school = schools.find(s => s.id === id);
    
    if (!school) {
      return simulateApiCall(null, { message: 'School not found' }, 300);
    }
    
    return simulateApiCall(school);
  },
  
  // GRADE LEVEL ENDPOINTS
  
  // Get grade levels for a school
  getGradeLevels: async (schoolId) => {
    const gradeLevels = storage.get('gradeLevels') || [];
    const filtered = schoolId 
      ? gradeLevels.filter(g => g.schoolId === schoolId)
      : gradeLevels;
      
    return simulateApiCall(filtered);
  },
  
  // TEACHER ENDPOINTS
  
  // Get teachers for a school
  getTeachers: async (schoolId, gradeLevel = null) => {
    const teachers = storage.get('teachers') || [];
    
    // Filter by school and optionally by grade
    const filtered = teachers.filter(t => {
      if (t.schoolId !== schoolId) return false;
      if (gradeLevel && t.grade !== gradeLevel) return false;
      return true;
    });
    
    return simulateApiCall(filtered);
  },
  
  // STUDENT ENDPOINTS
  
  // Get students
  getStudents: async (filters = {}) => {
    const { schoolId, gradeLevel, classId } = filters;
    const students = storage.get('students') || [];
    
    // Apply filters
    const filtered = students.filter(s => {
      if (schoolId && s.schoolId !== schoolId) return false;
      if (gradeLevel && s.grade !== gradeLevel) return false;
      
      // Filter by class requires checking the class data
      if (classId) {
        const classes = storage.get('classes') || [];
        const targetClass = classes.find(c => c.id === classId);
        if (!targetClass || !targetClass.students.includes(s.id)) return false;
      }
      
      return true;
    });
    
    return simulateApiCall(filtered);
  },
  
  // Import students
  importStudents: async (students, gradeLevel, schoolId = 'school1') => {
    // Get existing students
    const existingStudents = storage.get('students') || [];
    
    // Create new student records with IDs
    const newStudents = students.map(student => ({
      id: `s${uuidv4().substring(0, 8)}`,
      ...student,
      grade: gradeLevel,
      schoolId
    }));
    
    // Combine and save
    const updatedStudents = [...existingStudents, ...newStudents];
    storage.set('students', updatedStudents);
    
    return simulateApiCall({
      success: true,
      count: newStudents.length,
      students: newStudents
    }, null, 1500);
  },
  
  // CLASS LIST ENDPOINTS
  
  // Get class lists
  getClassLists: async (filters = {}) => {
    const { schoolId, gradeLevel, status } = filters;
    const classLists = storage.get('classLists') || [];
    
    // Apply filters
    const filtered = classLists.filter(cl => {
      if (schoolId && cl.schoolId !== schoolId) return false;
      if (gradeLevel && cl.gradeLevel !== gradeLevel) return false;
      if (status && cl.status !== status) return false;
      return true;
    });
    
    return simulateApiCall(filtered);
  },
  
  // Get a specific class list with its classes and students
  getClassListDetails: async (classListId) => {
    const classLists = storage.get('classLists') || [];
    const classList = classLists.find(cl => cl.id === classListId);
    
    if (!classList) {
      return simulateApiCall(null, { message: 'Class list not found' }, 300);
    }
    
    // Get classes for this class list
    const classes = storage.get('classes') || [];
    const classListClasses = classes.filter(c => c.classListId === classListId);
    
    // Get all students
    const students = storage.get('students') || [];
    
    // Get all teachers
    const teachers = storage.get('teachers') || [];
    
    // For each class, resolve student and teacher details
    const classesWithDetails = classListClasses.map(cls => {
      // Get teacher details
      const teacher = teachers.find(t => t.id === cls.teacherId) || null;
      const teacherName = teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unassigned';
      
      // Get student details
      const classStudents = cls.students.map(studentId => {
        return students.find(s => s.id === studentId) || null;
      }).filter(s => s !== null);
      
      return {
        ...cls,
        teacher: teacherName,
        students: classStudents
      };
    });
    
    return simulateApiCall({
      ...classList,
      classes: classesWithDetails
    }, null, 1000);
  },
  
  // Update classes in a class list (for drag and drop)
  updateClassStudents: async (classId, studentIds) => {
    const classes = storage.get('classes') || [];
    const classIndex = classes.findIndex(c => c.id === classId);
    
    if (classIndex === -1) {
      return simulateApiCall(null, { message: 'Class not found' }, 300);
    }
    
    // Update the class
    classes[classIndex] = {
      ...classes[classIndex],
      students: studentIds
    };
    
    // Save updated classes
    storage.set('classes', classes);
    
    return simulateApiCall({
      success: true,
      class: classes[classIndex]
    }, null, 800);
  },
  
  // Create a new class
  createClass: async (classData) => {
    const classes = storage.get('classes') || [];
    
    // Create new class with ID
    const newClass = {
      id: `class${uuidv4().substring(0, 8)}`,
      ...classData,
      students: []
    };
    
    // Add to classes
    const updatedClasses = [...classes, newClass];
    storage.set('classes', updatedClasses);
    
    return simulateApiCall({
      success: true,
      class: newClass
    }, null, 800);
  },
  
  // Optimize classes based on selected factors
  optimizeClasses: async (classListId, factors = [], strategy = 'balanced') => {
    try {
      // Call the server API endpoint
      const response = await fetch(`${API_BASE_URL}/api/class-lists/${classListId}/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ factors, strategy })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Optimization error:', data.message);
        return { 
          success: false, 
          message: data.message || 'Failed to optimize classes' 
        };
      }
      
      return data;
    } catch (error) {
      console.error('Error in optimizeClasses:', error);
      return { success: false, message: 'An error occurred while optimizing classes' };
    }
  },
};

// Helper function to calculate gender balance score (0-100)
const calculateGenderBalance = (classes) => {
  return classes.map(cls => {
    const total = cls.students.length;
    if (total === 0) return 100; // Empty class is balanced
    
    const maleCount = cls.students.filter(s => s.gender === 'Male').length;
    const femaleCount = cls.students.filter(s => s.gender === 'Female').length;
    const otherCount = cls.students.filter(s => s.gender !== 'Male' && s.gender !== 'Female').length;
    
    // Perfect balance would be equal proportions, calculate deviation
    const maleRatio = maleCount / total;
    const femaleRatio = femaleCount / total;
    const otherRatio = otherCount / total;
    
    // Ideal ratios (simplified as even distribution between male/female)
    const idealMaleRatio = 0.5;
    const idealFemaleRatio = 0.5;
    const idealOtherRatio = 0; // Simplified, adjust as needed
    
    // Calculate deviation from ideal (0 = perfect, 1 = worst)
    const deviation = (
      Math.abs(maleRatio - idealMaleRatio) + 
      Math.abs(femaleRatio - idealFemaleRatio) + 
      Math.abs(otherRatio - idealOtherRatio)
    ) / 2; // Normalize to 0-1
    
    // Convert to score (100 = perfect, 0 = worst)
    return Math.round((1 - deviation) * 100);
  });
};

// Helper function to calculate academic balance score (0-100)
const calculateAcademicBalance = (classes) => {
  return classes.map(cls => {
    const total = cls.students.length;
    if (total === 0) return 100; // Empty class is balanced
    
    const advancedCount = cls.students.filter(s => s.academicLevel === 'Advanced').length;
    const proficientCount = cls.students.filter(s => s.academicLevel === 'Proficient').length;
    const basicCount = cls.students.filter(s => s.academicLevel === 'Basic').length;
    const belowBasicCount = cls.students.filter(s => s.academicLevel === 'Below Basic').length;
    
    // Calculate ratios
    const advancedRatio = advancedCount / total;
    const proficientRatio = proficientCount / total;
    const basicRatio = basicCount / total;
    const belowBasicRatio = belowBasicCount / total;
    
    // Simplified ideal ratios (equal distribution)
    const idealRatio = 0.25;
    
    // Calculate deviation
    const deviation = (
      Math.abs(advancedRatio - idealRatio) + 
      Math.abs(proficientRatio - idealRatio) + 
      Math.abs(basicRatio - idealRatio) + 
      Math.abs(belowBasicRatio - idealRatio)
    ) / 4;
    
    return Math.round((1 - deviation) * 100);
  });
};

// Helper function to calculate behavior balance score (0-100)
const calculateBehaviorBalance = (classes) => {
  return classes.map(cls => {
    const total = cls.students.length;
    if (total === 0) return 100; // Empty class is balanced
    
    const highCount = cls.students.filter(s => s.behaviorLevel === 'High').length;
    const mediumCount = cls.students.filter(s => s.behaviorLevel === 'Medium').length;
    const lowCount = cls.students.filter(s => s.behaviorLevel === 'Low').length;
    
    // High needs students should be distributed evenly
    const highRatio = highCount / total;
    const mediumRatio = mediumCount / total;
    const lowRatio = lowCount / total;
    
    // Ideal distribution would have fewer high needs, more low needs
    const idealHighRatio = 0.2;
    const idealMediumRatio = 0.3;
    const idealLowRatio = 0.5;
    
    // Calculate weighted deviation (high needs deviation is more important)
    const deviation = (
      Math.abs(highRatio - idealHighRatio) * 1.5 + 
      Math.abs(mediumRatio - idealMediumRatio) * 1.0 + 
      Math.abs(lowRatio - idealLowRatio) * 0.5
    ) / 3;
    
    return Math.round((1 - deviation) * 100);
  });
};

// Helper function to calculate request fulfillment percentage
const calculateRequestsFulfillment = (students, classes) => {
  const studentsWithRequests = students.filter(s => s.parentRequests && s.parentRequests.length > 0);
  if (studentsWithRequests.length === 0) return 100; // No requests to fulfill
  
  let fulfilledCount = 0;
  
  studentsWithRequests.forEach(student => {
    // Find which class this student is in
    const studentClass = classes.find(c => c.students.includes(student));
    if (!studentClass) return;
    
    // Check if requests were fulfilled
    let allRequestsFulfilled = true;
    
    student.parentRequests.forEach(request => {
      if (request.type === 'teacher') {
        // Teacher request
        if (studentClass.teacherId !== request.targetTeacherId) {
          allRequestsFulfilled = false;
        }
      } else if (request.type === 'classmate') {
        // Classmate request
        const targetStudent = students.find(s => s.id === request.targetStudentId);
        if (!targetStudent || !studentClass.students.includes(targetStudent)) {
          allRequestsFulfilled = false;
        }
      }
    });
    
    if (allRequestsFulfilled) {
      fulfilledCount++;
    }
  });
  
  return Math.round((fulfilledCount / studentsWithRequests.length) * 100);
};

// Teacher-specific API endpoints
api.getTeacherClass = async (classId) => {
  return api.get(`/api/teacher/classes/${classId}`);
};

api.getTeacherParentRequests = async (classId) => {
  return api.get(`/api/teacher/parent-requests`, {
    params: { classId }
  });
};

api.addStudentNote = async (studentId, note) => {
  return api.post(`/api/teacher/students/${studentId}/notes`, { note });
};

api.exportClassReport = async (classId, format = 'pdf') => {
  return api.get(`/api/teacher/classes/${classId}/export`, {
    params: { format },
    responseType: 'blob'
  });
};

// Learning Plan API
api.getLearningPlans = async (filters = {}) => {
  const { academicYear, studentId, status, planType } = filters;
  let queryParams = new URLSearchParams();
  
  if (academicYear) queryParams.append('academicYear', academicYear);
  if (studentId) queryParams.append('studentId', studentId);
  if (status) queryParams.append('status', status);
  if (planType) queryParams.append('planType', planType);
  
  return api.get(`/api/learning-plans?${queryParams.toString()}`);
};

api.getLearningPlan = async (id) => {
  return api.get(`/api/learning-plans/${id}`);
};

api.createLearningPlan = async (planData) => {
  return api.post('/api/learning-plans', planData);
};

api.updateLearningPlan = async (id, planData) => {
  return api.put(`/api/learning-plans/${id}`, planData);
};

api.deleteLearningPlan = async (id) => {
  return api.delete(`/api/learning-plans/${id}`);
};

api.addLearningPlanGoal = async (planId, goalData) => {
  return api.post(`/api/learning-plans/${planId}/goals`, goalData);
};

api.updateLearningPlanGoal = async (planId, goalId, goalData) => {
  return api.put(`/api/learning-plans/${planId}/goals/${goalId}`, goalData);
};

api.addGoalProgress = async (planId, goalId, progressData) => {
  return api.post(`/api/learning-plans/${planId}/goals/${goalId}/progress`, progressData);
};

api.addLearningPlanReview = async (planId, reviewData) => {
  return api.post(`/api/learning-plans/${planId}/review`, reviewData);
};

api.getStudentLearningPlans = async (studentId, academicYear) => {
  let queryParams = new URLSearchParams();
  if (academicYear) queryParams.append('academicYear', academicYear);
  
  return api.get(`/api/learning-plans/student/${studentId}?${queryParams.toString()}`);
};

// Add the following constraint-related API methods

/**
 * Fetch all constraints for a specific academic year and grade
 * @param {string} academicYear - Academic year
 * @param {string} grade - Grade level
 * @returns {Promise<Array>} - Array of constraint objects
 */
const getConstraints = async (academicYear, grade) => {
  try {
    const response = await axios.get(`/api/constraints?academicYear=${academicYear}&grade=${grade}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching constraints:', error);
    throw error;
  }
};

/**
 * Get a specific constraint by ID
 * @param {string} id - Constraint ID
 * @returns {Promise<Object>} - Constraint object
 */
const getConstraintById = async (id) => {
  try {
    const response = await axios.get(`/api/constraints/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching constraint:', error);
    throw error;
  }
};

/**
 * Create a new constraint
 * @param {Object} constraintData - Constraint data
 * @returns {Promise<Object>} - Created constraint
 */
const createConstraint = async (constraintData) => {
  try {
    const response = await axios.post('/api/constraints', constraintData);
    return response.data;
  } catch (error) {
    console.error('Error creating constraint:', error);
    throw error;
  }
};

/**
 * Update an existing constraint
 * @param {string} id - Constraint ID
 * @param {Object} constraintData - Updated constraint data
 * @returns {Promise<Object>} - Updated constraint
 */
const updateConstraint = async (id, constraintData) => {
  try {
    const response = await axios.put(`/api/constraints/${id}`, constraintData);
    return response.data;
  } catch (error) {
    console.error('Error updating constraint:', error);
    throw error;
  }
};

/**
 * Delete a constraint
 * @param {string} id - Constraint ID
 * @returns {Promise<Object>} - Response data
 */
const deleteConstraint = async (id) => {
  try {
    const response = await axios.delete(`/api/constraints/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting constraint:', error);
    throw error;
  }
};

/**
 * Get constraints by source (admin, teacher, parent, system)
 * @param {string} source - Source of the constraints
 * @param {string} academicYear - Optional academic year filter
 * @param {string} grade - Optional grade filter
 * @returns {Promise<Array>} - Array of constraint objects
 */
const getConstraintsBySource = async (source, academicYear, grade) => {
  try {
    let url = `/api/constraints/source/${source}`;
    const params = [];
    
    if (academicYear) params.push(`academicYear=${academicYear}`);
    if (grade) params.push(`grade=${grade}`);
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching constraints by source:', error);
    throw error;
  }
};

// Add the constraint methods to the existing apiMethods object
apiMethods.getConstraints = getConstraints;
apiMethods.getConstraintById = getConstraintById;
apiMethods.createConstraint = createConstraint;
apiMethods.updateConstraint = updateConstraint;
apiMethods.deleteConstraint = deleteConstraint;
apiMethods.getConstraintsBySource = getConstraintsBySource;

export default apiMethods; 