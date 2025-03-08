import React, { useEffect, useState, useCallback } from "react";
import { Table, Button, message, Form } from "antd";
import axios from "../services/axiosInstance";
import dayjs from "dayjs";
import StudentFormModal from "../components/StudentFormModal"; // Import the new modal component

const StudentManagementPage = () => {
  const [students, setStudents] = useState([]);
  const [parents, setParents] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [form] = Form.useForm();

  // Fetch Data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [studentsRes, parentsRes, sectionsRes] = await Promise.all([
        axios.get("/api/students"),
        axios.get("/api/parents"),
        axios.get("/api/sections"),
      ]);
      setStudents(studentsRes.data);
      setParents(parentsRes.data);
      setSections(sectionsRes.data);
    } catch (error) {
      message.error("Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Save (Add or Update)
  const handleSave = async (values) => {
    const payload = {
      ...values,
      parentID: values.parent,
      sectionID: values.section,
    };

    try {
      if (editingStudent) {
        await axios.put(`/api/students/${editingStudent._id}`, payload);
        message.success("Student updated successfully.");
      } else {
        await axios.post("/api/students", payload);
        message.success("Student added successfully.");
      }
      fetchData();
      handleModalClose();
    } catch (error) {
      message.error("Failed to save student.");
    }
  };

  // Handle Delete
  const handleDelete = async (studentId) => {
    try {
      await axios.delete(`/api/students/${studentId}`);
      message.success("Student deleted successfully.");
      fetchData();
    } catch (error) {
      message.error("Failed to delete student.");
    }
  };

  // Show Modal for Add/Edit
  const showModal = (student = null) => {
    setEditingStudent(student);
    setIsModalVisible(true);

    if (student) {
      form.setFieldsValue({
        ...student,
        parent: student.parentID?._id,
        section: student.sectionID?._id,
        dateEnrolled: student.dateEnrolled ? dayjs(student.dateEnrolled) : null,
      });
    } else {
      form.resetFields();
    }
  };

  // Close Modal
  const handleModalClose = () => {
    setIsModalVisible(false);
    setEditingStudent(null);
    form.resetFields();
  };

  const columns = [
    { title: "First Name", dataIndex: "firstName" },
    { title: "Last Name", dataIndex: "lastName" },
    { title: "Email", dataIndex: "emailAddress" },
    { title: "Program", dataIndex: "program" },
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
  ];

  return (
    <div>
      <Button type="primary" onClick={() => showModal()} style={{ marginBottom: 16 }}>
        Add Student
      </Button>
      <Table dataSource={students} rowKey="_id" loading={loading} columns={columns} />

      <StudentFormModal
        visible={isModalVisible}
        onCancel={handleModalClose}
        onSubmit={handleSave}
        form={form}
        parents={parents}
        sections={sections}
        editingStudent={editingStudent}
      />
    </div>
  );
};

export default StudentManagementPage;
