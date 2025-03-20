import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Layouts
import Layout from './components/layout/Layout';
import ParentLayout from './components/parent/ParentLayout';
import TeacherLayout from './components/teacher/TeacherLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ClassLists from './pages/ClassLists';
import StudentImport from './pages/StudentImport';
import TeacherSurveys from './pages/TeacherSurveys';
import ParentRequests from './pages/ParentRequests';
import Reports from './pages/Reports';
import UsersManagement from './pages/UsersManagement';
import SchoolsManagement from './pages/SchoolsManagement';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Students from './pages/Students';
import AdminPlacementRequests from './pages/AdminPlacementRequests';
import DataImport from './pages/admin/DataImport';
import ClassOptimization from './pages/admin/ClassOptimization';
import Analytics from './pages/admin/Analytics';
import Integrations from './pages/admin/Integrations';
import PredictiveAnalytics from './pages/admin/PredictiveAnalytics';
import MultiYearAnalytics from './pages/admin/MultiYearAnalytics';
import StudentDetail from './pages/StudentDetail';
import Signup from './pages/Signup';
import LandingPage from './pages/LandingPage';
import { RequireAuth } from './components/RequireAuth';

// Parent portal pages
import ParentLogin from './pages/parent/Login';
import ParentRegister from './pages/parent/Register';
import ParentDashboard from './pages/parent/Dashboard';
import ParentProfile from './pages/parent/Profile';
import RequestsList from './pages/parent/RequestsList';
import RequestForm from './pages/parent/RequestForm';
import RequestDetails from './pages/parent/RequestDetails';
import StudentDetails from './pages/parent/StudentDetails';
import StudentsList from './pages/parent/StudentsList';
import ForgotPassword from './pages/parent/ForgotPassword';
import ResetPassword from './pages/parent/ResetPassword';
import VerifyEmail from './pages/parent/VerifyEmail';
import SchoolInfo from './pages/parent/SchoolInfo';
import CreateRequest from './pages/parent/CreateRequest';
import PlacementRequests from './pages/parent/PlacementRequests';
import PlacementRequestsEnhanced from './pages/parent/PlacementRequestsEnhanced';

// Teacher portal pages
import TeacherLogin from './pages/teacher/Login';
import TeacherDashboard from './pages/teacher/Dashboard';
import StudentSurveys from './pages/teacher/StudentSurveys';
import SurveyForm from './pages/teacher/SurveyForm';
import TeacherCollaboration from './pages/teacher/Collaboration';
import TeacherSchoolInfo from './pages/teacher/SchoolInfo';
import TeacherStudents from './pages/teacher/Students';
import ClassDetails from './pages/teacher/ClassDetails';
import TeacherSurveyForm from './pages/teacher/SurveyForm';
import LearningPlansList from './pages/teacher/learning-plans/LearningPlansList';

// Contexts
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { useParentAuth, ParentAuthProvider } from './contexts/ParentAuthContext';
import { ParentNotificationProvider } from './contexts/ParentNotificationContext';

// Error Boundary Component 
import ErrorBoundary from './components/ErrorBoundary';

// Define the theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

// Admin routes
const AdminRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

// Parent routes
const ParentRoute = ({ children }) => {
  const { isAuthenticated } = useParentAuth();
  return isAuthenticated() ? children : <Navigate to="/parent/login" />;
};

// Teacher routes
const TeacherRoute = ({ children }) => {
  const { isAuthenticated } = useAuth(); // For now, using the same auth context
  return isAuthenticated() ? children : <Navigate to="/teacher/login" />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <DataProvider>
          <NotificationProvider>
            <ParentAuthProvider>
              <ParentNotificationProvider>
                <ErrorBoundary>
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    
                    {/* Protected routes */}
                    <Route path="/dashboard" element={
                      <RequireAuth>
                        <Dashboard />
                      </RequireAuth>
                    } />
                    <Route path="/students" element={
                      <RequireAuth>
                        <Students />
                      </RequireAuth>
                    } />
                    <Route path="/students/:studentId" element={
                      <RequireAuth>
                        <StudentDetail />
                      </RequireAuth>
                    } />
                    <Route path="/admin/class-optimization" element={
                      <RequireAuth>
                        <ClassOptimization />
                      </RequireAuth>
                    } />
                    <Route path="/admin/analytics" element={
                      <RequireAuth>
                        <Analytics />
                      </RequireAuth>
                    } />
                    <Route path="/admin/multi-year-analytics" element={
                      <RequireAuth>
                        <MultiYearAnalytics />
                      </RequireAuth>
                    } />
                    <Route path="/admin/predictive-analytics" element={
                      <RequireAuth>
                        <PredictiveAnalytics />
                      </RequireAuth>
                    } />
                    <Route path="/admin/data-import" element={
                      <RequireAuth>
                        <DataImport />
                      </RequireAuth>
                    } />
                    <Route path="/admin/integrations" element={
                      <RequireAuth>
                        <Integrations />
                      </RequireAuth>
                    } />
                  </Routes>
                </ErrorBoundary>
              </ParentNotificationProvider>
            </ParentAuthProvider>
          </NotificationProvider>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;