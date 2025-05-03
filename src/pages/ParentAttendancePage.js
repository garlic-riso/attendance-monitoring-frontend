import React, { useEffect, useState } from "react";
import { Table, DatePicker, Typography, Space, Select, message } from "antd";
import axios from "../services/axiosInstance";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Title } = Typography;
const { Option } = Select;

const ParentAttendancePage = () => {
  const [children, setChildren] = useState([]);
  const [selectedChildID, setSelectedChildID] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [dateRange, setDateRange] = useState([
    dayjs().startOf("day"),
    dayjs().endOf("day"),
  ]);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const res = await axios.get("/api/students/by-parent", {
          params: { parentID: user?.id },
        });
        setChildren(res.data || []);
        if (res.data.length === 1) {
          setSelectedChildID(res.data[0]._id);
        }
      } catch (err) {
        message.error("Failed to load children list.");
      }
    };

    fetchChildren();
  }, [user?.id]);

  useEffect(() => {
    if (selectedChildID) {
      fetchAttendance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChildID, dateRange]);

  const fetchAttendance = async () => {
    try {
      const [startDate, endDate] = dateRange;
      const res = await axios.get("/api/attendance/student-attendance", {
        params: {
          studentID: selectedChildID,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });
      setAttendanceData(res.data || []);
    } catch (err) {
      message.error("Failed to fetch attendance.");
    }
  };

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
      dataIndex: "subject",
      key: "subject",
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
        <Title level={3}>Child Attendance Viewer</Title>
        <Space wrap>
          <Select
            value={selectedChildID}
            style={{ width: 300 }}
            placeholder="Select Child"
            onChange={(value) => setSelectedChildID(value)}
          >
            {children.map((child) => (
              <Option key={child._id} value={child._id}>
                {child.firstName} {child.lastName}
              </Option>
            ))}
          </Select>
          <RangePicker
            value={dateRange}
            onChange={(dates) => {
              if (dates) setDateRange(dates.map((d) => dayjs(d)));
            }}
          />
        </Space>
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

export default ParentAttendancePage;
