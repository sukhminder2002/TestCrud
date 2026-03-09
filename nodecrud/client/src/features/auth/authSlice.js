import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../api';

export const registerUser = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
    try {
        const res = await authAPI.register(data);
        return res.data.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
});

export const loginUser = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
    try {
        const res = await authAPI.login(data);
        return res.data.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
});

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
    try {
        const res = await authAPI.getMe();
        return res.data.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message);
    }
});

const initialState = {
    user: null,
    accessToken: localStorage.getItem('accessToken') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    loading: false,
    error: null,
    initialized: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout(state) {
            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        },
        clearError(state) { state.error = null; },
    },
    extraReducers: (builder) => {
        const setTokens = (state, action) => {
            state.user = action.payload.user;
            state.accessToken = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken;
            state.loading = false;
            state.error = null;
            localStorage.setItem('accessToken', action.payload.accessToken);
            localStorage.setItem('refreshToken', action.payload.refreshToken);
        };
        builder
            .addCase(registerUser.pending, (s) => { s.loading = true; s.error = null; })
            .addCase(registerUser.fulfilled, setTokens)
            .addCase(registerUser.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
            .addCase(loginUser.pending, (s) => { s.loading = true; s.error = null; })
            .addCase(loginUser.fulfilled, setTokens)
            .addCase(loginUser.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
            .addCase(fetchMe.fulfilled, (s, a) => { s.user = a.payload; s.initialized = true; })
            .addCase(fetchMe.rejected, (s) => { s.initialized = true; });
    },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
