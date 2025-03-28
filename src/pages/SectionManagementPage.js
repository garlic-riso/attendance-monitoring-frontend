// src/pages/SectionManagementPage.js
import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, message } from "antd";
import axios from "../services/axiosInstance";

const SectionManagementPage = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [students, setStudents] = useState([]);
  const [studentsModalVisible, setStudentsModalVisible] = useState(false);
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
      // console.log(error.message)
      message.error(error.message);
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

  // Handle Delete
  const handleDelete = async (sectionId) => {
    try {
      await axios.delete(`/api/sections/${sectionId}`);
      message.success("Section deleted successfully.");
      fetchSections();
    } catch (error) {
      message.error("Failed to delete section.");
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

  return (
    <div>
      <Button type="primary" onClick={() => showModal(null)} style={{ marginBottom: 16 }}>
        Add Section
      </Button>
      <Table
        dataSource={sections}
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
                <Button danger onClick={() => handleDelete(record._id)}>
                  Delete
                </Button>
              </div>
            ),
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
            name="sectionId"
            label="Section ID"
            rules={[{ required: true, message: "Please enter the section ID" }]}
          >
            <Input />
          </Form.Item>
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
              dataIndex: "email",
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
