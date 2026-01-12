import { apiClient } from './apiService'

export const productService = {
  getdata: async (id) => {
      return apiClient(`/products?select=*&id=eq.${id}`, {
        method: 'GET',
        headers: {
        }
    });
  },

  getall: async () => {
      return apiClient(`/products?select=*`, {
        method: 'GET',
        headers: {
        }
    });
  }
};