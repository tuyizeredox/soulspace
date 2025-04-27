import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Box } from '@mui/material';
import { ThemeProviderWrapper } from './theme/ThemeContext';
import { checkAuthStatus } from './store/slices/authSlice';
import { setAuthState } from './store/slices/userAuthSlice';
import axios from './utils/axiosConfig';
import useResizeObserverErrorHandler from './hooks/useResizeObserverErrorHandler';
import TestApi from './components/TestApi';
import LoginTest from './components/auth/LoginTest';
import Layout from './components/layout/Layout';
import HomeNavbar from './components/home/HomeNavbar';
import { PostProvider } from './context/PostContext';
import { ChatProvider } from './contexts/ChatContext';
import { AuthProvider } from './contexts/AuthContext';

// Auth Pages
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import NewLogin from './components/auth/NewLogin';

// Main Pages
import Home from './pages/home/Home';
import Dashboard from './pages/dashboard/Dashboard';
import Patients from './pages/patients/Patients';
import Appointments from './pages/appointments/Appointments';
import Monitoring from './pages/monitoring/DeviceMonitoring';
import HealthMonitoring from './pages/monitoring/HealthMonitoring';
import VirtualConsultations from './pages/appointments/VirtualConsultations';
import BookAppointment from './pages/appointments/BookAppointment';
import Prescriptions from './pages/prescriptions/Prescriptions';
import Profile from './pages/profile/Profile';
import Settings from './pages/settings/Settings';
import NotificationsPage from './pages/notifications/NotificationsPage';
import About from './pages/about/About';
import Blog from './pages/blog/Blog';
import Contact from './pages/contact/Contact';
import HelpCenter from './pages/help/HelpCenter';
import CommunityForum from './pages/community/CommunityForum';
import CommunityPost from './pages/community/CommunityPost';
import CommunityGuidelines from './pages/community/CommunityGuidelines';
import CreatePost from './pages/community/CreatePost';
import UserGuides from './pages/resources/UserGuides';
import VideoTutorials from './pages/resources/VideoTutorials';
import VideoTutorialDetail from './pages/resources/VideoTutorialDetail';
import KnowledgeBase from './pages/resources/KnowledgeBase';
import KnowledgeBaseArticle from './pages/resources/KnowledgeBaseArticle';

// Components
import PrivateRoute from './components/auth/PrivateRoute';
import SuperAdminDashboard from './pages/admin/SuperAdminDashboard';
import HospitalRegistrationForm from './pages/admin/HospitalRegistrationForm';
import Hospitals from './pages/admin/Hospitals';
import Users from './pages/admin/Users';

// SuperAdmin Pages
import Security from './pages/admin/Security';
import Roles from './pages/admin/Roles';
import Organizations from './pages/admin/Organizations';
import Compliance from './pages/admin/Compliance';
import Admins from './pages/admin/Admins';
import Analytics from './pages/admin/Analytics';
import Performance from './pages/admin/Performance';
import UserActivity from './pages/admin/UserActivity';
import Trends from './pages/admin/Trends';
import DatabaseManagement from './pages/admin/DatabaseManagement';
import ChatPage from './pages/admin/ChatPage';

// Add Hospital Admin Routes
import HospitalAdminDashboard from './pages/hospital/HospitalAdminDashboard';
import HospitalPatients from './pages/hospital/Patients';
import HospitalDoctors from './pages/hospital/Doctors';
import HospitalPharmacists from './pages/hospital/Pharmacists';
import HospitalAppointments from './pages/hospital/Appointments';
import PatientAssignments from './pages/hospital/PatientAssignments';
import HospitalChatPage from './pages/hospital/HospitalChatPage';

const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user, token } = useSelector((state) => state.auth);

  // Use the custom hook to handle ResizeObserver errors globally
  useResizeObserverErrorHandler();

  // Initialize auth state from localStorage for the new auth system
  useEffect(() => {
    const userToken = localStorage.getItem('userToken');
    const userData = localStorage.getItem('userData');

    // Also check for token in the old format for backward compatibility
    const oldToken = localStorage.getItem('token');
    const oldUserData = localStorage.getItem('user');

    if (userToken && userData) {
      try {
        const user = JSON.parse(userData);
        console.log('App: Initializing auth state from localStorage (new format)');
        console.log('User role:', user?.role);

        // Set the auth state directly without making an API call
        dispatch(setAuthState({
          isAuthenticated: true,
          user,
          token: userToken
        }));

        // Set the token in axios headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
      }
    }
    // Try the old format if new format is not available
    else if (oldToken && oldUserData) {
      try {
        const user = JSON.parse(oldUserData);
        console.log('App: Initializing auth state from localStorage (old format)');
        console.log('User role:', user?.role);

        // Set the auth state directly without making an API call
        dispatch(setAuthState({
          isAuthenticated: true,
          user,
          token: oldToken
        }));

        // Set the token in axios headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${oldToken}`;
      } catch (error) {
        console.error('Error parsing old user data from localStorage:', error);
      }
    }
  }, [dispatch]);

  // Check authentication status on component mount and when token changes (old auth system)
  useEffect(() => {
    console.log('App: Checking old auth status');
    console.log('Token exists:', !!token, 'User exists:', !!user);

    if (token) {
      // Always check auth status when a token exists
      dispatch(checkAuthStatus());
    }
  }, [dispatch, token]);

  // Create a simple wrapper for PostProvider to handle potential errors
  const SafePostProvider = ({ children }) => {
    try {
      return <PostProvider>{children}</PostProvider>;
    } catch (error) {
      console.error('Error rendering PostProvider:', error);
      return children; // Fallback to rendering without the provider
    }
  };

  return (
    <ThemeProviderWrapper>
      <Router>
        <SafePostProvider>
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={
            isAuthenticated ? (
              user?.role === 'super_admin' ? (
                <Navigate to="/admin/dashboard" replace />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            ) : (
              <>
                <HomeNavbar />
                <Home />
              </>
            )
          } />

          {/* Test Routes */}
          <Route path="/test-api" element={<TestApi />} />
          <Route path="/test-login" element={<LoginTest />} />
          <Route path="/register" element={
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <HomeNavbar />
              <Box sx={{ flex: 1 }}>
                <Register />
              </Box>
            </Box>
          } />
          <Route
            path="/login"
            element={
              !isAuthenticated ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                  <HomeNavbar />
                  <Box sx={{ flex: 1 }}>
                    <NewLogin />
                  </Box>
                </Box>
              ) : user?.role === 'super_admin' ? (
                <Navigate to="/admin/dashboard" replace />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route path="/forgot-password" element={
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <HomeNavbar />
              <Box sx={{ flex: 1 }}>
                <ForgotPassword />
              </Box>
            </Box>
          } />

          {/* Super Admin Routes - Using Layout component */}
          <Route
            path="/admin/*"
            element={
              <PrivateRoute roles={['super_admin']}>
                <AuthProvider>
                  <ChatProvider>
                    <Layout>
                      <Routes>
                        <Route path="dashboard" element={<SuperAdminDashboard />} />
                        <Route path="hospitals/register" element={<HospitalRegistrationForm />} />
                        <Route path="hospitals" element={<Hospitals />} />
                        <Route path="users" element={<Users />} />
                        <Route path="security" element={<Security />} />
                        <Route path="roles" element={<Roles />} />
                        <Route path="organizations" element={<Organizations />} />
                        <Route path="compliance" element={<Compliance />} />
                        <Route path="admins" element={<Admins />} />
                        <Route path="analytics" element={<Analytics />} />
                        <Route path="performance" element={<Performance />} />
                        <Route path="user-activity" element={<UserActivity />} />
                        <Route path="trends" element={<Trends />} />
                        <Route path="database" element={<DatabaseManagement />} />
                        <Route path="chat" element={<ChatPage />} />
                      </Routes>
                    </Layout>
                  </ChatProvider>
                </AuthProvider>
              </PrivateRoute>
            }
          />

          {/* Dashboard Route - Using Layout component */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <AuthProvider>
                  <ChatProvider>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ChatProvider>
                </AuthProvider>
              </PrivateRoute>
            }
          />

          {/* Other Protected Routes - Using Layout component */}
          <Route
            path="/patients"
            element={
              <PrivateRoute roles={['hospital_admin', 'doctor']}>
                <Layout>
                  <Patients />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/appointments"
            element={
              <PrivateRoute>
                <Layout>
                  <Appointments />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/appointments/virtual"
            element={
              <PrivateRoute>
                <Layout>
                  <VirtualConsultations />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/appointments/book"
            element={
              <PrivateRoute>
                <Layout>
                  <BookAppointment />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/monitoring"
            element={
              <PrivateRoute>
                <Layout>
                  <HealthMonitoring />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/monitoring/vitals"
            element={
              <PrivateRoute>
                <Layout>
                  <HealthMonitoring />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/monitoring/device"
            element={
              <PrivateRoute roles={['doctor', 'nurse']}>
                <Layout>
                  <Monitoring />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/prescriptions"
            element={
              <PrivateRoute roles={['doctor', 'pharmacist']}>
                <Layout>
                  <Prescriptions />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Layout>
                  <Profile />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Layout>
                  <Settings />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <PrivateRoute>
                <Layout>
                  <NotificationsPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/help"
            element={
              <PrivateRoute>
                <Layout>
                  <HelpCenter />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/community"
            element={
              <PrivateRoute>
                <Layout>
                  <CommunityForum />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/community/post/:postId"
            element={
              <PrivateRoute>
                <Layout>
                  <CommunityPost />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/community/guidelines"
            element={
              <PrivateRoute>
                <Layout>
                  <CommunityGuidelines />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/community/create-post"
            element={
              <PrivateRoute>
                <Layout>
                  <CreatePost />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/resources/user-guides"
            element={
              <PrivateRoute>
                <Layout>
                  <UserGuides />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/resources/video-tutorials"
            element={
              <PrivateRoute>
                <Layout>
                  <VideoTutorials />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/resources/video-tutorials/:videoId"
            element={
              <PrivateRoute>
                <Layout>
                  <VideoTutorialDetail />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/resources/knowledge-base"
            element={
              <PrivateRoute>
                <Layout>
                  <KnowledgeBase />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/resources/knowledge-base/:articleId"
            element={
              <PrivateRoute>
                <Layout>
                  <KnowledgeBaseArticle />
                </Layout>
              </PrivateRoute>
            }
          />

          {/* Hospital Admin Routes - Using Layout component */}
          <Route
            path="/hospital/*"
            element={
              <PrivateRoute roles={['hospital_admin']}>
                <Layout>
                  <Routes>
                    <Route path="dashboard" element={<HospitalAdminDashboard />} />
                    <Route path="patients" element={<HospitalPatients />} />
                    <Route path="doctors" element={<HospitalDoctors />} />
                    <Route path="pharmacists" element={<HospitalPharmacists />} />
                    <Route path="appointments" element={<HospitalAppointments />} />
                    <Route path="patient-assignments" element={<PatientAssignments />} />
                    <Route path="chat" element={
                      <AuthProvider>
                        <ChatProvider>
                          <HospitalChatPage />
                        </ChatProvider>
                      </AuthProvider>
                    } />
                  </Routes>
                </Layout>
              </PrivateRoute>
            }
          />

          {/* Catch all route - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </SafePostProvider>
      </Router>
    </ThemeProviderWrapper>
  );
};

export default App;
