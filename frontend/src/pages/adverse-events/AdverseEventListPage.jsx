import React, { useEffect, useState } from 'react';
import { clinicalApi } from '../../api/clinicalApi';
import { participantApi } from '../../api/participantApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import { AlertTriangle, Plus, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { Modal } from '../../components/common/Modal';

export const AdverseEventListPage = () => {
  const { hasRole } = useAuth();
  const { showToast } = useToast();
  const [adverseEvents, setAdverseEvents] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    participantId: 1,
    studyId: 1,
    eventTerm: 'Severe Nausea & Dizziness',
    severity: 'MODERATE',
    onsetDate: new Date().toISOString().split('T')[0],
    causality: 'POSSIBLE',
    actionTaken: 'DOSE_REDUCED',
    outcome: 'RECOVERING',
  });

  const fetchAEs = async () => {
    try {
      setLoading(true);
      const data = await clinicalApi.getAEsByStudy(1);
      setAdverseEvents(data || []);
    } catch (err) {
      showToast('Failed to fetch adverse events', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAEs();
    participantApi.getByStudy(1).then((res) => {
      setParticipants(res || []);
      if (res && res.length > 0) {
        setForm((f) => ({ ...f, participantId: res[0].id }));
      }
    }).catch(() => []);
  }, []);

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!form.participantId || participants.length === 0) {
      showToast('Please register a participant in Participant Management first!', 'error');
      return;
    }
    try {
      setSubmitting(true);
      await clinicalApi.reportAE({
        ...form,
        participantId: Number(form.participantId),
        studyId: Number(form.studyId),
        aeDescription: form.eventTerm,
        eventTerm: form.eventTerm,
      });
      showToast('Adverse Event reported & recorded!', 'success');
      setIsReportOpen(false);
      fetchAEs();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to report adverse event', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEscalateSAE = async (id) => {
    if (!window.confirm('Escalate this Adverse Event to a SERIOUS Adverse Event (SAE)? This starts the mandatory 24-hour regulatory notification clock.')) return;
    try {
      await clinicalApi.escalateToSAE(id);
      showToast('Escalated to SAE! 24-hour notification timer active.', 'warning');
      fetchAEs();
    } catch (err) {
      showToast('Failed to escalate to SAE', 'error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--forest-deep)', letterSpacing: '-0.03em' }}>
            Adverse Events & Pharmacovigilance
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', marginTop: '0.25rem', fontWeight: 500 }}>
            AE Log, Causality Assessment & 24-Hour SAE Escalation
          </p>
        </div>
        {hasRole(['ADMIN', 'SUB_INVESTIGATOR', 'PRINCIPAL_INVESTIGATOR']) && (
          <button className="btn btn-danger" style={{ padding: '0.75rem 1.35rem', fontWeight: 700, borderRadius: '12px' }} onClick={() => setIsReportOpen(true)}>
            <AlertTriangle size={18} /> Report Adverse Event
          </button>
        )}
      </div>

      <div className="neu-card">
        <div className="card-header" style={{ borderBottom: '2px solid var(--mint-light)', paddingBottom: '0.85rem' }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--forest-deep)' }}>Reported Safety Events Log</h3>
          <span className="badge badge-danger" style={{ fontWeight: 700 }}>Pharmacovigilance Active</span>
        </div>

        <div className="table-responsive" style={{ marginTop: '1rem' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Event Term</th>
                <th>Subject ID</th>
                <th>Severity</th>
                <th>Causality</th>
                <th>Onset Date</th>
                <th>Outcome</th>
                <th>SAE Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>Loading adverse events...</td></tr>
              ) : adverseEvents.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No adverse events reported</td></tr>
              ) : (
                adverseEvents.map((ae) => (
                  <tr key={ae.id}>
                    <td style={{ fontWeight: 600 }}>{ae.eventTerm || ae.aeDescription || 'Adverse Event'}</td>
                    <td>
                      <span style={{
                        fontFamily: 'monospace',
                        background: '#f0f7f2',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '6px',
                        border: '1px solid var(--mint-accent)',
                        color: 'var(--forest-deep)',
                        fontSize: '0.85rem',
                        fontWeight: 800
                      }}>
                        {ae.subjectId || '-'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${ae.severity === 'SEVERE' ? 'badge-danger' : 'badge-warning'}`} style={{ fontWeight: 700 }}>
                        {ae.severity}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{ae.causality}</td>
                    <td style={{ fontSize: '0.85rem' }}>{ae.onsetDate}</td>
                    <td style={{ fontWeight: 500 }}>{ae.outcome}</td>
                    <td>
                      {ae.isSAE ? (
                        <span className="badge badge-danger" style={{ fontWeight: 700 }}>SAE REPORTED</span>
                      ) : (
                        <span className="badge badge-secondary" style={{ fontWeight: 700 }}>NON-SERIOUS</span>
                      )}
                    </td>
                    <td>
                      {!ae.isSAE && hasRole(['ADMIN', 'SUB_INVESTIGATOR', 'PRINCIPAL_INVESTIGATOR']) && (
                        <button className="btn btn-danger btn-sm" style={{ fontWeight: 600 }} onClick={() => handleEscalateSAE(ae.id)}>
                          <ShieldAlert size={14} /> Escalate to SAE
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report AE Modal */}
      <Modal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} title="Report Adverse Event (AE)">
        <form onSubmit={handleReportSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700 }}>Select Subject / Participant *</label>
            <select
              className="form-select"
              value={form.participantId}
              onChange={(e) => setForm({ ...form, participantId: Number(e.target.value) })}
              required
            >
              {participants.length === 0 ? (
                <option value="">No subjects registered yet — Register one in Participant Management</option>
              ) : (
                participants.map((p) => (
                  <option key={p.id} value={p.id}>
                    Subject ID: {p.subjectId} (Status: {p.status})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700 }}>Adverse Event Term *</label>
            <input type="text" className="form-input" placeholder="e.g. Severe Nausea, Dizziness" value={form.eventTerm} onChange={(e) => setForm({ ...form, eventTerm: e.target.value })} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>Severity *</label>
              <select className="form-select" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                <option value="MILD">MILD</option>
                <option value="MODERATE">MODERATE</option>
                <option value="SEVERE">SEVERE</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>Causality Assessment *</label>
              <select className="form-select" value={form.causality} onChange={(e) => setForm({ ...form, causality: e.target.value })}>
                <option value="UNRELATED">UNRELATED</option>
                <option value="POSSIBLE">POSSIBLE</option>
                <option value="PROBABLE">PROBABLE</option>
                <option value="DEFINITE">DEFINITE</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>Onset Date *</label>
              <input type="date" className="form-input" value={form.onsetDate} onChange={(e) => setForm({ ...form, onsetDate: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>Action Taken</label>
              <input type="text" className="form-input" value={form.actionTaken} onChange={(e) => setForm({ ...form, actionTaken: e.target.value })} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsReportOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-danger" disabled={submitting}>{submitting ? 'Submitting...' : 'Report Safety Event'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
