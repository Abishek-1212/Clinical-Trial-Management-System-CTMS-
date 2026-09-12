import React, { useState, useEffect } from 'react';
import { clinicalApi } from '../../api/clinicalApi';
import { participantApi } from '../../api/participantApi';
import { studyApi } from '../../api/studyApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import { FileSpreadsheet, Save, Edit3, Lock, ShieldCheck } from 'lucide-react';
import { Modal } from '../../components/common/Modal';

export const EcrfPage = () => {
  const { hasRole } = useAuth();
  const { showToast } = useToast();
  const [participants, setParticipants] = useState([]);
  const [selectedParticipantId, setSelectedParticipantId] = useState(1);
  const [selectedVisitId, setSelectedVisitId] = useState(1);
  const [ecrfEntries, setEcrfEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [saveForm, setSaveForm] = useState({
    fieldName: 'HbA1c_Level',
    fieldValue: '6.8',
    unit: '%',
  });

  const [modifyForm, setModifyForm] = useState({
    fieldValue: '',
    modificationReason: '',
  });

  const [myParticipant, setMyParticipant] = useState(null);
  const [studies, setStudies] = useState([]);
  const [selectedStudyFilter, setSelectedStudyFilter] = useState('ALL');

  const loadStaffParticipants = async (studyIdFilter = 'ALL') => {
    try {
      let data;
      if (studyIdFilter === 'ALL') {
        data = await participantApi.getAll();
      } else {
        data = await participantApi.getByStudy(studyIdFilter);
      }
      setParticipants(data || []);
      if (data && data.length > 0) {
        setSelectedParticipantId(data[0].id);
      } else {
        setSelectedParticipantId('');
      }
    } catch (err) {
      setParticipants([]);
      setSelectedParticipantId('');
    }
  };

  useEffect(() => {
    if (hasRole(['PARTICIPANT'])) {
      participantApi.getMe()
        .then((res) => {
          setMyParticipant(res);
          if (res) {
            setSelectedParticipantId(res.id);
          }
        })
        .catch(() => setMyParticipant(null));
    } else {
      studyApi.getAll()
        .then((res) => setStudies(res || []))
        .catch(() => setStudies([]));
      loadStaffParticipants('ALL');
    }
  }, []);

  const fetchEcrf = async () => {
    if (!selectedParticipantId) return;
    try {
      setLoading(true);
      const data = await clinicalApi.getEcrf(selectedParticipantId, selectedVisitId);
      setEcrfEntries(data || []);
    } catch (err) {
      setEcrfEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEcrf();
  }, [selectedParticipantId, selectedVisitId]);

  const handleSaveSubmit = async (e) => {
    e.preventDefault();
    if (!selectedParticipantId || participants.length === 0) {
      showToast('No trial subject found! Please register a subject in Participant Management first.', 'error');
      return;
    }
    try {
      setSubmitting(true);
      await clinicalApi.saveEcrf({
        participantId: Number(selectedParticipantId),
        visitId: Number(selectedVisitId),
        formId: 'FORM_CLINICAL',
        fieldId: saveForm.fieldName,
        fieldName: saveForm.fieldName,
        fieldValue: saveForm.fieldValue,
        unit: saveForm.unit,
        electronicSignature: `ESIG_${Date.now()}`,
      });
      showToast('eCRF Field saved with 21 CFR Electronic Signature!', 'success');
      setIsSaveModalOpen(false);
      fetchEcrf();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save eCRF field', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleModifySubmit = async (e) => {
    e.preventDefault();
    if (!selectedEntry || !modifyForm.modificationReason) {
      showToast('Modification reason is required!', 'error');
      return;
    }
    try {
      setSubmitting(true);
      await clinicalApi.modifyEcrf(selectedEntry.id, {
        ...modifyForm,
        electronicSignature: `ESIG_MOD_${Date.now()}`,
      });
      showToast('eCRF Entry modified & audit logged!', 'success');
      setIsModifyModalOpen(false);
      fetchEcrf();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to modify eCRF entry', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem' }}>Electronic Case Report Form (eCRF)</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {hasRole(['PARTICIPANT'])
              ? 'Read-Only View of Your Personal Clinical Protocol Visit & Trial Data'
              : 'GCP Compliant Data Entry & Mandatory Audit Reason Log'}
          </p>
        </div>
        {hasRole(['PARTICIPANT']) ? (
          <span className="badge badge-info" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.85rem' }}>
            <ShieldCheck size={16} /> Read-Only Participant View
          </span>
        ) : (
          hasRole(['ADMIN', 'SITE_COORDINATOR', 'SUB_INVESTIGATOR']) && (
            <button className="btn btn-primary" onClick={() => setIsSaveModalOpen(true)}>
              <Save size={18} /> Record eCRF Field
            </button>
          )
        )}
      </div>

      {/* Participant & Visit Selector */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        {hasRole(['PARTICIPANT']) ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>PARTICIPANT SUBJECT PROFILE</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--forest-deep)' }}>
                {myParticipant ? `Subject ID: ${myParticipant.subjectId}` : 'Participant Account'}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {myParticipant?.studyTitle || 'CTMS Active Protocol Study'}
              </div>
            </div>

            <div style={{ minWidth: '300px' }}>
              <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Select Protocol Visit</label>
              <select
                className="form-select"
                value={selectedVisitId}
                onChange={(e) => setSelectedVisitId(Number(e.target.value))}
              >
                <option value={1}>Visit 1: Screening (SCR-01)</option>
                <option value={2}>Visit 2: Baseline (BL-01)</option>
                <option value={3}>Visit 3: Week 4 (W4-01)</option>
                <option value={4}>Visit 4: Week 12 (W12-01)</option>
                <option value={5}>Visit 5: End of Study (EOS-01)</option>
              </select>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Filter by Clinical Study</label>
              <select
                className="form-select"
                value={selectedStudyFilter}
                onChange={(e) => {
                  const val = e.target.value === 'ALL' ? 'ALL' : Number(e.target.value);
                  setSelectedStudyFilter(val);
                  loadStaffParticipants(val);
                }}
              >
                <option value="ALL">All Active Clinical Studies</option>
                {studies.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.studyTitle || `Study #${s.id}`} ({s.protocolNumber || `P-${s.id}`})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Select Subject *</label>
              <select
                className="form-select"
                value={selectedParticipantId}
                onChange={(e) => setSelectedParticipantId(Number(e.target.value))}
              >
                {participants.length === 0 ? (
                  <option value="">No subjects registered in this study yet</option>
                ) : (
                  participants.map((p) => (
                    <option key={p.id} value={p.id}>
                      Subject ID: {p.subjectId} ({p.status})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Select Protocol Visit *</label>
              <select
                className="form-select"
                value={selectedVisitId}
                onChange={(e) => setSelectedVisitId(Number(e.target.value))}
              >
                <option value={1}>Visit 1: Screening (SCR-01)</option>
                <option value={2}>Visit 2: Baseline (BL-01)</option>
                <option value={3}>Visit 3: Week 4 (W4-01)</option>
                <option value={4}>Visit 4: Week 12 (W12-01)</option>
                <option value={5}>Visit 5: End of Study (EOS-01)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* eCRF Data Entries Table */}
      <div className="card">
        <div className="card-header">
          <h3>Recorded Visit Fields</h3>
          <span className="badge badge-info">SHA-256 Audit Tracked</span>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Field Name</th>
                <th>Recorded Value</th>
                <th>Unit</th>
                <th>Verification</th>
                <th>Query Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center' }}>Loading eCRF data...</td></tr>
              ) : ecrfEntries.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No data recorded for this visit yet. Click "Record eCRF Field" above.</td></tr>
              ) : (
                ecrfEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td style={{ fontWeight: 600 }}>{entry.fieldName}</td>
                    <td style={{ color: '#818cf8', fontWeight: 600 }}>{entry.fieldValue}</td>
                    <td>{entry.unit || '-'}</td>
                    <td>
                      <span className={`badge ${entry.verified ? 'badge-success' : 'badge-secondary'}`}>
                        {entry.verified ? 'VERIFIED' : 'UNVERIFIED'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${entry.queryStatus === 'OPEN' ? 'badge-warning' : 'badge-secondary'}`}>
                        {entry.queryStatus || 'CLEAN'}
                      </span>
                    </td>
                    <td>
                      {hasRole(['PARTICIPANT']) ? (
                        <span className="badge badge-secondary">READ-ONLY</span>
                      ) : (
                        hasRole(['ADMIN', 'SITE_COORDINATOR', 'PRINCIPAL_INVESTIGATOR', 'SUB_INVESTIGATOR', 'DATA_MANAGER']) && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              setSelectedEntry(entry);
                              setModifyForm({ fieldValue: entry.fieldValue, modificationReason: '' });
                              setIsModifyModalOpen(true);
                            }}
                          >
                            <Edit3 size={14} /> Modify Entry
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Save eCRF Modal */}
      <Modal isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)} title="Record New eCRF Field Entry">
        <form onSubmit={handleSaveSubmit}>
          <div className="form-group">
            <label className="form-label">Field Name *</label>
            <input type="text" className="form-input" placeholder="e.g. Systolic_BP, HbA1c" value={saveForm.fieldName} onChange={(e) => setSaveForm({ ...saveForm, fieldName: e.target.value })} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Field Value *</label>
              <input type="text" className="form-input" placeholder="120" value={saveForm.fieldValue} onChange={(e) => setSaveForm({ ...saveForm, fieldValue: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Unit</label>
              <input type="text" className="form-input" placeholder="mmHg / % / kg" value={saveForm.unit} onChange={(e) => setSaveForm({ ...saveForm, unit: e.target.value })} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsSaveModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Save Field'}</button>
          </div>
        </form>
      </Modal>

      {/* Modify eCRF Modal */}
      <Modal isOpen={isModifyModalOpen} onClose={() => setIsModifyModalOpen(false)} title={`Modify ${selectedEntry?.fieldName}`}>
        <form onSubmit={handleModifySubmit}>
          <div className="form-group">
            <label className="form-label">New Field Value *</label>
            <input type="text" className="form-input" value={modifyForm.fieldValue} onChange={(e) => setModifyForm({ ...modifyForm, fieldValue: e.target.value })} required />
          </div>

          <div className="form-group">
            <label className="form-label">Mandatory Modification Reason (21 CFR Part 11) *</label>
            <textarea className="form-textarea" rows={3} placeholder="e.g. Transcription error corrected against source document" value={modifyForm.modificationReason} onChange={(e) => setModifyForm({ ...modifyForm, modificationReason: e.target.value })} required />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModifyModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-danger" disabled={submitting}>{submitting ? 'Saving Audit...' : 'Commit Modification'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
