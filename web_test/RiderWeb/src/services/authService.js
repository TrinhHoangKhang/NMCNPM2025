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
        role: "rider"
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
    // No Firebase signOut needed, just clear local session (handled in AuthProvider)
  },

  updateProfile: async (userId, data) => {
    return apiClient(`/users/${userId}`, {
      method: "PATCH",
      body: data
    });
  }
};