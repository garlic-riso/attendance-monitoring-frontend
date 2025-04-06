import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Upload, message } from "antd";
import * as XLSX from "xlsx";
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

  return (
    <div>
      <div style={{ display: "flex", gap: "8px", marginBottom: 16 }}>
        <Button type="primary" onClick={() => showModal(null)}>Add Teacher</Button>
        <Upload accept=".csv, .xlsx" showUploadList={false} beforeUpload={handleBulkImport}>
          <Button icon={<UploadOutlined />}>Bulk Import</Button>
        </Upload>
      </div>
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
