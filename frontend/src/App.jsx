import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import History from "./pages/History";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Transaction from "./pages/Transaction";
import Navbar from "./pages/Navbar";

const App = () => (
  <Router>
    <div className="gradient" />
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow mx-auto w-full my-10 max-w-7xl">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={<Home />} />
            <Route path="/transaction" element={<Transaction />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </div>
        <footer className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center py-4 relative overflow-hidden">
          <p className="text-lg">
            &copy; 2024 Digi Banking. All rights reserved.
          </p>
        </footer>
      </div>
    </AuthProvider>
  </Router>
);

export default App;
