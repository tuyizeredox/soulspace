import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/axiosConfig';

export const fetchHospitals = createAsyncThunk(
  'hospitals/fetchHospitals',
  async (_, { getState }) => {
    // Get token from state
    const state = getState();
    const newToken = state.userAuth?.token;
    const oldToken = state.auth?.token;
    const token = newToken || oldToken;

    console.log('hospitalSlice: Fetching hospitals with token:', !!token);

    const config = {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    };

    const response = await axios.get('/api/hospitals', config);
    return response.data;
  }
);

export const updateHospital = createAsyncThunk(
  'hospitals/updateHospital',
  async ({ hospitalId, hospitalData }, { getState }) => {
    // Get token from state
    const state = getState();
    const newToken = state.userAuth?.token;
    const oldToken = state.auth?.token;
    const token = newToken || oldToken;

    console.log('hospitalSlice: Updating hospital with token:', !!token);

    const config = {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    };

    const response = await axios.put(`/api/hospitals/${hospitalId}`, hospitalData, config);
    return response.data;
  }
);

const hospitalSlice = createSlice({
  name: 'hospitals',
  initialState: {
    hospitals: [],
    currentHospital: null,
    loading: false,
    error: null,
  },
  reducers: {
    setCurrentHospital: (state, action) => {
      state.currentHospital = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHospitals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHospitals.fulfilled, (state, action) => {
        state.loading = false;
        state.hospitals = action.payload;
      })
      .addCase(fetchHospitals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updateHospital.fulfilled, (state, action) => {
        const index = state.hospitals.findIndex(hospital => hospital._id === action.payload._id);
        if (index !== -1) {
          state.hospitals[index] = action.payload;
        }
        if (state.currentHospital?._id === action.payload._id) {
          state.currentHospital = action.payload;
        }
      });
  },
});

export const { setCurrentHospital } = hospitalSlice.actions;
export default hospitalSlice.reducer;
