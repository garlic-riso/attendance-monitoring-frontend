import React, { useEffect, useState, useCallback } from "react";
import { Table, Button, message, Form } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "../services/axiosInstance";
import dayjs from "dayjs";
import StudentFormModal from "../components/StudentFormModal";
import * as XLSX from "xlsx";

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

    try {
      if (editingStudent) {
        await axios.put(`/api/students/${editingStudent._id}`, values);
        message.success("Student updated successfully.");
      } else {
        await axios.post("/api/students", values);
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
        parentID: student.parentID?._id,
        sectionID: student.sectionID?._id,
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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const data = evt.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
  
      try {
        await axios.post("/api/students/bulk-import", jsonData);
        message.success("Bulk import successful.");
        fetchData();
      } catch (err) {
        if (
          err.response &&
          err.response.data &&
          err.response.data.errors &&
          Array.isArray(err.response.data.errors)
        ) {
          const errorDetails = err.response.data.errors
            .map(e => `Row ${e.row}: Missing fields - ${e.missingFields.join(", ")}`)
            .join("\n");
          message.error({
            content: (
              <div>
                <b>Bulk import failed:</b>
                <pre style={{ whiteSpace: "pre-wrap" }}>{errorDetails}</pre>
              </div>
            ),
            duration: 4,
          });
        } else {
          message.error("Bulk import failed.");
        }
      }
      
    };
    reader.readAsBinaryString(file);
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
      <input
        type="file"
        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        style={{ display: "none" }}
        id="bulkUpload"
        onChange={handleFileUpload}
      />
      <Button
        icon={<UploadOutlined />}
        onClick={() => document.getElementById("bulkUpload").click()}
        style={{ marginLeft: 8 }}
      >
        Bulk Import
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
