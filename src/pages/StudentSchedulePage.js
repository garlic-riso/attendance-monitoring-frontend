// StudentSchedulePage.js
import React, { useEffect, useState } from "react";
import { Tabs, Table, Spin, message } from "antd";
import axios from "../services/axiosInstance";

const StudentSchedulePage = () => {
  const [schedules, setSchedules] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState("Monday");

  const user = JSON.parse(localStorage.getItem("user")); // should contain sectionID

  const fetchCurrentAcademicYearAndQuarter = async () => {
    try {
      const [syRes, settingsRes] = await Promise.all([
        axios.get("/api/school-years"),
        axios.get("/api/settings"),
      ]);

      const currentSY = syRes.data.find((sy) => sy.isCurrent)?.label;
      const currentQuarter = settingsRes.data?.currentQuarter;

      return { currentSY, currentQuarter };
    } catch {
      message.error("Failed to get academic year or quarter.");
      return {};
    }
  };

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const { currentSY, currentQuarter } =
        (await fetchCurrentAcademicYearAndQuarter()) || {};

      console.log("Current SY:", currentSY);
      console.log("Current Quarter:", currentQuarter); 
      console.log("User Section ID:", user?.sectionID);

      if (!user?.sectionID || !currentSY || !currentQuarter) {
        message.error("Missing section ID, academic year, or quarter.");
        return;
      }

      const res = await axios.get("/api/schedules", {
        params: {
          sectionID: user.sectionID,
          academicYear: currentSY,
          quarter: currentQuarter,
        },
      });

      const grouped = res.data.reduce((acc, sched) => {
        const day = sched.week;
        if (!acc[day]) acc[day] = [];
        acc[day].push(sched);
        return acc;
      }, {});

      setSchedules(grouped);
      setCurrentTab(Object.keys(grouped)[0] || "Monday");
    } catch {
      message.error("Failed to load your schedule.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>My Weekly Schedule</h2>
      {loading ? (
        <Spin />
      ) : (
        <Tabs activeKey={currentTab} onChange={setCurrentTab}>
          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) =>
            schedules[day] ? (
              <Tabs.TabPane tab={day} key={day}>
                <Table
                  dataSource={schedules[day].map((sched, i) => ({
                    key: i,
                    startTime: sched.startTime,
                    endTime: sched.endTime,
                    subject: sched.subjectName,
                    teacher: sched.teacherName,
                    mode: sched.classMode,
                    room: sched.room || "-",
                  }))}
                  columns={[
                    { title: "Start", dataIndex: "startTime" },
                    { title: "End", dataIndex: "endTime" },
                    { title: "Subject", dataIndex: "subject" },
                    { title: "Teacher", dataIndex: "teacher" },
                    { title: "Mode", dataIndex: "mode" },
                    { title: "Room", dataIndex: "room" },
                  ]}
                  pagination={false}
                />
              </Tabs.TabPane>
            ) : null
          )}
        </Tabs>
      )}
    </div>
  );
};

export default StudentSchedulePage;
