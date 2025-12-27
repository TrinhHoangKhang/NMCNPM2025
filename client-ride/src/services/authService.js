import { auth } from '../config/firebase';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    updateProfile
} from "firebase/auth";

const getStorageKey = (key) => {
    return `${key}_${window.location.port}`;
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

export const loginUser = async (email, password) => {
    // 1. Authenticate with Firebase first
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const idToken = await user.getIdToken();

    // 2. Sync with our Backend to get profile/session
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Backend sync failed');

    // Store the ID Token for all future API calls
    localStorage.setItem(getStorageKey('userToken'), idToken);

    return {
        user: { ...user, ...data.user },
        token: idToken
    };
};

export const registerUser = async (userData) => {
    const { email, password, name, role } = userData;
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (name) {
        await updateProfile(user, {
            displayName: name
        });
    }

    const idToken = await user.getIdToken();

    // Also register in our backend (Firestore)
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...userData, idToken })
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Server registration failed');
    }

    localStorage.setItem(getStorageKey('userToken'), idToken);

    return {
        user: { ...user, displayName: name, role },
        token: idToken
    };
};

export const logoutUser = async () => {
    await signOut(auth);
    localStorage.removeItem(getStorageKey('userInfo'));
    localStorage.removeItem(getStorageKey('userToken'));
};

export const getCurrentUser = () => {
    return auth.currentUser;
};
