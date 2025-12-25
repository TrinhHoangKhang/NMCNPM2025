import React, { createContext, useState, useEffect } from 'react';
import { loginUser, logoutUser, getCurrentUser } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const login = async (email, password) => {
        try {
            const data = await loginUser(email, password);
            setUser(data);
            return data;
        } catch (error) {
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            // Dynamically import to avoid circular dependency if service imports context (it doesn't, but good practice)
            const { registerUser } = await import('../services/authService');
            const data = await registerUser(userData);
            setUser(data);
            return data;
        } catch (error) {
            throw error;
        }
    };

    const updateUser = (userData) => {
        setUser(prev => ({ ...prev, ...userData }));

        // Helper for port-based isolation
        const getKey = (key) => `${key}_${window.location.port}`;

        // Also update local storage to persist changes
        const currentInfo = JSON.parse(localStorage.getItem(getKey('userInfo')) || '{}');
        localStorage.setItem(getKey('userInfo'), JSON.stringify({ ...currentInfo, ...userData }));

        // Update token if it was refreshed
        if (userData.token) {
            localStorage.setItem(getKey('userToken'), userData.token);
        }
    };

    const logout = () => {
        logoutUser();
        setUser(null);
    };

    useEffect(() => {
        const userInfo = getCurrentUser();
        if (userInfo) {
            setUser(userInfo);
        }
        setLoading(false);
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
