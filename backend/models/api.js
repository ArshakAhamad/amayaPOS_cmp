import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api'; // Adjust to your backend URL

export const productReturnService = {
  // Get all returns
  getAllReturns: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/returns`);
      return response.data;
    } catch (error) {
      console.error('Error fetching returns:', error);
      throw error;
    }
  },

  // Create a new return
  createReturn: async (returnData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/returns`, returnData);
      return response.data;
    } catch (error) {
      console.error('Error creating return:', error);
      throw error;
    }
  },

  // Get product details
  getProductDetails: async (productId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product details:', error);
      throw error;
    }
  },

  // Search products
  searchProducts: async (query) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/search?q=${query}`);
      return response.data;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }
};