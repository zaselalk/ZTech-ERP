import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Form, Input, Button, Typography, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { authService, settingsService } from "../services";

const { Text } = Typography;

const DEFAULT_LOGO = "/logo/storyflix-logo.png";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>(DEFAULT_LOGO);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch logo from settings
    const loadSettings = async () => {
      try {
        const settings = await settingsService.getSettings();
        if (settings.logoUrl) {
          setLogoUrl(settings.logoUrl);
        }
      } catch (error) {
        // Silently fail and use default logo
        console.error("Failed to load settings:", error);
      }
    };
    loadSettings();
  }, []);

  const handleLogin = async (): Promise<void> => {
    setLoading(true);
    try {
      const {
        token,
        role,
        username: user,
      } = await authService.login(username, password);
      authService.storeToken(token, role, user);
      message.success("Login successful!");
      if (role === "staff") {
        navigate("/pos");
      } else {
        navigate("/");
      }
    } catch (error) {
      message.error("Invalid credentials..! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#667eea] to-[#764ba2] p-5">
      <Card
        style={{
          width: "100%",
          maxWidth: "450px",
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          border: "none",
        }}
        styles={{
          body: { padding: "48px" },
        }}
        className="p-32"
      >
        <div className="text-center mb-8">
          <img
            src={logoUrl}
            alt="Business Logo"
            className="mx-auto mb-4  h-16"
            onError={(e) => {
              (e.target as HTMLImageElement).src = DEFAULT_LOGO;
            }}
          />

          <Text className="text-base text-[#7f8c8d] block">
            Sign in to your account
          </Text>
        </div>

        <Form onFinish={handleLogin}>
          <Form.Item className="mb-5">
            <Input
              size="large"
              prefix={<UserOutlined className="text-[#7f8c8d]" />}
              placeholder="Username"
              value={username}
              required={true}
              onChange={(e) => setUsername(e.target.value)}
              className="rounded-lg border border-[#e0e0e0]"
            />
          </Form.Item>

          <Form.Item className="mb-6">
            <Input.Password
              size="large"
              prefix={<LockOutlined className="text-[#7f8c8d]" />}
              placeholder="Password"
              required={true}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-[#e0e0e0]"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              size="large"
              loading={loading}
              block
              className="bg-linear-to-br from-[#4285f4] to-[#346ecbff] border-none rounded-lg h-12 text-base font-semibold shadow-[0_4px_16px_rgba(66,133,244,0.3)]"
              htmlType="submit"
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
