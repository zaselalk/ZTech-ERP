import { useState, useEffect } from "react";
import { Button, Card, Typography, message, Space } from "antd";
import {
  ReloadOutlined,
  PlusOutlined,
  GithubOutlined,
} from "@ant-design/icons";
import { issueService } from "../services";
import { GithubIssue } from "../services/issueService";
import IssueList from "./features/issues/IssueList";
import IssueDetailModal from "./features/issues/IssueDetailModal";
import CreateIssueModal from "./features/issues/CreateIssueModal";

const { Title } = Typography;

const Issues = () => {
  const [issues, setIssues] = useState<GithubIssue[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<GithubIssue | null>(null);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const data = await issueService.getIssues();
      setIssues(data);
    } catch (error) {
      message.error("Failed to fetch issues");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={2} className="mb-0!">
          <GithubOutlined className="mr-2" />
          System Issues
        </Title>
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

      <Card className="shadow-md">
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

export default Issues;
