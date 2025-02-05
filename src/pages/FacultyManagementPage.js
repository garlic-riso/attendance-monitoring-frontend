import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "../services/axiosInstance";

const FacultyManagementPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [form] = Form.useForm();

  // Fetch Teachers
  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/teachers");
      setTeachers(response.data);
    } catch (error) {
      message.error("Failed to load teachers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // Handle Save (Add or Update)
  const handleSave = async (values) => {
    try {
      if (editingTeacher) {
        // Update Teacher
        await axios.put(`/api/teachers/${editingTeacher._id}`, values);
        message.success("Teacher updated successfully.");
      } else {
        // Add Teacher
        await axios.post("/api/teachers", values);
        message.success("Teacher added successfully.");
      }
      fetchTeachers();
      setIsModalVisible(false);
      setEditingTeacher(null);
      form.resetFields();
    } catch (error) {
      message.error("Failed to save teacher.");
    }
  };

  // Handle Delete
  const handleDelete = async (teacherId) => {
    try {
      await axios.delete(`/api/teachers/${teacherId}`);
      message.success("Teacher deleted successfully.");
      fetchTeachers();
    } catch (error) {
      message.error("Failed to delete teacher.");
    }
  };

  // Bulk Import Teachers
  const handleBulkImport = async ({ file }) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post("/api/teachers/bulk-import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      message.success("Teachers imported successfully.");
      fetchTeachers();
    } catch (error) {
      message.error("Failed to import teachers.");
    }
  };

  // Show Modal for Add/Edit
  const showModal = (teacher) => {
    setEditingTeacher(teacher || null);
    setIsModalVisible(true);
    if (teacher) {
      form.setFieldsValue(teacher);
    } else {
      form.resetFields();
    }
  };

  return (
    <div>
      <Button
        type="primary"
        onClick={() => showModal(null)}
        style={{ marginBottom: 16 }}
      >
        Add Teacher
      </Button>
      <Upload
        customRequest={handleBulkImport}
        accept=".xlsx, .xls"
        showUploadList={false}
      >
        <Button icon={<UploadOutlined />} style={{ marginBottom: 16 }}>
          Bulk Import
        </Button>
      </Upload>
      <Table
        dataSource={teachers}
        rowKey="_id"
        loading={loading}
        columns={[
          {
            title: "Name",
            dataIndex: "name",
          },
          {
            title: "Email",
            dataIndex: "email",
          },
          {
            title: "Specialization",
            dataIndex: "specialization",
          },
          {
            title: "Actions",
            render: (text, record) => (
              <div>
                <Button
                  onClick={() => showModal(record)}
                  style={{ marginRight: 8 }}
                >
                  Edit
                </Button>
                <Button danger onClick={() => handleDelete(record._id)}>
                  Delete
                </Button>
              </div>
            ),
          },
        ]}
      />
      <Modal
        title={editingTeacher ? "Edit Teacher" : "Add Teacher"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please enter the name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter the email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="specialization"
            label="Specialization"
            rules={[{ required: true, message: "Please enter the specialization" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FacultyManagementPage;
