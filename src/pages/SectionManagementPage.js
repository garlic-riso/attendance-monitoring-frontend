// src/pages/SectionManagementPage.js
import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, message, Switch, Select } from "antd";
import axios from "../services/axiosInstance";
import { Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";


const SectionManagementPage = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [students, setStudents] = useState([]);
  const [studentsModalVisible, setStudentsModalVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [form] = Form.useForm();

  // Fetch Sections
  const fetchSections = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/sections");
      setSections(response.data);
    } catch (error) {
      message.error("Failed to load sections.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (sectionId) => {
    try {
      const response = await axios.get(`/api/sections/${sectionId}/students`);
      setStudents(response.data);
      setStudentsModalVisible(true);
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to fetch students.";
      message.error(errorMsg);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  // Handle Save (Add or Update)
  const handleSave = async (values) => {
    try {
      if (editingSection) {
        // Update Section
        await axios.put(`/api/sections/${editingSection._id}`, values);
        message.success("Section updated successfully.");
      } else {
        // Add Section
        await axios.post("/api/sections", values);
        message.success("Section added successfully.");
      }
      fetchSections();
      setIsModalVisible(false);
      setEditingSection(null);
      form.resetFields();
    } catch (error) {
      message.error("Failed to save section.");
    }
  };

  // Show Modal for Add/Edit
  const showModal = (section) => {
    setEditingSection(section || null);
    setIsModalVisible(true);
    if (section) {
      form.setFieldsValue(section);
    } else {
      form.resetFields();
    }
  };

  const handleRemoveStudent = async (studentId) => {
    try {
      await axios.delete(`/api/sections/${selectedSection._id}/students/${studentId}`);
      message.success("Student removed successfully.");
      fetchStudents(selectedSection._id);
    } catch (error) {
      message.error("Failed to remove student.");
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
        await axios.post("/api/sections/bulk-import", jsonData);
        message.success("Bulk import successful.");
        fetchSections();
      } catch (error) {
        if (error.response?.data?.errors) {
          const errorList = error.response.data.errors;
          Modal.error({
            title: "Import Errors",
            content: (
              <ul style={{ maxHeight: 200, overflowY: "auto", paddingLeft: 16 }}>
                {errorList.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            ),
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
  


  const handleToggleStatus = async (section) => {
    try {
      await axios.put(`/api/sections/${section._id}`, {
        isActive: !section.isActive,
      });
      fetchSections();
      message.success("Section status updated.");
    } catch (error) {
      message.error("Failed to update status.");
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button type="primary" onClick={() => showModal(null)}>
            Add Section
          </Button>
          <Upload accept=".csv, .xlsx" showUploadList={false} beforeUpload={handleBulkImport}>
            <Button icon={<UploadOutlined />}>Bulk Import</Button>
          </Upload>
        </div>
        <div>
          <span style={{ marginRight: 8 }}>Filter by Status:</span>
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
            ? sections
            : sections.filter(s => filterStatus === "active" ? s.isActive : !s.isActive)
        }
        rowKey="_id"
        loading={loading}
        columns={[
          {
            title: "Section",
            dataIndex: "name",
          },
          {
            title: "Grade",
            dataIndex: "grade",
          },
          {
            title: "Actions",
            render: (text, record) => (
              <div>
                <Button onClick={() => {
                  setSelectedSection(record);
                  fetchStudents(record._id);
                }} style={{ marginRight: 8 }}>
                  View Students
                </Button>
                <Button onClick={() => showModal(record)} style={{ marginRight: 8 }}>
                  Edit
                </Button>
              </div>
            ),
            fixed: "right",
            width: 300,
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
        title={editingSection ? "Edit Section" : "Add Section"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            name="name"
            label="Section Name"
            rules={[{ required: true, message: "Please enter the section name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="grade"
            label="Grade"
            rules={[{ required: true, message: "Please enter the grade" }]}
          >
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={`Students in ${selectedSection?.name}`}
        open={studentsModalVisible}
        onCancel={() => setStudentsModalVisible(false)}
        footer={null}
      >
        <Table
          dataSource={students}
          rowKey="_id"
          columns={[
            {
              title: "Name",
              dataIndex: "name",
              render: (_, record) => `${record.firstName} ${record.lastName}`,
            },
            {
              title: "Email",
              dataIndex: "emailAddress",
            },
            {
              title: "Actions",
              render: (_, record) => (
                <Button danger onClick={() => handleRemoveStudent(record._id)}>
                  Remove
                </Button>
              ),
            },
          ]}
        />
      </Modal>
    </div>
  );
};

export default SectionManagementPage;
