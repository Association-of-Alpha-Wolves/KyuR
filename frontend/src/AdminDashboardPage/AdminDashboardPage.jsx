import { useState, useEffect } from 'react';
import './AdminDashboardPage.css';
import { useNavigate } from 'react-router-dom';

const AdminDashboardPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const token = localStorage.getItem('kyurToken');
        if (!token) {
          throw new Error('No authentication token found. Please login as an admin.');
        }

        const response = await fetch('http://localhost:5000/api/admin/metrics', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const result = await response.json();
        
        if (response.ok && result.success) {
          setMetrics(result.data);
        } else {
          throw new Error(result.message || 'Failed to fetch metrics. You may not be authorized.');
        }
      } catch (error) {
        console.error('Failed to fetch metrics', error);
        setMetrics({ error: error.message });
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="admin-loading-container">
        <div className="admin-loader"></div>
        <p>Loading Dashboard Analytics...</p>
      </div>
    );
  }

  if (!metrics || metrics.error) {
    return (
      <div className="admin-error">
        <div className="error-card">
          <h2>Access Denied</h2>
          <p>{metrics?.error || 'Failed to load metrics. Please check the backend connection.'}</p>
          <button className="primaryBtn" onClick={() => navigate('/')}>Return to App</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-wrapper">
      <aside className="admin-sidebar">
        <div className="admin-brand" onClick={() => navigate('/')}>
          <span className="brand-primary">Admin</span>
          <span className="brand-accent">KyuR</span>
        </div>
        <nav className="admin-nav-links">
          <button className="nav-link active">Dashboard</button>
          <button className="nav-link" onClick={() => navigate('/')}>Return to App</button>
        </nav>
      </aside>

      <main className="admin-main-content">
        <header className="admin-topbar">
          <h1 className="admin-page-title">Dashboard Overview</h1>
          <div className="admin-profile-mock">Admin User</div>
        </header>

        <div className="admin-content-body">
          <section className="admin-metric-cards">
            {/* User Metrics */}
            <div className="admin-card">
              <div className="card-header">
                <h3>Total Users</h3>
                <span className="card-icon">👥</span>
              </div>
              <div className="card-body">
                <div className="stat-primary">{metrics.users.total}</div>
                <div className="stat-details">
                  <span>Students: {metrics.users.students}</span>
                  <span>Faculty: {metrics.users.faculty}</span>
                  <span className="text-red font-bold">Admins: {metrics.users.admins}</span>
                </div>
              </div>
            </div>

            {/* Item Metrics (Red Highlight) */}
            <div className="admin-card card-highlight-red">
              <div className="card-header">
                <h3 className="text-red">Item Lifecycle</h3>
                <span className="card-icon">📦</span>
              </div>
              <div className="card-body">
                <div className="stat-primary text-red">{metrics.items.total}</div>
                <div className="stat-details">
                  <span>Lost: {metrics.items.lost}</span>
                  <span>Found: {metrics.items.found}</span>
                  <span>Claimed: {metrics.items.claimed}</span>
                </div>
              </div>
            </div>

            {/* Activity Metrics (Yellow Highlight) */}
            <div className="admin-card card-highlight-yellow">
              <div className="card-header">
                <h3 className="text-yellow">Recent Activity (30 Days)</h3>
                <span className="card-icon">📈</span>
              </div>
              <div className="card-body">
                <div className="stat-primary text-yellow">{metrics.items.last30Days}</div>
                <div className="stat-details">
                  <span>Conversations: {metrics.chat.conversations}</span>
                  <span>Messages: {metrics.chat.messages}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="admin-charts-section">
            <div className="admin-card full-width">
              <div className="card-header border-bottom">
                <h3>Item Categories Distribution</h3>
              </div>
              <div className="card-body chart-body">
                {Object.entries(metrics.items.categories).map(([category, count]) => {
                  const percentage = Math.round((count / metrics.items.total) * 100) || 0;
                  return (
                    <div key={category} className="category-row">
                      <div className="category-label">
                        <span className="category-name">{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                        <span className="category-count">{count}</span>
                      </div>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
                {Object.keys(metrics.items.categories).length === 0 && (
                  <div className="no-data-state">No categories data available</div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
