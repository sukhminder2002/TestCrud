import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { boardAPI } from '../../api';

export const fetchBoards = createAsyncThunk('boards/fetchAll', async (projectId, { rejectWithValue }) => {
    try { return (await boardAPI.getAll(projectId)).data.data; }
    catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const createBoard = createAsyncThunk('boards/create', async ({ projectId, data }, { rejectWithValue }) => {
    try { return (await boardAPI.create(projectId, data)).data.data; }
    catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const updateBoard = createAsyncThunk('boards/update', async ({ projectId, boardId, data }, { rejectWithValue }) => {
    try { return (await boardAPI.update(projectId, boardId, data)).data.data; }
    catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const deleteBoard = createAsyncThunk('boards/delete', async ({ projectId, boardId }, { rejectWithValue }) => {
    try { await boardAPI.delete(projectId, boardId); return boardId; }
    catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const boardsSlice = createSlice({
    name: 'boards',
    initialState: { list: [], loading: false, error: null },
    reducers: {
        setBoards: (s, a) => { s.list = a.payload; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBoards.pending, (s) => { s.loading = true; })
            .addCase(fetchBoards.fulfilled, (s, a) => { s.loading = false; s.list = a.payload; })
            .addCase(fetchBoards.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
            .addCase(createBoard.fulfilled, (s, a) => { s.list.push(a.payload); })
            .addCase(updateBoard.fulfilled, (s, a) => { s.list = s.list.map((b) => b._id === a.payload._id ? a.payload : b); })
            .addCase(deleteBoard.fulfilled, (s, a) => { s.list = s.list.filter((b) => b._id !== a.payload); });
    },
});

export const { setBoards } = boardsSlice.actions;
export default boardsSlice.reducer;
