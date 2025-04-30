import React, { useEffect, useState } from "react";
import { Form, Select, Button, message, Input, Space } from "antd";
import axios from "../services/axiosInstance";

const { Option } = Select;

const SettingsPage = () => {
  const [form] = Form.useForm();
  const [settingsId, setSettingsId] = useState(null);
  const [schoolYears, setSchoolYears] = useState([]);
  const [newSY, setNewSY] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchSchoolYears();
    fetchSettings();
  }, []);

  const fetchSchoolYears = async () => {
    try {
      const res = await axios.get("/api/school-years");
      setSchoolYears(res.data);

      // Find the school year with isCurrent: true
      const currentSchoolYear = res.data.find((sy) => sy.isCurrent);
      if (currentSchoolYear) {
        // Set the form field value for the dropdown
        form.setFieldsValue({ currentSchoolYear: currentSchoolYear._id });
      } else {
        // Clear the field if no school year is marked as current
        form.setFieldsValue({ currentSchoolYear: null });
      }
    } catch (err) {
      console.error("Error fetching school years:", err);
      message.error("Failed to fetch school years.");
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await axios.get("/api/settings");
      if (response.data) {
        form.setFieldsValue({
          currentQuarter: response.data.currentQuarter,
        });
        setSettingsId(response.data._id);
      }
    } catch {
      message.error("Failed to fetch settings.");
    }
  };

  const handleAddSchoolYear = async () => {
    if (!newSY.trim()) return;
    setAdding(true);
    try {
      const res = await axios.post("/api/school-years", { label: newSY });
      await fetchSchoolYears();
      form.setFieldValue("currentSchoolYear", res.data._id);
      message.success("New school year added.");
      setNewSY("");
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to add school year.");
    }
    setAdding(false);
  };

  const handleSave = async (values) => {
    try {
      if (settingsId) {
        await axios.put(`/api/settings/${settingsId}`, values);
        message.success("Settings updated.");
      } else {
        const res = await axios.post("/api/settings", values);
        setSettingsId(res.data._id);
        message.success("Settings saved.");
      }
    } catch {
      message.error("Failed to save settings.");
    }
  };

  const handleSchoolYearChange = async (value) => {
    try {
      // Update the backend to set the selected school year as current
      await axios.patch(`/api/school-years/${value}/set-current`);
      message.success("School year updated successfully.");

      // Update the form field value to reflect the change
      form.setFieldsValue({ currentSchoolYear: value });

      // Refresh the list of school years to reflect the updated state
      await fetchSchoolYears();
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to update school year.");
    }
  };

  const handleQuarterChange = async (value) => {
    try {
      const updatedSettings = { currentQuarter: value };
      await axios.put("/api/settings", updatedSettings); // Use the correct backend route
      message.success("Quarter updated successfully.");
    } catch (err) {
      message.error("Failed to update quarter.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Settings</h1>
      <div style={{ maxWidth: "600px" }}>
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            name="currentSchoolYear"
            label="Current School Year"
            rules={[{ required: true, message: "Please select the current school year." }]}
          >
            <Select
              placeholder="Select School Year"
              onChange={handleSchoolYearChange} // Trigger the change handler
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <div style={{ display: "flex", gap: "8px", padding: "8px" }}>
                    <Input
                      placeholder="Add new school year"
                      value={newSY}
                      onChange={(e) => setNewSY(e.target.value)}
                      onPressEnter={handleAddSchoolYear}
                    />
                    <Button onClick={handleAddSchoolYear} loading={adding}>
                      Add
                    </Button>
                  </div>
                </>
              )}
            >
              {schoolYears.map((sy) => (
                <Option key={sy._id} value={sy._id}>
                  {sy.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="currentQuarter"
            label="Current Quarter"
            rules={[{ required: true, message: "Please select the current quarter." }]}
          >
            <Select onChange={handleQuarterChange}>
              <Option value="First">First</Option>
              <Option value="Second">Second</Option>
              <Option value="Third">Third</Option>
              <Option value="Fourth">Fourth</Option>
            </Select>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default SettingsPage;
