import { useState } from "react";
import { Modal, Form, Input, Button, Space, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { issueService } from "../../../services";

const { TextArea } = Input;

interface CreateIssueModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const CreateIssueModal = ({
  visible,
  onCancel,
  onSuccess,
}: CreateIssueModalProps) => {
  const [form] = Form.useForm();
  const [creating, setCreating] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);

  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleCreateIssue = async (values: { title: string; body: string }) => {
    setCreating(true);
    try {
      let imageData = undefined;
      let imageName = undefined;

      if (fileList.length > 0) {
        const file = fileList[0].originFileObj;
        const base64 = await getBase64(file);
        // Remove data:image/png;base64, prefix
        imageData = base64.split(",")[1];
        imageName = file.name;
      }

      await issueService.createIssue({
        ...values,
        image: imageData,
        imageName: imageName,
      });
      message.success(
        "Issue submitted, Please wait for few minutes for it to appear."
      );
      form.resetFields();
      setFileList([]);
      onSuccess();
    } catch (error) {
      message.error("Failed to submit issue");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal
      title="Submit New Issue"
      open={visible}
      onCancel={onCancel}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={handleCreateIssue}>
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: "Please enter a title" }]}
        >
          <Input placeholder="Brief description of the issue" />
        </Form.Item>

        <Form.Item
          name="body"
          label="Description"
          rules={[{ required: true, message: "Please enter a description" }]}
        >
          <TextArea
            rows={4}
            placeholder="Detailed explanation of the issue, steps to reproduce, etc."
          />
        </Form.Item>

        <Form.Item label="Screenshot (Optional)">
          <Upload
            beforeUpload={(file) => {
              const isLt5M = file.size / 1024 / 1024 < 5;
              if (!isLt5M) {
                message.error("Image must be smaller than 5MB!");
                return Upload.LIST_IGNORE;
              }
              return false;
            }}
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            maxCount={1}
            listType="picture"
            accept="image/*"
          >
            <Button icon={<UploadOutlined />}>Select Image</Button>
          </Upload>
        </Form.Item>

        <Form.Item className="mb-0 text-right">
          <Space>
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={creating}>
              Submit
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateIssueModal;
