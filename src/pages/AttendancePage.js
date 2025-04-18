import React, { useState, useEffect, useCallback } from "react";
import { Table, Button, Select, Form, message, Spin, DatePicker, Radio } from "antd";
import axios from "../services/axiosInstance";
import AttendanceModal from "../components/AttendanceModal";
import moment from "moment";
import { useSearchParams } from "react-router-dom";


const statusOptions = ["Present", "Absent", "Tardy"];


const { Option } = Select;

const AttendancePage = () => {
  const [attendance, setAttendance] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [form] = Form.useForm();

  const [filters, setFilters] = useState({
    subject: "",
    date: moment(),
    section: "",
  });

  // const fetchInitialData = async () => {
  //   const params = {
  //     section: '6788ba4aa448dbda2cecfa98',
  //     subject: '678e800624e320c5478fc98a',
  //     date: moment("2025-03-11")
  //   };

  //   try {
  //     setLoading(true);
  //     const [{ data: subjectsData }, { data: sectionsData }] = await Promise.all([
  //       axios.get("/api/subjects"),
  //       axios.get("/api/sections"),
  //     ]);
  //     setSubjects(subjectsData);
  //     setSections(sectionsData);
  
  //     const section = searchParams.get("section") || "";
  //     const subject = searchParams.get("subject") || "";
  //     const dateParam = searchParams.get("date");
  //     const date = dateParam ? moment(dateParam) : null;
  
  //     setFilters({ section, subject, date });
  //   } catch {
  //     message.error("Failed to load data.");
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { subject, date, section } = filters;
  
      const response = await axios.get("/api/attendance", {
        params: {
          subjectID: subject || undefined,
          sectionID: section || undefined,
          date: date ? date.format("YYYY-MM-DD") : undefined,
        },
      });
      setAttendance(response.data.students || []);
    } catch (error) {

      console.error("Error fetching attendance:", error.message);
      message.error("Failed to load attendance data.");
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [{ data: subjectsData }, { data: sectionsData }] = await Promise.all([
          axios.get("/api/subjects"),
          axios.get("/api/sections"),
        ]);
        setSubjects(subjectsData);
        setSections(sectionsData);
  
        const section = searchParams.get("section") || "";
        const subject = searchParams.get("subject") || "";
        const dateParam = searchParams.get("date");
        const date = dateParam ? moment(dateParam) : moment();
  
        setFilters({ section, subject, date });
      } catch {
        message.error("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchInitialData();
  }, [searchParams]);

  useEffect(() => {
    if (filters.subject && filters.section && filters.date) {
      fetchData();
    }
  }, [fetchData, filters]);

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      status: record.attendanceStatus, 
    });
    setIsModalVisible(true);
  };

  const handleSave = async (values) => {
    const { attendanceID, scheduleID, _id } = editingRecord;
  
    const payload = {
      ...values,
      studentID: _id,
      scheduleID,
      date: filters.date?.format("YYYY-MM-DD"),
    };
  
    const updateAttendanceState = (data) => {
      setAttendance((prev) =>
        prev.map((s) =>
          s._id === _id
            ? {
                ...s,
                ...values,
                attendanceID: data._id,
                attendanceStatus: values.status,
              }
            : s
        )
      );
    };
  
    try {
      if (attendanceID) {
        const { data } = await axios.put(`/api/attendance/${attendanceID}`, payload);
        updateAttendanceState(data);
        message.success("Attendance updated successfully.");
      } else {
        const { data } = await axios.post("/api/attendance", payload);
        updateAttendanceState(data);
        message.success("Attendance created successfully.");
      }
  
      setIsModalVisible(false);
    } catch {
      message.error("Failed to save attendance.");
    }
  };
  

  const handleFilterChange = (key, value) => {
    const updatedFilters = { ...filters, [key]: value };
  
    // Update filters state
    setFilters(updatedFilters);
  
    // Update URL params
    const params = new URLSearchParams();
    if (updatedFilters.section) params.set("section", updatedFilters.section);
    if (updatedFilters.subject) params.set("subject", updatedFilters.subject);
    if (updatedFilters.date) params.set("date", updatedFilters.date.format("YYYY-MM-DD"));
    setSearchParams(params);
  };

  const handleStatusChange = async (studentId, newStatus) => {
    setAttendance((prevAttendance) =>
      prevAttendance.map((student) =>
        student._id === studentId ? { ...student, attendanceStatus: newStatus } : student
      )
    );
  
    const student = attendance.find((s) => s._id === studentId);
    const attendanceID = student?.attendanceID;
  
    const payload = {
      status: newStatus,
      studentID: studentId,
      scheduleID: student.scheduleID,
      date: filters.date?.format("YYYY-MM-DD"),
    };
  
    try {
      if (attendanceID) {
        await axios.put(`/api/attendance/${attendanceID}`, payload);
      } else {
        const { data } = await axios.post("/api/attendance", payload);
        setAttendance((prev) =>
          prev.map((s) =>
            s._id === studentId ? { ...s, attendanceID: data._id } : s
          )
        );
      }
    } catch (error) {
      console.error("Error updating attendance:", error);
      message.error("Failed to update attendance.");
    }
  };


  return (
    <div style={{ padding: 20 }}>
      <h1>Attendance</h1>
      <div style={{ marginBottom: 16, display: "flex", gap: 10 }}>
        <DatePicker
          placeholder="Date and Time"
          style={{ width: 200 }}
          value={filters.date}
          onChange={(date) => handleFilterChange("date", date)}
        />
        <Select
          placeholder="Subject"
          style={{ width: 200 }}
          value={filters.subject}
          onChange={(value) => handleFilterChange("subject", value)}
        >
          {subjects.map(({ _id, subjectName }) => (
            <Option key={_id} value={_id}>{subjectName}</Option>
          ))}
        </Select>
        <Select
          placeholder="Section"
          style={{ width: 200 }}
          value={filters.section}
          onChange={(value) => handleFilterChange("section", value)}
        >
          {sections.map(({ _id, grade, name }) => (
            <Option key={_id} value={_id}>{`${grade} - ${name}`}</Option>
          ))}
        </Select>
      </div>
      {loading ? (
        <Spin size="large" />
      ) : (
        <Table
          bordered
          dataSource={attendance.map((item, index) => ({
            ...item,
            key: item._id || index,
            classMode: item.classMode || item.program || "N/A"
          }))}
          columns={[
            {
              title: "Student",
              key: "student",
              render: (_, record) => `${record.fullName}`,
            },
            {
              title: "Status",
              key: "status",
              render: (_, record) => (
                <Radio.Group
                  onChange={(e) => handleStatusChange(record.key, e.target.value)}
                  value={record.attendanceStatus}
                >
                  {statusOptions.map((status) => (
                    <Radio key={status} value={status}>
                      {status}
                    </Radio>
                  ))}
                </Radio.Group>
              ),
            },
            { title: "Class Mode", dataIndex: "classMode", key: "classMode" },
            {
              title: "Actions",
              key: "actions",
              render: (_, record) => (
                <Button type="link" onClick={() => handleEdit(record)}>Edit</Button>
              ),
            },
          ]}
        />
      )}
      <AttendanceModal
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSave={handleSave}
        form={form}
        record={editingRecord}
      />
    </div>
  );
};

export default AttendancePage;
