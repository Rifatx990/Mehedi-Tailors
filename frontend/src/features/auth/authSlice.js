import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import toast from 'react-hot-toast';

// Async thunks
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      toast.success('Registration successful!');
      return response;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed');
      return rejectWithValue(error.response?.data);
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      toast.success('Login successful!');
      return response;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
      return rejectWithValue(error.response?.data);
    }
  }
);

export const getProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getProfile();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

// Get initial state from localStorage safely
const getInitialState = () => {
  try {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    return {
      user: userStr ? JSON.parse(userStr) : null,
      token: token,
      isLoading: false,
      isAuthenticated: !!token,
      error: null,
    };
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return {
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
    };
  }
};

const initialState = getInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Reset state
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      
      toast.success('Logged out successfully');
    },
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      
      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Registration failed';
      })
      
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Login failed';
      })
      
      // Get Profile
      .addCase(getProfile.fulfilled, (state, action) => {
        state.user = action.payload.user;
      });
  }
});

export const { logout, clearError, setCredentials } = authSlice.actions;
export default authSlice.reducer;
