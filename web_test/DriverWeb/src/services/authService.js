import { apiClient } from './apiService'

export const authService = {
  register: async (userData) => {
    return apiClient('/auth/register', {
      method: "POST",
      body: {
        email: userData.email,
        password: userData.password,
        name: userData.name,
        phone: userData.phone,
        role: "driver"
      }
    });
  },

  login: async (email, password) => {
    return apiClient('/auth/login', {
      method: 'POST',
      body: { email, password }
    });
  },

  logout: async () => {
    // No Firebase signOut needed
  }
};