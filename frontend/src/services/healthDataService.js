import axios from '../utils/axiosConfig';
import store from '../store';

// Helper function to get the auth token from Redux store
const getAuthToken = () => {
  const state = store.getState();
  // Try to get token from both auth systems, preferring the new one
  const newToken = state.userAuth?.token;
  const oldToken = state.auth?.token;
  return newToken || oldToken;
};

// Fetch user health stats
export const fetchHealthStats = async () => {
  try {
    const token = getAuthToken();
    console.log('Fetching health stats with token:', !!token);

    const config = {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    };

    const response = await axios.get('/api/health/stats', config);
    return response.data;
  } catch (error) {
    console.error('Error fetching health stats:', error);
    // Return default data if API fails
    return {
      steps: { current: 8742, goal: 10000, unit: 'steps', color: '#4caf50' },
      sleep: { current: 7.2, goal: 8, unit: 'hours', color: '#9c27b0' },
      water: { current: 6, goal: 8, unit: 'glasses', color: '#2196f3' },
      heartRate: { current: 72, unit: 'bpm', color: '#f44336' },
    };
  }
};

// Fetch user health recommendations
export const fetchHealthRecommendations = async () => {
  try {
    const token = getAuthToken();
    console.log('Fetching health recommendations with token:', !!token);

    const config = {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    };

    const response = await axios.get('/api/health/recommendations', config);
    return response.data;
  } catch (error) {
    console.error('Error fetching health recommendations:', error);
    // Return default recommendations if API fails
    return [
      { title: 'Managing Stress', path: '/articles/stress-management', icon: 'Psychology' },
      { title: 'Healthy Diet Tips', path: '/articles/diet-tips', icon: 'Restaurant' },
      { title: 'Sleep Improvement', path: '/articles/sleep-tips', icon: 'Bedtime' },
      { title: 'Exercise Routines', path: '/articles/exercise', icon: 'FitnessCenter' },
    ];
  }
};

// Fetch nearby hospitals
export const fetchNearbyHospitals = async () => {
  try {
    const token = getAuthToken();
    console.log('Fetching nearby hospitals with token:', !!token);

    const config = {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    };

    const response = await axios.get('/api/hospitals/nearby', config);
    console.log('Successfully fetched nearby hospitals:', response.data.length);
    return response.data;
  } catch (error) {
    console.error('Error fetching nearby hospitals:', error);
    // Return default hospitals if API fails
    return [
      { id: 1, name: 'Metro General Hospital', distance: '2.3 miles', rating: 4.5 },
      { id: 2, name: 'City Medical Center', distance: '3.7 miles', rating: 4.8 },
      { id: 3, name: 'Westside Health Center', distance: '5.1 miles', rating: 4.2 },
      { id: 4, name: 'Community Hospital', distance: '6.5 miles', rating: 4.6 },
    ];
  }
};

// Fetch user notifications (deprecated - use notificationService instead)
export const fetchNotifications = async () => {
  try {
    const token = getAuthToken();
    console.log('Fetching notifications with token:', !!token);

    const config = {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    };

    const response = await axios.get('/api/notifications', config);
    return response.data.notifications;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

// Fetch user appointments
export const fetchAppointments = async () => {
  try {
    const token = getAuthToken();
    console.log('Fetching appointments with token:', !!token);

    const config = {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    };

    const response = await axios.get('/api/appointments', config);
    return response.data;
  } catch (error) {
    console.error('Error fetching appointments:', error);
    // Return default appointments if API fails
    return [
      {
        id: 1,
        doctor: 'Dr. Sarah Johnson',
        specialty: 'Cardiologist',
        hospital: 'Metro General Hospital',
        date: '2023-06-15',
        time: '10:00 AM',
        type: 'in-person'
      },
      {
        id: 2,
        doctor: 'Dr. Michael Chen',
        specialty: 'Neurologist',
        hospital: 'City Medical Center',
        date: '2023-06-18',
        time: '2:30 PM',
        type: 'virtual'
      },
    ];
  }
};
