import { apiClient } from './apiService'

export const authService = {
  register: async (userData) => {
    return apiClient('/auth/register', {
      method: "POST",
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
        name: userData.name,
        phone: userData.phone,
        role: "rider"
      })
    });
  },

  login: async (email, password) => {
    return apiClient('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  logout: async () => {
    // No Firebase signOut needed, just clear local session (handled in AuthProvider)
  }
};