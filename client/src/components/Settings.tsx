import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Spin,
  Upload,
  Image,
  Popconfirm,
  Switch,
  Divider,
  Alert,
} from "antd";
import {
  UploadOutlined,
  DeleteOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import type { RcFile } from "antd/es/upload/interface";
import { settingsService } from "../services/settingsService";

const DEFAULT_LOGO = "/logo/storyflix-logo.png";

const Settings: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [enableSupplierManagement, setEnableSupplierManagement] =
    useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getSettings();
      form.setFieldsValue(data);
      setLogoUrl(data.logoUrl);
      setEnableSupplierManagement(data.enableSupplierManagement ?? false);
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
      await settingsService.updateSettings({
        ...values,
        enableSupplierManagement,
      });
      message.success("Settings updated successfully");
      // Reload page to update navigation if supplier management was toggled
      window.location.reload();
    } catch (error) {
      console.error("Error updating settings:", error);
      message.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (file: RcFile) => {
    // Validate file type
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("You can only upload image files!");
      return false;
    }

    // Validate file size (max 2MB)
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Image must be smaller than 2MB!");
      return false;
    }

    try {
      setUploadingLogo(true);
      const response = await settingsService.uploadLogo(file);
      setLogoUrl(response.logoUrl);
      message.success("Logo uploaded successfully");
    } catch (error) {
      console.error("Error uploading logo:", error);
      message.error("Failed to upload logo");
    } finally {
      setUploadingLogo(false);
    }

    return false; // Prevent default upload behavior
  };

  const handleDeleteLogo = async () => {
    try {
      setUploadingLogo(true);
      await settingsService.deleteLogo();
      setLogoUrl(null);
      message.success("Logo removed successfully");
    } catch (error) {
      console.error("Error removing logo:", error);
      message.error("Failed to remove logo");
    } finally {
      setUploadingLogo(false);
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

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Business Logo Card */}
        <Card title="Business Logo" className="lg:w-80 shrink-0">
          <div className="flex flex-col items-center">
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
              <Image
                src={logoUrl || DEFAULT_LOGO}
                alt="Business Logo"
                width={150}
                height={150}
                style={{ objectFit: "contain" }}
                fallback={DEFAULT_LOGO}
              />
            </div>

            <div className="flex gap-2 flex-wrap justify-center">
              <Upload
                accept="image/*"
                showUploadList={false}
                beforeUpload={handleLogoUpload}
                disabled={uploadingLogo}
              >
                <Button
                  icon={<UploadOutlined />}
                  loading={uploadingLogo}
                  type="primary"
                >
                  {logoUrl ? "Change Logo" : "Upload Logo"}
                </Button>
              </Upload>

              {logoUrl && (
                <Popconfirm
                  title="Remove Logo"
                  description="Are you sure you want to remove the logo? The default logo will be used."
                  onConfirm={handleDeleteLogo}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button
                    icon={<DeleteOutlined />}
                    danger
                    disabled={uploadingLogo}
                  >
                    Remove
                  </Button>
                </Popconfirm>
              )}
            </div>

            <p className="text-xs text-gray-500 mt-3 text-center">
              Recommended: Square image, max 2MB
              <br />
              Formats: PNG, JPG, GIF, WebP
            </p>
          </div>
        </Card>

        {/* Business Details Card */}
        <Card title="Business Details" className="flex-1">
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item
              name="businessName"
              label="Business Name"
              rules={[
                { required: true, message: "Please enter business name" },
              ]}
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

            <Divider />

            {/* Advanced Features Section */}
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Advanced Features</h3>
              <p className="text-gray-500 text-sm mb-4">
                Enable additional features to extend your POS system
                capabilities.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TeamOutlined className="text-xl text-blue-500" />
                  <div>
                    <div className="font-medium">Supplier Management</div>
                    <div className="text-gray-500 text-sm">
                      Track and manage your product suppliers
                    </div>
                  </div>
                </div>
                <Switch
                  checked={enableSupplierManagement}
                  onChange={setEnableSupplierManagement}
                />
              </div>
              {enableSupplierManagement && (
                <Alert
                  className="mt-3"
                  message="Supplier management will be available in the sidebar after saving."
                  type="info"
                  showIcon
                />
              )}
            </div>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={saving}>
                Save Changes
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
