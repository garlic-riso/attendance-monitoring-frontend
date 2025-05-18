// src/pages/SectionManagementPage.js
import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, message, Switch, Select } from "antd";
import axios from "../services/axiosInstance";
import { Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";


const SectionManagementPage = ({ userRole }) => {
  const normalizedUserRole = userRole?.toLowerCase(); // Normalize userRole to lowercase

  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [students, setStudents] = useState([]);
  const [studentsModalVisible, setStudentsModalVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState("active");
  const [form] = Form.useForm();
  const [addStudentModalVisible, setAddStudentModalVisible] = useState(false);
  const [formAddStudent] = Form.useForm();
  const [facultyOptions, setFacultyOptions] = useState([]);
  const [unassignedStudents, setUnassignedStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);


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

  const fetchUnassignedStudents = async () => {
    try {
      const response = await axios.get("/api/students/unassigned");
      setUnassignedStudents(response.data);
    } catch {
      message.error("Failed to fetch unassigned students.");
    }
  };
  

  const fetchFaculty = async () => {
    try {
      const response = await axios.get("/api/teachers?active=true");
      setFacultyOptions(response.data);
    } catch {
      message.error("Failed to fetch faculty list.");
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
    fetchFaculty();
    fetchSections();
  }, []);

  const handleAddStudent = async (values) => {
    try {
      await axios.post(`/api/sections/${selectedSection._id}/students`, values);
      message.success("Student added successfully.");
      fetchStudents(selectedSection._id);
      setAddStudentModalVisible(false);
      formAddStudent.resetFields();
    } catch (error) {
      const msg =
      error.response?.data?.error || error.response?.data?.message || "Failed to add student.";
      message.error(msg);}
  };
  
  

  // Handle Save (Add or Update)
  const handleSave = async (values) => {
    try {
      if (editingSection) {
        await axios.put(`/api/sections/${editingSection._id}`, values);
        message.success("Section updated successfully.");
      } else {
        await axios.post("/api/sections", values);
        message.success("Section added successfully.");
      }
      fetchSections();
      setIsModalVisible(false);
      setEditingSection(null);
      form.resetFields();
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to save section.";
      if (msg.includes("Duplicate section name and grade combination")) {
        message.error("A section with this name and grade already exists.");
      } else {
        message.error(msg);
      }
    }    
  };
  

  const showModal = (section) => {
    setEditingSection(section || null);
    setIsModalVisible(true);
    if (section) {
      form.setFieldsValue({
        name: section.name,
        grade: section.grade,
        advisorID: section.advisorID || null,
      });
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
        {normalizedUserRole === "admin" && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button type="primary" onClick={() => showModal(null)}>
              Add Section
            </Button>
            <Upload accept=".csv, .xlsx" showUploadList={false} beforeUpload={handleBulkImport}>
              <Button icon={<UploadOutlined />}>Bulk Import</Button>
            </Upload>
          </div>
        )}
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
                {normalizedUserRole === "admin" && (
                  <Button onClick={() => showModal(record)} style={{ marginRight: 8 }}>
                    Edit
                  </Button>
                )}
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
                disabled={normalizedUserRole !== "admin"}
              />
            ),
            fixed: "right",
            width: 120,
          },
        ]}
      />
      <Modal
        title={`Students in ${selectedSection?.name}`}
        open={studentsModalVisible}
        onCancel={() => setStudentsModalVisible(false)}
        footer={null}
      >
        <Button type="primary" onClick={() => {
          fetchUnassignedStudents();
          setAddStudentModalVisible(true);
        }}>
          Add Student
        </Button>
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
                <Button
                  type="link"
                  danger
                  onClick={() => handleRemoveStudent(record._id)}
                >
                  Remove
                </Button>
              ),
            },
          ]}
        />
      </Modal>
      <Modal
        title="Add Student"
        open={addStudentModalVisible}
        onCancel={() => setAddStudentModalVisible(false)}
        onOk={async () => {
          if (!selectedStudentId) {
            message.warning("Please select a student.");
            return;
          }
          try {
            await axios.put(`/api/students/${selectedStudentId}/assign`, {
              sectionID: selectedSection._id,
            });
            message.success("Student assigned successfully.");
            fetchStudents(selectedSection._id);
            setAddStudentModalVisible(false);
            setSelectedStudentId(null);
          } catch (error) {
            message.error("Failed to assign student.");
          }
        }}
      >
        <Select
          style={{ width: "100%" }}
          placeholder="Select a student"
          onChange={value => setSelectedStudentId(value)}
          value={selectedStudentId}
        >
          {unassignedStudents.map(student => (
            <Select.Option key={student._id} value={student._id}>
              {student.firstName} {student.lastName}
            </Select.Option>
          ))}
        </Select>
      </Modal>

      <Modal
        title={editingSection ? "Edit Section" : "Add Section"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="name" label="Section Name" rules={[{ required: true, message: "Please input the section name" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="grade" label="Grade Level" rules={[{ required: true, message: "Please input the grade level" }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="advisorID" label="Faculty Adviser">
            <Select allowClear placeholder="Select Adviser">
              {facultyOptions.map(fac => (
                <Select.Option key={fac._id} value={fac._id}>
                  {fac.firstName} {fac.lastName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>


    </div>
  );
};

export default SectionManagementPage;
