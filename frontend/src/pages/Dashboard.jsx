import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalLost: 0,
    totalFound: 0,
    resolvedClaimed: 0,
    activeReports: 0,
    totalClaims: 0,
    recentItems: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await API.get('/dashboard/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Fetching real-time statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Welcome Banner */}
      <div className="dashboard-hero">
        <div className="hero-content">
          <h1>Welcome back, <span className="highlight-text">{user?.name || 'Friend'}</span> 👋</h1>
          <p className="hero-subtitle">
            Track reported items, review claim requests, and help reunite lost belongings with their owners.
          </p>
        </div>
        <div className="hero-actions">
          <Link to="/report" className="btn btn-primary">
            ➕ Report an Item
          </Link>
          <Link to="/items" className="btn btn-outline-white">
            🔎 Browse Items
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* 4 Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-lost">
          <div className="stat-icon-wrapper">
            <span className="stat-icon">❗</span>
          </div>
          <div className="stat-details">
            <span className="stat-label">Lost Items</span>
            <span className="stat-value">{stats.totalLost}</span>
            <span className="stat-hint">Reported missing items</span>
          </div>
        </div>

        <div className="stat-card stat-found">
          <div className="stat-icon-wrapper">
            <span className="stat-icon">🎁</span>
          </div>
          <div className="stat-details">
            <span className="stat-label">Found Items</span>
            <span className="stat-value">{stats.totalFound}</span>
            <span className="stat-hint">Waiting to be claimed</span>
          </div>
        </div>

        <div className="stat-card stat-claimed">
          <div className="stat-icon-wrapper">
            <span className="stat-icon">🤝</span>
          </div>
          <div className="stat-details">
            <span className="stat-label">Claimed / Resolved</span>
            <span className="stat-value">{stats.resolvedClaimed}</span>
            <span className="stat-hint">Successfully reunited</span>
          </div>
        </div>

        <div className="stat-card stat-active">
          <div className="stat-icon-wrapper">
            <span className="stat-icon">📌</span>
          </div>
          <div className="stat-details">
            <span className="stat-label">Active Reports</span>
            <span className="stat-value">{stats.activeReports}</span>
            <span className="stat-hint">Currently open cases</span>
          </div>
        </div>
      </div>

      {/* Quick Access Section */}
      <div className="dashboard-content-grid">
        <div className="dashboard-section recent-activity-card">
          <div className="section-header">
            <h2>Recent Activity</h2>
            <Link to="/items" className="view-all-link">
              View All Items →
            </Link>
          </div>

          {stats.recentItems && stats.recentItems.length > 0 ? (
            <div className="recent-items-list">
              {stats.recentItems.map((item) => (
                <div key={item._id} className="recent-item-row">
                  <div className="recent-item-icon">
                    {item.type === 'Lost' ? '🚨' : '✨'}
                  </div>
                  <div className="recent-item-info">
                    <h4>{item.title}</h4>
                    <div className="recent-item-sub">
                      <span className={`badge badge-sm badge-${item.type.toLowerCase()}`}>
                        {item.type}
                      </span>
                      <span>•</span>
                      <span>{item.category}</span>
                      <span>•</span>
                      <span>📍 {item.location}</span>
                    </div>
                  </div>
                  <div className="recent-item-status">
                    <span className={`badge badge-sm badge-${item.status.toLowerCase()}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">📭</span>
              <p>No items reported yet. Be the first to report an item!</p>
              <Link to="/report" className="btn btn-sm btn-primary">
                Report Item
              </Link>
            </div>
          )}
        </div>

        {/* Quick Shortcuts Card */}
        <div className="dashboard-section quick-actions-card">
          <div className="section-header">
            <h2>Quick Actions</h2>
          </div>
          <div className="shortcuts-list">
            <Link to="/report" className="shortcut-item">
              <span className="shortcut-icon">📢</span>
              <div>
                <strong>Report an Item</strong>
                <p>Post a lost or found possession</p>
              </div>
            </Link>
            <Link to="/my-reports" className="shortcut-item">
              <span className="shortcut-icon">📋</span>
              <div>
                <strong>My Reports</strong>
                <p>Manage, edit, and view claims for your items</p>
              </div>
            </Link>
            <Link to="/claims" className="shortcut-item">
              <span className="shortcut-icon">📬</span>
              <div>
                <strong>Claims Management</strong>
                <p>Check claim statuses and review submissions</p>
              </div>
            </Link>
            <Link to="/items" className="shortcut-item">
              <span className="shortcut-icon">🔍</span>
              <div>
                <strong>Search Database</strong>
                <p>Filter by location, category, or type</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
