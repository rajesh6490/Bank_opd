import React, { useState, useEffect } from "react";
import { Button, Input, notification, Card, Typography, Space } from "antd";
import { UserOutlined, LockOutlined, LoginOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "../axios"; // Assuming this is configured to point to your backend
import { useAuth } from "../context/AuthContext";

const { Text } = Typography;

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Loading state
  const { login, user } = useAuth(); // Destructure user from context
  const navigate = useNavigate();

  // Redirect to /home if the user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/home");
    }
  }, [user, navigate]);

  const handleLogin = async () => {
    setLoading(true); // Set loading state to true
    try {
      const response = await axios.post(
        `/api/users/login?username=${username}&password=${password}`
      );

      // Backend now returns the token string directly
      console.log("Login response:", response);
      if (response.data) {
        console.log("Token received:", response.data);
        const success = await login(response.data); // Store user data in context
        console.log("Login success status:", success);
        if (success) {
          navigate("/home");
        } else {
          notification.error({ message: "Failed to fetch user details" });
        }
      } else {
        console.log("No data in response");
        notification.error({ message: "Invalid credentials" });
      }
    } catch (error) {
      console.error("Login Error:", error);
      notification.error({ message: "Login failed" });
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div className="flex justify-center items-center">
      <Card className="bg-transparent w-full outline-none border-none">
        <img
          src="/pay.gif"
          alt="logo"
          className="w-1/4 mb-2 mx-auto rounded-lg"
        />
        <h1 className="text-left text-3xl gradient-text-blue font-bold py-2">
          Login to Your Account
        </h1>
        <Text type="secondary" className="block text-left mb-4">
          Please enter your credentials to proceed.
        </Text>

        <Space direction="vertical" size="large" className="w-full">
          <Input
            size="large"
            placeholder="Username"
            prefix={<UserOutlined className="text-gray-400" />}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input.Password
            size="large"
            placeholder="Password"
            prefix={<LockOutlined className="text-gray-400" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Space>

        <Button
          type="primary"
          size="large"
          block
          className="mt-6"
          icon={<LoginOutlined />}
          onClick={handleLogin}
          loading={loading} // Add loading prop
          disabled={loading} // Prevent multiple clicks
        >
          {loading ? "Logging in..." : "Login"}
        </Button>
      </Card>
    </div>
  );
};

export default Login;
