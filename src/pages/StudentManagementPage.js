import React, { useEffect, useState, useCallback } from "react";
import { Table, Button, message, Form, Switch, Select } from "antd";
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
  const [filterStatus, setFilterStatus] = useState("all");
  const [form] = Form.useForm();

  // Fetch Data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [studentsRes, parentsRes, sectionsRes] = await Promise.all([
        axios.get("/api/students"),
        axios.get("/api/parents?active=true"),
        axios.get("/api/sections?active=true"),
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

  useEffect(() => {
    if (editingStudent && editingStudent.sectionID) {
      const exists = sections.some(sec => sec._id === editingStudent.sectionID._id);
      if (!exists) {
        setSections(prev => [...prev, editingStudent.sectionID]);
      }
    }
  }, [editingStudent, sections]);

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

  const handleToggleStatus = async (student) => {
    try {
      await axios.put(`/api/students/${student._id}`, {
        isActive: !student.isActive,
      });
      message.success("Status updated.");
      fetchData();
    } catch (error) {
      message.error("Failed to update status.");
    }
  };

  const columns = [
    { title: "First Name", dataIndex: "firstName" },
    { title: "Last Name", dataIndex: "lastName" },
    { title: "Email", dataIndex: "emailAddress" },
    { title: "Program", dataIndex: "program" },
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
      title: "Active",
      dataIndex: "isActive",
      render: (value, record) => (
        <Switch
          checked={record.isActive}
          onChange={() => handleToggleStatus(record)}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
        />
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Button type="primary" onClick={() => showModal()}>
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
          >
            Bulk Import
          </Button>
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
            ? students
            : students.filter(s =>
                filterStatus === "active" ? s.isActive : !s.isActive
              )
        }
        rowKey="_id"
        loading={loading}
        columns={columns}
      />
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
