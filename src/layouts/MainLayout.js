import React from "react";
import { Layout, Menu, Dropdown, Avatar, Space } from "antd";
import { DownOutlined, UserOutlined } from "@ant-design/icons";
import { Outlet, useNavigate } from "react-router-dom";
import "../styles/MainLayout.css";
import { hasAccess } from "../utils/permissions";
import { logout } from "../utils/auth";

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const rawMenuItems = [
    { key: "1", label: "Dashboard", route: "/", resource: "dashboard" },
    { key: "2", label: "User Management", route: "/users", resource: "users" },
    { key: "3", label: "Attendance", route: "/attendance", resource: "attendance" },
    { key: "4", label: "Settings", route: "/settings", resource: "settings" },
    { key: "5", label: "Schedules", route: "/schedules", resource: "schedules" },
    { key: "6", label: "Sections", route: "/sections", resource: "sections" },
    { key: "7", label: "Subjects", route: "/subjects", resource: "subjects" },
    { key: "8", label: "Faculty", route: "/faculty", resource: "faculty" },
    { key: "9", label: "Students", route: "/students", resource: "students" },
    { key: "10", label: "Parents", route: "/parents", resource: "parents" },
  ];

  const menuItems = rawMenuItems
    .filter(item => !item.resource || hasAccess(user?.role, item.resource))
    .map(item => ({
      key: item.key,
      label: item.label,
      onClick: () => navigate(item.route),
    }));

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
      <Sider>
        <div className="sider-logo">Logo</div>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={["1"]} items={menuItems} />
      </Sider>
      <Layout>
        <Header className="layout-header">
          <div>Attendance Management</div>
          <Dropdown menu={userMenu} trigger={["click"]}>
            <Space className="user-profile">
              <Avatar icon={<UserOutlined />} />
              <DownOutlined />
            </Space>
          </Dropdown>
        </Header>
        <Content className="content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
