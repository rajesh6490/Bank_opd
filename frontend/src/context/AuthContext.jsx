import React, { createContext, useState, useContext, useEffect } from "react";
import { message } from "antd"; // For Ant Design alerts
import { useNavigate } from "react-router-dom"; // For redirecting to the homepage
import axios from "../axios";
import { setToken, getToken, removeToken } from "../utils/auth";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // On page load, check if token exists and fetch user data
  useEffect(() => {
    const token = getToken();
    if (token) {
      axios.get("/api/users/getUser")
        .then(response => {
          setUser(response.data);
        })
        .catch(() => {
          removeToken();
          setUser(null);
          navigate("/");
        });
    } else {
      // Only redirect if we are not already on the login page (or register page)
      // Since we don't have location info here easily without useLocation, 
      // rely on protected routes or component-level checks, 
      // or just let the axios interceptor handle 401s later.
      // For now, if no token, we just don't set user.
      // If specific pages require auth, they should check `user` context.
    }
  }, []);

  // Function to log in the user: save token and fetch user data
  const login = async (token) => {
    console.log("AuthContext login called with token:", token);
    setToken(token);
    try {
      console.log("Fetching user details...");
      const response = await axios.get("/api/users/getUser");
      console.log("User details fetched:", response.data);
      setUser(response.data);
      return true;
    } catch (error) {
      console.error("Failed to fetch user details", error);
      removeToken();
      return false;
    }
  };

  // Function to log out the user
  const logout = () => {
    setUser(null);
    removeToken();
    message.info("You have been logged out.");
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
