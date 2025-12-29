import { apiClient } from './apiService'
import { auth } from '@/config/firebase'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth'

export const authService = {
  register: async (userData) => {
    // 1. Create user in Firebase
    const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
    const user = userCredential.user;

    // 2. Update display name in Firebase
    await updateProfile(user, { displayName: userData.name });

    // 3. Get ID Token
    const idToken = await user.getIdToken();

    // 4. Send to Backend to sync/create in DB
    return apiClient('/auth/register', {
      method: "POST",
      body: JSON.stringify({
        idToken,
        name: userData.name,
        phone: userData.phone, // Assuming phone can be passed
        role: "driver" // Default to driver for DriverWeb
      })
    });
  },

  login: async (username, password) => {
    // 1. Sign in with Firebase (using email/password)
    const userCredential = await signInWithEmailAndPassword(auth, username, password);
    const user = userCredential.user;

    // 2. Get ID Token
    const idToken = await user.getIdToken();

    // 3. Send to Backend to verify/get user details
    return apiClient('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ idToken })
    });
  },

  logout: async () => {
    await signOut(auth);
  }
};