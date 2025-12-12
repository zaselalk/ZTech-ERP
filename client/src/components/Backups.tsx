import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Card,
  Typography,
  message,
  Popconfirm,
  Space,
  Modal,
} from "antd";
import {
  ReloadOutlined,
  CloudUploadOutlined,
  DeleteOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import { backupService } from "../services";
import { Backup } from "../types";

const { Title } = Typography;

const Backups = () => {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const data = await backupService.getBackups();
      setBackups(data);
    } catch (error) {
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
    } catch (error) {
      message.error("Failed to create backup");
    } finally {
      setCreating(false);
    }
  };

  const handleRestore = async (filename: string) => {
    Modal.confirm({
      title: "Are you sure you want to restore this backup?",
      content:
        "This will overwrite the current database. This action cannot be undone.",
      okText: "Yes, Restore",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        const hide = message.loading("Restoring database...", 0);
        try {
          await backupService.restoreBackup(filename);
          hide();
          message.success("Database restored successfully");
        } catch (error) {
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
    } catch (error) {
      message.error("Failed to delete backup");
    }
  };

  const columns = [
    {
      title: "Filename",
      dataIndex: "filename",
      key: "filename",
    },
    {
      title: "Size",
      dataIndex: "size",
      key: "size",
      render: (size: number) => `${(size / 1024).toFixed(2)} KB`,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Backup) => (
        <Space>
          <Button
            icon={<RollbackOutlined />}
            onClick={() => handleRestore(record.filename)}
            danger
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
            <Button icon={<DeleteOutlined />} type="text" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <Title level={2} style={{ margin: 0 }}>
            System Backups
          </Title>
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

        <Table
          columns={columns}
          dataSource={backups}
          rowKey="filename"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default Backups;
