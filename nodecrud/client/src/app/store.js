import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import projectsReducer from '../features/projects/projectsSlice';
import boardsReducer from '../features/boards/boardsSlice';
import tasksReducer from '../features/tasks/tasksSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        projects: projectsReducer,
        boards: boardsReducer,
        tasks: tasksReducer,
    },
});

export default store;
