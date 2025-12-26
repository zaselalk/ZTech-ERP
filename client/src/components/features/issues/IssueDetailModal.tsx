import { Modal, Button, Space, Tag, Typography, Avatar, Divider } from "antd";
import {
  GithubOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { GithubIssue } from "../../../services/issueService";

const { Text } = Typography;

interface IssueDetailModalProps {
  issue: GithubIssue | null;
  onClose: () => void;
}

const IssueDetailModal = ({ issue, onClose }: IssueDetailModalProps) => {
  return (
    <Modal
      title={
        <div className="flex items-center gap-2 pr-8">
          <GithubOutlined />
          <span className="truncate">
            #{issue?.number} {issue?.title}
          </span>
        </div>
      }
      open={!!issue}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
      width={700}
    >
      {issue && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Space>
              <Tag
                color={issue.state === "open" ? "green" : "purple"}
                icon={
                  issue.state === "open" ? (
                    <SyncOutlined spin />
                  ) : (
                    <CheckCircleOutlined />
                  )
                }
              >
                {issue.state.toUpperCase()}
              </Tag>
              <Text type="secondary">
                Created on {new Date(issue.created_at).toLocaleString()}
              </Text>
            </Space>
            <Space>
              <Avatar
                src={issue.user.avatar_url}
                icon={<UserOutlined />}
                size="small"
              />
              <Text strong>{issue.user.login}</Text>
            </Space>
          </div>

          <Divider className="my-2" />

          <div
            className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm prose max-w-none"
            dangerouslySetInnerHTML={{
              __html: issue.body || "No description provided.",
            }}
          />
        </div>
      )}
    </Modal>
  );
};

export default IssueDetailModal;
