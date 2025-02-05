import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Select, message } from "antd";
import axios from "../services/axiosInstance";

const { Option } = Select;

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  const [form] = Form.useForm();

  // Fetch subjects from the API
  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/subjects");
      setSubjects(response.data);
    } catch (error) {
      message.error("Failed to fetch subjects. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Add or Update Subject
  const handleSave = async (values) => {
    try {
      if (editingSubject) {
        // Update subject
        await axios.put(`/api/subjects/${editingSubject._id}`, values);
        message.success("Subject updated successfully");
      } else {
        // Create new subject
        await axios.post("/api/subjects", values);
        message.success("Subject created successfully");
      }
      fetchSubjects(); // Refresh the table
      handleCloseModal();
    } catch (error) {
      message.error("Failed to save the subject. Please try again.");
    }
  };

  // Delete a subject
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/subjects/${id}`);
      message.success("Subject deleted successfully");
      fetchSubjects();
    } catch (error) {
      message.error("Failed to delete the subject. Please try again.");
    }
  };

  // Open modal for creating or editing
  const handleOpenModal = (subject = null) => {
    setEditingSubject(subject);
    setIsModalOpen(true);
    if (subject) {
      form.setFieldsValue(subject);
    } else {
      form.resetFields();
    }
  };

  // Close modal
  const handleCloseModal = () => {
    setEditingSubject(null);
    setIsModalOpen(false);
  };

  // Table columns
  const columns = [
    {
      title: "Subject Name",
      dataIndex: "subjectName",
      key: "subjectName",
    },
    {
      title: "Grade Level",
      dataIndex: "gradeLevel",
      key: "gradeLevel",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Date Created",
      dataIndex: "dateCreated",
      key: "dateCreated",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => handleOpenModal(record)}>
            Edit
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record._id)}>
            Delete
          </Button>
        </>
      ),
    },
  ];

  // Fetch subjects on component mount
  useEffect(() => {
    fetchSubjects();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Subjects Management</h1>
      <Button
        type="primary"
        onClick={() => handleOpenModal()}
        style={{ marginBottom: 20 }}
      >
        Add Subject
      </Button>
      <Table
        dataSource={subjects.map((item) => ({
          ...item,
          key: item._id,
        }))}
        columns={columns}
        loading={loading}
        bordered
      />

      {/* Modal for Add/Edit */}
      <Modal
        title={editingSubject ? "Edit Subject" : "Add Subject"}
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{ status: "Active" }}
        >
          <Form.Item
            name="subjectName"
            label="Subject Name"
            rules={[{ required: true, message: "Subject Name is required" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="gradeLevel"
            label="Grade Level"
            rules={[{ required: true, message: "Grade Level is required" }]}
          >
            <Input type="number" min={1} />
          </Form.Item>
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: "Status is required" }]}
          >
            <Select>
              <Option value="Active">Active</Option>
              <Option value="Inactive">Inactive</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ marginRight: 10 }}>
              Save
            </Button>
            <Button onClick={handleCloseModal}>Cancel</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SubjectsPage;
