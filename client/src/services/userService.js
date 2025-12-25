import api from '../lib/axios';

export const getUserById = async (id) => {
    const { data } = await api.get(`/api/users/${id}`);
    return data;
};

// Placeholder for future update
export const updateUserProfile = async (id, userData) => {
    const { data } = await api.put(`/api/users/${id}`, userData);
    return data;
};
export const getUsers = async () => {
    const { data } = await api.get('/api/auth/users');
    return data;
};

export const deleteUser = async (id) => {
    const { data } = await api.delete(`/api/auth/users/${id}`);
    return data;
};
