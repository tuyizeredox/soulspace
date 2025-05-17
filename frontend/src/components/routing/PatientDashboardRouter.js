import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, CircularProgress, Typography } from '@mui/material';
import axios from '../../utils/axiosConfig';
import PatientWithHospitalDashboard from '../../pages/patient/PatientWithHospitalDashboard';
import PatientDashboard from '../../pages/patient/PatientDashboard';

const PatientDashboardRouter = () => {
  const navigate = useNavigate();

  // Get user data from Redux store
  const { user: oldAuthUser, token: oldToken } = useSelector((state) => state.auth);
  const { user: userAuthUser, token: newToken } = useSelector((state) => state.userAuth);

  // Use either auth system, preferring the new one
  const user = userAuthUser || oldAuthUser;
  const token = newToken || oldToken;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [patientAssignment, setPatientAssignment] = useState(null);
  const [hasOnlineAppointment, setHasOnlineAppointment] = useState(false);

  // Force flag for development/testing - set to true to always show hospital dashboard
  const forceHospitalDashboard = true;

  useEffect(() => {
    const checkPatientStatus = async () => {
      if (!user || !token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      try {
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

        // Try to check if patient has a hospital assignment
        try {
          const assignmentResponse = await axios.get('/api/patient-assignments/my-assignment', config);

          // Log the full response for debugging
          console.log('PatientDashboardRouter: Raw assignment response:', JSON.stringify(assignmentResponse.data));
          console.log('PatientDashboardRouter: Assignment data received:', assignmentResponse.data);
          console.log('PatientDashboardRouter: Has assigned property?', assignmentResponse.data?.assigned);
          console.log('PatientDashboardRouter: Has primaryDoctor?', !!assignmentResponse.data?.primaryDoctor);
          console.log('PatientDashboardRouter: Has hospital?', !!assignmentResponse.data?.hospital);

          // The API doesn't return an 'assigned' property, it returns the full assignment object
          // If we got a response, it means the patient has an assignment
          if (assignmentResponse.data) {
            console.log('PatientDashboardRouter: Assignment found:', assignmentResponse.data);

            // Check if the response has the required data
            if (assignmentResponse.data.primaryDoctor && assignmentResponse.data.hospital) {
              // Add an assigned property for consistency with our code
              const enhancedAssignment = {
                ...assignmentResponse.data,
                assigned: true
              };
              setPatientAssignment(enhancedAssignment);
              console.log('PatientDashboardRouter: Enhanced assignment:', enhancedAssignment);
            } else {
              console.warn('PatientDashboardRouter: Assignment missing primaryDoctor or hospital');
              setPatientAssignment(null);
            }
          } else {
            console.log('PatientDashboardRouter: No assignment found');
            setPatientAssignment(null);
          }
        } catch (error) {
          console.log('API endpoint for patient assignment not available, using mock data');
          // For testing, we'll set a mock assignment
          // In a real app, you might want to check localStorage or other sources

          // Randomly decide if the patient has an assignment (for demo purposes)
          const hasAssignment = Math.random() > 0.5;

          if (hasAssignment) {
            // Create mock data that matches the expected format
            setPatientAssignment({
              _id: 'pa1',
              assigned: true,
              patientId: user?._id || 'p1',
              primaryDoctor: {
                _id: 'd1',
                name: 'Dr. Jane Smith',
                profile: {
                  specialization: 'Cardiologist'
                },
                email: 'jane.smith@hospital.com'
              },
              hospital: {
                _id: 'h1',
                name: 'City General Hospital',
                address: '123 Medical Center Blvd, City, State',
                phone: '+1 (555) 987-6543',
                email: 'info@citygeneral.com'
              },
              assignmentDate: new Date().toISOString(),
              status: 'active'
            });
            console.log('PatientDashboardRouter: Using mock assignment data');
          } else {
            setPatientAssignment(null);
            console.log('PatientDashboardRouter: No mock assignment data');
          }
        }

        // Try to check if patient has any confirmed online appointments
        try {
          const appointmentsResponse = await axios.get('/api/appointments/my-appointments', config);
          if (appointmentsResponse.data && appointmentsResponse.data.length > 0) {
            const onlineAppointments = appointmentsResponse.data.filter(
              apt => apt.type === 'online' && apt.status === 'confirmed'
            );
            setHasOnlineAppointment(onlineAppointments.length > 0);
          }
        } catch (error) {
          console.log('API endpoint for patient appointments not available, using mock data');
          // For testing, we'll randomly set if the patient has an online appointment
          const hasOnlineAppt = Math.random() > 0.5;
          setHasOnlineAppointment(hasOnlineAppt);
        }
      } catch (error) {
        console.error('Error in patient dashboard router:', error);
        // Don't show error to user, just use default values
        setError('');
        setPatientAssignment(null);
        setHasOnlineAppointment(false);
      } finally {
        setLoading(false);
      }
    };

    checkPatientStatus();
  }, [user, token]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  // Routing logic:
  // 1. If patient has a hospital assignment OR has an online appointment OR forceHospitalDashboard is true,
  //    show PatientWithHospitalDashboard
  // 2. Otherwise, show regular PatientDashboard

  // Check if the patient has a valid assignment with doctor and hospital
  if ((patientAssignment && patientAssignment.primaryDoctor && patientAssignment.hospital) || forceHospitalDashboard) {
    console.log('PatientDashboardRouter: Showing PatientWithHospitalDashboard');

    // Use real data if available, otherwise use mock data
    const doctor = (patientAssignment && patientAssignment.primaryDoctor) || {
      _id: 'force-doctor-id',
      name: 'Dr. John Doe',
      profile: {
        specialization: 'General Practitioner'
      },
      email: 'john.doe@hospital.com'
    };

    const hospitalData = (patientAssignment && patientAssignment.hospital) || {
      _id: 'force-hospital-id',
      name: 'SoulSpace Medical Center',
      address: '456 Health Avenue, Medical District',
      phone: '+1 (555) 123-4567',
      email: 'info@soulspace.com'
    };

    return <PatientWithHospitalDashboard
      assignedDoctor={doctor}
      hospital={hospitalData}
    />;
  } else if (hasOnlineAppointment) {
    console.log('PatientDashboardRouter: Showing PatientWithHospitalDashboard due to online appointment');
    // Create mock data for online appointment case if we don't have real data
    const mockDoctor = {
      _id: 'online-d1',
      name: 'Dr. Online Consultation',
      profile: {
        specialization: 'Telemedicine'
      },
      email: 'telemedicine@hospital.com'
    };

    const mockHospital = {
      _id: 'online-h1',
      name: 'Virtual Care Center',
      address: 'Online',
      phone: '+1 (555) 123-4567',
      email: 'virtualcare@hospital.com'
    };

    return <PatientWithHospitalDashboard
      assignedDoctor={mockDoctor}
      hospital={mockHospital}
    />;
  } else {
    console.log('PatientDashboardRouter: Showing regular PatientDashboard');
    return <PatientDashboard />;
  }
};

export default PatientDashboardRouter;
