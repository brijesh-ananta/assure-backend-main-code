// src/utils/axiosToken.js

import axios from "axios";
import apiService from "../services";

// Create an Axios instance
const axiosToken = axios.create({
  baseURL: import.meta.env.VITE_TOKEN_BASE_URL || "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach token
axiosToken.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("bhtoken"); // Get token from localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthorized errors
axiosToken.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await apiService.user.logoutUser();
      } catch (error) {
        console.error(error);
      } finally {
        localStorage.removeItem("bhtoken"); // Remove token on 401 errors
        localStorage.removeItem("ciperText");

        window.location.href = "/"; // Redirect to login page
      }
    }
    return Promise.reject(error);
  }
);

export default axiosToken;
