import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";
import "./index.css";
import axios from "axios";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

const AnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("weekly");
  const [watchLaterFolderData, setWatchLaterFolderData] = useState([]);
  const [FolderTotalMovies, setFolderTotalMovies] = useState([]);

  useEffect(() => {
    renderPlaylistAnalytics();
  }, []);

  const renderPlaylistAnalytics = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/api/analytics`,
        {
          withCredentials: true,
        },
      );

      setWatchLaterFolderData(res.data.results);
    } catch (err) {
      console.log(err);
    }
  };

  // Share Links Data
  const shareLinkData = {
    labels: ["Active", "Expired"],
    datasets: [
      {
        label: "Share Links",
        data: [4, 2],
        backgroundColor: ["#6366f1", "#ef4444"],
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  // Revenue Data
  const revenueData = {
    labels: watchLaterFolderData.map((e) => e.folder_name),
    datasets: [
      {
        label: "Revenue",
        data: watchLaterFolderData.map((e) => e.total_count),
        borderColor: "#148dff",
        backgroundColor: "#fff",
        tension: 0.,
        fill: true,
        pointBackgroundColor: "#7eceff",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 5,
      },
    ],
  };

  // Performance Data
  const performanceData = {
    labels: ["Product A", "Product B", "Product C", "Product D"],
    datasets: [
      {
        label: "Performance",
        data: [65, 78, 45, 92],
                borderRadius: 8,
      },
    ],
  };

  // Distribution Data
  const distributionData = {
    labels: ["Desktop", "Mobile", "Tablet"],
    datasets: [
      {
        data: [45, 35, 20],
        backgroundColor: ["#4f46e5", "#7c3aed", "#a78bfa"],
        borderColor: "#fff",
        borderWidth: 3,
      },
    ],
  };

  // Usage Data
  const usageData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Usage",
        data: [30, 45, 60, 75],
        borderColor: "#7c3aed",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#7c3aed",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: "#150f0f",
          font: { size: 12, weight: "600" },
          padding: 15,
          backgroundColor: "white",
          usePointStyle: true,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(0, 0, 0, 0.05)" },
        ticks: { color: "#000000" },
      },
      x: { grid: { display: false }, ticks: { color: "#000000" } },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "#1f2937", font: { size: 12 }, padding: 15 },
      },
    },
  };

  return (
    <div className="analytics-dashboard">
      <div className="dashboard-wrapper">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-top">
            <div>
              <h1>📊 Advanced Analytics</h1>
              <p>Comprehensive business insights and metrics</p>
            </div>
            <div className="header-controls">
              <div className="time-range">
                {["daily", "weekly", "monthly"].map((range) => (
                  <button
                    key={range}
                    className={`time-btn ${timeRange === range ? "active" : ""}`}
                    onClick={() => setTimeRange(range)}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="tabs-nav">
          {["overview", "performance", "analytics"].map((tab) => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "overview" && "📈 Overview"}
              {tab === "performance" && "⚡ Performance"}
              {tab === "analytics" && "📊 Analytics"}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            {/* KPI Cards */}
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-top">
                  <span className="kpi-icon">📊</span>
                  <span className="kpi-change positive">+12%</span>
                </div>
                <div className="kpi-name">Total Records</div>
                <div className="kpi-number">15,234</div>
                <div className="kpi-footer">vs last week</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-top">
                  <span className="kpi-icon">📈</span>
                  <span className="kpi-change positive">+28.5%</span>
                </div>
                <div className="kpi-name">Revenue Growth</div>
                <div className="kpi-number">$45,280</div>
                <div className="kpi-footer">this month</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-top">
                  <span className="kpi-icon">👥</span>
                  <span className="kpi-change positive">+18%</span>
                </div>
                <div className="kpi-name">Active Users</div>
                <div className="kpi-number">8,456</div>
                <div className="kpi-footer">currently online</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-top">
                  <span className="kpi-icon">✅</span>
                  <span className="kpi-change negative">-2%</span>
                </div>
                <div className="kpi-name">Success Rate</div>
                <div className="kpi-number">98.5%</div>
                <div className="kpi-footer">system uptime</div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="charts-grid-2">
              <div className="chart-card">
                <div className="chart-header">
                  <h3>Share Links</h3>
                  <span className="chart-badge">Status</span>
                </div>
                <div className="chart-wrapper">
                  <Bar data={shareLinkData} options={chartOptions} />
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header">
                  <h3>Device Distribution</h3>
                  <span className="chart-badge">Devices</span>
                </div>
                <div className="chart-wrapper pie">
                  <Doughnut data={distributionData} options={pieOptions} />
                </div>
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="chart-card full-width">
              <div className="chart-header">
                <h3>Revenue Trend</h3>
                <span className="chart-badge">Weekly</span>
              </div>
              <div className="chart-wrapper large">
                <Line data={revenueData} options={chartOptions} />
              </div>
            </div>
          </>
        )}

        {/* Performance Tab */}
        {activeTab === "performance" && (
          <>
            <div className="charts-grid-2">
              <div className="chart-card">
                <div className="chart-header">
                  <h3>Product Performance</h3>
                  <span className="chart-badge">All Products</span>
                </div>
                <div className="chart-wrapper">
                  <Bar data={performanceData} options={chartOptions} />
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header">
                  <h3>Market Share</h3>
                  <span className="chart-badge">Distribution</span>
                </div>
                <div className="chart-wrapper pie">
                  <Pie data={distributionData} options={pieOptions} />
                </div>
              </div>
            </div>

            <div className="info-section">
              <h3 className="info-title">Performance Metrics</h3>
              <div className="metrics-grid">
                <div className="metric-item">
                  <div className="metric-label">Conversion Rate</div>
                  <div className="metric-progress">
                    <div
                      className="progress-bar"
                      style={{ width: "78%" }}
                    ></div>
                  </div>
                  <div className="metric-value">78%</div>
                </div>
                <div className="metric-item">
                  <div className="metric-label">Customer Retention</div>
                  <div className="metric-progress">
                    <div
                      className="progress-bar"
                      style={{ width: "85%" }}
                    ></div>
                  </div>
                  <div className="metric-value">85%</div>
                </div>
                <div className="metric-item">
                  <div className="metric-label">System Availability</div>
                  <div className="metric-progress">
                    <div
                      className="progress-bar"
                      style={{ width: "99.9%" }}
                    ></div>
                  </div>
                  <div className="metric-value">99.9%</div>
                </div>
                <div className="metric-item">
                  <div className="metric-label">Load Time</div>
                  <div className="metric-progress">
                    <div
                      className="progress-bar"
                      style={{ width: "92%" }}
                    ></div>
                  </div>
                  <div className="metric-value">0.8s</div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <>
            <div className="chart-card full-width">
              <div className="chart-header">
                <h3>Monthly Usage Trend</h3>
                <span className="chart-badge">Last 4 Weeks</span>
              </div>
              <div className="chart-wrapper large">
                <Line data={usageData} options={chartOptions} />
              </div>
            </div>

            <div className="info-section">
              <h3 className="info-title">Analytics Summary</h3>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="summary-label">Page Views</span>
                  <span className="summary-value">124,567</span>
                  <span className="summary-change positive">↑ 23%</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Average Session</span>
                  <span className="summary-value">4m 32s</span>
                  <span className="summary-change positive">↑ 12%</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Bounce Rate</span>
                  <span className="summary-value">32.4%</span>
                  <span className="summary-change negative">↓ 5%</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Transactions</span>
                  <span className="summary-value">2,456</span>
                  <span className="summary-change positive">↑ 18%</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
