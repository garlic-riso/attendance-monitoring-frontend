import React, { useEffect, useState } from "react";
import { Card, Row, Col, Select, DatePicker, Button, Table, message, Form } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import axios from "../services/axiosInstance";
import dayjs from "dayjs";

const { Option } = Select;

const quarters = ["First", "Second", "Third", "Fourth"];

const FILTERS_STORAGE_KEY = "studentBasedReportFilters";

const ReportsStudentBased = () => {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [schoolYears, setSchoolYears] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [filters, setFilters] = useState(() => {
    const saved = localStorage.getItem(FILTERS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.month) parsed.month = dayjs(parsed.month);
      return parsed;
    }
    return {
      student: null,
      month: null,
      schoolYear: null,
      quarter: null,
      subject: null,
    };
  });

  useEffect(() => {
    const toSave = { ...filters, month: filters.month ? filters.month.toISOString() : null };
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(toSave));
  }, [filters]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [studentsRes, subjectsRes, yearsRes] = await Promise.all([
          axios.get("/api/students?active=true"),
          axios.get("/api/subjects?active=true"),
          axios.get("/api/school-years"),
        ]);
        setStudents(studentsRes.data || []);
        setSubjects(subjectsRes.data || []);
        setSchoolYears(yearsRes.data || []);
      } catch (err) {
        message.error("Failed to load filter data.");
      }
    };
    fetchInitialData();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const fetchAttendance = async () => {
    try {
      const params = {};
      if (filters.student) params.studentID = filters.student;
      if (filters.month) params.month = filters.month.format("YYYY-MM");
      if (filters.schoolYear) {
        const sy = schoolYears.find((y) => y._id === filters.schoolYear);
        params.schoolYear = sy ? sy.label : filters.schoolYear;
      }
      if (filters.quarter) params.quarter = filters.quarter;
      if (filters.subject) params.subjectID = filters.subject;

      // Call the new backend route for student-based report
      const res = await axios.get(`/api/attendance/report/student-based`, { params });
      setAttendanceData(res.data || []);
    } catch (err) {
      message.error("Failed to fetch attendance data.");
    }
  };

  const handleDownload = async () => {
    try {
      const params = {};
      if (filters.student) params.studentID = filters.student;
      if (filters.month) params.month = filters.month.format("YYYY-MM");
      if (filters.schoolYear) {
        const sy = schoolYears.find((y) => y._id === filters.schoolYear);
        params.schoolYear = sy ? sy.label : filters.schoolYear;
      }
      if (filters.quarter) params.quarter = filters.quarter;
      if (filters.subject) params.subjectID = filters.subject;

      // Call the backend route for student-based report export
      const res = await axios.get(`/api/attendance/report/export`, {
        params,
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "attendance_report_student_based.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      message.error("Failed to download report.");
    }
  };

  const columns = [
    { title: "Student Name", dataIndex: "fullName", key: "fullName" },
    { title: "Section", dataIndex: "sectionName", key: "sectionName" },
    { title: "Subject", dataIndex: "subjectName", key: "subjectName" },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => (date ? dayjs(date).format("YYYY-MM-DD") : ""),
    },
    { title: "Status", dataIndex: "status", key: "status" },
    { title: "Class Mode", dataIndex: "classMode", key: "classMode" },
  ];

  return (
    <div style={{ maxWidth: "100%", margin: "0 auto", padding: 24 }}>
      <Card
        title="Student-Based Attendance Overview"
        style={{ marginBottom: 24, width: "100%" }} // <-- Stretch horizontally
        bodyStyle={{ width: "100%" }} // <-- Ensure content stretches
      >
        <Form layout="vertical">
          <Row gutter={12} style={{ marginBottom: 0 }}>
            <Col span={7}>
              <Form.Item
                label={
                  <span
                    style={{
                      fontWeight: "bold",
                      fontSize: 12,
                      paddingBottom: "0px !important",
                      marginBottom: 0,
                      display: "inline-block",
                    }}
                  >
                    Student
                  </span>
                }
                style={{ marginBottom: 8 }}
              >
                <Select
                  placeholder="Student"
                  style={{ width: "100%" }}
                  allowClear
                  size="small"
                  value={filters.student}
                  onChange={(val) => handleFilterChange("student", val)}
                  showSearch
                  optionFilterProp="children"
                >
                  {students.map((s) => (
                    <Option key={s._id} value={s._id}>
                      {s.lastName}, {s.firstName} {s.middleName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item
                label={
                  <span
                    style={{
                      fontWeight: "bold",
                      fontSize: 12,
                      paddingBottom: "0px !important",
                      marginBottom: 0,
                      display: "inline-block",
                    }}
                  >
                    Month
                  </span>
                }
                style={{ marginBottom: 8 }}
              >
                <DatePicker
                  picker="month"
                  placeholder="Month"
                  style={{ width: "100%" }}
                  value={filters.month}
                  onChange={(val) => handleFilterChange("month", val)}
                  allowClear
                  size="small"
                />
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item
                label={
                  <span
                    style={{
                      fontWeight: "bold",
                      fontSize: 12,
                      paddingBottom: "0px !important",
                      marginBottom: 0,
                      display: "inline-block",
                    }}
                  >
                    School Year
                  </span>
                }
                style={{ marginBottom: 8 }}
              >
                <Select
                  placeholder="School Year"
                  style={{ width: "100%" }}
                  allowClear
                  size="small"
                  value={filters.schoolYear}
                  onChange={(val) => handleFilterChange("schoolYear", val)}
                >
                  {schoolYears.map((y) => (
                    <Option key={y._id} value={y._id}>
                      {y.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={3}>
              <Form.Item
                label={
                  <span
                    style={{
                      fontWeight: "bold",
                      fontSize: 12,
                      paddingBottom: "0px !important",
                      marginBottom: 0,
                      display: "inline-block",
                    }}
                  >
                    Quarter
                  </span>
                }
                style={{ marginBottom: 8 }}
              >
                <Select
                  placeholder="Quarter"
                  style={{ width: "100%" }}
                  allowClear
                  size="small"
                  value={filters.quarter}
                  onChange={(val) => handleFilterChange("quarter", val)}
                >
                  {quarters.map((q, index) => (
                    <Option key={index} value={index + 1}>
                      {q}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item
                label={
                  <span
                    style={{
                      fontWeight: "bold",
                      fontSize: 12,
                      paddingBottom: "0px !important",
                      marginBottom: 0,
                      display: "inline-block",
                    }}
                  >
                    Subject
                  </span>
                }
                style={{ marginBottom: 8 }}
              >
                <Select
                  placeholder="Subject"
                  style={{ width: "100%" }}
                  allowClear
                  size="small"
                  value={filters.subject}
                  onChange={(val) => handleFilterChange("subject", val)}
                  showSearch
                  optionFilterProp="children"
                >
                  {subjects.map((s) => (
                    <Option key={s._id} value={s._id}>
                      {s.subjectName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={8} style={{ marginBottom: 0 }}>
            <Col span={24} style={{ display: "flex", alignItems: "end" }}>
              <Button
                type="primary"
                onClick={fetchAttendance}
                style={{ marginRight: 8 }}
                size="small"
              >
                Generate Report
              </Button>
              <Button onClick={handleDownload} icon={<DownloadOutlined />} size="small">
                Download Report
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
      <Card style={{ width: "100%" }} bodyStyle={{ width: "100%" }}> {/* <-- Stretch horizontally */}
        <Table
          dataSource={attendanceData}
          columns={columns}
          rowKey={(record) => record._id}
          pagination={{ pageSize: 20 }}
          size="small"
        />
      </Card>
    </div>
  );
};

export default ReportsStudentBased;