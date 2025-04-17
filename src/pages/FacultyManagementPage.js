import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Upload, message, Switch, Select } from "antd";
import * as XLSX from "xlsx";
import { UploadOutlined } from "@ant-design/icons";
import axios from "../services/axiosInstance";

const FacultyManagementPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [filterStatus, setFilterStatus] = useState("active");
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

  const handleBulkImport = async (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
  
      try {
        const response = await axios.post("/api/teachers/bulk-import", jsonData);
        message.success("Bulk import successful.");
        fetchTeachers();
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

  const handleToggleStatus = async (faculty) => {
    try {
      await axios.put(`/api/teachers/${faculty._id}`, {
        isActive: !faculty.isActive,
      });
      fetchTeachers();
      message.success("Status updated.");
    } catch (error) {
      message.error("Failed to update status.");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <Button type="primary" onClick={() => showModal(null)}>Add Teacher</Button>
          <Upload accept=".csv, .xlsx" showUploadList={false} beforeUpload={handleBulkImport}>
            <Button icon={<UploadOutlined />}>Bulk Import</Button>
          </Upload>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontWeight: 500 }}>Filter by Status:</span>
          <Select
            value={filterStatus}
            onChange={setFilterStatus}
            style={{ width: 150 }}
          >
            <Select.Option value="all">All</Select.Option>
            <Select.Option value="active">Active</Select.Option>
            <Select.Option value="inactive">Inactive</Select.Option>
          </Select>
        </div>
      </div>


      <Table
        dataSource={
          filterStatus === "all"
            ? teachers
            : teachers.filter(t => filterStatus === "active" ? t.isActive : !t.isActive)
        }
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
              </div>
            ),
            fixed: "right",
            width: 100,
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
            fixed: "right",
            width: 120,
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
