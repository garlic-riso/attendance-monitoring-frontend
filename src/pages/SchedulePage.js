import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Tabs, Table, Button, Select, Form, message, Spin } from "antd";
import * as XLSX from "xlsx";
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

  const fileInputRef = useRef(null);
  const handleImportClick = () => fileInputRef.current.click();


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
      const selectedTeacher = teachers.find(t => String(t._id) === String(values.teacherID));
      if (selectedTeacher && !selectedTeacher.isActive) {
        message.error("You cannot assign an inactive faculty.");
        return;
      }

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

  const handleCSVUpload = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    if (!filters.gradeLevel) {
      message.error("Please select a section before importing.");
      return;
    }
  
    const section = sections.find((s) => s._id === filters.gradeLevel);
    if (!section?.isActive) {
      message.error("Cannot import to an inactive section.");
      return;
    }
  
    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
  
      try {
        const response = await axios.post("/api/schedules/import", {
          sectionID: filters.gradeLevel,
          academicYear: filters.academicYear,
          quarter: filters.quarter,
          schedules: jsonData,
        });
        message.success(`Imported: ${response.data.successCount}, Skipped: ${response.data.errorCount}`);
        fetchSchedules();
      } catch (error) {
        console.log(error);
        message.error("Failed to import schedules.");
      }
    };
  
    reader.readAsArrayBuffer(file);
  }, [filters, sections, fetchSchedules]);
  
  useEffect(() => {
    const input = fileInputRef.current;
    input?.addEventListener("change", handleCSVUpload);
    return () => input?.removeEventListener("change", handleCSVUpload);
  }, [filters, sections]);
  

  const handleFilterChange = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));
  const currentSection = sections.find((s) => s._id === filters.gradeLevel);
  const sectionName = currentSection ? `${currentSection.grade} - ${currentSection.name}` : "";

  // Include active items + used inactive ones
  const visibleSections = useMemo(() => {
    return sections.filter((s) => {
      const used = Object.values(schedules)
        .flat()
        .some((sched) => (sched.sectionID?._id || sched.sectionID) === s._id);
      return s.isActive || used;
    });
  }, [sections, schedules]);
  
  const visibleTeachers = useMemo(() => {
    const assignedTeacherIDs = new Set(
      Object.values(schedules)
        .flat()
        .map((sched) => String(sched.teacherID?._id || sched.teacherID))
    );
  
    return teachers.filter((t) => t.isActive || assignedTeacherIDs.has(String(t._id)));
  }, [teachers, schedules]);
  
  
  const teacherOptions = useMemo(() => {
    if (!editingRecord) return visibleTeachers;
  
    const editingTeacherID =
      editingRecord.teacherID?._id || editingRecord.teacherID;
  
    // Only include inactive teacher if it's still assigned in the current schedule
    const isStillAssigned = Object.values(schedules)
      .flat()
      .some((sched) => String(sched.teacherID?._id || sched.teacherID) === String(editingTeacherID));
  
    if (!isStillAssigned) return visibleTeachers;
  
    const original = teachers.find((t) => String(t._id) === String(editingTeacherID));
  
    return visibleTeachers.some((t) => t._id === editingTeacherID)
      ? visibleTeachers
      : [...visibleTeachers, original];
  }, [visibleTeachers, teachers, editingRecord, schedules]);
  
  const visibleSubjects = useMemo(() => {
    const usedSubjectIDs = new Set(
      Object.values(schedules)
        .flat()
        .map((sched) => String(sched.subjectID?._id || sched.subjectID))
    );
  
    return subjects.filter(
      (s) => s.isActive || usedSubjectIDs.has(String(s._id))
    );
  }, [subjects, schedules]);
  

  return (
    <div style={{ padding: 20 }}>
      <h1>Grade-level Schedule</h1>
      <div style={{ marginBottom: 16, display: "flex", gap: 10 }}>
        {[
          {
            key: "gradeLevel",
            placeholder: "Grade Level & Section",
            options: visibleSections.map((s) => ({
              value: s._id,
              label: `${s.grade} - ${s.name}${s.isActive ? "" : " (Inactive)"}`
            }))
          },
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
      <Button type="primary" onClick={handleCreate} style={{ marginBottom: 16 }}>Add Schedule</Button>
      <Button onClick={handleImportClick}>Bulk Import</Button>
        <input
          type="file"
          accept=".csv"
          style={{ display: "none" }}
          ref={fileInputRef}
        />

      {loading ? <Spin size="large" /> : (
        <Tabs activeKey={currentTab} onChange={setCurrentTab} items={Object.entries(schedules).map(([day, list]) => ({
          label: day,
          key: day,
          children: (
            <Table
              bordered
              dataSource={list
                .slice()
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((item, index) => ({
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
        subjects={visibleSubjects}
        teachers={teacherOptions}
        filters={filters}
        sectionName={sectionName}
      />
    </div>
  );
};

export default SchedulePage;
