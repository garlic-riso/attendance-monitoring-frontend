import React, { useState, useEffect, useCallback } from "react";
import { Tabs, Table, Button, Select, Form, message, Spin } from "antd";
import axios from "../services/axiosInstance";
import ScheduleModal from "../components/ScheduleModal";

const { Option } = Select;

const SchedulePage = () => {
  const [schedules, setSchedules] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState("Monday");
  const [editingRecord, setEditingRecord] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [form] = Form.useForm();

  const [filters, setFilters] = useState({
    gradeLevel: "",
    academicYear: "2024-2025",
    quarter: "First",
  });

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [defaultSchedule, sectionsData, subjectsData, teachersData] = await Promise.all([
        axios.get("/api/defaultSchedule").then((res) => res.data),
        axios.get("/api/sections").then((res) => res.data),
        axios.get("/api/subjects").then((res) => res.data),
        axios.get("/api/teachers").then((res) => res.data),
      ]);

      setFilters((prev) => ({
        ...prev,
        gradeLevel: defaultSchedule.sectionId || "",
        academicYear: defaultSchedule.academicYear || "2024-2025",
        quarter: defaultSchedule.quarter || "First",
      }));

      setSections(sectionsData);
      setSubjects(subjectsData);
      setTeachers(teachersData);
    } catch {
      message.error("Failed to initialize data.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const { gradeLevel, academicYear, quarter } = filters;
      const schedulesData = await axios.get("/api/schedules", {
        params: { sectionID: gradeLevel, academicYear, quarter },
      }).then((res) => res.data);

      setSchedules(
        schedulesData.reduce((acc, schedule) => ({
          ...acc,
          [schedule.week]: [...(acc[schedule.week] || []), schedule], // Use API response directly
        }), {})
      );
    } catch {
      message.error("Failed to fetch schedules.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    fetchSchedules();
  }, [filters, fetchSchedules]);


  const handleEdit = (record) => {
    setEditingRecord(record);
  
    form.setFieldsValue({
      ...record,
      subjectID: record.subjectID?._id || record.subjectID || null, 
      teacherID: record.teacherID?._id || record.teacherID || null,
    });
  
    setIsCreateMode(false);
    setIsModalVisible(true);
  };
  
  

  const handleCreate = () => {
    form.resetFields();
    setEditingRecord(null);
    setIsCreateMode(true);
    setIsModalVisible(true);
  };

  const handleDelete = async (record) => {
    try {
      await axios.delete(`/api/schedules/${record.key}`);
      fetchSchedules();
      message.success("Schedule deleted successfully.");
    } catch {
      message.error("Failed to delete schedule.");
    }
  };

  const handleSave = async (values) => {
    try {
      if (isCreateMode) {
        await axios.post("/api/schedules", values);
      } else {
        await axios.put(`/api/schedules/${editingRecord.key}`, values);
      }
      message.success(isCreateMode ? "Schedule created successfully." : "Schedule updated successfully.");
      fetchSchedules();
      setIsModalVisible(false);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to save schedule.";
      message.error(errorMessage);
    }
  };

  const handleFilterChange = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  return (
    <div style={{ padding: 20 }}>
      <h1>Grade-level Schedule</h1>
      <div style={{ marginBottom: 16, display: "flex", gap: 10 }}>
        {[
          { key: "gradeLevel", placeholder: "Grade Level & Section", options: sections.map((s) => ({ value: s._id, label: `${s.grade} - ${s.name}` })) },
          { key: "academicYear", placeholder: "Academic Year", options: [{ value: "2024-2025", label: "2024-2025" }] },
          { key: "quarter", placeholder: "Quarter", options: ["First", "Second", "Third", "Fourth"].map((q) => ({ value: q, label: q })) },
        ].map(({ key, placeholder, options }) => (
          <Select key={key} placeholder={placeholder} style={{ width: 200 }} value={filters[key]} onChange={(value) => handleFilterChange(key, value)} loading={loading}>
            {options.map(({ value, label }) => (
              <Option key={value} value={value}>{label}</Option>
            ))}
          </Select>
        ))}
      </div>
      <Button type="primary" onClick={handleCreate} style={{ marginBottom: 16 }}>Create Schedule</Button>
      {loading ? <Spin size="large" /> : (
        <Tabs activeKey={currentTab} onChange={setCurrentTab} items={Object.entries(schedules).map(([day, list]) => ({
          label: day,
          key: day,
          children: (
            <Table
              bordered
              dataSource={list.map((item, index) => ({
                ...item,
                key: item._id || index,
              }))}
              columns={[
                { title: "Start", dataIndex: "startTime", key: "startTime" },
                { title: "End", dataIndex: "endTime", key: "endTime" },
                { title: "Subject", dataIndex: "subjectName", key: "subjectName" },
                { title: "Class Mode", dataIndex: "classMode", key: "classMode" },
                { title: "Room", dataIndex: "room", key: "room" },
                { title: "Teacher", dataIndex: "teacherName", key: "teacherName" },
                { title: "Actions", key: "actions", render: (_, record) => (
                  <>
                    <Button type="link" onClick={() => handleEdit(record)}>Edit</Button>
                    <Button type="link" danger onClick={() => handleDelete(record)}>Delete</Button>
                  </>
                ) },
              ]}
              pagination={false}
            />
          ),
        }))} />
      )}
      <ScheduleModal
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSave={handleSave}
        form={form}
        isCreateMode={isCreateMode}
        subjects={subjects}
        teachers={teachers}
        filters={filters}
      />
    </div>
  );
};

export default SchedulePage;
