import React, { useEffect, useState } from "react";
import { Form, Input, Select, DatePicker, Card, Spin } from "antd";
import axios from "../services/axiosInstance";
import dayjs from "dayjs";

const { Option } = Select;

const StudentProfilePage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await axios.get(`/api/students?active=true`);
        const current = res.data.find(s => s.emailAddress === user.email);
        setStudent(current);
        form.setFieldsValue({
          ...current,
          dateEnrolled: current?.dateEnrolled ? dayjs(current.dateEnrolled) : null,
        });
      } catch (err) {
        console.error("Error loading student profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [form, user.email]);

  if (loading || !student) return <Spin fullscreen />;

  return (
    <Card title="Student Profile" bordered={false}>
      <Form layout="vertical" form={form}>
        <Form.Item label="First Name" name="firstName">
          <Input disabled />
        </Form.Item>
        <Form.Item label="Middle Name" name="middleName">
          <Input disabled />
        </Form.Item>
        <Form.Item label="Last Name" name="lastName">
          <Input disabled />
        </Form.Item>
        <Form.Item label="Gender" name="gender">
          <Select disabled>
            <Option value="Male">Male</Option>
            <Option value="Female">Female</Option>
            <Option value="Other">Other</Option>
          </Select>
        </Form.Item>
        <Form.Item label="Program" name="program">
          <Input disabled />
        </Form.Item>
        <Form.Item label="Section" name="section">
          <Input disabled value={student.section} />
        </Form.Item>
        <Form.Item label="Date Enrolled" name="dateEnrolled">
          <DatePicker disabled style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label="Email Address" name="emailAddress">
          <Input disabled />
        </Form.Item>
        <Form.Item label="Parent" name="parent">
          <Input disabled value={student.parent} />
        </Form.Item>
      </Form>
    </Card>
  );
};

export default StudentProfilePage;
