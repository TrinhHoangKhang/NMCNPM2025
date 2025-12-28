import React, { createContext, useState, useEffect } from 'react';
import { loginUser, registerUser, logoutUser } from '../services/authService';
import { auth, db } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

export const AuthContext = createContext();

const getKey = (key) => `${key}_${window.location.port}`;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem(getKey('userInfo'));
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            console.error("Failed to parse user from local storage", e);
            return null;
        }
    });
    const [loading, setLoading] = useState(true);

    const login = async (email, password) => {
        try {
            const data = await loginUser(email, password);
            const loggedInUser = data.user;
            setUser(loggedInUser);

            // Persist for page reloads
            localStorage.setItem(getKey('userInfo'), JSON.stringify(loggedInUser));

            return data;
        } catch (error) {
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const data = await registerUser(userData);
            const registeredUser = data.user;
            setUser(registeredUser);

            // Persist for page reloads
            localStorage.setItem(getKey('userInfo'), JSON.stringify(registeredUser));

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
            console.log('AuthContext: onAuthStateChanged trigger', firebaseUser ? firebaseUser.uid : 'No user');
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
                        console.log('AuthContext: Firestore data received', firestoreData);
                        const storedInfo = JSON.parse(localStorage.getItem(getKey('userInfo')) || '{}');

                        // FIX: Do not spread firebaseUser class instance directly.
                        const firebaseData = {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            emailVerified: firebaseUser.emailVerified,
                            displayName: firebaseUser.displayName,
                            photoURL: firebaseUser.photoURL
                        };

                        const mergedUser = { ...firebaseData, ...storedInfo, ...firestoreData };
                        setUser(mergedUser);
                        // Update cache
                        localStorage.setItem(getKey('userInfo'), JSON.stringify(mergedUser));
                    } else {
                        // Fallback if doc doesn't exist yet
                        const storedInfo = JSON.parse(localStorage.getItem(getKey('userInfo')) || '{}');
                        const firebaseData = {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            emailVerified: firebaseUser.emailVerified,
                            displayName: firebaseUser.displayName,
                            photoURL: firebaseUser.photoURL
                        };
                        setUser({ ...firebaseData, ...storedInfo });
                    }
                    setLoading(false);
                }, (err) => {
                    console.error("Firestore sync error:", err);
                    const storedInfo = JSON.parse(localStorage.getItem(getKey('userInfo')) || '{}');
                    const firebaseData = {
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        emailVerified: firebaseUser.emailVerified,
                        displayName: firebaseUser.displayName,
                        photoURL: firebaseUser.photoURL
                    };
                    setUser({ ...firebaseData, ...storedInfo });
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
