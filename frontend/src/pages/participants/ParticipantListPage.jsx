import React, { useEffect, useState } from 'react';
import { participantApi } from '../../api/participantApi';
import { studyApi } from '../../api/studyApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import { DataTable } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { Users, UserPlus, ShieldCheck, Edit3, FlaskConical } from 'lucide-react';

export const ParticipantListPage = () => {
  const { hasRole } = useAuth();
  const { showToast } = useToast();
  const [participants, setParticipants] = useState([]);
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isConsentOpen, setIsConsentOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [registerForm, setRegisterForm] = useState({
    studyId: 1,
    consentDate: new Date().toISOString().split('T')[0],
    consentVersion: 'v1.0',
    screeningDate: new Date().toISOString().split('T')[0],
  });

  const [consentForm, setConsentForm] = useState({
    consentDate: new Date().toISOString().split('T')[0],
    consentVersion: 'v1.1',
  });

  const [statusForm, setStatusForm] = useState({
    status: 'ACTIVE',
    withdrawalReason: '',
  });

  const [selectedStudyId, setSelectedStudyId] = useState(1);

  const fetchParticipants = async (studyId = selectedStudyId) => {
    try {
      setLoading(true);
      const data = await participantApi.getByStudy(studyId);
      setParticipants(data || []);
    } catch (err) {
      showToast('Failed to load participants', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    studyApi.getAll()
      .then(res => {
        setStudies(res || []);
        if (res && res.length > 0) {
          setSelectedStudyId(res[0].id);
          setRegisterForm(prev => ({ ...prev, studyId: res[0].id }));
          fetchParticipants(res[0].id);
        } else {
          fetchParticipants(1);
        }
      })
      .catch(() => {
        setStudies([]);
        fetchParticipants(1);
      });
  }, []);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await participantApi.register(registerForm);
      showToast('Participant registered successfully!', 'success');
      setIsRegisterOpen(false);
      fetchParticipants();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to register participant', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConsentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedParticipant) return;
    try {
      setSubmitting(true);
      await participantApi.recordConsent(selectedParticipant.id, consentForm);
      showToast('Participant ICF consent recorded!', 'success');
      setIsConsentOpen(false);
      fetchParticipants();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to record consent', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedParticipant) return;
    try {
      setSubmitting(true);
      await participantApi.updateStatus(selectedParticipant.id, statusForm);
      showToast(`Participant ${selectedParticipant.subjectId} status updated to ${statusForm.status}!`, 'success');
      setIsStatusOpen(false);
      fetchParticipants();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id', width: '60px' },
    {
      header: 'Pseudonym Subject ID',
      accessor: 'subjectId',
      render: (r) => (
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
          {r.subjectId}
        </span>
      )
    },
    { header: 'Consent Date', accessor: 'consentDate' },
    {
      header: 'Consent Version',
      accessor: 'consentVersion',
      render: (r) => <span className="badge badge-secondary" style={{ fontWeight: 700 }}>{r.consentVersion || 'v1.0'}</span>
    },
    { header: 'Screening Date', accessor: 'screeningDate' },
    { header: 'Enrollment Date', accessor: 'enrollmentDate' },
    {
      header: 'Status',
      accessor: 'status',
      render: (r) => (
        <span className={`badge ${r.status === 'ACTIVE' || r.status === 'ENROLLED' ? 'badge-success' : r.status === 'COMPLETED' ? 'badge-info' : 'badge-warning'}`} style={{ fontWeight: 700 }}>
          {r.status}
        </span>
      ),
    },
    {
      header: 'Action',
      render: (r) => (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary btn-sm"
            style={{ fontWeight: 600 }}
            onClick={() => {
              setSelectedParticipant(r);
              setStatusForm({ status: r.status || 'ACTIVE', withdrawalReason: '' });
              setIsStatusOpen(true);
            }}
          >
            <Edit3 size={14} /> Update Status
          </button>
          <button
            className="btn btn-secondary btn-sm"
            style={{ fontWeight: 600 }}
            onClick={() => {
              setSelectedParticipant(r);
              setIsConsentOpen(true);
            }}
          >
            <ShieldCheck size={14} /> Update Consent
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--forest-deep)', letterSpacing: '-0.03em' }}>
            Participant Management
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', marginTop: '0.25rem', fontWeight: 500 }}>
            Pseudonymized Subject IDs, ICF Consent Versioning & Status Tracking
          </p>
        </div>
        {hasRole(['ADMIN', 'SITE_COORDINATOR', 'PRINCIPAL_INVESTIGATOR', 'SUB_INVESTIGATOR']) && (
          <button className="btn btn-primary" style={{ padding: '0.75rem 1.35rem', fontWeight: 700, borderRadius: '12px' }} onClick={() => setIsRegisterOpen(true)}>
            <UserPlus size={18} /> Register Subject Pseudonym
          </button>
        )}
      </div>

      {/* Neumorphic Study Filter Toolbar */}
      <div className="neu-card" style={{ marginBottom: '1.75rem', padding: '1.25rem 1.6rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--forest-deep)', fontWeight: 700, fontSize: '0.95rem' }}>
            <FlaskConical size={20} style={{ color: 'var(--emerald-vibrant)' }} />
            <span>Select Active Clinical Trial Study:</span>
          </div>
          <select
            className="form-select"
            style={{
              maxWidth: '460px',
              backgroundColor: '#ffffff',
              border: '1px solid var(--mint-accent)',
              borderRadius: '10px',
              fontWeight: 600,
              color: 'var(--forest-deep)',
              padding: '0.6rem 1rem'
            }}
            value={selectedStudyId}
            onChange={(e) => {
              const sId = Number(e.target.value);
              setSelectedStudyId(sId);
              fetchParticipants(sId);
            }}
          >
            {studies.length === 0 ? (
              <option value={1}>CTMS-DEMO-001: Phase 3 Clinical Trial of ABC-200</option>
            ) : (
              studies.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.studyTitle || `Study #${s.id}`} ({s.protocolNumber || `P-${s.id}`})
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Neumorphic Data Table Container */}
      <div className="neu-card" style={{ padding: '1.5rem' }}>
        <DataTable columns={columns} data={participants} loading={loading} searchPlaceholder="Search subject IDs..." />
      </div>

      {/* Register Participant Modal */}
      <Modal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} title="Register Trial Subject Pseudonym">
        <form onSubmit={handleRegisterSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700 }}>Clinical Study *</label>
            <select
              className="form-select"
              value={registerForm.studyId}
              onChange={(e) => setRegisterForm({ ...registerForm, studyId: Number(e.target.value) })}
              required
            >
              {studies.length === 0 ? (
                <option value={1}>CTMS-DEMO-001: Phase 3 Clinical Trial of ABC-200</option>
              ) : (
                studies.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.studyTitle || `Study #${s.id}`} (Phase: {s.phase || 'N/A'})
                  </option>
                ))
              )}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>Screening Date *</label>
              <input type="date" className="form-input" value={registerForm.screeningDate} onChange={(e) => setRegisterForm({ ...registerForm, screeningDate: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>Consent Date *</label>
              <input type="date" className="form-input" value={registerForm.consentDate} onChange={(e) => setRegisterForm({ ...registerForm, consentDate: e.target.value })} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700 }}>ICF Consent Version *</label>
            <input type="text" className="form-input" value={registerForm.consentVersion} onChange={(e) => setRegisterForm({ ...registerForm, consentVersion: e.target.value })} required />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsRegisterOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Registering...' : 'Register Subject'}</button>
          </div>
        </form>
      </Modal>

      {/* Record Consent Modal */}
      <Modal isOpen={isConsentOpen} onClose={() => setIsConsentOpen(false)} title={`Record Re-Consent for ${selectedParticipant?.subjectId}`}>
        <form onSubmit={handleConsentSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700 }}>New Consent Date *</label>
            <input type="date" className="form-input" value={consentForm.consentDate} onChange={(e) => setConsentForm({ ...consentForm, consentDate: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700 }}>Updated ICF Version *</label>
            <input type="text" className="form-input" value={consentForm.consentVersion} onChange={(e) => setConsentForm({ ...consentForm, consentVersion: e.target.value })} required />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsConsentOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Recording...' : 'Update Consent'}</button>
          </div>
        </form>
      </Modal>

      {/* Update Status Modal */}
      <Modal isOpen={isStatusOpen} onClose={() => setIsStatusOpen(false)} title={`Update Trial Status for ${selectedParticipant?.subjectId}`}>
        <form onSubmit={handleStatusSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700 }}>Trial Status *</label>
            <select
              className="form-select"
              value={statusForm.status}
              onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
              required
            >
              <option value="SCREENING">SCREENING</option>
              <option value="ENROLLED">ENROLLED</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="WITHDRAWN">WITHDRAWN</option>
              <option value="SCREEN_FAILED">SCREEN_FAILED</option>
            </select>
          </div>

          {statusForm.status === 'WITHDRAWN' && (
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>Withdrawal Reason *</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="e.g. Adverse event, patient request, protocol deviation"
                value={statusForm.withdrawalReason}
                onChange={(e) => setStatusForm({ ...statusForm, withdrawalReason: e.target.value })}
                required
              />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsStatusOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Save Status'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
