import api from './axios';

export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
    getMe: () => api.get('/auth/me'),
};

export const projectAPI = {
    getAll: () => api.get('/projects'),
    getOne: (id) => api.get(`/projects/${id}`),
    create: (data) => api.post('/projects', data),
    update: (id, data) => api.put(`/projects/${id}`, data),
    delete: (id) => api.delete(`/projects/${id}`),
    invite: (id, data) => api.post(`/projects/${id}/invite`, data),
    removeMember: (id, userId) => api.delete(`/projects/${id}/members/${userId}`),
    search: (id, params) => api.get(`/projects/${id}/search`, { params }),
};

export const boardAPI = {
    getAll: (projectId) => api.get(`/projects/${projectId}/boards`),
    create: (projectId, data) => api.post(`/projects/${projectId}/boards`, data),
    update: (projectId, boardId, data) => api.put(`/projects/${projectId}/${boardId}`, data),
    delete: (projectId, boardId) => api.delete(`/projects/${projectId}/${boardId}`),
};

export const taskAPI = {
    getByBoard: (boardId, params) => api.get(`/projects/boards/${boardId}/tasks`, { params }),
    getOne: (id) => api.get(`/tasks/${id}`),
    create: (boardId, data) => api.post(`/projects/boards/${boardId}/tasks`, data),
    update: (id, data) => api.put(`/tasks/${id}`, data),
    delete: (id) => api.delete(`/tasks/${id}`),
    updateStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),
    move: (id, data) => api.put(`/tasks/${id}/move`, data),
    getComments: (id) => api.get(`/tasks/${id}/comments`),
    addComment: (id, text) => api.post(`/tasks/${id}/comments`, { text }),
};
