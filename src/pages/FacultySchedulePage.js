// src/pages/FacultySchedulePage.js
import React, { useEffect, useState, useCallback } from "react";
import { Tabs, Table, Spin, message } from "antd";
import axios from "../services/axiosInstance";

const FacultySchedulePage = () => {
  const [academicYear, setAcademicYear] = useState("");
  const [quarter, setQuarter] = useState("");
  const [schedules, setSchedules] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState("Monday");

  const user = JSON.parse(localStorage.getItem("user"));
  const teacherID = user?.id || user?._id;

  const fetchInitialData = async () => {
    try {
      const [syData, settingsData] = await Promise.all([
        axios.get("/api/school-years").then((res) => res.data),
        axios.get("/api/settings").then((res) => res.data),
      ]);

      const currentSY = syData.find((sy) => sy.isCurrent);
      if (currentSY) setAcademicYear(currentSY.label);
      if (settingsData.currentQuarter) setQuarter(settingsData.currentQuarter);
    } catch {
      message.error("Failed to fetch school year or settings.");
    }
  };

  const fetchSchedules = useCallback(async () => {
    console.log("Fetching schedules for:", {
      teacherID, academicYear, quarter,
    });
    if (!teacherID || !academicYear || !quarter) return;

    setLoading(true);
    try {
      const res = await axios.get("/api/schedules", {
        params: { teacherID, academicYear, quarter },
      });

      const grouped = res.data.reduce((acc, sched) => {
        const day = sched.week;
        acc[day] = acc[day] || [];
        acc[day].push(sched);
        return acc;
      }, {});

      setSchedules(grouped);
      setCurrentTab(Object.keys(grouped)[0] || "Monday");
    } catch {
      message.error("Failed to fetch schedules.");
    } finally {
      setLoading(false);
    }
  }, [teacherID, academicYear, quarter]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [academicYear, quarter, fetchSchedules]);

  return (
    <div style={{ padding: 20 }}>
      <h1>My Schedule</h1>

      {loading ? (
        <Spin size="large" />
      ) : (
        <Tabs
          activeKey={currentTab}
          onChange={setCurrentTab}
          items={Object.entries(schedules)
            .sort(([a], [b]) => {
              const order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
              return order.indexOf(a) - order.indexOf(b);
            })
            .map(([day, list]) => ({
              label: day,
              key: day,
              children: (
                <Table
                  bordered
                  dataSource={list.map((item, idx) => ({
                    ...item,
                    key: item._id || idx,
                    section:
                      item.sectionID?.grade && item.sectionID?.name
                        ? `${item.sectionID.grade} - ${item.sectionID.name}`
                        : "—",
                  }))}
                  columns={[
                    { title: "Start", dataIndex: "startTime" },
                    { title: "End", dataIndex: "endTime" },
                    { title: "Subject", dataIndex: "subjectName" },
                    { title: "Section", dataIndex: "section" },
                    { title: "Class Mode", dataIndex: "classMode" },
                    { title: "Room", dataIndex: "room" },
                  ]}
                  pagination={false}
                />
              ),
            }))}
        />
      )}
    </div>
  );
};

export default FacultySchedulePage;
