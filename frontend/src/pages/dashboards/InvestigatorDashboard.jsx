import React, { useEffect, useState } from 'react';
import { participantApi } from '../../api/participantApi';
import { clinicalApi } from '../../api/clinicalApi';
import { useToast } from '../../components/common/Toast';
import { Stethoscope, AlertTriangle, HelpCircle, Users, Plus, ArrowRight, ShieldAlert, Pill, FileSpreadsheet, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

export const InvestigatorDashboard = () => {
  const { showToast } = useToast();
  const [participants, setParticipants] = useState([]);
  const [adverseEvents, setAdverseEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Load demo study #1 data
        const [pRes, aeRes] = await Promise.all([
          participantApi.getByStudy(1).catch(() => []),
          clinicalApi.getAEsByStudy(1).catch(() => []),
        ]);
        setParticipants(pRes || []);
        setAdverseEvents(aeRes || []);
      } catch (err) {
        showToast('Failed to load investigator workspace', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [showToast]);

  const saeCount = adverseEvents.filter((a) => a.isSAE).length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem' }}>Principal Investigator Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Site Medical Oversight, Subject Safety Monitoring & SAE Escalations
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/participants" className="btn btn-secondary">
            <UserPlus size={18} /> Register Subject
          </Link>
          <Link to="/ip" className="btn btn-secondary">
            <Pill size={18} /> Dispense IP
          </Link>
          <Link to="/adverse-events" className="btn btn-danger">
            <AlertTriangle size={18} /> Report AE / SAE
          </Link>
          <Link to="/ecrf" className="btn btn-primary">
            <Stethoscope size={18} /> eCRF Entry
          </Link>
        </div>
      </div>

      <div className="grid-stats">
        <div className="stat-card">
          <div className="stat-icon indigo"><Users size={24} /></div>
          <div className="stat-info">
            <h4>Active Site Subjects</h4>
            <div className="value">{participants.length}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon rose"><ShieldAlert size={24} /></div>
          <div className="stat-info">
            <h4>Serious Adverse Events (SAE)</h4>
            <div className="value">{saeCount}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber"><HelpCircle size={24} /></div>
          <div className="stat-info">
            <h4>Open Medical Queries</h4>
            <div className="value">1</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Safety / AE Monitoring Table */}
        <div className="card">
          <div className="card-header">
            <h3>Recent Adverse Events Log</h3>
            <span className="badge badge-warning">24-Hour SAE Countdown Active</span>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Event Term</th>
                  <th>Severity</th>
                  <th>SAE Status</th>
                  <th>Onset Date</th>
                </tr>
              </thead>
              <tbody>
                {adverseEvents.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No adverse events reported</td></tr>
                ) : (
                  adverseEvents.map((ae) => (
                    <tr key={ae.id}>
                      <td style={{ fontWeight: 600 }}>{ae.eventTerm || ae.aeDescription || 'Adverse Event'}</td>
                      <td>
                        <span className={`badge ${ae.severity === 'SEVERE' ? 'badge-danger' : 'badge-warning'}`}>
                          {ae.severity}
                        </span>
                      </td>
                      <td>
                        {ae.isSAE ? (
                          <span className="badge badge-danger">SAE REPORTED</span>
                        ) : (
                          <span className="badge badge-secondary">NON-SERIOUS</span>
                        )}
                      </td>
                      <td>{ae.onsetDate}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Site Participants */}
        <div className="card">
          <div className="card-header">
            <h3>Enrolled Subjects</h3>
            <Link to="/participants" className="btn btn-secondary btn-sm">View All</Link>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subject ID</th>
                  <th>Consent Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {participants.length === 0 ? (
                  <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No subjects enrolled</td></tr>
                ) : (
                  participants.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>{p.subjectId}</td>
                      <td>{p.consentDate}</td>
                      <td><span className="badge badge-success">{p.status}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sub-Investigator Clinical Operations Hub */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header">
          <h3>Sub-Investigator Quick Launch Operations Hub</h3>
          <span className="badge badge-info">Full Site Access</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '0.75rem' }}>
          <Link to="/participants" className="btn btn-secondary" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1rem', textAlign: 'center' }}>
            <UserPlus size={24} style={{ color: 'var(--primary)' }} />
            <strong style={{ fontSize: '0.9rem' }}>Participant Management</strong>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Register Pseudonyms & ICF</span>
          </Link>

          <Link to="/ecrf" className="btn btn-secondary" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1rem', textAlign: 'center' }}>
            <Stethoscope size={24} style={{ color: '#818cf8' }} />
            <strong style={{ fontSize: '0.9rem' }}>eCRF Data Entry</strong>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Record & Modify Visit Labs</span>
          </Link>

          <Link to="/adverse-events" className="btn btn-secondary" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1rem', textAlign: 'center' }}>
            <AlertTriangle size={24} style={{ color: 'var(--danger)' }} />
            <strong style={{ fontSize: '0.9rem' }}>Adverse Events</strong>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Report AE & Escalate SAE</span>
          </Link>

          <Link to="/ip" className="btn btn-secondary" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1rem', textAlign: 'center' }}>
            <Pill size={24} style={{ color: 'var(--emerald-vibrant)' }} />
            <strong style={{ fontSize: '0.9rem' }}>IP Accountability</strong>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dispense Drug Kits</span>
          </Link>

          <Link to="/queries" className="btn btn-secondary" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1rem', textAlign: 'center' }}>
            <HelpCircle size={24} style={{ color: '#f59e0b' }} />
            <strong style={{ fontSize: '0.9rem' }}>Data Queries</strong>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Respond to Discrepancies</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
