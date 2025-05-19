import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Select, message, Switch, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import axios from "../services/axiosInstance";

const { Option } = Select;

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [filterStatus, setFilterStatus] = useState("active");

  const [form] = Form.useForm();

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

  const handleSave = async (values) => {
    try {
      if (editingSubject) {
        await axios.put(`/api/subjects/${editingSubject._id}`, values);
        message.success("Subject updated successfully");
      } else {
        await axios.post("/api/subjects", {
          subjectName: values.subjectName,
          gradeLevel: values.gradeLevel,
          isActive: values.isActive,
        });
        message.success("Subject created successfully");
      }
      fetchSubjects();
      handleCloseModal();
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to save the subject.";
      message.error(msg);
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
        await axios.post("/api/subjects/bulk-import", jsonData);
        message.success("Bulk import successful.");
        fetchSubjects();
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
  

  const handleToggleStatus = async (record) => {
    try {
      await axios.put(`/api/subjects/${record._id}`, {
        subjectName: record.subjectName,
        gradeLevel: record.gradeLevel,
        isActive: !record.isActive,
      });
      message.success("Status updated.");
      fetchSubjects();
    } catch (error) {
      message.error("Failed to update status.");
    }
  };

  const handleOpenModal = (subject = null) => {
    setEditingSubject(subject);
    setIsModalOpen(true);
    if (subject) {
      form.setFieldsValue(subject);
    } else {
      form.resetFields();
    }
  };

  const handleCloseModal = () => {
    setEditingSubject(null);
    setIsModalOpen(false);
  };

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
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button type="link" onClick={() => handleOpenModal(record)}>
          Edit
        </Button>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => (
        <Switch
          checked={record.isActive}
          onChange={() => handleToggleStatus(record)}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
        />
      ),
    },
  ];

  useEffect(() => {
    fetchSubjects();
  }, []);

  const filteredSubjects =
    filterStatus === "all"
      ? subjects
      : subjects.filter((s) => (filterStatus === "active" ? s.isActive : !s.isActive));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <Button type="primary" onClick={() => handleOpenModal()}>
            Add Subject
          </Button>
          <Upload accept=".csv, .xlsx" showUploadList={false} beforeUpload={handleBulkImport}>
            <Button icon={<UploadOutlined />}>Bulk Import</Button>
          </Upload>
        </div>
        <div>
          <span style={{ marginRight: 8 }}>Filter by Status:</span>
          <Select value={filterStatus} onChange={setFilterStatus} style={{ width: 150 }}>
            <Option value="all">All</Option>
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
          </Select>
        </div>
      </div>

      <Table
        dataSource={filteredSubjects.map((item) => ({ ...item, key: item._id }))}
        columns={columns}
        loading={loading}
        bordered
      />

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
          initialValues={editingSubject || { isActive: true }}
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
          <Form.Item name="isActive" label="Status" valuePropName="checked">
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
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
