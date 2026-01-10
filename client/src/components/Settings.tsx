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
  Alert,
  Tabs,
  Table,
  Space,
  Modal,
  Typography,
  InputNumber,
} from "antd";
import {
  UploadOutlined,
  DeleteOutlined,
  TeamOutlined,
  HomeOutlined,
  DollarOutlined,
  SettingOutlined,
  CloudUploadOutlined,
  BugOutlined,
  ReloadOutlined,
  RollbackOutlined,
  PlusOutlined,
  GithubOutlined,
  ShopOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  ControlOutlined,
  TagsOutlined,
  TagOutlined,
  PercentageOutlined,
  AppstoreOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import type { RcFile } from "antd/es/upload/interface";
import { settingsService, backupService, issueService } from "../services";
import { Backup } from "../types";
import { GithubIssue } from "../services/issueService";
import IssueList from "./features/issues/IssueList";
import IssueDetailModal from "./features/issues/IssueDetailModal";
import CreateIssueModal from "./features/issues/CreateIssueModal";
import { usePermissions } from "../hooks/usePermissions";

const { Title, Text } = Typography;
const DEFAULT_LOGO = "/logo/storyflix-logo.png";

// ============== General Settings Tab ==============
interface GeneralSettingsProps {
  form: ReturnType<typeof Form.useForm>[0];
  loading: boolean;
  saving: boolean;
  logoUrl: string | null;
  uploadingLogo: boolean;
  onFinish: (values: any) => void;
  onLogoUpload: (file: RcFile) => boolean;
  onDeleteLogo: () => void;
}

const GeneralSettingsTab: React.FC<GeneralSettingsProps> = ({
  form,
  saving,
  logoUrl,
  uploadingLogo,
  onFinish,
  onLogoUpload,
  onDeleteLogo,
}) => {
  return (
    <div className="space-y-6">
      {/* Business Branding Section */}
      <Card
        className="shadow-sm border-0"
        styles={{ header: { borderBottom: "1px solid #f0f0f0" } }}
      >
        <div className="flex flex-col md:flex-row gap-8">
          {/* Logo Section */}
          <div className="md:w-64 shrink-0">
            <div className="text-center">
              <div className="mb-4 p-6 bg-linear-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-200 inline-block">
                <Image
                  src={logoUrl || DEFAULT_LOGO}
                  alt="Business Logo"
                  width={120}
                  height={120}
                  style={{ objectFit: "contain" }}
                  fallback={DEFAULT_LOGO}
                  className="rounded-lg"
                />
              </div>

              <div className="flex gap-2 justify-center flex-wrap">
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={onLogoUpload}
                  disabled={uploadingLogo}
                >
                  <Button
                    icon={<UploadOutlined />}
                    loading={uploadingLogo}
                    type="primary"
                    size="small"
                  >
                    {logoUrl ? "Change" : "Upload"}
                  </Button>
                </Upload>

                {logoUrl && (
                  <Popconfirm
                    title="Remove Logo"
                    description="Are you sure? The default logo will be used."
                    onConfirm={onDeleteLogo}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button
                      icon={<DeleteOutlined />}
                      danger
                      size="small"
                      disabled={uploadingLogo}
                    >
                      Remove
                    </Button>
                  </Popconfirm>
                )}
              </div>

              <Text type="secondary" className="text-xs mt-3 block">
                Square image, max 2MB
                <br />
                PNG, JPG, GIF, WebP
              </Text>
            </div>
          </div>

          {/* Business Info Form */}
          <div className="flex-1">
            <Title level={5} className="mb-4! flex items-center gap-2">
              <ShopOutlined className="text-blue-500" />
              Business Information
            </Title>
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                <Form.Item
                  name="businessName"
                  label="Business Name"
                  rules={[
                    { required: true, message: "Please enter business name" },
                  ]}
                >
                  <Input
                    prefix={<ShopOutlined className="text-gray-400" />}
                    placeholder="ZTech POS"
                  />
                </Form.Item>

                <Form.Item name="phone" label="Phone">
                  <Input
                    prefix={<PhoneOutlined className="text-gray-400" />}
                    placeholder="0123456789"
                  />
                </Form.Item>

                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { type: "email", message: "Please enter a valid email" },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined className="text-gray-400" />}
                    placeholder="info@example.com"
                  />
                </Form.Item>

                <Form.Item name="website" label="Website">
                  <Input
                    prefix={<GlobalOutlined className="text-gray-400" />}
                    placeholder="www.example.com"
                  />
                </Form.Item>
              </div>

              <Form.Item name="address" label="Address">
                <Input.TextArea rows={2} placeholder="123 Main St, City" />
              </Form.Item>

              <Form.Item name="receiptFooter" label="Receipt Footer Message">
                <Input.TextArea
                  rows={2}
                  placeholder="Thank you for shopping with us!"
                />
              </Form.Item>

              <Form.Item className="mb-0 mt-4">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={saving}
                  icon={<SettingOutlined />}
                >
                  Save Changes
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </Card>
    </div>
  );
};

// ============== Advanced Features Tab ==============
interface AdvancedFeaturesProps {
  saving: boolean;
  enableSupplierManagement: boolean;
  enableWarehouseManagement: boolean;
  enableProfitTracking: boolean;
  enableCategoryManagement: boolean;
  enableBrandManagement: boolean;
  enableTaxManagement: boolean;
  enableVariantManagement: boolean;
  enableServiceManagement: boolean;
  taxName: string;
  taxRate: number | null;
  taxIncludedInPrice: boolean;
  setEnableSupplierManagement: (value: boolean) => void;
  setEnableWarehouseManagement: (value: boolean) => void;
  setEnableProfitTracking: (value: boolean) => void;
  setEnableCategoryManagement: (value: boolean) => void;
  setEnableBrandManagement: (value: boolean) => void;
  setEnableTaxManagement: (value: boolean) => void;
  setEnableVariantManagement: (value: boolean) => void;
  setEnableServiceManagement: (value: boolean) => void;
  setTaxName: (value: string) => void;
  setTaxRate: (value: number | null) => void;
  setTaxIncludedInPrice: (value: boolean) => void;
  onSave: () => void;
}

const AdvancedFeaturesTab: React.FC<AdvancedFeaturesProps> = ({
  saving,
  enableSupplierManagement,
  enableWarehouseManagement,
  enableProfitTracking,
  enableCategoryManagement,
  enableBrandManagement,
  enableTaxManagement,
  enableVariantManagement,
  enableServiceManagement,
  taxName,
  taxRate,
  taxIncludedInPrice,
  setEnableSupplierManagement,
  setEnableWarehouseManagement,
  setEnableProfitTracking,
  setEnableCategoryManagement,
  setEnableBrandManagement,
  setEnableTaxManagement,
  setEnableVariantManagement,
  setEnableServiceManagement,
  setTaxName,
  setTaxRate,
  setTaxIncludedInPrice,
  onSave,
}) => {
  return (
    <div className="space-y-6">
      <Card
        title={
          <span className="flex items-center gap-2">
            <ControlOutlined className="text-purple-500" />
            Advanced Features
          </span>
        }
        className="shadow-sm border-0"
        styles={{ header: { borderBottom: "1px solid #f0f0f0" } }}
      >
        <Text type="secondary" className="block mb-4">
          Enable additional features to extend your POS system capabilities.
          Changes will take effect after saving and refreshing the page.
        </Text>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Supplier Management */}
          <div className="bg-linear-to-br from-blue-50 to-blue-100/50 p-4 rounded-xl border border-blue-100 transition-all hover:shadow-md">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <TeamOutlined className="text-white text-lg" />
              </div>
              <Switch
                checked={enableSupplierManagement}
                onChange={setEnableSupplierManagement}
              />
            </div>
            <div className="font-semibold text-gray-800 mb-1">
              Supplier Management
            </div>
            <Text type="secondary" className="text-xs">
              Track and manage your product suppliers
            </Text>
            {enableSupplierManagement && (
              <Alert
                className="mt-3"
                message="Available after saving"
                type="info"
                showIcon
              />
            )}
          </div>

          {/* Warehouse Management */}
          <div className="bg-linear-to-br from-green-50 to-green-100/50 p-4 rounded-xl border border-green-100 transition-all hover:shadow-md">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <HomeOutlined className="text-white text-lg" />
              </div>
              <Switch
                checked={enableWarehouseManagement}
                onChange={setEnableWarehouseManagement}
              />
            </div>
            <div className="font-semibold text-gray-800 mb-1">
              Warehouse Management
            </div>
            <Text type="secondary" className="text-xs">
              Manage multiple warehouse locations
            </Text>
            {enableWarehouseManagement && (
              <Alert
                className="mt-3"
                message="Available after saving"
                type="info"
                showIcon
              />
            )}
          </div>

          {/* Profit Tracking */}
          <div className="bg-linear-to-br from-purple-50 to-purple-100/50 p-4 rounded-xl border border-purple-100 transition-all hover:shadow-md">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <DollarOutlined className="text-white text-lg" />
              </div>
              <Switch
                checked={enableProfitTracking}
                onChange={setEnableProfitTracking}
              />
            </div>
            <div className="font-semibold text-gray-800 mb-1">
              Profit & Loss Tracking
            </div>
            <Text type="secondary" className="text-xs">
              Track product costs and calculate margins
            </Text>
            {enableProfitTracking && (
              <Alert
                className="mt-3"
                message="Enables cost fields & reports"
                type="info"
                showIcon
              />
            )}
          </div>

          {/* Category Management */}
          <div className="bg-linear-to-br from-orange-50 to-orange-100/50 p-4 rounded-xl border border-orange-100 transition-all hover:shadow-md">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <TagsOutlined className="text-white text-lg" />
              </div>
              <Switch
                checked={enableCategoryManagement}
                onChange={setEnableCategoryManagement}
              />
            </div>
            <div className="font-semibold text-gray-800 mb-1">
              Category Management
            </div>
            <Text type="secondary" className="text-xs">
              Organize products by categories
            </Text>
            {enableCategoryManagement && (
              <Alert
                className="mt-3"
                message="Available after saving"
                type="info"
                showIcon
              />
            )}
          </div>

          {/* Brand Management */}
          <div className="bg-linear-to-br from-cyan-50 to-cyan-100/50 p-4 rounded-xl border border-cyan-100 transition-all hover:shadow-md">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center">
                <TagOutlined className="text-white text-lg" />
              </div>
              <Switch
                checked={enableBrandManagement}
                onChange={setEnableBrandManagement}
              />
            </div>
            <div className="font-semibold text-gray-800 mb-1">
              Brand Management
            </div>
            <Text type="secondary" className="text-xs">
              Track product brands and manufacturers
            </Text>
            {enableBrandManagement && (
              <Alert
                className="mt-3"
                message="Available after saving"
                type="info"
                showIcon
              />
            )}
          </div>

          {/* Tax Management */}
          <div className="bg-linear-to-br from-rose-50 to-rose-100/50 p-4 rounded-xl border border-rose-100 transition-all hover:shadow-md">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-rose-500 rounded-lg flex items-center justify-center">
                <PercentageOutlined className="text-white text-lg" />
              </div>
              <Switch
                checked={enableTaxManagement}
                onChange={setEnableTaxManagement}
              />
            </div>
            <div className="font-semibold text-gray-800 mb-1">
              Tax Management
            </div>
            <Text type="secondary" className="text-xs">
              Apply taxes to sales automatically
            </Text>
            {enableTaxManagement && (
              <Alert
                className="mt-3"
                message="Configure tax below"
                type="info"
                showIcon
              />
            )}
          </div>

          {/* Product Variant Management */}
          <div className="bg-linear-to-br from-indigo-50 to-indigo-100/50 p-4 rounded-xl border border-indigo-100 transition-all hover:shadow-md">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                <AppstoreOutlined className="text-white text-lg" />
              </div>
              <Switch
                checked={enableVariantManagement}
                onChange={setEnableVariantManagement}
              />
            </div>
            <div className="font-semibold text-gray-800 mb-1">
              Product Variants
            </div>
            <Text type="secondary" className="text-xs">
              Create product variations (size, color, etc.)
            </Text>
            {enableVariantManagement && (
              <Alert
                className="mt-3"
                message="Available after saving"
                type="info"
                showIcon
              />
            )}
          </div>

          {/* Service Management */}
          <div className="bg-linear-to-br from-violet-50 to-violet-100/50 p-4 rounded-xl border border-violet-100 transition-all hover:shadow-md">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-violet-500 rounded-lg flex items-center justify-center">
                <ToolOutlined className="text-white text-lg" />
              </div>
              <Switch
                checked={enableServiceManagement}
                onChange={setEnableServiceManagement}
              />
            </div>
            <div className="font-semibold text-gray-800 mb-1">
              Service Management
            </div>
            <Text type="secondary" className="text-xs">
              Offer services like labor, repairs, or consultations
            </Text>
            {enableServiceManagement && (
              <Alert
                className="mt-3"
                message="Available after saving"
                type="info"
                showIcon
              />
            )}
          </div>
        </div>

        {/* Tax Configuration - Only shown when tax management is enabled */}
        {enableTaxManagement && (
          <Card
            className="mt-6 border-rose-200 bg-rose-50/30"
            title={
              <span className="flex items-center gap-2">
                <PercentageOutlined className="text-rose-500" />
                Tax Configuration
              </span>
            }
            size="small"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tax Name
                </label>
                <Input
                  placeholder="e.g., VAT, GST, Sales Tax"
                  value={taxName}
                  onChange={(e) => setTaxName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tax Rate (%)
                </label>
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  max={100}
                  precision={2}
                  placeholder="e.g., 10"
                  value={taxRate}
                  onChange={(value) => setTaxRate(value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tax Included in Price
                </label>
                <div className="flex items-center gap-2 mt-2">
                  <Switch
                    checked={taxIncludedInPrice}
                    onChange={setTaxIncludedInPrice}
                  />
                  <Text type="secondary" className="text-xs">
                    {taxIncludedInPrice
                      ? "Prices already include tax"
                      : "Tax will be added to prices"}
                  </Text>
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className="mt-6 pt-4 border-t border-gray-100">
          <Button
            type="primary"
            onClick={onSave}
            loading={saving}
            icon={<SettingOutlined />}
          >
            Save Changes
          </Button>
        </div>
      </Card>
    </div>
  );
};

// ============== Backups Tab ==============
const BackupsTab: React.FC = () => {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const data = await backupService.getBackups();
      setBackups(data);
    } catch {
      message.error("Failed to fetch backups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateBackup = async () => {
    setCreating(true);
    try {
      await backupService.createBackup();
      message.success("Backup created successfully");
      fetchBackups();
    } catch {
      message.error("Failed to create backup");
    } finally {
      setCreating(false);
    }
  };

  const handleRestore = async (filename: string) => {
    Modal.confirm({
      title: "Restore Backup",
      content:
        "This will overwrite the current database. This action cannot be undone.",
      okText: "Yes, Restore",
      okType: "danger",
      cancelText: "Cancel",
      icon: <RollbackOutlined className="text-orange-500" />,
      onOk: async () => {
        const hide = message.loading("Restoring database...", 0);
        try {
          await backupService.restoreBackup(filename);
          hide();
          message.success("Database restored successfully");
        } catch {
          hide();
          message.error("Failed to restore database");
        }
      },
    });
  };

  const handleDelete = async (filename: string) => {
    try {
      await backupService.deleteBackup(filename);
      message.success("Backup deleted successfully");
      fetchBackups();
    } catch {
      message.error("Failed to delete backup");
    }
  };

  const columns = [
    {
      title: "Filename",
      dataIndex: "filename",
      key: "filename",
      render: (filename: string) => (
        <span className="font-mono text-sm">{filename}</span>
      ),
    },
    {
      title: "Size",
      dataIndex: "size",
      key: "size",
      render: (size: number) => (
        <span className="text-gray-600">{(size / 1024).toFixed(2)} KB</span>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => (
        <span className="text-gray-600">{new Date(date).toLocaleString()}</span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Backup) => (
        <Space>
          <Button
            icon={<RollbackOutlined />}
            onClick={() => handleRestore(record.filename)}
            size="small"
          >
            Restore
          </Button>
          <Popconfirm
            title="Delete backup"
            description="Are you sure to delete this backup?"
            onConfirm={() => handleDelete(record.filename)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} type="text" danger size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-linear-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
        <div>
          <Title level={5} className="mb-1! flex items-center gap-2">
            <CloudUploadOutlined className="text-blue-500" />
            Database Backups
          </Title>
          <Text type="secondary" className="text-sm">
            Create and manage database backups to protect your data
          </Text>
        </div>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchBackups}
            loading={loading}
          >
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<CloudUploadOutlined />}
            onClick={handleCreateBackup}
            loading={creating}
          >
            Create Backup
          </Button>
        </Space>
      </div>

      {/* Backups Table */}
      <Card className="shadow-sm border-0">
        <Table
          columns={columns}
          dataSource={backups}
          rowKey="filename"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{
            emptyText: (
              <div className="py-8 text-center">
                <CloudUploadOutlined className="text-4xl text-gray-300 mb-2" />
                <p className="text-gray-500">
                  No backups found. Create your first backup above.
                </p>
              </div>
            ),
          }}
        />
      </Card>
    </div>
  );
};

// ============== Issues Tab ==============
const IssuesTab: React.FC = () => {
  const [issues, setIssues] = useState<GithubIssue[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<GithubIssue | null>(null);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const data = await issueService.getIssues();
      setIssues(data);
    } catch {
      message.error("Failed to fetch issues");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-linear-to-r from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-100">
        <div>
          <Title level={5} className="mb-1! flex items-center gap-2">
            <GithubOutlined className="text-gray-700" />
            System Issues
          </Title>
          <Text type="secondary" className="text-sm">
            Report bugs and track system issues on GitHub
          </Text>
        </div>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchIssues}
            loading={loading}
          >
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
          >
            Submit Issue
          </Button>
        </Space>
      </div>

      {/* Issues List */}
      <Card className="shadow-sm border-0">
        <IssueList
          issues={issues}
          loading={loading}
          onIssueClick={setSelectedIssue}
        />
      </Card>

      <IssueDetailModal
        issue={selectedIssue}
        onClose={() => setSelectedIssue(null)}
      />

      <CreateIssueModal
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSuccess={() => {
          setIsModalVisible(false);
          fetchIssues();
        }}
      />
    </div>
  );
};

// ============== Main Settings Component ==============
const Settings: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [enableSupplierManagement, setEnableSupplierManagement] =
    useState(false);
  const [enableWarehouseManagement, setEnableWarehouseManagement] =
    useState(false);
  const [enableProfitTracking, setEnableProfitTracking] = useState(false);
  const [enableCategoryManagement, setEnableCategoryManagement] =
    useState(false);
  const [enableBrandManagement, setEnableBrandManagement] = useState(false);
  const [enableTaxManagement, setEnableTaxManagement] = useState(false);
  const [enableVariantManagement, setEnableVariantManagement] = useState(false);
  const [enableServiceManagement, setEnableServiceManagement] = useState(false);
  const [taxName, setTaxName] = useState<string>("");
  const [taxRate, setTaxRate] = useState<number | null>(null);
  const [taxIncludedInPrice, setTaxIncludedInPrice] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const { canView } = usePermissions();

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
      setEnableWarehouseManagement(data.enableWarehouseManagement ?? false);
      setEnableProfitTracking(data.enableProfitTracking ?? false);
      setEnableCategoryManagement(data.enableCategoryManagement ?? false);
      setEnableBrandManagement(data.enableBrandManagement ?? false);
      setEnableTaxManagement(data.enableTaxManagement ?? false);
      setEnableVariantManagement(data.enableVariantManagement ?? false);
      setEnableServiceManagement(data.enableServiceManagement ?? false);
      setTaxName(data.taxName ?? "");
      setTaxRate(data.taxRate ?? null);
      setTaxIncludedInPrice(data.taxIncludedInPrice ?? false);
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
        enableWarehouseManagement,
        enableProfitTracking,
        enableCategoryManagement,
        enableBrandManagement,
        enableTaxManagement,
        enableVariantManagement,
        enableServiceManagement,
        taxName: taxName || null,
        taxRate,
        taxIncludedInPrice,
      });
      message.success("Settings updated successfully");
      window.location.reload();
    } catch (error) {
      console.error("Error updating settings:", error);
      message.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = (file: RcFile): boolean => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("You can only upload image files!");
      return false;
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Image must be smaller than 2MB!");
      return false;
    }

    (async () => {
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
    })();

    return false;
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

  // Build tabs based on permissions
  const tabItems = [
    {
      key: "general",
      label: (
        <span className="flex items-center gap-2">
          <SettingOutlined />
          General
        </span>
      ),
      children: (
        <GeneralSettingsTab
          form={form}
          loading={loading}
          saving={saving}
          logoUrl={logoUrl}
          uploadingLogo={uploadingLogo}
          onFinish={onFinish}
          onLogoUpload={handleLogoUpload}
          onDeleteLogo={handleDeleteLogo}
        />
      ),
    },
    {
      key: "advanced",
      label: (
        <span className="flex items-center gap-2">
          <ControlOutlined />
          Advanced
        </span>
      ),
      children: (
        <AdvancedFeaturesTab
          saving={saving}
          enableSupplierManagement={enableSupplierManagement}
          enableWarehouseManagement={enableWarehouseManagement}
          enableProfitTracking={enableProfitTracking}
          enableCategoryManagement={enableCategoryManagement}
          enableBrandManagement={enableBrandManagement}
          enableTaxManagement={enableTaxManagement}
          enableVariantManagement={enableVariantManagement}
          enableServiceManagement={enableServiceManagement}
          taxName={taxName}
          taxRate={taxRate}
          taxIncludedInPrice={taxIncludedInPrice}
          setEnableSupplierManagement={setEnableSupplierManagement}
          setEnableWarehouseManagement={setEnableWarehouseManagement}
          setEnableProfitTracking={setEnableProfitTracking}
          setEnableCategoryManagement={setEnableCategoryManagement}
          setEnableBrandManagement={setEnableBrandManagement}
          setEnableTaxManagement={setEnableTaxManagement}
          setEnableVariantManagement={setEnableVariantManagement}
          setEnableServiceManagement={setEnableServiceManagement}
          setTaxName={setTaxName}
          setTaxRate={setTaxRate}
          setTaxIncludedInPrice={setTaxIncludedInPrice}
          onSave={() => form.submit()}
        />
      ),
    },
  ];

  // Add Backups tab if user has permission
  if (canView("backups")) {
    tabItems.push({
      key: "backups",
      label: (
        <span className="flex items-center gap-2">
          <CloudUploadOutlined />
          Backups
        </span>
      ),
      children: <BackupsTab />,
    });
  }

  // Add Issues tab if user has permission
  if (canView("issues")) {
    tabItems.push({
      key: "issues",
      label: (
        <span className="flex items-center gap-2">
          <BugOutlined />
          Issues
        </span>
      ),
      children: <IssuesTab />,
    });
  }

  return (
    <div className="p-2 sm:p-4 md:p-6">
      {/* Page Header */}
      <div className="mb-6">
        <Title level={2} className="mb-1! flex items-center gap-3">
          <div className="w-10 h-10 bg-linear-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <SettingOutlined className="text-white text-lg" />
          </div>
          Settings
        </Title>
        <Text type="secondary">
          Manage your business settings, backups, and system issues
        </Text>
      </div>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        className="settings-tabs"
        size="large"
      />
    </div>
  );
};

export default Settings;
