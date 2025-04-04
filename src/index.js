import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "antd/dist/reset.css"; // Ant Design Reset
import axiosInstance from './services/axiosInstance';


// Get the root element from the HTML
const rootElement = document.getElementById("root");


const fetchData = async () => {
  try {
    const response = await axiosInstance.get('/'); // Example endpoint
    console.log(response.data);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

fetchData();

// Create a root and render the App component
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
