// ScheduleModal.js
import React from 'react';
import { Modal, Form, Input, Select, Button } from 'antd';

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
}) => {
  return (
    <Modal
      title={isCreateMode ? 'Create Schedule' : 'Edit Schedule'}
      visible={visible}
      onCancel={onCancel}
      footer={null}
    >
      <Form form={form} onFinish={onSave} layout="vertical" initialValues={{ sectionID: filters.gradeLevel, academicYear: filters.academicYear, quarter: filters.quarter }}>
        <Form.Item name="sectionID" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="academicYear" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="quarter" hidden>
          <Input />
        </Form.Item>
        <Form.Item label="Start Time" name="startTime">
          <Input type="time" />
        </Form.Item>
        <Form.Item label="End Time" name="endTime">
          <Input type="time" />
        </Form.Item>
        <Form.Item label="Subject" name="subjectID">
          <Select>
            {subjects.map((subj) => (
              <Option key={subj._id} value={subj._id}>
                {subj.subjectName}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Class Mode" name="classMode">
          <Select>
            <Option value="Online">Online</Option>
            <Option value="Face-to-Face">Face-to-Face</Option>
            <Option value="Hybrid">Hybrid</Option>
          </Select>
        </Form.Item>
        <Form.Item label="Day" name="week">
          <Select>
            <Option value="Monday">Monday</Option>
            <Option value="Tuesday">Tuesday</Option>
            <Option value="Wednesday">Wednesday</Option>
            <Option value="Thursday">Thursday</Option>
            <Option value="Friday">Friday</Option>
          </Select>
        </Form.Item>
        <Form.Item label="Room" name="room">
          <Input />
        </Form.Item>
        <Form.Item label="Teacher" name="teacherID">
          <Select>
            {teachers.map((teacher) => (
              <Option key={teacher._id} value={teacher._id}>
                {teacher.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Save
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ScheduleModal;
