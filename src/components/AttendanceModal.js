import React from "react";
import { Modal, Form, Select, Input, Button } from "antd";

const { Option } = Select;

const AttendanceModal = ({ visible, onCancel, onSave, form }) => {
  return (
    <Modal
      title="Edit Attendance"
      visible={visible}
      onCancel={onCancel}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={onSave}>
        <Form.Item name="status" label="Status" rules={[{ required: true, message: "Please select a status" }]}>
          <Select placeholder="Select Status">
            <Option value="Present">Present</Option>
            <Option value="Absent">Absent</Option>
            <Option value="Tardy">Tardy</Option>
          </Select>
        </Form.Item>

        <Form.Item name="classMode" label="Class Mode" rules={[{ required: true, message: "Please select a class mode" }]}>
          <Select placeholder="Select Class Mode">
            <Option value="Online">Online</Option>
            <Option value="Homeschool">Homeschooling</Option>
            <Option value="Face-to-Face">Face-to-Face</Option>
          </Select>
        </Form.Item>

        <Form.Item name="remarks" label="Remarks">
          <Input.TextArea rows={3} placeholder="Enter remarks (optional)" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
            Save
          </Button>
          <Button onClick={onCancel}>Cancel</Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AttendanceModal;
