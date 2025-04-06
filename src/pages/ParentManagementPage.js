// src/pages/ParentManagementPage.js
import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { Upload } from "antd";
import * as XLSX from "xlsx";
import axios from "../services/axiosInstance";


const ParentManagementPage = () => {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingParent, setEditingParent] = useState(null);
  const [form] = Form.useForm();

  // Fetch Parents
  const fetchParents = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/parents");
      setParents(response.data);
    } catch (error) {
      message.error("Failed to load parents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParents();
  }, []);

  // Handle Save (Add or Update)
  const handleSave = async (values) => {
    try {
      if (editingParent) {
        await axios.put(`/api/parents/${editingParent._id}`, values);
        message.success("Parent updated successfully.");
      } else {
        await axios.post("/api/parents", values);
        message.success("Parent added successfully.");
      }
      fetchParents();
      setIsModalVisible(false);
      setEditingParent(null);
      form.resetFields();
    } catch (error) {
      message.error("Failed to save parent.");
    }
  };

  // Handle Delete
  const handleDelete = async (parentId) => {
    try {
      await axios.delete(`/api/parents/${parentId}`);
      message.success("Parent deleted successfully.");
      fetchParents();
    } catch (error) {
      message.error("Failed to delete parent.");
    }
  };

  // Show Modal for Add/Edit
  const showModal = (parent) => {
    setEditingParent(parent || null);
    setIsModalVisible(true);
    if (parent) {
      form.setFieldsValue(parent);
    } else {
      form.resetFields();
    }
  };

  const handleBulkUpload = async (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
  
      try {
        const response = await axios.post("/api/parents/bulk-import", jsonData);
        message.success("Bulk import successful.");
        fetchParents();
      } catch (error) {
        if (error.response?.data?.errors) {
          const errorList = error.response.data.errors.map(
            (err, index) => `Row ${index + 2}: ${err}`
          );
          Modal.error({
            title: "Import Errors",
            content: <ul>{errorList.map((e, i) => <li key={i}>{e}</li>)}</ul>,
            width: 600,
          });
        } else {
          message.error("Failed to import.");
        }
      }
    };
    reader.readAsArrayBuffer(file);
    return false;
  };
  

  return (
    <div>
      <div style={{ display: "flex", gap: "8px", marginBottom: 16 }}>
        <Button type="primary" onClick={() => showModal(null)}>
          Add Parent
        </Button>
        <Upload
          accept=".csv, .xlsx"
          showUploadList={false}
          beforeUpload={(file) => handleBulkUpload(file)}
        >
          <Button icon={<UploadOutlined />}>Bulk Import</Button>
        </Upload>
      </div>
      <Table
        dataSource={parents}
        rowKey="_id"
        loading={loading}
        columns={[
          { title: "First Name", dataIndex: "firstName" },
          { title: "Last Name", dataIndex: "lastName" },
          { title: "Email", dataIndex: "emailAddress" },
          { title: "Contact Number", dataIndex: "contactNumber" },
          { title: "Status", dataIndex: "status" },
          {
            title: "Actions",
            render: (_, record) => (
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
        title={editingParent ? "Edit Parent" : "Add Parent"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="emailAddress" label="Email" rules={[{ required: true, type: "email" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="contactNumber" label="Contact Number" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ParentManagementPage;
