import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [userToken, setUserToken] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Android Emulator: 10.0.2.2 
    // iOS Simulator: localhost
    // Physical Device: Your Machine IP
    const BASE_URL = 'http://10.0.2.2:5000/api';

    const login = async (email, password) => {
        setIsLoading(true);
        try {
            const response = await axios.post(`${BASE_URL}/auth/login`, {
                email,
                password
            });

            const { token, ...user } = response.data;
            setUserToken(token);
            setUserInfo(user);

            await AsyncStorage.setItem('userToken', token);
            await AsyncStorage.setItem('userInfo', JSON.stringify(user));
        } catch (error) {
            console.log('Login Error', error);
            alert('Login failed');
        } finally {
            setIsLoading(false);
        }
    }

    const logout = () => {
        setIsLoading(true);
        setUserToken(null);
        setUserInfo(null);
        AsyncStorage.removeItem('userToken');
        AsyncStorage.removeItem('userInfo');
        setIsLoading(false);
    }

    const isLoggedIn = async () => {
        try {
            setIsLoading(true);
            let userToken = await AsyncStorage.getItem('userToken');
            let userInfo = await AsyncStorage.getItem('userInfo');

            if (userToken) {
                setUserToken(userToken);
                setUserInfo(JSON.parse(userInfo));
            }
        } catch (e) {
            console.log('isLogged in error', e);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        isLoggedIn();
    }, []);

    return (
        <AuthContext.Provider value={{ login, logout, isLoading, userToken, userInfo, BASE_URL }}>
            {children}
        </AuthContext.Provider>
    );
};
