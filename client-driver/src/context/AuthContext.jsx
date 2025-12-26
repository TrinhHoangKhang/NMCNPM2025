import React, { createContext, useState, useEffect } from 'react';
import { loginUser, registerUser, logoutUser } from '../services/authService';
import { auth, db } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const getKey = (key) => `${key}_${window.location.port}`;

    const login = async (email, password) => {
        try {
            const data = await loginUser(email, password);
            // Attempt to recover role from storage if exists (hack for now)
            const storedInfo = JSON.parse(localStorage.getItem(getKey('userInfo')) || '{}');
            const role = storedInfo.role || 'RIDER'; // Default to RIDER if unknown

            const userWithRole = { ...data.user, role };
            setUser(userWithRole);

            // Persist for page reloads
            localStorage.setItem(getKey('userInfo'), JSON.stringify(userWithRole));

            return data;
        } catch (error) {
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const data = await registerUser(userData);
            // registerUser returns the role, so we use it
            const userWithRole = { ...data.user, role: userData.role };
            setUser(userWithRole);

            // Persist for page reloads
            localStorage.setItem(getKey('userInfo'), JSON.stringify(userWithRole));

            return data;
        } catch (error) {
            throw error;
        }
    };

    const updateUser = (userData) => {
        setUser(prev => {
            const updated = { ...prev, ...userData };
            localStorage.setItem(getKey('userInfo'), JSON.stringify(updated));
            return updated;
        });
    };

    const logout = async () => {
        await logoutUser();
        setUser(null);
        localStorage.removeItem(getKey('userInfo'));
    };

    useEffect(() => {
        let firestoreUnsubscribe = null;

        const authUnsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firestoreUnsubscribe) {
                firestoreUnsubscribe();
                firestoreUnsubscribe = null;
            }

            if (firebaseUser) {
                // Listen to Firestore for real-time presence/profile updates
                const userDocRef = doc(db, 'users', firebaseUser.uid);
                firestoreUnsubscribe = onSnapshot(userDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const firestoreData = docSnap.data();
                        const storedInfo = JSON.parse(localStorage.getItem(getKey('userInfo')) || '{}');
                        const mergedUser = { ...firebaseUser, ...storedInfo, ...firestoreData };
                        setUser(mergedUser);
                        // Update cache
                        localStorage.setItem(getKey('userInfo'), JSON.stringify(mergedUser));
                    } else {
                        // Fallback if doc doesn't exist yet
                        const storedInfo = JSON.parse(localStorage.getItem(getKey('userInfo')) || '{}');
                        setUser({ ...firebaseUser, ...storedInfo });
                    }
                    setLoading(false);
                }, (err) => {
                    console.error("Firestore sync error:", err);
                    const storedInfo = JSON.parse(localStorage.getItem(getKey('userInfo')) || '{}');
                    setUser({ ...firebaseUser, ...storedInfo });
                    setLoading(false);
                });
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => {
            authUnsubscribe();
            if (firestoreUnsubscribe) firestoreUnsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
