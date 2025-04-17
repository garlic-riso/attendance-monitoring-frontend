// src/pages/ParentManagementPage.js
import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, message, Select, Switch } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { Upload } from "antd";
import * as XLSX from "xlsx";
import axios from "../services/axiosInstance";


const ParentManagementPage = () => {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingParent, setEditingParent] = useState(null);
  const [filterStatus, setFilterStatus] = useState("active");
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

  const handleToggleStatus = async (parent) => {
    try {
      await axios.put(`/api/parents/${parent._id}`, {
        isActive: !parent.isActive,
      });
      fetchParents();
      message.success("Status updated.");
    } catch (error) {
      message.error("Failed to update status.");
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
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

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontWeight: 500 }}>Filter by Status:</span>
          <Select value={filterStatus} onChange={setFilterStatus} style={{ width: 150 }}>
            <Select.Option value="all">All</Select.Option>
            <Select.Option value="active">Active</Select.Option>
            <Select.Option value="inactive">Inactive</Select.Option>
          </Select>
        </div>
      </div>

      <Table
        dataSource={
          filterStatus === "all"
            ? parents
            : parents.filter(p => filterStatus === "active" ? p.isActive : !p.isActive)
        }
        rowKey="_id"
        loading={loading}
        columns={[
          { title: "First Name", dataIndex: "firstName" },
          { title: "Last Name", dataIndex: "lastName" },
          { title: "Email", dataIndex: "emailAddress" },
          { title: "Contact Number", dataIndex: "contactNumber" },
          {
            title: "Actions",
            render: (_, record) => (
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
                onChange={() => handleToggleStatus(record)}
                checkedChildren="Active"
                unCheckedChildren="Inactive"
              />
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
