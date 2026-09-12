import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { studyApi } from '../../api/studyApi';
import { useToast } from '../../components/common/Toast';
import { Activity, ShieldCheck, Users, FlaskConical, AlertTriangle, ArrowUpRight, Database } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const AdminDashboard = () => {
  const { showToast } = useToast();
  const [health, setHealth] = useState(null);
  const [analytics, setAnalytics] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [hRes, aRes, lRes, sRes] = await Promise.all([
          adminApi.getSystemHealth().catch(() => null),
          adminApi.getAnalytics().catch(() => []),
          adminApi.getAuditLogs(0, 5).catch(() => ({ content: [] })),
          studyApi.getAll().catch(() => []),
        ]);
        setHealth(hRes);
        setAnalytics(aRes || []);
        setRecentLogs(lRes?.content || []);
        setStudies(sRes || []);
      } catch (err) {
        showToast('Failed to load admin analytics from backend', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [showToast]);

  const activeStudiesCount = health?.activeStudies != null 
    ? health.activeStudies 
    : studies.filter(s => (s.studyStatus === 'ACTIVE' || s.studyStatus === 'SETUP') && !s.databaseLocked).length;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--forest-deep)', letterSpacing: '-0.03em' }}>
          System Administrator Dashboard
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', marginTop: '0.25rem', fontWeight: 500 }}>
          Global System Health, 21 CFR Part 11 Audit Trail & System Analytics
        </p>
      </div>

      {/* Top Neumorphic Stat Cards */}
      <div className="grid-stats" style={{ gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="stat-card neu">
          <div className="neu-icon-badge" style={{ background: '#eaf5eb', color: 'var(--forest-deep)' }}>
            <Activity size={26} />
          </div>
          <div className="stat-info">
            <h4>System Status</h4>
            <div className="value" style={{ color: 'var(--forest-deep)', fontSize: '1.65rem' }}>
              {health?.status || 'ONLINE (UP)'}
            </div>
          </div>
        </div>

        <div className="stat-card neu">
          <div className="neu-icon-badge" style={{ background: '#eaf2f8', color: '#0284c7' }}>
            <Users size={26} />
          </div>
          <div className="stat-info">
            <h4>Total Registered Users</h4>
            <div className="value" style={{ color: '#0369a1', fontSize: '1.65rem' }}>
              {loading ? '...' : (health?.totalUsers ?? JSON.parse(localStorage.getItem('ctms_registered_users') || '[]').length)}
            </div>
          </div>
        </div>

        <div className="stat-card neu">
          <div className="neu-icon-badge" style={{ background: '#eaf5eb', color: '#16a34a' }}>
            <FlaskConical size={26} />
          </div>
          <div className="stat-info">
            <h4>Active Clinical Studies</h4>
            <div className="value" style={{ color: '#15803d', fontSize: '1.65rem' }}>
              {loading ? '...' : activeStudiesCount}
            </div>
          </div>
        </div>

        <div className="stat-card neu">
          <div className="neu-icon-badge" style={{ background: '#fef3c7', color: '#d97706' }}>
            <AlertTriangle size={26} />
          </div>
          <div className="stat-info">
            <h4>Overdue SAE Alerts</h4>
            <div className="value" style={{ color: '#b45309', fontSize: '1.65rem' }}>
              {loading ? '...' : health?.overdueSAEs || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Neumorphic Analytics & Audit Trail Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.75rem' }}>
        {/* Trial Enrollment Progress Chart */}
        <div className="neu-card">
          <div className="card-header" style={{ borderBottom: '2px solid var(--mint-light)', paddingBottom: '0.85rem' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--forest-deep)' }}>Study Enrollment Analytics</h3>
            <span className="badge badge-info" style={{ fontWeight: 700 }}>Real Backend Data</span>
          </div>
          <div style={{ height: '320px', width: '100%', marginTop: '1rem' }}>
            {analytics.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8f5e9" />
                  <XAxis dataKey="studyTitle" stroke="#4a6350" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#4a6350" />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#a5d6a7', color: '#1b5e20', borderRadius: '12px', boxShadow: '0 8px 24px rgba(27,94,32,0.12)' }} />
                  <Bar dataKey="actualEnrollment" name="Actual Enrolled" fill="#1b5e20" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="targetEnrollment" name="Target Goal" fill="#a5d6a7" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontWeight: 500 }}>
                No active enrollment data found
              </div>
            )}
          </div>
        </div>

        {/* Live Cryptographic Audit Feed */}
        <div className="neu-card">
          <div className="card-header" style={{ borderBottom: '2px solid var(--mint-light)', paddingBottom: '0.85rem' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--forest-deep)' }}>Latest 21 CFR Part 11 Audit Logs</h3>
            <span className="badge badge-success" style={{ fontWeight: 700 }}>Cryptographic SHA-256</span>
          </div>
          <div className="table-responsive" style={{ marginTop: '0.75rem' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>User</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                      No audit records found
                    </td>
                  </tr>
                ) : (
                  recentLogs.map((log) => (
                    <tr key={log.id}>
                      <td>
                        <span className="badge badge-info" style={{ fontWeight: 700, letterSpacing: '0.03em', fontSize: '0.725rem' }}>
                          {log.action}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          fontFamily: 'monospace',
                          background: '#f0f7f2',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '6px',
                          border: '1px solid var(--mint-accent)',
                          color: 'var(--forest-deep)',
                          fontSize: '0.8rem',
                          fontWeight: 700
                        }}>
                          {log.entityType} #{log.entityId || 'N/A'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--forest-deep)', fontWeight: 700, fontSize: '0.85rem' }}>
                        {log.user?.username || 'SYSTEM'}
                      </td>
                      <td style={{ fontSize: '0.785rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
