import React, { useEffect, useState } from 'react';
import { studyApi } from '../../api/studyApi';
import { useToast } from '../../components/common/Toast';
import { FileSpreadsheet, HelpCircle, Lock, Unlock, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DataManagerDashboard = () => {
  const { showToast } = useToast();
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudies = async () => {
      try {
        setLoading(true);
        const data = await studyApi.getAll();
        setStudies(data || []);
      } catch (err) {
        showToast('Failed to load data manager studies', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchStudies();
  }, [showToast]);

  const handleLock = async (id) => {
    if (!window.confirm('Are you sure you want to LOCK this database? No further eCRF modifications will be permitted.')) return;
    try {
      await studyApi.lockDatabase(id);
      showToast('Study database successfully locked!', 'success');
      const updated = await studyApi.getAll();
      setStudies(updated);
    } catch (err) {
      showToast('Failed to lock database', 'error');
    }
  };

  const handleUnlock = async (id) => {
    if (!window.confirm('Are you sure you want to RELEASE / UNLOCK this database lock? eCRF data entry and modifications will be permitted again.')) return;
    try {
      await studyApi.unlockDatabase(id);
      showToast('Study database lock released successfully! Study is now unlocked.', 'success');
      const updated = await studyApi.getAll();
      setStudies(updated);
    } catch (err) {
      showToast('Failed to release database lock', 'error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem' }}>Data Manager Workspace</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            eCRF Data Validation, Discrepancy Query Management & Database Freeze
          </p>
        </div>
        <Link to="/queries" className="btn btn-primary">
          <HelpCircle size={18} /> Manage Data Queries
        </Link>
      </div>

      <div className="grid-stats">
        <div className="stat-card">
          <div className="stat-icon indigo"><FileSpreadsheet size={24} /></div>
          <div className="stat-info">
            <h4>Studies Under Management</h4>
            <div className="value">{studies.length}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber"><HelpCircle size={24} /></div>
          <div className="stat-info">
            <h4>Open Queries Queue</h4>
            <div className="value">2</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon rose"><Lock size={24} /></div>
          <div className="stat-info">
            <h4>Locked Databases</h4>
            <div className="value">{studies.filter(s => s.databaseLocked).length}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Study Database Freeze Controls</h3>
          <span className="badge badge-info">GCP Lock Enforcement</span>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Study Title</th>
                <th>Phase</th>
                <th>Database Status</th>
                <th>Lock Control</th>
              </tr>
            </thead>
            <tbody>
              {studies.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{s.studyTitle}</td>
                  <td><span className="badge badge-secondary">{s.phase}</span></td>
                  <td>
                    {s.databaseLocked ? (
                      <span className="badge badge-danger">LOCKED & FROZEN</span>
                    ) : (
                      <span className="badge badge-success">OPEN FOR ENTRY</span>
                    )}
                  </td>
                  <td>
                    {s.databaseLocked ? (
                      <button className="btn btn-warning btn-sm" onClick={() => handleUnlock(s.id)}>
                        <Unlock size={14} /> Release Lock
                      </button>
                    ) : (
                      <button className="btn btn-danger btn-sm" onClick={() => handleLock(s.id)}>
                        <Lock size={14} /> Freeze & Lock DB
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
