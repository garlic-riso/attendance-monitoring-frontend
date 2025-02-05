// src/pages/UserManagementPage.js
import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Select, message } from "antd";
import axios from "../services/axiosInstance";

const { Option } = Select;

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  // Fetch Users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/users");
      setUsers(response.data);
    } catch (error) {
      message.error("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle Save (Add or Update)
  const handleSave = async (values) => {
    try {
      if (editingUser) {
        // Update User
        await axios.put(`/api/users/${editingUser._id}`, values);
        message.success("User updated successfully.");
      } else {
        // Add User
        await axios.post("/users", values);
        message.success("User added successfully.");
      }
      fetchUsers();
      setIsModalVisible(false);
      setEditingUser(null);
      form.resetFields();
    } catch (error) {
      message.error("Failed to save user.");
    }
  };

  // Handle Delete
  const handleDelete = async (userId) => {
    try {
      await axios.delete(`/api/users/${userId}`);
      message.success("User deleted successfully.");
      fetchUsers();
    } catch (error) {
      message.error("Failed to delete user.");
    }
  };

  // Show Modal for Add/Edit
  const showModal = (user) => {
    setEditingUser(user || null);
    setIsModalVisible(true);
    if (user) {
      form.setFieldsValue(user);
    } else {
      form.resetFields();
    }
  };

  return (
    <div>
      <Button type="primary" onClick={() => showModal(null)} style={{ marginBottom: 16 }}>
        Add User
      </Button>
      <Table
        dataSource={users}
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
            title: "Role",
            dataIndex: "role",
          },
          {
            title: "Actions",
            render: (text, record) => (
              <div>
                <Button onClick={() => showModal(record)} style={{ marginRight: 8 }}>
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
        title={editingUser ? "Edit User" : "Add User"}
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
          <Form.Item name="role" label="Role" rules={[{ required: true, message: "Please select a role" }]}>
            <Select>
              <Option value="Admin">Admin</Option>
              <Option value="User">User</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagementPage;
