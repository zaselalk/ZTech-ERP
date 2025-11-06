import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Form, Input, Button, Typography, message } from "antd";
import { UserOutlined, LockOutlined, BookOutlined } from "@ant-design/icons";

import api from "../utils/api";

const { Title, Text } = Typography;

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    setLoading(true);
    try {
      const response = await api.fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const { token } = await response.json();
        localStorage.setItem("token", token);
        message.success("Login successful!");
        navigate("/");
      } else {
        message.error("Invalid username or password");
      }
    } catch (error) {
      console.error("Error during login:", error);
      message.error("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "20px",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: "450px",
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          border: "none",
        }}
        bodyStyle={{ padding: "48px" }}
      >
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              background: "linear-gradient(135deg, #4285f4 0%, #346ecbff 100%)",
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              boxShadow: "0 4px 16px rgba(66, 133, 244, 0.3)",
            }}
          >
            <BookOutlined style={{ fontSize: "32px", color: "white" }} />
          </div>
          <Title
            level={2}
            style={{
              color: "#2c3e50",
              marginBottom: "8px",
              fontSize: "28px",
              fontWeight: "700",
            }}
          >
            Welcome Back
          </Title>
          <Text
            style={{
              fontSize: "16px",
              color: "#7f8c8d",
              display: "block",
            }}
          >
            Sign in to your bookshop account
          </Text>
        </div>

        <Form.Item style={{ marginBottom: "20px" }}>
          <Input
            size="large"
            prefix={<UserOutlined style={{ color: "#7f8c8d" }} />}
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              borderRadius: "8px",
              border: "1px solid #e0e0e0",
            }}
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: "24px" }}>
          <Input.Password
            size="large"
            prefix={<LockOutlined style={{ color: "#7f8c8d" }} />}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              borderRadius: "8px",
              border: "1px solid #e0e0e0",
            }}
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            size="large"
            loading={loading}
            block
            style={{
              background: "linear-gradient(135deg, #4285f4 0%, #346ecbff 100%)",
              border: "none",
              borderRadius: "8px",
              height: "48px",
              fontSize: "16px",
              fontWeight: "600",
              boxShadow: "0 4px 16px rgba(66, 133, 244, 0.3)",
            }}
            onClick={handleLogin}
          >
            Sign In
          </Button>
        </Form.Item>
      </Card>
    </div>
  );
};

export default LoginPage;
