import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userAuthReducer from './slices/userAuthSlice'; // New auth reducer
import userReducer from './slices/userSlice';
import hospitalReducer from './slices/hospitalSlice';
import appointmentReducer from './slices/appointmentSlice';
import patientReducer from './slices/patientSlice';
import profileReducer from './slices/profileSlice';
import notificationReducer from './slices/notificationSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    userAuth: userAuthReducer, // Add new auth reducer
    user: userReducer,
    hospital: hospitalReducer,
    appointment: appointmentReducer,
    patient: patientReducer,
    profile: profileReducer,
    notifications: notificationReducer,
  },
});

export default store;
