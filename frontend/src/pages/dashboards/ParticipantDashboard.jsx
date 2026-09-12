import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { participantApi } from '../../api/participantApi';
import { Calendar, ShieldCheck, HeartPulse, PhoneCall, UserCheck } from 'lucide-react';

export const ParticipantDashboard = () => {
  const { user } = useAuth();
  const [participant, setParticipant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    participantApi.getMe()
      .then((res) => setParticipant(res))
      .catch(() => setParticipant(null))
      .finally(() => setLoading(false));
  }, []);

  const schedule = [
    {
      visit: 'Screening Visit',
      code: 'SCR-01',
      day: 'Day -7',
      status: 'COMPLETED',
      date: participant?.screeningDate || '2026-02-27'
    },
    {
      visit: 'Baseline & Randomization',
      code: 'BL-01',
      day: 'Day 0',
      status: 'COMPLETED',
      date: participant?.enrollmentDate || '2026-03-05'
    },
    {
      visit: 'Week 4 Assessment',
      code: 'W4-01',
      day: 'Day 28',
      status: 'UPCOMING',
      date: participant?.enrollmentDate ? new Date(new Date(participant.enrollmentDate).getTime() + 28 * 86400000).toISOString().split('T')[0] : '2026-04-02'
    },
    {
      visit: 'Week 12 Follow-up',
      code: 'W12-01',
      day: 'Day 84',
      status: 'SCHEDULED',
      date: participant?.enrollmentDate ? new Date(new Date(participant.enrollmentDate).getTime() + 84 * 86400000).toISOString().split('T')[0] : '2026-05-28'
    },
    {
      visit: 'End of Study Closeout',
      code: 'EOS-01',
      day: 'Day 168',
      status: 'SCHEDULED',
      date: participant?.enrollmentDate ? new Date(new Date(participant.enrollmentDate).getTime() + 168 * 86400000).toISOString().split('T')[0] : '2026-08-20'
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem' }}>Participant Clinical Portal</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Welcome back, {user?.username}. {participant ? `Subject Pseudonym: ${participant.subjectId}` : 'Here is your active trial participation overview.'}
        </p>
      </div>

      <div className="grid-stats">
        <div className="stat-card">
          <div className="stat-icon indigo"><HeartPulse size={24} /></div>
          <div className="stat-info">
            <h4>Assigned Trial Study</h4>
            <div className="value" style={{ fontSize: '1.05rem', fontWeight: 600 }}>
              {participant?.studyTitle || 'CTMS-DEMO-001: Phase 3 Clinical Trial of ABC-200'}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon emerald"><ShieldCheck size={24} /></div>
          <div className="stat-info">
            <h4>ICF Consent Status</h4>
            <div className="value" style={{ color: 'var(--success)', fontSize: '1.15rem' }}>
              {participant?.consentVersion ? `CONSENTED (${participant.consentVersion})` : 'CONSENTED (v1.0)'}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon cyan"><UserCheck size={24} /></div>
          <div className="stat-info">
            <h4>Participant Status</h4>
            <div className="value" style={{ fontSize: '1.15rem', color: 'var(--forest-deep)' }}>
              {participant?.status || 'ACTIVE'}
            </div>
          </div>
        </div>
      </div>

      {/* Visit Schedule */}
      <div className="card">
        <div className="card-header">
          <h3>Your Trial Protocol Visit Schedule</h3>
          <span className="badge badge-info">{participant?.siteName || 'City Hospital Research Site'}</span>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading your protocol schedule...</div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Protocol Visit Name</th>
                  <th>Visit Code</th>
                  <th>Target Timeline</th>
                  <th>Scheduled Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((s, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{s.visit}</td>
                    <td><span className="badge badge-secondary">{s.code}</span></td>
                    <td>{s.day}</td>
                    <td>{s.date}</td>
                    <td>
                      <span className={`badge ${s.status === 'COMPLETED' ? 'badge-success' : s.status === 'UPCOMING' ? 'badge-warning' : 'badge-secondary'}`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Emergency / Coordinator Contact Card */}
      <div className="card" style={{ backgroundColor: 'rgba(99, 102, 241, 0.08)', borderColor: 'rgba(99, 102, 241, 0.3)' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#818cf8', marginBottom: '0.5rem' }}>
          <PhoneCall size={18} /> Need Help or Have Questions About Your Study?
        </h4>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Contact your Clinical Site Coordinator at {participant?.siteName || 'Research Site'}: <strong>research@ctms.com</strong> | <strong>+1-555-0100</strong>
        </p>
      </div>
    </div>
  );
};
