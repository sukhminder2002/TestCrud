import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { taskAPI } from '../../api';
import api from '../../api/axios';

export const fetchTasks = createAsyncThunk('tasks/fetchByBoard', async ({ boardId, params }, { rejectWithValue }) => {
    try { return { boardId, tasks: (await taskAPI.getByBoard(boardId, params)).data.data }; }
    catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchTask = createAsyncThunk('tasks/fetchOne', async (id, { rejectWithValue }) => {
    try { return (await taskAPI.getOne(id)).data.data; }
    catch (err) { return rejectWithValue(err.response?.data?.message); }
});

// ...existing code...
export const createTask = createAsyncThunk(
    'tasks/createTask',
    async ({ boardId, data }, { rejectWithValue }) => {
        try {
            const res = await api.post(`/boards/${boardId}/tasks`, data);
            // normalize response: return the actual task object
            return res.data?.data ?? res.data;
        } catch (err) {
            const payload = err.response?.data || { message: err.message || 'Network error' };
            return rejectWithValue(payload);
        }
    }
);


export const updateTask = createAsyncThunk('tasks/update', async ({ id, data }, { rejectWithValue }) => {
    try { return (await taskAPI.update(id, data)).data.data; }
    catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const deleteTask = createAsyncThunk('tasks/delete', async (id, { rejectWithValue }) => {
    try { await taskAPI.delete(id); return id; }
    catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const updateTaskStatus = createAsyncThunk('tasks/updateStatus', async ({ id, status }, { rejectWithValue }) => {
    try { return (await taskAPI.updateStatus(id, status)).data.data; }
    catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const moveTask = createAsyncThunk('tasks/move', async ({ id, boardId, order }, { rejectWithValue }) => {
    try { return (await taskAPI.move(id, { boardId, order })).data.data; }
    catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const tasksSlice = createSlice({
    name: 'tasks',
    initialState: {
        byBoard: {},       // { [boardId]: Task[] }
        current: null,
        comments: [],
        loading: false,
        error: null,
        filters: { status: '', priority: '', assignee: '', q: '' },
    },
    reducers: {
        setFilters: (s, a) => { s.filters = { ...s.filters, ...a.payload }; },
        clearFilters: (s) => { s.filters = { status: '', priority: '', assignee: '', q: '' }; },
        optimisticMove: (s, a) => {
            const { task, sourceBoardId, destBoardId, destIndex } = a.payload;
            if (!s.byBoard[sourceBoardId]) return;
            s.byBoard[sourceBoardId] = s.byBoard[sourceBoardId].filter((t) => t._id !== task._id);
            if (!s.byBoard[destBoardId]) s.byBoard[destBoardId] = [];
            const moved = { ...task, board: destBoardId };
            s.byBoard[destBoardId].splice(destIndex, 0, moved);
        },
        setComments: (s, a) => { s.comments = a.payload; },
        addComment: (s, a) => { s.comments.push(a.payload); },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTasks.pending, (s) => { s.loading = true; })
            .addCase(fetchTasks.fulfilled, (s, a) => { s.loading = false; s.byBoard[a.payload.boardId] = a.payload.tasks; })
            .addCase(fetchTasks.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
            .addCase(fetchTask.fulfilled, (s, a) => { s.current = a.payload; })
            .addCase(createTask.fulfilled, (s, a) => {
                const bid = a.payload.board;
                if (!s.byBoard[bid]) s.byBoard[bid] = [];
                s.byBoard[bid].push(a.payload);
            })
            .addCase(updateTask.fulfilled, (s, a) => {
                const t = a.payload;
                if (s.current?._id === t._id) s.current = t;
                Object.keys(s.byBoard).forEach((bid) => {
                    s.byBoard[bid] = s.byBoard[bid].map((x) => x._id === t._id ? t : x);
                });
            })
            .addCase(deleteTask.fulfilled, (s, a) => {
                Object.keys(s.byBoard).forEach((bid) => {
                    s.byBoard[bid] = s.byBoard[bid].filter((x) => x._id !== a.payload);
                });
            });
    },
});

export const { setFilters, clearFilters, optimisticMove, setComments, addComment } = tasksSlice.actions;
export default tasksSlice.reducer;
