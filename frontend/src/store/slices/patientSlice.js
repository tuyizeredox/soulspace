import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/axiosConfig';

export const fetchPatients = createAsyncThunk(
  'patients/fetchPatients',
  async (_, { getState }) => {
    // Get token from state
    const state = getState();
    const newToken = state.userAuth?.token;
    const oldToken = state.auth?.token;
    const token = newToken || oldToken;

    console.log('patientSlice: Fetching patients with token:', !!token);

    const config = {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    };

    const response = await axios.get('/api/patients', config);
    return response.data;
  }
);

export const createPatient = createAsyncThunk(
  'patients/createPatient',
  async (patientData, { getState }) => {
    // Get token from state
    const state = getState();
    const newToken = state.userAuth?.token;
    const oldToken = state.auth?.token;
    const token = newToken || oldToken;

    console.log('patientSlice: Creating patient with token:', !!token);

    const config = {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    };

    const response = await axios.post('/api/patients', patientData, config);
    return response.data;
  }
);

export const updatePatient = createAsyncThunk(
  'patients/updatePatient',
  async ({ patientId, patientData }, { getState }) => {
    // Get token from state
    const state = getState();
    const newToken = state.userAuth?.token;
    const oldToken = state.auth?.token;
    const token = newToken || oldToken;

    console.log('patientSlice: Updating patient with token:', !!token);

    const config = {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    };

    const response = await axios.put(`/api/patients/${patientId}`, patientData, config);
    return response.data;
  }
);

export const deletePatient = createAsyncThunk(
  'patients/deletePatient',
  async (patientId, { getState }) => {
    // Get token from state
    const state = getState();
    const newToken = state.userAuth?.token;
    const oldToken = state.auth?.token;
    const token = newToken || oldToken;

    console.log('patientSlice: Deleting patient with token:', !!token);

    const config = {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    };

    await axios.delete(`/api/patients/${patientId}`, config);
    return patientId;
  }
);

const patientSlice = createSlice({
  name: 'patients',
  initialState: {
    patients: [],
    selectedPatient: null,
    loading: false,
    error: null,
  },
  reducers: {
    setSelectedPatient: (state, action) => {
      state.selectedPatient = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.loading = false;
        state.patients = action.payload;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createPatient.fulfilled, (state, action) => {
        state.patients.push(action.payload);
      })
      .addCase(updatePatient.fulfilled, (state, action) => {
        const index = state.patients.findIndex(
          (patient) => patient._id === action.payload._id
        );
        if (index !== -1) {
          state.patients[index] = action.payload;
        }
        if (state.selectedPatient?._id === action.payload._id) {
          state.selectedPatient = action.payload;
        }
      })
      .addCase(deletePatient.fulfilled, (state, action) => {
        state.patients = state.patients.filter(
          (patient) => patient._id !== action.payload
        );
        if (state.selectedPatient?._id === action.payload) {
          state.selectedPatient = null;
        }
      });
  },
});

export const { setSelectedPatient } = patientSlice.actions;
export default patientSlice.reducer;
