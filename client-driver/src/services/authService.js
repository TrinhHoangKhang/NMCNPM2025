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

export const loginUser = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const token = await user.getIdToken();

    // Note: Roles are not stored in Firebase Auth default profile. 
    // You would typically fetch them from your backend or Firestore here.

    return { user, token };
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

    const token = await user.getIdToken();

    // Return user mixed with role for immediate context usage
    // In a real app, you should save this role to your database
    return {
        user: { ...user, displayName: name, role },
        token
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
