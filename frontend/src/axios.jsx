import axios from "axios";
import { getToken, removeToken } from "./utils/auth";

const instance = axios.create({
  baseURL: "http://localhost:8080", 
});

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
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      removeToken();
      window.location.href = '/'; 
    }
    return Promise.reject(error);
  }
);

export default instance;
