import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/axiosConfig';

export const fetchDeviceData = createAsyncThunk(
  'monitoring/fetchDeviceData',
  async (patientId) => {
    const response = await axios.get(`/api/monitoring/${patientId}`);
    return response.data;
  }
);

export const updateDeviceSettings = createAsyncThunk(
  'monitoring/updateDeviceSettings',
  async ({ patientId, settings }) => {
    const response = await axios.put(`/api/monitoring/${patientId}/settings`, settings);
    return response.data;
  }
);

const monitoringSlice = createSlice({
  name: 'monitoring',
  initialState: {
    deviceData: null,
    realtimeData: null,
    alerts: [],
    settings: null,
    loading: false,
    error: null,
  },
  reducers: {
    updateRealtimeData: (state, action) => {
      state.realtimeData = action.payload;
    },
    addAlert: (state, action) => {
      state.alerts.unshift(action.payload);
      if (state.alerts.length > 50) {
        state.alerts.pop();
      }
    },
    clearAlerts: (state) => {
      state.alerts = [];
    },
    updateSettings: (state, action) => {
      state.settings = { ...state.settings, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeviceData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeviceData.fulfilled, (state, action) => {
        state.loading = false;
        state.deviceData = action.payload;
      })
      .addCase(fetchDeviceData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updateDeviceSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      });
  },
});

export const {
  updateRealtimeData,
  addAlert,
  clearAlerts,
  updateSettings,
} = monitoringSlice.actions;

export default monitoringSlice.reducer;
