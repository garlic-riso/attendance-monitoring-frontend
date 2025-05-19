import React from "react";
import { Modal, Form, Input, Select, DatePicker } from "antd";

const { Option } = Select;

const StudentFormModal = ({ visible, onCancel, onSubmit, form, parents, sections, editingStudent }) => {
  return (
    <Modal
      title={editingStudent ? "Edit Student" : "Add Student"}
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
          <Input />  
        </Form.Item>
        <Form.Item
          label="Middle Name"
          name="middleName"
          rules={[{ whitespace: true }]}
        >
          <Input placeholder="(optional)" />
        </Form.Item>
        <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="emailAddress" label="Email" rules={[{ required: true, type: "email" }]}>
          <Input />
        </Form.Item>
        <Form.Item name="gender" label="Gender" rules={[{ required: true }]}>
          <Select>
            <Option value="Male">Male</Option>
            <Option value="Female">Female</Option>
          </Select>
        </Form.Item>
        <Form.Item name="dateEnrolled" label="Date Enrolled" rules={[{ required: true }]}>
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="program" label="Program" rules={[{ required: true }]}>
          <Select>
            <Option value="Homeschooling">Homeschooling</Option>
            <Option value="Online">Online</Option>
            <Option value="Face-to-Face">Face-to-Face</Option>
          </Select>
        </Form.Item>
        <Form.Item name="parentID" label="Parent" rules={[{ required: true }]}>
          <Select showSearch optionFilterProp="children">
            {editingStudent?.parentID && (
              <Option key={editingStudent.parentID._id} value={editingStudent.parentID._id} disabled>
                {`${editingStudent.parentID.firstName} ${editingStudent.parentID.lastName}`} 
                {editingStudent.parentID.isActive === false ? " (Inactive)" : ""}
              </Option>
            )}
            {parents
              .filter(p => !editingStudent?.parentID || p._id !== editingStudent.parentID._id)
              .map((parent) => (
                <Option key={parent._id} value={parent._id}>
                  {`${parent.firstName} ${parent.lastName}`} 
                  {parent.isActive === false ? " (Inactive)" : ""}
                </Option>
              ))}
          </Select>
        </Form.Item>

        <Form.Item name="sectionID" label="Section" rules={[{ required: true }]}>
          <Select>
            {sections.map((section) => (
              <Option key={section._id} value={section._id}>
                {`Grade ${section.grade} - ${section.name}`}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default StudentFormModal;
