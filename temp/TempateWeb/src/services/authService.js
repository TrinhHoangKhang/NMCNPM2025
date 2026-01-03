import { apiClient } from './apiService'

export const authService = {
  register: async (userData) => {
    return apiClient('/users', {
      method: "POST",
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        "username": userData.username, 
        "name": userData.name, 
        "email": userData.email, 
        "password": userData.password })
    });
  },

  login: async (username, password) => {
    return apiClient(`/users?select=*&username=eq.${username}`, {
      method: 'GET',
      headers: {
      }
    });
  },

  logout: async () => {
  },

  getall: async () => {
      return apiClient(`/users?select=*`, {
        method: 'GET',
        headers: {
        }
    });
  }
};