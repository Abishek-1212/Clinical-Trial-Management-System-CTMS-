import React, { useEffect, useState } from 'react';
import { studyApi } from '../../api/studyApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import { DataTable } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { FlaskConical, Plus, Lock, Unlock, Edit3, CheckCircle2 } from 'lucide-react';

export const StudyListPage = () => {
  const { hasRole } = useAuth();
  const { showToast } = useToast();
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudyId, setEditingStudyId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    studyTitle: '',
    phase: 'PHASE_2',
    therapeuticArea: '',
    targetEnrollment: 100,
    protocolVersion: 'v1.0',
    primaryEndpoint: '',
    irbApprovalDate: '',
    regulatoryApprovalDate: '',
  });

  const fetchStudies = async () => {
    try {
      setLoading(true);
      const data = await studyApi.getAll();
      setStudies(data || []);
    } catch (err) {
      showToast('Failed to load clinical studies', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudies();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openCreateModal = () => {
    setForm({
      studyTitle: '',
      phase: 'PHASE_2',
      therapeuticArea: '',
      targetEnrollment: 100,
      protocolVersion: 'v1.0',
      primaryEndpoint: '',
      irbApprovalDate: '',
      regulatoryApprovalDate: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (study) => {
    setEditingStudyId(study.id);
    setForm({
      studyTitle: study.studyTitle || '',
      phase: study.phase || 'PHASE_2',
      therapeuticArea: study.therapeuticArea || '',
      targetEnrollment: study.targetEnrollment || 100,
      protocolVersion: study.protocolVersion || 'v1.0',
      primaryEndpoint: study.primaryEndpoint || '',
      irbApprovalDate: study.irbApprovalDate || '',
      regulatoryApprovalDate: study.regulatoryApprovalDate || '',
    });
    setIsEditModalOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.studyTitle || !form.therapeuticArea) {
      showToast('Please fill in required fields', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await studyApi.create({
        ...form,
        targetEnrollment: Number(form.targetEnrollment),
      });
      showToast('Study created and saved to database!', 'success');
      setIsModalOpen(false);
      fetchStudies();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create study', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!form.studyTitle || !form.therapeuticArea) {
      showToast('Please fill in required fields', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await studyApi.update(editingStudyId, {
        ...form,
        targetEnrollment: Number(form.targetEnrollment),
      });
      showToast('Study updated successfully! Database lock released.', 'success');
      setIsEditModalOpen(false);
      fetchStudies();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update study', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnlock = async (id) => {
    if (!window.confirm('Release database lock for this study? eCRF data entry and editing will be allowed.')) return;
    try {
      await studyApi.unlockDatabase(id);
      showToast('Study database lock successfully released / unlocked!', 'success');
      fetchStudies();
    } catch (err) {
      showToast('Failed to release database lock', 'error');
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id', width: '60px' },
    { header: 'Study Title', accessor: 'studyTitle', render: (row) => <strong style={{ color: 'var(--forest-deep)' }}>{row.studyTitle}</strong> },
    { header: 'Phase', accessor: 'phase', render: (row) => <span className="badge badge-secondary">{row.phase}</span> },
    { header: 'Therapeutic Area', accessor: 'therapeuticArea' },
    { header: 'Version', accessor: 'protocolVersion' },
    { header: 'Target Enrolled', accessor: 'targetEnrollment' },
    { header: 'Actual Enrolled', accessor: 'actualEnrollment' },
    {
      header: 'Status',
      accessor: 'studyStatus',
      render: (row) => (
        <span className={`badge ${row.databaseLocked ? 'badge-danger' : 'badge-success'}`}>
          {row.databaseLocked ? 'LOCKED & FROZEN' : row.studyStatus}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {hasRole(['ADMIN', 'SPONSOR', 'PRINCIPAL_INVESTIGATOR', 'DATA_MANAGER']) && (
            <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(row)} title="Edit study details">
              <Edit3 size={14} /> Edit
            </button>
          )}
          {row.databaseLocked && hasRole(['ADMIN', 'SPONSOR', 'DATA_MANAGER']) && (
            <button className="btn btn-warning btn-sm" onClick={() => handleUnlock(row.id)} title="Release database lock">
              <Unlock size={14} /> Unlock
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--forest-deep)', letterSpacing: '-0.03em' }}>
            Clinical Studies Directory
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', marginTop: '0.25rem', fontWeight: 500 }}>
            Protocol Definitions & Database Lock Administration
          </p>
        </div>
        {hasRole(['ADMIN', 'SPONSOR']) && (
          <button className="btn btn-primary" style={{ padding: '0.75rem 1.35rem', fontWeight: 700, borderRadius: '12px' }} onClick={openCreateModal}>
            <Plus size={18} /> Setup New Study Protocol
          </button>
        )}
      </div>

      <div className="neu-card" style={{ padding: '1.5rem' }}>
        <DataTable columns={columns} data={studies} loading={loading} searchPlaceholder="Search studies..." />
      </div>

      {/* Create Study Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Setup New Clinical Study Protocol"
      >
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700 }}>Study Title *</label>
            <input
              type="text"
              name="studyTitle"
              className="form-input"
              placeholder="e.g. CTMS-DEMO-002: Phase 3 Trial of ABC-200"
              value={form.studyTitle}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>Trial Phase *</label>
              <select name="phase" className="form-select" value={form.phase} onChange={handleChange}>
                <option value="PHASE_1">Phase 1</option>
                <option value="PHASE_2">Phase 2</option>
                <option value="PHASE_3">Phase 3</option>
                <option value="PHASE_4">Phase 4</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>Therapeutic Area *</label>
              <input
                type="text"
                name="therapeuticArea"
                className="form-input"
                placeholder="e.g. Oncology / Cardiology"
                value={form.therapeuticArea}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>Target Enrollment *</label>
              <input
                type="number"
                name="targetEnrollment"
                className="form-input"
                value={form.targetEnrollment}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>Protocol Version</label>
              <input
                type="text"
                name="protocolVersion"
                className="form-input"
                value={form.protocolVersion}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700 }}>Primary Endpoint</label>
            <textarea
              name="primaryEndpoint"
              className="form-textarea"
              rows={2}
              placeholder="e.g. Overall survival at 12 months"
              value={form.primaryEndpoint}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving to DB...' : 'Create Study'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Study Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Clinical Study Protocol"
      >
        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700 }}>Study Title *</label>
            <input
              type="text"
              name="studyTitle"
              className="form-input"
              value={form.studyTitle}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>Trial Phase *</label>
              <select name="phase" className="form-select" value={form.phase} onChange={handleChange}>
                <option value="PHASE_1">Phase 1</option>
                <option value="PHASE_2">Phase 2</option>
                <option value="PHASE_3">Phase 3</option>
                <option value="PHASE_4">Phase 4</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>Therapeutic Area *</label>
              <input
                type="text"
                name="therapeuticArea"
                className="form-input"
                value={form.therapeuticArea}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>Target Enrollment *</label>
              <input
                type="number"
                name="targetEnrollment"
                className="form-input"
                value={form.targetEnrollment}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>Protocol Version</label>
              <input
                type="text"
                name="protocolVersion"
                className="form-input"
                value={form.protocolVersion}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700 }}>Primary Endpoint</label>
            <textarea
              name="primaryEndpoint"
              className="form-textarea"
              rows={2}
              value={form.primaryEndpoint}
              onChange={handleChange}
            />
          </div>

          <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <strong>Note:</strong> Saving edits to a locked study will automatically release its database lock and update the trial protocol.
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving Changes...' : 'Save & Release Lock'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
