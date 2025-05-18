import React, { useEffect } from "react";
import { Modal, Form, Input, Select, Button } from "antd";

const { Option } = Select;

const ScheduleModal = ({
  visible,
  onCancel,
  onSave,
  form,
  isCreateMode,
  subjects,
  teachers,
  filters,
  sectionName,
  classModeOptions, // Pass updated classMode options
}) => {
  // Dynamically update room validation based on classMode
  const handleClassModeChange = (value) => {
    if (value === "Online" || value === "Homeschooling") {
      form.setFieldsValue({ room: null }); // Clear the room field
    }
  };

  return (
    <Modal
      title={
        isCreateMode
          ? `Add Schedule for ${sectionName} - ${filters.quarter} Quarter - ${filters.academicYear}`
          : "Edit Schedule"
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
    >
      <Form form={form} onFinish={onSave} layout="vertical">
        {/* Hidden Fields */}
        <Form.Item name="sectionID" noStyle>
          <Input type="hidden" />
        </Form.Item>
        <Form.Item name="academicYear" noStyle>
          <Input type="hidden" />
        </Form.Item>
        <Form.Item name="quarter" noStyle>
          <Input type="hidden" />
        </Form.Item>

        {/* Schedule Details */}
        <Form.Item label="Start Time" name="startTime" rules={[{ required: true, message: "Please select a start time" }]}>
          <Input type="time" />
        </Form.Item>
        <Form.Item label="End Time" name="endTime" rules={[{ required: true, message: "Please select an end time" }]}>
          <Input type="time" />
        </Form.Item>

        <Form.Item label="Subject" name="subjectID" rules={[{ required: true, message: "Please select a subject" }]}>
          <Select placeholder="Select a subject">
            {subjects.map((subj) => (
              <Option key={subj._id} value={subj._id}>
                {subj.subjectName}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Class Mode"
          name="classMode"
          rules={[{ required: true, message: "Please select a class mode" }]}
        >
          <Select
            placeholder="Select class mode"
            onChange={handleClassModeChange} // Handle classMode change
          >
            {classModeOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Day" name="week" rules={[{ required: true, message: "Please select a day" }]}>
          <Select placeholder="Select a day">
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
              <Option key={day} value={day}>
                {day}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Room"
          name="room"
          rules={[
            ({ getFieldValue }) => ({
              required: !["Online", "Homeschooling"].includes(getFieldValue("classMode")),
              message: "Please enter a room number",
            }),
          ]}
        >
          <Input placeholder="Enter room number" />
        </Form.Item>

        <Form.Item label="Teacher" name="teacherID" rules={[{ required: true, message: "Please select a teacher" }]}>
          <Select placeholder="Select a teacher" showSearch optionFilterProp="children">
            {teachers.map((teacher) => (
              <Option key={teacher._id} value={teacher._id}>
                {`${teacher.firstName} ${teacher.lastName}`}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Submit Button */}
        <Form.Item>
          <Button type="primary" htmlType="submit">
            {isCreateMode ? "Create" : "Save"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ScheduleModal;
