import React from 'react';
import { Box, Typography, Paper, Alert } from '@mui/material';
import { EnhancedDoctorManagement } from './index';

/**
 * Demo component showing how to use the Enhanced Doctor Management System
 */
const DoctorManagementDemo = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Enhanced Doctor Management System Demo
        </Typography>
        
        <Alert severity="info" sx={{ mb: 2 }}>
          This is a comprehensive doctor management system with advanced scheduling and approval features.
        </Alert>

        <Typography variant="h6" gutterBottom>
          Features Include:
        </Typography>
        
        <Box component="ul" sx={{ mb: 2 }}>
          <li>Complete doctor profile management</li>
          <li>Doctor self-scheduling with admin approval</li>
          <li>Patient-doctor assignment management</li>
          <li>Advanced analytics and reporting</li>
          <li>Schedule approval queue for admins</li>
          <li>Professional credentials tracking</li>
        </Box>

        <Typography variant="h6" gutterBottom>
          How to Use:
        </Typography>
        
        <Box component="ol" sx={{ mb: 3 }}>
          <li><strong>Doctors Tab:</strong> Manage doctor profiles, add new doctors, edit existing ones</li>
          <li><strong>Schedules Tab:</strong> View and manage doctor schedules, create schedule requests</li>
          <li><strong>Approvals Tab:</strong> (Admin only) Approve or reject doctor schedule requests</li>
          <li><strong>Analytics Tab:</strong> View department distribution, experience analytics, and performance metrics</li>
          <li><strong>Assignments Tab:</strong> Manage patient-doctor assignments and track relationships</li>
        </Box>
      </Paper>

      {/* The actual Enhanced Doctor Management component */}
      <EnhancedDoctorManagement />
    </Box>
  );
};

export default DoctorManagementDemo;