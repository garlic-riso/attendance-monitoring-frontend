import React, { useEffect, useState } from "react";
import axios from "../services/axiosInstance";
import { Card, DatePicker, Row, Col, Statistic } from "antd";
import dayjs from "dayjs";

const DailyAttendanceReportPage = () => {
  const [date, setDate] = useState(dayjs());
  const [data, setData] = useState({ Present: 0, Absent: 0, Tardy: 0, Excused: 0 });
  const [topAbsentees, setTopAbsentees] = useState([]);
  const [perfectAttendance, setPerfectAttendance] = useState([]);

  useEffect(() => {
    fetchSummary(date.format("YYYY-MM-DD"));
    fetchPerfectAttendance(date.startOf("month").format("YYYY-MM-DD"), date.endOf("month").format("YYYY-MM-DD"));
    fetchTopAbsentees(date.startOf("month").format("YYYY-MM-DD"), date.endOf("month").format("YYYY-MM-DD"));
  }, [date]);

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
      <Row gutter={16} style={{ marginTop: 16 }}>
        {["Present", "Absent", "Tardy", "Excused"].map((status) => (
          <Col span={6} key={status}>
            <Card>
              <Statistic title={status} value={data[status]} />
            </Card>
          </Col>
        ))}
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
