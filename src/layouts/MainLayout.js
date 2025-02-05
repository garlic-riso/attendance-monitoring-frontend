import React from "react";
import { Layout, Menu, Dropdown, Avatar, Space } from "antd";
import { DownOutlined, UserOutlined } from "@ant-design/icons";
import { Outlet, useNavigate } from "react-router-dom";
import "../styles/MainLayout.css";

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const navigate = useNavigate();

  const menuItems = [
    { key: "1", label: "Dashboard", onClick: () => navigate("/users") },
    { key: "2", label: "Attendance", onClick: () => navigate("/users") },
    { key: "3", label: "Class List", onClick: () => navigate("/users") },
    { key: "4", label: "Reports", onClick: () => navigate("/users") },
    { key: "5", label: "Settings", onClick: () => navigate("/users") },
    { key: "6", label: "Schedule", onClick: () => navigate("/schedules") },
    { key: "7", label: "Sections", onClick: () => navigate("/sections") },
    { key: "8", label: "Faculty", onClick: () => navigate("/faculty") },
    { key: "9", label: "Subject", onClick: () => navigate("/subjects") },
  ];

  const userMenu = {
    items: [
      {
        key: "logout",
        label: "Logout",
        onClick: () => navigate("/login"),
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
