import axios from "axios";
import { getToken, removeToken } from "./utils/auth";

const instance = axios.create({
  baseURL: "http://localhost:8080", // Replace with your Spring Boot backend URL
});

// Request interceptor to add the token to headers
instance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      removeToken();
      window.location.href = '/'; // Redirect to login page
    }
    return Promise.reject(error);
  }
);

export default instance;
