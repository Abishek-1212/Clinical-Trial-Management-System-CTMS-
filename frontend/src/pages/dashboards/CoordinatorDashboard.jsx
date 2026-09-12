import React, { useEffect, useState } from 'react';
import { participantApi } from '../../api/participantApi';
import { clinicalApi } from '../../api/clinicalApi';
import { useToast } from '../../components/common/Toast';
import { UserPlus, Calendar, Pill, FileSpreadsheet, Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CoordinatorDashboard = () => {
  const { showToast } = useToast();
  const [participants, setParticipants] = useState([]);
  const [ipLog, setIpLog] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [pRes, ipRes] = await Promise.all([
          participantApi.getByStudy(1).catch(() => []),
          clinicalApi.getIpAccountability(1).catch(() => []),
        ]);
        setParticipants(pRes || []);
        setIpLog(ipRes || []);
      } catch (err) {
        showToast('Failed to load coordinator workspace', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [showToast]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem' }}>Site Coordinator Workspace</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Patient Onboarding, Visit Execution, ICF Records & IP Accountability
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/participants" className="btn btn-primary">
            <UserPlus size={18} /> Enroll Subject
          </Link>
          <Link to="/ip" className="btn btn-secondary">
            <Pill size={18} /> Dispense IP
          </Link>
        </div>
      </div>

      <div className="grid-stats">
        <div className="stat-card">
          <div className="stat-icon indigo"><UserPlus size={24} /></div>
          <div className="stat-info">
            <h4>Screened & Active Subjects</h4>
            <div className="value">{participants.length}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon emerald"><Calendar size={24} /></div>
          <div className="stat-info">
            <h4>Scheduled Protocol Visits</h4>
            <div className="value">5</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon cyan"><Pill size={24} /></div>
          <div className="stat-info">
            <h4>IP Stock Movements</h4>
            <div className="value">{ipLog.length}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Enrolled Participants & Consent Status</h3>
          <Link to="/participants" className="btn btn-secondary btn-sm">Manage All</Link>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Subject Pseudonym ID</th>
                <th>Consent Date</th>
                <th>Consent Version</th>
                <th>Screening Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {participants.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No participants found</td></tr>
              ) : (
                participants.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.subjectId}</td>
                    <td>{p.consentDate || 'Pending'}</td>
                    <td><span className="badge badge-secondary">{p.consentVersion || 'v1.0'}</span></td>
                    <td>{p.screeningDate || 'N/A'}</td>
                    <td><span className="badge badge-success">{p.status}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
