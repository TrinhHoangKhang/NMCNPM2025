import api from '../lib/axios';

const getStorageKey = (key) => {
    return `${key}_${window.location.port}`;
};

export const loginUser = async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    if (data.token) {
        localStorage.setItem(getStorageKey('userToken'), data.token);
        localStorage.setItem(getStorageKey('userInfo'), JSON.stringify(data));
    }
    return data;
};

export const registerUser = async (userData) => {
    const { data } = await api.post('/api/auth/register', userData);
    if (data.token) {
        localStorage.setItem(getStorageKey('userToken'), data.token);
        localStorage.setItem(getStorageKey('userInfo'), JSON.stringify(data));
    }
    return data;
};

export const logoutUser = () => {
    localStorage.removeItem(getStorageKey('userInfo'));
    localStorage.removeItem(getStorageKey('userToken'));
};

export const getCurrentUser = () => {
    const userInfo = localStorage.getItem(getStorageKey('userInfo'));
    return userInfo ? JSON.parse(userInfo) : null;
};
