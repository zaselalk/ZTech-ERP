import { Table, Typography, Tabs } from "antd";
import { SyncOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { GithubIssue } from "../../../services/issueService";

const { Text } = Typography;

interface IssueListProps {
  issues: GithubIssue[];
  loading: boolean;
  onIssueClick: (issue: GithubIssue) => void;
}

const IssueList = ({ issues, loading, onIssueClick }: IssueListProps) => {
  const columns = [
    {
      title: "ID",
      dataIndex: "number",
      key: "number",
      width: 80,
      render: (text: number) => <Text strong>#{text}</Text>,
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: GithubIssue) => (
        <a
          onClick={(e) => {
            e.preventDefault();
            onIssueClick(record);
          }}
          className="cursor-pointer hover:underline"
        >
          {text}
        </a>
      ),
    },

    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      width: 200,
      render: (date: string) => new Date(date).toLocaleString(),
    },
  ];

  const openIssues = issues.filter((issue) => issue.state === "open");
  const closedIssues = issues.filter((issue) => issue.state === "closed");

  const tabItems = [
    {
      key: "open",
      label: (
        <span>
          <SyncOutlined className="mr-2" />
          Todo ({openIssues.length})
        </span>
      ),
      children: (
        <Table
          columns={columns}
          dataSource={openIssues}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      ),
    },
    {
      key: "closed",
      label: (
        <span>
          <CheckCircleOutlined className="mr-2" />
          Completed ({closedIssues.length})
        </span>
      ),
      children: (
        <Table
          columns={columns}
          dataSource={closedIssues}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      ),
    },
  ];

  return <Tabs defaultActiveKey="open" items={tabItems} />;
};

export default IssueList;
