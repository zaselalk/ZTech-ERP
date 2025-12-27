import React, { useEffect, useState } from "react";
import { Form, Input, Button, Card, message, Spin } from "antd";
import {
  settingsService,
  Settings as SettingsType,
} from "../services/settingsService";

const Settings: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getSettings();
      form.setFieldsValue(data);
    } catch (error) {
      console.error("Error fetching settings:", error);
      message.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    try {
      setSaving(true);
      await settingsService.updateSettings(values);
      message.success("Settings updated successfully");
    } catch (error) {
      console.error("Error updating settings:", error);
      message.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Business Settings</h1>
      <Card title="Business Details" className="max-w-2xl">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="businessName"
            label="Business Name"
            rules={[{ required: true, message: "Please enter business name" }]}
          >
            <Input placeholder="ZTech POS" />
          </Form.Item>

          <Form.Item name="address" label="Address">
            <Input.TextArea rows={3} placeholder="123 Main St, City" />
          </Form.Item>

          <Form.Item name="phone" label="Phone">
            <Input placeholder="0123456789" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ type: "email", message: "Please enter a valid email" }]}
          >
            <Input placeholder="info@example.com" />
          </Form.Item>

          <Form.Item name="website" label="Website">
            <Input placeholder="www.example.com" />
          </Form.Item>

          <Form.Item name="receiptFooter" label="Receipt Footer Message">
            <Input.TextArea
              rows={2}
              placeholder="Thank you for shopping with us!"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={saving}>
              Save Changes
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Settings;
