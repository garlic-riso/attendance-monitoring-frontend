import React, { useState, useEffect } from "react";
import { Tabs, Table, Button, Select, Input, Form, message, Spin, Modal } from "antd";
import axios from "../services/axiosInstance";

const { Option } = Select;

const SchedulePage = () => {
  const [schedules, setSchedules] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState("");
  const [editingRecord, setEditingRecord] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [isCreateMode, setIsCreateMode] = useState(false);

  useEffect(() => {
    fetchSchedules();
    fetchSubjects();
    fetchTeachers();
  }, []);

  useEffect(() => {
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const availableDay = daysOfWeek.find(day => schedules[day] && schedules[day].length > 0);
    setCurrentTab(availableDay || "Monday");
  }, [schedules]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/schedules");
      setSchedules(response.data.reduce((acc, schedule) => {
        acc[schedule.week] = acc[schedule.week] || [];
        acc[schedule.week].push(schedule);
        return acc;
      }, {}));
    } catch (error) {
      message.error("Failed to fetch schedules.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await axios.get("/api/subjects");
      setSubjects(response.data);
    } catch (error) {
      message.error("Failed to fetch subjects.");
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await axios.get("/api/teachers");
      setTeachers(response.data);
    } catch (error) {
      message.error("Failed to fetch teachers.");
    }
  };

  const formatTime = (time) => {
    const [hour, minute] = time.split(":");
    const hour12 = ((+hour % 12) || 12).toString();
    const period = +hour >= 12 ? "PM" : "AM";
    return `${hour12}:${minute} ${period}`;
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setIsCreateMode(false);
    setIsModalVisible(true);
  };

  const handleCreate = () => {
    setEditingRecord(null);
    form.resetFields();
    setIsCreateMode(true);
    setIsModalVisible(true);
  };

  const handleDelete = async (record) => {
    try {
      await axios.delete(`/api/schedules/${record.key}`);
      fetchSchedules();
      message.success("Schedule deleted successfully.");
    } catch (error) {
      message.error("Failed to delete schedule.");
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setEditingRecord(null);
    setIsModalVisible(false);
  };

  const handleSave = async (values) => {
    try {
      if (isCreateMode) {
        await axios.post("/api/schedules", values);
        message.success("Schedule created successfully.");
      } else {
        await axios.put(`/api/schedules/${editingRecord.key}`, values);
        message.success("Schedule updated successfully.");
      }
      fetchSchedules();
      handleCancel();
    } catch (error) {
      message.error("Failed to save schedule.");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Grade-level Schedule</h1>
      <Button type="primary" onClick={handleCreate} style={{ marginBottom: 16 }}>Create Schedule</Button>
      {loading ? (
        <Spin size="large" />
      ) : (
        <Tabs
          activeKey={currentTab}
          onChange={setCurrentTab}
          items={Object.keys(schedules).map((day) => ({
            label: day,
            key: day,
            children: (
              <Table
                bordered
                dataSource={schedules[day]?.map((item, index) => ({ ...item, key: item._id || index }))}
                columns={[
                  { title: "Start", dataIndex: "startTime", key: "startTime", render: (time) => formatTime(time) },
                  { title: "End", dataIndex: "endTime", key: "endTime", render: (time) => formatTime(time) },
                  { title: "Subject", dataIndex: "subjectName", key: "subjectName" },
                  { title: "Class Mode", dataIndex: "classMode", key: "classMode" },
                  { title: "Room", dataIndex: "room", key: "room" },
                  { title: "Teacher", dataIndex: "teacherName", key: "teacherName" },
                  {
                    title: "Actions",
                    key: "actions",
                    render: (_, record) => (
                      <>
                        <Button type="link" onClick={() => handleEdit(record)}>Edit</Button>
                        <Button type="link" danger onClick={() => handleDelete(record)}>Delete</Button>
                      </>
                    ),
                  },
                ]}
                pagination={false}
              />
            ),
          }))}
        />
      )}
      <Modal
        title={isCreateMode ? "Create Schedule" : "Edit Schedule"}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} onFinish={handleSave} layout="vertical">
          <Form.Item label="Start Time" name="startTime"><Input type="time" /></Form.Item>
          <Form.Item label="End Time" name="endTime"><Input type="time" /></Form.Item>
          <Form.Item label="Subject" name="subjectName"><Select>{subjects.map(subj => <Option key={subj._id} value={subj.subjectName}>{subj.subjectName}</Option>)}</Select></Form.Item>
          <Form.Item label="Class Mode" name="classMode"><Select><Option value="Online">Online</Option><Option value="Face-to-Face">Face-to-Face</Option><Option value="Hybrid">Hybrid</Option></Select></Form.Item>
          <Form.Item label="Room" name="room"><Input /></Form.Item>
          <Form.Item label="Teacher" name="teacherName"><Select>{teachers.map(teacher => <Option key={teacher._id} value={teacher.name}>{teacher.name}</Option>)}</Select></Form.Item>
          <Form.Item><Button type="primary" htmlType="submit">Save</Button></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SchedulePage;
