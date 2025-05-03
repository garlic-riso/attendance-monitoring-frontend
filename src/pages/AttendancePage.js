import React, { useState, useEffect, useCallback } from "react";
import { Table, Button, Select, Form, message, Spin, DatePicker, Radio } from "antd";
import axios from "../services/axiosInstance";
import AttendanceModal from "../components/AttendanceModal";
import dayjs from "dayjs";
import { useSearchParams } from "react-router-dom";

const statusOptions = ["Present", "Absent", "Tardy", "Excused"];
const { Option } = Select;
const formatDate = (date) => date?.format("YYYY-MM-DD") || undefined;

const AttendancePage = () => {
  const [attendance, setAttendance] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [form] = Form.useForm();

  const [filters, setFilters] = useState(() => {
    const stored = sessionStorage.getItem("attendanceFilters");
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        subject: parsed.subject || "",
        section: parsed.section || "",
        date: parsed.date && dayjs(parsed.date, "YYYY-MM-DD", true).isValid()
        ? dayjs(parsed.date, "YYYY-MM-DD")
        : dayjs(),
      };
    }
    return { subject: "", section: "", date: dayjs() };
  });

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [{ data: subjectsData }, { data: sectionsData }] = await Promise.all([
        axios.get("/api/subjects"),
        axios.get("/api/sections"),
      ]);
      setSubjects(subjectsData.filter(s => s.isActive));
      setSections(sectionsData.filter(s => s.isActive));

      const storedFilters = JSON.parse(sessionStorage.getItem("attendanceFilters") || "{}");
      const section = storedFilters.section || searchParams.get("section") || "";
      const subject = storedFilters.subject || searchParams.get("subject") || "";
      const dateRaw = storedFilters.date || searchParams.get("date");
      const date = dayjs(dateRaw, "YYYY-MM-DD", true).isValid() ? dayjs(dateRaw) : dayjs();

      if (
        section !== filters.section ||
        subject !== filters.subject ||
        !filters.date?.isSame(date, "day")
      ) {
        setFilters({ section, subject, date });
      }
    } catch {
      message.error("Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, [filters, searchParams]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    if (filters.subject && filters.section && filters.date) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const { subject, date, section } = filters;
          const response = await axios.get("/api/attendance", {
            params: {
              subjectID: subject || undefined,
              sectionID: section || undefined,
              date: formatDate(date),
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
      };
      fetchData();
    }
  }, [filters]);

  const handleFilterChange = useCallback((key, value) => {
    const newFilters = {
      ...filters,
      [key]: key === "date" && value ? dayjs(value) : value,
    };

    sessionStorage.setItem("attendanceFilters", JSON.stringify({
      ...newFilters,
      date: formatDate(newFilters.date),
    }));

    setFilters(newFilters);

    const params = new URLSearchParams();
    if (newFilters.section) params.set("section", newFilters.section);
    if (newFilters.subject) params.set("subject", newFilters.subject);
    if (newFilters.date) params.set("date", formatDate(newFilters.date));
    setSearchParams(params);
  }, [filters, setSearchParams]);

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
      date: formatDate(filters.date),
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

  const handleStatusChange = async (studentId, newStatus) => {
    setAttendance((prev) =>
      prev.map((student) =>
        student._id === studentId ? { ...student, attendanceStatus: newStatus } : student
      )
    );

    const student = attendance.find((s) => s._id === studentId);
    const attendanceID = student?.attendanceID;

    const payload = {
      status: newStatus,
      studentID: studentId,
      scheduleID: student.scheduleID,
      date: formatDate(filters.date),
    };

    try {
      if (attendanceID) {
        await axios.put(`/api/attendance/${attendanceID}`, payload);
      } else {
        const { data } = await axios.post("/api/attendance", payload);
        setAttendance((prev) =>
          prev.map((s) => (s._id === studentId ? { ...s, attendanceID: data._id } : s))
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
          placeholder="Date"
          allowClear={false}
          format="YYYY-MM-DD"
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
            classMode: item.classMode || item.program || "N/A",
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
                    <Radio key={status} value={status}>{status}</Radio>
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
