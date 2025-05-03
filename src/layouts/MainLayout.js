import React, { useState } from "react";
import { Layout, Menu, Dropdown, Avatar, Space, Tooltip } from "antd";
import { DownOutlined, UserOutlined } from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import "../styles/MainLayout.css";
import { hasAccess } from "../utils/permissions";
import { logout } from "../utils/auth";
import logo from "../assets/images/logo.png";

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const toggleSidebar = () => setCollapsed(!collapsed);
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));

  const rawMenuItems = [
    { key: "1", label: "Dashboard", route: "/", resource: "dashboard" },
    { key: "3", label: "Attendance", route: "/attendance", resource: "attendance" },
    { key: "5", label: "Schedules", route: "/schedules", resource: "schedules" },
    { key: "6", label: "Sections", route: "/sections", resource: "sections" },
    { key: "7", label: "Subjects", route: "/subjects", resource: "subjects" },
    { key: "4", label: "Settings", route: "/settings", resource: "settings" },
    { key: "8", label: "Faculty", route: "/faculty", resource: "faculty" },
    { key: "9", label: "Students", route: "/students", resource: "students" },
    { key: "10", label: "Parents", route: "/parents", resource: "parents" },
    { key: "2", label: "Admin", route: "/users", resource: "users" },
    { key: "11", label: "My Attendance", route: "/my-attendance", resource: "my-attendance" },
    { key: "12", label: "My Schedule", route: "/my-schedule", resource: "my-schedule" },
    { key: "16", label: "My Schedule", route: "/faculty-schedules", resource: "my-faculty-schedule" },
    { key: "14", label: "My Profile", route: "/my-profile", resource: "my-profile" },
    { key: "15", label: "Child Attendance", route: "/parent-attendance", resource: "parent-attendance" },
  ];

  const menuItems = rawMenuItems
    .filter(item => !item.resource || hasAccess(user?.role, item.resource))
    .map(item => ({
      key: item.key,
      label: item.label,
      onClick: () => navigate(item.route),
    }));

  const selectedKey = rawMenuItems.find(item => item.route === location.pathname)?.key || "1";

  const userMenu = {
    items: [
      {
        key: "logout",
        label: "Logout",
        onClick: () => {
          logout();
          navigate("/login");
        },
      },
    ],
  };

  return (
    <Layout style={{ height: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="lg"
        collapsedWidth={0}
        trigger={null}
      >
        <div className="sider-logo">
          <img src={logo} alt="Logo" className="logo-img" />
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header className="layout-header">
          <div className="header-left">
            <Tooltip title="Toggle Menu">
              <span className="system-title" onClick={toggleSidebar}>SMIS Attendance Monitoring System</span>
            </Tooltip>
          </div>
          <Dropdown menu={userMenu} trigger={["click"]}>
            <Space className="user-profile">
              <Avatar icon={<UserOutlined />} />
              <span>{user?.name || user?.email || "User"}</span>
              <DownOutlined />
            </Space>
          </Dropdown>
        </Header>
        <Content className="content">
          <div className="content-scrollable">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
