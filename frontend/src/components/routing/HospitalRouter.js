import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, Alert } from '@mui/material';

/**
 * Hospital Router Component
 * 
 * Handles all hospital administration routes including:
 * - /hospital/staff - Uses new EnhancedStaffManagement component
 * - /hospital/nurses - Uses existing Nurses page component  
 * - /hospital/chat - Uses existing HospitalChatPage component
 * - /hospital/analytics - Uses existing HospitalAnalytics component
 * - /hospital/staff-analytics - Uses new StaffAnalytics component
 * 
 * All routes require hospital_admin role access.
 */

// Import hospital management components
import { 
  PatientManagement, 
  DoctorManagement, 
  AppointmentManagement,
  NurseManagement,
  StaffManagement,
  StaffAnalytics
} from '../hospital/modern';

import HospitalAdminDashboard from '../hospital/HospitalAdminDashboard';
import HospitalChatPage from '../../pages/hospital/HospitalChatPage';
import HospitalAnalytics from '../../pages/hospital/HospitalAnalytics';
import Nurses from '../../pages/hospital/Nurses';
import Pharmacists from '../../pages/hospital/Pharmacists';
import Staff from '../../pages/hospital/Staff';
import StaffDetail from '../../pages/hospital/StaffDetail';
import PatientAssignments from '../../pages/hospital/PatientAssignments';

const HospitalRouter = () => {
  const { user } = useSelector((state) => state.userAuth);

  // Check if user has hospital admin access
  if (!user || user.role !== 'hospital_admin') {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Access denied. You need hospital administrator privileges to access this section.
        </Alert>
      </Box>
    );
  }

  return (
    <Routes>
      {/* Default hospital route - redirect to dashboard */}
      <Route path="/" element={<Navigate to="/hospital/dashboard" replace />} />
      
      {/* Hospital Admin Dashboard */}
      <Route path="/dashboard" element={<HospitalAdminDashboard />} />
      
      {/* Hospital Management Routes */}
      <Route path="/patients" element={<PatientManagement />} />
      <Route path="/doctors" element={<DoctorManagement />} />
      <Route path="/appointments" element={<AppointmentManagement />} />
      
      {/* Staff Management - Using new enhanced component */}
      <Route path="/staff" element={<StaffManagement />} />
      <Route path="/staff/:id" element={<StaffDetail />} />
      
      {/* Specialized Staff Routes */}
      <Route path="/nurses" element={<Nurses />} />
      <Route path="/pharmacists" element={<Pharmacists />} />
      
      {/* Analytics and Reports */}
      <Route path="/analytics" element={<HospitalAnalytics />} />
      <Route path="/staff-analytics" element={<StaffAnalytics />} />
      
      {/* Patient Assignments */}
      <Route path="/assignments" element={<PatientAssignments />} />
      
      {/* Additional routes can be added here */}
      <Route path="/inventory" element={
        <Box sx={{ p: 3 }}>
          <Alert severity="info">Inventory management coming soon...</Alert>
        </Box>
      } />
      
      <Route path="/billing" element={
        <Box sx={{ p: 3 }}>
          <Alert severity="info">Billing management coming soon...</Alert>
        </Box>
      } />
      
      <Route path="/chat" element={<HospitalChatPage />} />
      
      <Route path="/notifications" element={
        <Box sx={{ p: 3 }}>
          <Alert severity="info">Notifications system coming soon...</Alert>
        </Box>
      } />
      
      <Route path="/help" element={
        <Box sx={{ p: 3 }}>
          <Alert severity="info">Help & Support coming soon...</Alert>
        </Box>
      } />
      
      <Route path="/settings" element={
        <Box sx={{ p: 3 }}>
          <Alert severity="info">Hospital settings coming soon...</Alert>
        </Box>
      } />
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/hospital/dashboard" replace />} />
    </Routes>
  );
};

export default HospitalRouter;