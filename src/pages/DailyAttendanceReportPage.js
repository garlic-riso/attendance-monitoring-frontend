import React, { useEffect, useState } from "react";
import axios from "../services/axiosInstance";
import { Card, DatePicker, Row, Col, Statistic } from "antd";
import dayjs from "dayjs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Select } from "antd";

const { Option } = Select;

const DailyAttendanceReportPage = () => {
  const [date, setDate] = useState(dayjs());
  const [data, setData] = useState({ Present: 0, Absent: 0, Tardy: 0, Excused: 0 });
  const [topAbsentees, setTopAbsentees] = useState([]);
  const [perfectAttendance, setPerfectAttendance] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [studentID, setStudentID] = useState(null);
  const [students, setStudents] = useState([]);
  const [gradeSection, setGradeSection] = useState(null);
  const [sections, setSections] = useState([]);
  const [sectionID, setSectionID] = useState(null);

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
  }, [date]);

  useEffect(() => {
    
    const fetchSections = async () => {
      const res = await axios.get("/api/sections?active=true");
      setSections(res.data || []);
    };

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
  
  

  const fetchPerfectAttendance = async (startDate, endDate) => {
    try {
      const res = await axios.get(`/api/attendance/perfect?startDate=${startDate}&endDate=${endDate}`);
      setPerfectAttendance(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTopAbsentees = async (startDate, endDate) => {
    try {
      const res = await axios.get(`/api/attendance/top-absentees?startDate=${startDate}&endDate=${endDate}`);
      setTopAbsentees(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSummary = async (selectedDate) => {
    try {
      const res = await axios.get(`/api/attendance/daily-summary?date=${selectedDate}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Attendance Overview</h2>
      <DatePicker value={date} onChange={setDate} />
      <Row gutter={10} style={{ marginTop: 16 }}>
        {["Present", "Absent", "Tardy", "Excused"].map((status) => (
          <Col span={6} key={status}>
            <Card>
              <Statistic title={status} value={data[status]} />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={16} style={{ marginTop: 10 }}>
        <Col span={24}>
        <Card style={{ marginTop: 32 }}>
          <h4 style={{ marginBottom: 16 }}>Filter Trends</h4>
          <Row gutter={16}>
            
            <Col span={6}>
              <Select
                placeholder="Select Grade & Section"
                style={{ width: "100%" }}
                value={gradeSection}
                onChange={setGradeSection}
                allowClear
              >
                {sections.map((s) => (
                  <Option key={s._id} value={`${s.grade}||${s._id}`}>
                    Grade {s.grade} – {s.name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={6}>
              <button
                onClick={() =>
                  fetchMonthlyTrend(date.startOf("month").format("YYYY-MM-DD"), date.endOf("month").format("YYYY-MM-DD"))
                }
              >
                Apply Filters
              </button>
            </Col>
          </Row>
        </Card>


          <Card>
            <h4 style={{ marginTop: 0 }}>Monthly Attendance Trends</h4>
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

      <Row justify="start" gutter={16} style={{ marginTop: 32 }}>
        <Col span={12}>
          <Card>
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
          <Card>
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
