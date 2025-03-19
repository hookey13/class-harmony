import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

// Create context
const DataContext = createContext();

// Custom hook to use the data context
export const useData = () => useContext(DataContext);

// Provider component
export const DataProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  
  // State for schools
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [schoolsLoading, setSchoolsLoading] = useState(false);
  
  // State for grade levels
  const [gradeLevels, setGradeLevels] = useState([]);
  const [selectedGradeLevel, setSelectedGradeLevel] = useState(null);
  const [gradeLevelsLoading, setGradeLevelsLoading] = useState(false);
  
  // State for teachers
  const [teachers, setTeachers] = useState([]);
  const [teachersLoading, setTeachersLoading] = useState(false);
  
  // State for students
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  
  // State for class lists
  const [classLists, setClassLists] = useState([]);
  const [selectedClassList, setSelectedClassList] = useState(null);
  const [classListsLoading, setClassListsLoading] = useState(false);
  
  // State for classes
  const [classes, setClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(false);
  
  // State for teacher surveys
  const [teacherSurveys, setTeacherSurveys] = useState([]);
  const [teacherSurveysLoading, setTeacherSurveysLoading] = useState(false);
  
  // State for parent requests
  const [parentRequests, setParentRequests] = useState([]);
  const [parentRequestsLoading, setParentRequestsLoading] = useState(false);
  
  // State for reports
  const [classBalanceReport, setClassBalanceReport] = useState(null);
  const [requestStatistics, setRequestStatistics] = useState(null);
  const [reportsLoading, setReportsLoading] = useState(false);
  
  // General loading and error states
  const [studentsGeneralLoading, setStudentsGeneralLoading] = useState(false);
  const [teachersGeneralLoading, setTeachersGeneralLoading] = useState(false);
  const [classListsGeneralLoading, setClassListsGeneralLoading] = useState(false);
  const [classRoomsGeneralLoading, setClassRoomsGeneralLoading] = useState(false);
  const [parentRequestsGeneralLoading, setParentRequestsGeneralLoading] = useState(false);
  const [teacherSurveysGeneralLoading, setTeacherSurveysGeneralLoading] = useState(false);
  const [districtsGeneralLoading, setDistrictsGeneralLoading] = useState(false);
  
  // Individual error states
  const [studentsError, setStudentsError] = useState(null);
  const [teachersError, setTeachersError] = useState(null);
  const [classListsError, setClassListsError] = useState(null);
  const [classRoomsError, setClassRoomsError] = useState(null);
  const [parentRequestsError, setParentRequestsError] = useState(null);
  const [teacherSurveysError, setTeacherSurveysError] = useState(null);
  const [districtsError, setDistrictsError] = useState(null);
  const [generalError, setGeneralError] = useState(null);
  
  // User Management States
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  
  // State for class rooms
  const [classRooms, setClassRooms] = useState([]);
  
  // State for districts
  const [districts, setDistricts] = useState([]);
  
  // Fetch data methods
  
  // Fetch schools
  const fetchSchools = useCallback(async (filters = {}) => {
    if (!isAuthenticated) return;
    
    setSchoolsLoading(true);
    
    try {
      const result = await api.getSchools(filters);
      setSchools(result || []);
      
      // Select first school by default if none selected
      if (result.length > 0 && !selectedSchool) {
        setSelectedSchool(result[0]);
      }
    } catch (err) {
      console.error('Error fetching schools:', err);
      setGeneralError('Failed to fetch schools');
    } finally {
      setSchoolsLoading(false);
    }
  }, [isAuthenticated, selectedSchool]);
  
  // Fetch grade levels for selected school
  const fetchGradeLevels = useCallback(async () => {
    if (!isAuthenticated || !selectedSchool) return;
    
    setGradeLevelsLoading(true);
    setGeneralError(null);
    
    try {
      const data = await api.getGradeLevels(selectedSchool.id);
      setGradeLevels(data);
      
      // Reset selected grade level if not in the list
      if (selectedGradeLevel && !data.find(g => g.id === selectedGradeLevel.id)) {
        setSelectedGradeLevel(data.length > 0 ? data[0] : null);
      }
    } catch (err) {
      console.error('Error fetching grade levels:', err);
      setGeneralError('Failed to fetch grade levels');
    } finally {
      setGradeLevelsLoading(false);
    }
  }, [isAuthenticated, selectedSchool, selectedGradeLevel]);
  
  // Fetch teachers for selected school and grade
  const fetchTeachers = useCallback(async () => {
    if (!isAuthenticated || !selectedSchool) return;
    
    setTeachersLoading(true);
    setTeachersError(null);
    
    try {
      const data = await api.getTeachers(
        selectedSchool.id, 
        selectedGradeLevel ? selectedGradeLevel.code : null
      );
      setTeachers(data);
    } catch (err) {
      console.error('Error fetching teachers:', err);
      setTeachersError('Failed to fetch teachers');
    } finally {
      setTeachersLoading(false);
    }
  }, [isAuthenticated, selectedSchool, selectedGradeLevel]);
  
  // Fetch students with filters
  const fetchStudents = useCallback(async (filters = {}) => {
    if (!isAuthenticated) return;
    
    setStudentsLoading(true);
    setStudentsError(null);
    
    // Apply default filters based on context
    const defaultFilters = {
      schoolId: selectedSchool ? selectedSchool.id : null,
      gradeLevel: selectedGradeLevel ? selectedGradeLevel.code : null,
      ...filters
    };
    
    try {
      const data = await api.getStudents(defaultFilters);
      setStudents(data);
    } catch (err) {
      console.error('Error fetching students:', err);
      setStudentsError('Failed to fetch students');
    } finally {
      setStudentsLoading(false);
    }
  }, [isAuthenticated, selectedSchool, selectedGradeLevel]);
  
  // Fetch class lists with filters
  const fetchClassLists = useCallback(async (filters = {}) => {
    if (!isAuthenticated) return;
    
    setClassListsLoading(true);
    setClassListsError(null);
    
    // Apply default filters based on context
    const defaultFilters = {
      schoolId: selectedSchool ? selectedSchool.id : null,
      gradeLevel: selectedGradeLevel ? selectedGradeLevel.code : null,
      ...filters
    };
    
    try {
      const data = await api.getClassLists(defaultFilters);
      setClassLists(data);
      
      // Reset selected class list if not in the list
      if (selectedClassList && !data.find(cl => cl.id === selectedClassList.id)) {
        setSelectedClassList(data.length > 0 ? data[0] : null);
      }
    } catch (err) {
      console.error('Error fetching class lists:', err);
      setClassListsError('Failed to fetch class lists');
    } finally {
      setClassListsLoading(false);
    }
  }, [isAuthenticated, selectedSchool, selectedGradeLevel, selectedClassList]);
  
  // Fetch classes for a class list
  const fetchClassListDetails = useCallback(async (classListId = null) => {
    if (!isAuthenticated) return;
    
    const targetClassListId = classListId || (selectedClassList ? selectedClassList.id : null);
    if (!targetClassListId) return;
    
    setClassesLoading(true);
    setGeneralError(null);
    
    try {
      const data = await api.getClassListDetails(targetClassListId);
      
      if (data) {
        // Update the selected class list with full details
        setSelectedClassList(data);
        
        // Set classes from the details
        setClasses(data.classes || []);
      }
    } catch (err) {
      console.error('Error fetching class list details:', err);
      setGeneralError('Failed to fetch class list details');
    } finally {
      setClassesLoading(false);
    }
  }, [isAuthenticated, selectedClassList]);
  
  // Update class students (for drag and drop)
  const updateClassStudents = useCallback(async (classId, studentIds) => {
    if (!isAuthenticated || !classId || !Array.isArray(studentIds)) return;
    
    setClassListsGeneralLoading(true);
    setClassListsError(null);
    
    try {
      const result = await api.updateClassStudents(classId, studentIds);
      
      if (result && result.success) {
        // Refresh class list details to get updated data
        await fetchClassListDetails();
      }
      
      return result;
    } catch (err) {
      console.error('Error updating class students:', err);
      setClassListsError('Failed to update class');
      return { success: false, error: err.message };
    } finally {
      setClassListsGeneralLoading(false);
    }
  }, [isAuthenticated, fetchClassListDetails]);
  
  // Create a new class
  const createClass = useCallback(async (classData) => {
    if (!isAuthenticated || !classData) return;
    
    setClassListsGeneralLoading(true);
    setGeneralError(null);
    
    try {
      const result = await api.createClass(classData);
      
      if (result && result.success) {
        // Refresh class list details to get updated data
        await fetchClassListDetails();
      }
      
      return result;
    } catch (err) {
      console.error('Error creating class:', err);
      setGeneralError('Failed to create class');
      return { success: false, error: err.message };
    } finally {
      setClassListsGeneralLoading(false);
    }
  }, [isAuthenticated, fetchClassListDetails]);
  
  // Import students
  const importStudents = useCallback(async (students, gradeLevel, schoolId = null) => {
    if (!isAuthenticated || !students || !gradeLevel) return;
    
    const targetSchoolId = schoolId || (selectedSchool ? selectedSchool.id : null);
    if (!targetSchoolId) return;
    
    setStudentsGeneralLoading(true);
    setGeneralError(null);
    
    try {
      const result = await api.importStudents(students, gradeLevel, targetSchoolId);
      
      if (result && result.success) {
        // Refresh students to get updated data
        await fetchStudents();
      }
      
      return result;
    } catch (err) {
      console.error('Error importing students:', err);
      setGeneralError('Failed to import students');
      return { success: false, error: err.message };
    } finally {
      setStudentsGeneralLoading(false);
    }
  }, [isAuthenticated, selectedSchool, fetchStudents]);
  
  // Optimize classes
  const optimizeClasses = useCallback(async (classListId, factors) => {
    if (!isAuthenticated) return;
    
    const targetClassListId = classListId || (selectedClassList ? selectedClassList.id : null);
    if (!targetClassListId) return;
    
    setClassListsGeneralLoading(true);
    setGeneralError(null);
    
    try {
      const result = await api.optimizeClasses(targetClassListId, factors);
      
      if (result && result.success) {
        // Refresh class list details to get updated data
        await fetchClassListDetails();
      }
      
      return result;
    } catch (err) {
      console.error('Error optimizing classes:', err);
      setGeneralError('Failed to optimize classes');
      return { success: false, error: err.message };
    } finally {
      setClassListsGeneralLoading(false);
    }
  }, [isAuthenticated, selectedClassList, fetchClassListDetails]);
  
  // Fetch teacher surveys with filters
  const fetchTeacherSurveys = useCallback(async (filters = {}) => {
    if (!isAuthenticated) return;
    
    setTeacherSurveysLoading(true);
    setGeneralError(null);
    
    // Apply default filters based on context
    const defaultFilters = {
      schoolId: selectedSchool ? selectedSchool.id : null,
      gradeLevel: selectedGradeLevel ? selectedGradeLevel.code : null,
      ...filters
    };
    
    try {
      const data = await api.getTeacherSurveys(defaultFilters);
      setTeacherSurveys(data);
    } catch (err) {
      console.error('Error fetching teacher surveys:', err);
      setGeneralError('Failed to fetch teacher surveys');
    } finally {
      setTeacherSurveysLoading(false);
    }
  }, [isAuthenticated, selectedSchool, selectedGradeLevel]);
  
  // Create teacher survey
  const createTeacherSurvey = useCallback(async (surveyData) => {
    if (!isAuthenticated) return;
    
    setTeacherSurveysGeneralLoading(true);
    setGeneralError(null);
    
    try {
      const result = await api.createTeacherSurvey(surveyData);
      
      if (result && result.success) {
        await fetchTeacherSurveys();
      }
      
      return result;
    } catch (err) {
      console.error('Error creating teacher survey:', err);
      setGeneralError('Failed to create teacher survey');
      return { success: false, error: err.message };
    } finally {
      setTeacherSurveysGeneralLoading(false);
    }
  }, [isAuthenticated, fetchTeacherSurveys]);
  
  // Fetch parent requests with filters
  const fetchParentRequests = useCallback(async (filters = {}) => {
    if (!isAuthenticated) return;
    
    setParentRequestsLoading(true);
    setGeneralError(null);
    
    // Apply default filters based on context
    const defaultFilters = {
      schoolId: selectedSchool ? selectedSchool.id : null,
      gradeLevel: selectedGradeLevel ? selectedGradeLevel.code : null,
      ...filters
    };
    
    try {
      const data = await api.getParentRequests(defaultFilters);
      setParentRequests(data);
    } catch (err) {
      console.error('Error fetching parent requests:', err);
      setGeneralError('Failed to fetch parent requests');
    } finally {
      setParentRequestsLoading(false);
    }
  }, [isAuthenticated, selectedSchool, selectedGradeLevel]);
  
  // Create parent request
  const createParentRequest = useCallback(async (requestData) => {
    if (!isAuthenticated) return;
    
    setParentRequestsGeneralLoading(true);
    setGeneralError(null);
    
    try {
      const result = await api.createParentRequest(requestData);
      
      if (result && result.success) {
        await fetchParentRequests();
      }
      
      return result;
    } catch (err) {
      console.error('Error creating parent request:', err);
      setGeneralError('Failed to create parent request');
      return { success: false, error: err.message };
    } finally {
      setParentRequestsGeneralLoading(false);
    }
  }, [isAuthenticated, fetchParentRequests]);
  
  // Update parent request
  const updateParentRequest = useCallback(async (requestId, requestData) => {
    if (!isAuthenticated || !requestId) return;
    
    setParentRequestsGeneralLoading(true);
    setGeneralError(null);
    
    try {
      const result = await api.updateParentRequest(requestId, requestData);
      
      if (result && result.success) {
        await fetchParentRequests();
      }
      
      return result;
    } catch (err) {
      console.error('Error updating parent request:', err);
      setGeneralError('Failed to update parent request');
      return { success: false, error: err.message };
    } finally {
      setParentRequestsGeneralLoading(false);
    }
  }, [isAuthenticated, fetchParentRequests]);
  
  // Delete parent request
  const deleteParentRequest = useCallback(async (requestId) => {
    if (!isAuthenticated || !requestId) return;
    
    setParentRequestsGeneralLoading(true);
    setGeneralError(null);
    
    try {
      const result = await api.deleteParentRequest(requestId);
      
      if (result && result.success) {
        await fetchParentRequests();
      }
      
      return result;
    } catch (err) {
      console.error('Error deleting parent request:', err);
      setGeneralError('Failed to delete parent request');
      return { success: false, error: err.message };
    } finally {
      setParentRequestsGeneralLoading(false);
    }
  }, [isAuthenticated, fetchParentRequests]);
  
  // Get class balance report
  const getClassBalanceReport = useCallback(async (classListId) => {
    if (!isAuthenticated || !classListId) return;
    
    setReportsLoading(true);
    setGeneralError(null);
    
    try {
      const data = await api.getClassBalanceReport(classListId);
      setClassBalanceReport(data);
      return data;
    } catch (err) {
      console.error('Error fetching class balance report:', err);
      setGeneralError('Failed to fetch class balance report');
      return null;
    } finally {
      setReportsLoading(false);
    }
  }, [isAuthenticated]);
  
  // Get request statistics
  const getRequestStatistics = useCallback(async (academicYear = null) => {
    if (!isAuthenticated || !selectedSchool) return;
    
    setReportsLoading(true);
    setGeneralError(null);
    
    try {
      const data = await api.getRequestStatistics(selectedSchool.id, academicYear);
      setRequestStatistics(data);
      return data;
    } catch (err) {
      console.error('Error fetching request statistics:', err);
      setGeneralError('Failed to fetch request statistics');
      return null;
    } finally {
      setReportsLoading(false);
    }
  }, [isAuthenticated, selectedSchool]);
  
  // Fetch users with optional filters
  const fetchUsers = useCallback(async (filters = {}) => {
    if (!isAuthenticated) return;
    
    setUsersLoading(true);
    
    try {
      const result = await api.getUsers(filters);
      setUsers(result || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setGeneralError('Failed to fetch users');
    } finally {
      setUsersLoading(false);
    }
  }, [isAuthenticated, setGeneralError]);

  // Create a new user
  const createUser = useCallback(async (userData) => {
    if (!isAuthenticated) return null;
    
    try {
      const result = await api.createUser(userData);
      
      if (result && result.success) {
        // Refresh users list
        fetchUsers();
        return result;
      } else {
        setGeneralError(result?.message || 'Failed to create user');
        return result;
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setGeneralError('An error occurred while creating the user');
      return { success: false, message: error.message };
    }
  }, [isAuthenticated, fetchUsers, setGeneralError]);

  // Update a user
  const updateUser = useCallback(async (userId, userData) => {
    if (!isAuthenticated) return null;
    
    try {
      const result = await api.updateUser(userId, userData);
      
      if (result && result.success) {
        // Refresh users list
        fetchUsers();
        return result;
      } else {
        setGeneralError(result?.message || 'Failed to update user');
        return result;
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setGeneralError('An error occurred while updating the user');
      return { success: false, message: error.message };
    }
  }, [isAuthenticated, fetchUsers, setGeneralError]);

  // Delete a user
  const deleteUser = useCallback(async (userId) => {
    if (!isAuthenticated) return null;
    
    try {
      const result = await api.deleteUser(userId);
      
      if (result && result.success) {
        // Refresh users list
        fetchUsers();
        return result;
      } else {
        setGeneralError(result?.message || 'Failed to delete user');
        return result;
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setGeneralError('An error occurred while deleting the user');
      return { success: false, message: error.message };
    }
  }, [isAuthenticated, fetchUsers, setGeneralError]);

  // Invite a user
  const inviteUser = useCallback(async (inviteData) => {
    if (!isAuthenticated) return null;
    
    try {
      const result = await api.inviteUser(inviteData);
      return result;
    } catch (error) {
      console.error('Error inviting user:', error);
      setGeneralError('An error occurred while sending the invitation');
      return { success: false, message: error.message };
    }
  }, [isAuthenticated, setGeneralError]);
  
  // Fetch districts
  const fetchDistricts = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setDistrictsGeneralLoading(true);
    setDistrictsError(null);
    
    try {
      const result = await api.getDistricts();
      if (result) {
        setDistricts(result);
      }
    } catch (err) {
      console.error("Error fetching districts:", err);
      setDistrictsError("Failed to load districts");
    } finally {
      setDistrictsGeneralLoading(false);
    }
  }, [isAuthenticated]);
  
  // Effects to load initial data
  
  // Fetch schools when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchSchools();
    }
  }, [isAuthenticated, fetchSchools]);
  
  // Fetch grade levels when school changes
  useEffect(() => {
    if (selectedSchool) {
      fetchGradeLevels();
    }
  }, [selectedSchool, fetchGradeLevels]);
  
  // Fetch teachers when school or grade level changes
  useEffect(() => {
    if (selectedSchool) {
      fetchTeachers();
    }
  }, [selectedSchool, selectedGradeLevel, fetchTeachers]);
  
  // Fetch class lists when school or grade level changes
  useEffect(() => {
    if (selectedSchool) {
      fetchClassLists();
    }
  }, [selectedSchool, selectedGradeLevel, fetchClassLists]);
  
  // Fetch parent requests when school or grade level changes
  useEffect(() => {
    if (selectedSchool) {
      fetchParentRequests();
    }
  }, [selectedSchool, selectedGradeLevel, fetchParentRequests]);
  
  // Fetch districts
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchDistricts();
    }
  }, [isAuthenticated, user, fetchDistricts]);
  
  // Reset state when authentication changes
  useEffect(() => {
    if (!isAuthenticated) {
      setSchools([]);
      setSelectedSchool(null);
      setGradeLevels([]);
      setSelectedGradeLevel(null);
      setTeachers([]);
      setStudents([]);
      setClassLists([]);
      setSelectedClassList(null);
      setClasses([]);
      setTeacherSurveys([]);
      setParentRequests([]);
      setClassBalanceReport(null);
      setRequestStatistics(null);
      setUsers([]);
      setDistricts([]);
    }
  }, [isAuthenticated]);
  
  // Context value
  const value = {
    // Data
    schools,
    selectedSchool,
    gradeLevels,
    selectedGradeLevel,
    teachers,
    students,
    classLists,
    selectedClassList,
    classes,
    teacherSurveys,
    parentRequests,
    classBalanceReport,
    requestStatistics,
    
    // Loading states 
    isLoading: schoolsLoading || gradeLevelsLoading || teachersLoading || 
             studentsLoading || classListsLoading || classesLoading || teacherSurveysLoading ||
             parentRequestsLoading || reportsLoading ||
             studentsGeneralLoading || teachersGeneralLoading ||
             classListsGeneralLoading || classRoomsGeneralLoading ||
             parentRequestsGeneralLoading || teacherSurveysGeneralLoading ||
             districtsGeneralLoading,
    schoolsLoading,
    gradeLevelsLoading,
    teachersLoading,
    studentsLoading,
    classListsLoading,
    classesLoading,
    teacherSurveysLoading,
    parentRequestsLoading,
    reportsLoading,
    studentsGeneralLoading,
    teachersGeneralLoading,
    classListsGeneralLoading,
    classRoomsGeneralLoading,
    parentRequestsGeneralLoading,
    teacherSurveysGeneralLoading,
    districtsGeneralLoading,
    
    // Error states
    error: generalError,
    studentsError,
    teachersError,
    classListsError,
    classRoomsError,
    parentRequestsError,
    teacherSurveysError,
    districtsError,
    
    // Setters
    setSelectedSchool,
    setSelectedGradeLevel,
    setSelectedClassList,
    
    // Data methods
    fetchSchools,
    fetchGradeLevels,
    fetchTeachers,
    fetchStudents,
    fetchClassLists,
    fetchClassListDetails,
    updateClassStudents,
    createClass,
    importStudents,
    optimizeClasses,
    fetchTeacherSurveys,
    createTeacherSurvey,
    fetchParentRequests,
    createParentRequest,
    updateParentRequest,
    deleteParentRequest,
    getClassBalanceReport,
    getRequestStatistics,
    
    // Utility to clear errors
    clearError: () => {
      setGeneralError(null);
      setStudentsError(null);
      setTeachersError(null);
      setClassListsError(null);
      setClassRoomsError(null);
      setParentRequestsError(null);
      setTeacherSurveysError(null);
      setDistrictsError(null);
    },
    
    // User Management
    users,
    usersLoading,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    inviteUser,
    
    // New states and methods
    districts,
    fetchDistricts,
  };
  
  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export default DataContext; 