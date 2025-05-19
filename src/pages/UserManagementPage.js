// src/pages/UserManagementPage.js
import React, { useEffect, useState, useCallback } from "react";
import { Table, Button, Modal, Form, Input, Select, message, Switch } from "antd";
import axios from "../services/axiosInstance";

const { Option } = Select;

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [filterStatus, setFilterStatus] = useState("active");
  const [form] = Form.useForm();

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/users", {
        params: filterStatus === "all" ? {} : { active: filterStatus === "active" }
      });
      setUsers(response.data);
    } catch (error) {
      message.error("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);
  

  const handleToggleStatus = async (user) => {
    try {
      await axios.put(`/api/users/${user._id}`, { isActive: !user.isActive });
      message.success("Status updated.");
      fetchUsers();
    } catch {
      message.error("Failed to update status.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchUsers();
  }, [filterStatus]);

  // Handle Save (Add or Update)
  const handleSave = async (values) => {
    try {
      const payload = { ...values, role: "Admin" };
      if (editingUser) {
        await axios.put(`/api/users/${editingUser._id}`, payload);
        message.success("User updated successfully.");
      } else {
        await axios.post("/api/users", payload);
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
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <Button type="primary" onClick={() => showModal(null)}>
          Add User
        </Button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>Status:</span>
          <Select value={filterStatus} onChange={(val) => setFilterStatus(val)} style={{ width: 150 }}>
            <Option value="all">All</Option>
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
          </Select>
        </div>
      </div>

      <Table
        dataSource={users}
        rowKey="_id"
        loading={loading}
        columns={[
          {
            title: "Name",
            render: (_, record) => `${record.firstName} ${record.middleName || ""} ${record.lastName}`,
          },
          {
            title: "Email",
            dataIndex: "email",
          },
          {
            title: "Actions",
            render: (text, record) => (
              <div>
                <Button onClick={() => showModal(record)} style={{ marginRight: 8 }}>
                  Edit
                </Button>
              </div>
            ),
          },
          {
            title: "Status",
            render: (_, record) => (
              <Switch
                checked={record.isActive}
                checkedChildren="Active"
                unCheckedChildren="Inactive"
                onChange={() => handleToggleStatus(record)}
              />
            ),
            fixed: "right",
            width: 120,
          }
        ]}
      />
      <Modal
        title={editingUser ? "Edit User" : "Add User"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
        <Form.Item name="firstName" label="First Name" rules={[{ required: true, message: "Enter first name" }]}>
          <Input />
        </Form.Item>
        <Form.Item name="middleName" label="Middle Name">
          <Input />
        </Form.Item>
        <Form.Item name="lastName" label="Last Name" rules={[{ required: true, message: "Enter last name" }]}>
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
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagementPage;
