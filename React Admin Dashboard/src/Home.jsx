import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import {
  BsPeopleFill, BsFillBellFill, BsFillArchiveFill
} from 'react-icons/bs';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend
} from 'recharts';
import './home.css'; // if styling separately

function Home() {
  const [stats, setStats] = useState({
    totalCount: 0,
    latest: [],
    all: []
  });
  const [viewMode, setViewMode] = useState('date');

  useEffect(() => {
    axios.get('http://0.0.0.0:8080/list')
      .then(res => setStats(res.data))
      .catch(console.error);
  }, []);

  const chartData = useMemo(() => {
    const group = {};

    stats.all.forEach(t => {
      if (!t.createdAt) return;

      const cleaned = t.createdAt.replace(' IST', '');
      const ts = Date.parse(cleaned);
      if (isNaN(ts)) return;

      const d = new Date(ts);

      const label = viewMode === 'date'
        ? d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })  // e.g., "22 Jun"
        : d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }); // e.g., "Jun 2025"

      group[label] = (group[label] || 0) + 1;
    });

    return Object.entries(group)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([name, signups]) => ({ name, signups }));
  }, [stats.all, viewMode]);

  return (
    <main className="main-container">
      <h2 className="main-title">Dashboard</h2>

      <div className="card-grid">
        <Card label="Total Tenants" value={stats.totalCount} icon={BsPeopleFill} />
        <Card label="Latest (24h)" value={stats.latest.length} icon={BsFillBellFill} />
        <Card label="Latest (10)" value={stats.latest.length} icon={BsFillArchiveFill} />
      </div>

      <div className="view-toggle">
        <label>View Mode: </label>
        <select value={viewMode} onChange={e => setViewMode(e.target.value)}>
          <option value="date">Date-wise</option>
          <option value="month">Month-wise</option>
        </select>
      </div>

      <div className="chart-section">
        <h3>Tenant Signups Over Time</h3>
        <div className="scroll-chart">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              width={chartData.length * 60}  // Dynamically expand chart
              height={300}
              data={chartData}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="signups" fill="#4e73df" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="latest-table">
        <h3>Latest Tenants</h3>
        <table>
          <thead>
            <tr>
              <th>School ID</th>
              <th>Name</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {stats.latest.map((item, idx) => (
              <tr key={idx} onClick={() => handleCustomerClick(item.schoolId)}>
                <td>{item.schoolId}</td>
                <td>{item.schoolName || 'N/A'}</td>
                <td>{item.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function Card({ label, value, icon: Icon }) {
  return (
    <div className="dashboard-card">
      <div className="card-icon"><Icon /></div>
      <div>
        <p className="card-label">{label}</p>
        <h3 className="card-value">{value}</h3>
      </div>
    </div>
  );
}

// Placeholder for future detailed screen navigation
function handleCustomerClick(schoolId) {
  console.log(`Navigate to details for schoolId: ${schoolId}`);
  // You can use React Router or another method to navigate to a new page
  // e.g., navigate(`/tenant/${schoolId}`)
}

export default Home;