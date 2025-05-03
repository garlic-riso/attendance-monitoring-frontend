import React, { useEffect, useState } from "react";
import { Table, DatePicker, Typography, Space } from "antd";
import axios from "../services/axiosInstance";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Title } = Typography;

const StudentAttendancePage = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [dateRange, setDateRange] = useState([
    dayjs().startOf("day"),
    dayjs().endOf("day"),
  ]);

  const fetchAttendance = async () => {
    try {
      const studentID = JSON.parse(localStorage.getItem("user"))?.id;
      if (!studentID) {
        console.error("Student ID is missing");
      }
      const [startDate, endDate] = dateRange;
      const res = await axios.get("/api/attendance/student-attendance", {
        params: {
          studentID,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });
      console.log(res.data)
      setAttendanceData(res.data || []);
    } catch (err) {
      console.error("Failed to fetch attendance", err);
    }
  };

  useEffect(() => {
    fetchAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (text) => dayjs(text).format("YYYY-MM-DD"),
    },
    {
      title: "Day",
      dataIndex: "date",
      key: "day",
      render: (text) => dayjs(text).format("dddd"),
    },
    {
      title: "Subject",
      dataIndex: "subject", // ✅ matches the backend-flattened field
      key: "subject",
      render: (text) => text || "N/A",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Class Mode",
      dataIndex: "classMode",
      key: "classMode",
    },
    {
      title: "Remarks",
      dataIndex: "remarks",
      key: "remarks",
    },
  ];

  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Title level={3}>My Attendance Record</Title>
        <RangePicker
          value={dateRange}
          onChange={(dates) => {
            if (dates) setDateRange(dates.map((date) => dayjs(date)));
          }}
        />
        <Table
          rowKey="_id"
          dataSource={attendanceData}
          columns={columns}
          pagination={{ pageSize: 10 }}
        />
      </Space>
    </div>
  );
};

export default StudentAttendancePage;
