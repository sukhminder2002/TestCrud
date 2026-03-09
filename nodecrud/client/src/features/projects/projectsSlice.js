import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { projectAPI } from '../../api';

export const fetchProjects = createAsyncThunk('projects/fetchAll', async (_, { rejectWithValue }) => {
    try { return (await projectAPI.getAll()).data.data; }
    catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchProject = createAsyncThunk('projects/fetchOne', async (id, { rejectWithValue }) => {
    try { return (await projectAPI.getOne(id)).data.data; }
    catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const createProject = createAsyncThunk('projects/create', async (data, { rejectWithValue }) => {
    try { return (await projectAPI.create(data)).data.data; }
    catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const updateProject = createAsyncThunk('projects/update', async ({ id, data }, { rejectWithValue }) => {
    try { return (await projectAPI.update(id, data)).data.data; }
    catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const deleteProject = createAsyncThunk('projects/delete', async (id, { rejectWithValue }) => {
    try { await projectAPI.delete(id); return id; }
    catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const inviteMember = createAsyncThunk('projects/invite', async ({ id, data }, { rejectWithValue }) => {
    try { return (await projectAPI.invite(id, data)).data.data; }
    catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const removeMember = createAsyncThunk('projects/removeMember', async ({ id, userId }, { rejectWithValue }) => {
    try { await projectAPI.removeMember(id, userId); return { id, userId }; }
    catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const projectsSlice = createSlice({
    name: 'projects',
    initialState: { list: [], current: null, loading: false, error: null },
    reducers: { clearCurrentProject: (s) => { s.current = null; } },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProjects.pending, (s) => { s.loading = true; })
            .addCase(fetchProjects.fulfilled, (s, a) => { s.loading = false; s.list = a.payload; })
            .addCase(fetchProjects.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
            .addCase(fetchProject.fulfilled, (s, a) => { s.current = a.payload; })
            .addCase(createProject.fulfilled, (s, a) => { s.list.unshift(a.payload); })
            .addCase(updateProject.fulfilled, (s, a) => {
                s.list = s.list.map((p) => p._id === a.payload._id ? a.payload : p);
                if (s.current?._id === a.payload._id) s.current = a.payload;
            })
            .addCase(deleteProject.fulfilled, (s, a) => { s.list = s.list.filter((p) => p._id !== a.payload); })
            .addCase(inviteMember.fulfilled, (s, a) => {
                s.list = s.list.map((p) => p._id === a.payload._id ? a.payload : p);
                if (s.current?._id === a.payload._id) s.current = a.payload;
            });
    },
});

export const { clearCurrentProject } = projectsSlice.actions;
export default projectsSlice.reducer;
