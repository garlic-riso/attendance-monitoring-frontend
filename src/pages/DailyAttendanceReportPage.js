import React, { useEffect, useState } from "react";
import axios from "../services/axiosInstance";
import { Card, DatePicker, Row, Col, Statistic } from "antd";
import dayjs from "dayjs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Select } from "antd";
import { PieChart, Pie, Cell } from "recharts";

const { Option } = Select;

const DailyAttendanceReportPage = () => {
  const [date, setDate] = useState(dayjs());
  const [data, setData] = useState({ Present: 0, Absent: 0, Tardy: 0, Excused: 0 });
  const [topAbsentees, setTopAbsentees] = useState([]);
  const [perfectAttendance, setPerfectAttendance] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [students, setStudents] = useState([]);
  const [gradeSection, setGradeSection] = useState(""); // Default to "All Sections"
  const [sections, setSections] = useState([]);
  const [sectionID, setSectionID] = useState(null);
  const [schoolYear, setSchoolYear] = useState("");
  const [schoolYears, setSchoolYears] = useState([]);
  const [yearlyTrendData, setYearlyTrendData] = useState([]);
  const [classModeBreakdown, setClassModeBreakdown] = useState([
    { name: "Online", value: 0 },
    { name: "Face-to-Face", value: 0 },
    { name: "Homeschooling", value: 0 },
  ]);

  useEffect(() => {
    const fetchSections = async () => {
      const res = await axios.get("/api/sections?active=true");
      setSections(res.data || []);
    };
    const fetchSchoolYears = async () => {
      const res = await axios.get("/api/school-years");
      setSchoolYears(res.data);
      const current = res.data.find((y) => y.isCurrent);
      if (current) setSchoolYear(current._id);
    };

    fetchSchoolYears();
    fetchSections();
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!sectionID) return setStudents([]);
      try {
        const res = await axios.get(`/api/students?sectionID=${sectionID}`);
        setStudents(res.data);
      } catch (err) {
        console.error("Failed to fetch students:", err);
      }
    };
    fetchStudents();
  }, [sectionID]);

  useEffect(() => {
    if (!schoolYear) return;
    const fetchYearlyTrend = async () => {
      try {
        const res = await axios.get(`/api/attendance/yearly-trends?schoolYear=${schoolYear}`);
        const sorted = [...res.data].sort((a, b) => new Date(a.month) - new Date(b.month));
        setYearlyTrendData(sorted);
      } catch (err) {
        console.error(err);
      }
    };
    fetchYearlyTrend();
  }, [schoolYear, gradeSection]);

  const fetchSummary = async (selectedDate) => {
    try {
      const params = new URLSearchParams({ date: selectedDate });
      if (gradeSection) {
        const [grade, sectionID] = gradeSection.split("||");
        params.append("gradeLevel", grade);
        params.append("sectionID", sectionID);
      }
      const res = await axios.get(`/api/attendance/daily-summary?${params.toString()}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPerfectAttendance = async (startDate, endDate) => {
    try {
      const params = new URLSearchParams({ startDate, endDate });
      if (gradeSection) {
        const [grade, sectionID] = gradeSection.split("||");
        params.append("gradeLevel", grade);
        params.append("sectionID", sectionID);
      }
      const res = await axios.get(`/api/attendance/perfect?${params.toString()}`);
      setPerfectAttendance(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTopAbsentees = async (startDate, endDate) => {
    try {
      const params = new URLSearchParams({ startDate, endDate });
      if (gradeSection) {
        const [grade, sectionID] = gradeSection.split("||");
        params.append("gradeLevel", grade);
        params.append("sectionID", sectionID);
      }
      const res = await axios.get(`/api/attendance/top-absentees?${params.toString()}`);
      setTopAbsentees(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMonthlyTrend = async (startDate, endDate) => {
    const params = new URLSearchParams({ startDate, endDate });
    if (gradeSection) {
      const [grade, sectionID] = gradeSection.split("||");
      params.append("gradeLevel", grade);
      params.append("sectionID", sectionID);
    }

    try {
      const res = await axios.get(`/api/attendance/monthly-trends?${params.toString()}`);
      const sorted = [...res.data].sort((a, b) => new Date(a.date) - new Date(b.date));
      setTrendData(sorted);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const start = date.startOf("month").format("YYYY-MM-DD");
    const end = date.endOf("month").format("YYYY-MM-DD");
    fetchSummary(date.format("YYYY-MM-DD"));
    fetchPerfectAttendance(start, end);
    fetchTopAbsentees(start, end);
    fetchMonthlyTrend(start, end);
  }, [date, gradeSection]);

  useEffect(() => {
    const fetchClassModeBreakdown = async () => {
      try {
        const params = new URLSearchParams({ date: date.format("YYYY-MM-DD") });
        if (gradeSection) {
          const [grade, sectionID] = gradeSection.split("||");
          params.append("gradeLevel", grade);
          params.append("sectionID", sectionID);
        }
        const res = await axios.get(`/api/attendance/daily-classmode-breakdown?${params.toString()}`);
        setClassModeBreakdown(res.data);
      } catch (err) {
        setClassModeBreakdown([
          { name: "Online", value: 0 },
          { name: "Face-to-Face", value: 0 },
          { name: "Homeschooling", value: 0 },
        ]);
      }
    };
    fetchClassModeBreakdown();
  }, [date, gradeSection]);


  return (
    <div style={{ maxWidth: "100%", margin: "0 auto", padding: "1rem", overflowX: "hidden" }}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Select
            placeholder="Select Grade & Section"
            style={{ width: "100%" }}
            value={gradeSection}
            onChange={(val) => {
              setGradeSection(val || "");
              if (val) {
                const [, sectionId] = val.split("||");
                setSectionID(sectionId);
              } else {
                setSectionID(null);
              }
            }}
            allowClear
          >
            <Option value="">All Sections</Option>
            {sections.map((s) => (
              <Option key={s._id} value={`${s.grade}||${s._id}`}>
                Grade {s.grade} – {s.name}
              </Option>
            ))}
          </Select>
        </Col>
        <Col span={6}>
          <DatePicker value={date} onChange={setDate} style={{ width: "100%" }} />
        </Col>
      </Row>

      <h2>Attendance Overview</h2>
      
      <Row gutter={16} style={{ marginTop: 16 }}>
        {/* First half: Present and Absent */}
        <Col span={12}>
          <div style={{ height: 240, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <Row gutter={10}>
              <Col span={12}>
                <Card>
                  <Statistic title="Present" value={data.Present} />
                </Card>
              </Col>
              <Col span={12}>
                <Card>
                  <Statistic title="Absent" value={data.Absent} />
                </Card>
              </Col>
            </Row>
            <Row gutter={10}>
              <Col span={12}>
                <Card>
                  <Statistic title="Tardy" value={data.Tardy} />
                </Card>
              </Col>
              <Col span={12}>
                <Card>
                  <Statistic title="Excused" value={data.Excused} />
                </Card>
              </Col>
            </Row>
          </div>
        </Col>
        {/* Second half: Pie Chart */}
        <Col span={12}>
          <Card
            style={{
              height: 240,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: 0,
              width: "100%", // <-- Stretch horizontally
            }}
            bodyStyle={{
              padding: 0,
              width: "100%", // <-- Stretch horizontally
            }}
          >
            <h4 style={{ textAlign: "center", margin: "8px 0" }}>Attendance by Class Mode</h4>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={classModeBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  label
                >
                  <Cell fill="#1890ff" /> {/* Online */}
                  <Cell fill="#52c41a" /> {/* Face-to-Face */}
                  <Cell fill="#faad14" /> {/* Homeschooling */}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 10 }}>
        <Col span={24}>
          <Card style={{ marginTop: 32, width: "100%" }} bodyStyle={{ width: "100%" }}> {/* <-- Stretch horizontally */}
            <h4 style={{ marginBottom: 16 }}>Monthly Attendance Trends</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(d) => dayjs(d).format("MM-DD")} />
                <YAxis />
                <Tooltip labelFormatter={(d) => dayjs(d).format("MMMM D")} />
                <Legend />
                <Line type="monotone" dataKey="Present" stroke="#52c41a" />
                <Line type="monotone" dataKey="Absent" stroke="#f5222d" />
                <Line type="monotone" dataKey="Tardy" stroke="#faad14" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* School Year filter moved here */}
      <Row gutter={16} style={{ marginTop: 32, marginBottom: 0, alignItems: "center" }}>
        <Col flex="auto">
          <h4 style={{ marginBottom: 0 }}>Attendance Trend for the School Year</h4>
        </Col>
        <Col flex="200px">
          <Select
            placeholder="Select School Year"
            style={{ width: "100%" }}
            value={schoolYear}
            onChange={setSchoolYear}
          >
            {schoolYears.map((y) => (
              <Option key={y._id} value={y._id}>
                {y.label}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 10 }}>
        <Col span={24}>
          <Card style={{ width: "100%" }} bodyStyle={{ width: "100%" }}> {/* <-- Stretch horizontally */}
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={yearlyTrendData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Present" stroke="#52c41a" />
                <Line type="monotone" dataKey="Absent" stroke="#f5222d" />
                <Line type="monotone" dataKey="Tardy" stroke="#faad14" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>



      <Row justify="start" gutter={16} style={{ marginTop: 32 }}>
        <Col span={12}>
          <Card style={{ width: "100%" }} bodyStyle={{ width: "100%" }}> {/* <-- Stretch horizontally */}
            <h4 style={{ marginTop: 0 }}>Top Frequently Absent Students (Monthly)</h4>
            {topAbsentees.length === 0 ? (
              <p>No data available.</p>
            ) : (
              <ul>
                {topAbsentees.map((student, index) => (
                  <li key={student.studentID}>
                    {index + 1}. {student.fullName} – {student.count} absences
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </Col>
        <Col span={12}>
          <Card style={{ width: "100%" }} bodyStyle={{ width: "100%" }}> {/* <-- Stretch horizontally */}
            <h4 style={{ marginTop: 0 }}>Students with Perfect Attendance (Monthly)</h4>
            {perfectAttendance.length === 0 ? (
              <p>No data available.</p>
            ) : (
              <ul>
                {perfectAttendance.map((student, index) => (
                  <li key={student.studentID}>
                    {index + 1}. {student.fullName}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DailyAttendanceReportPage;
