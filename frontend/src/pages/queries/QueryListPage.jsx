import React, { useState } from 'react';
import { clinicalApi } from '../../api/clinicalApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import { HelpCircle, Plus, MessageSquare, CheckCircle2 } from 'lucide-react';
import { Modal } from '../../components/common/Modal';

export const QueryListPage = () => {
  const { hasRole } = useAuth();
  const { showToast } = useToast();
  const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false);
  const [isRespondModalOpen, setIsRespondModalOpen] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [queries, setQueries] = useState([
    {
      id: 1,
      queryText: 'HbA1c value of 6.8% conflicts with baseline recorded value of 9.2%. Please verify source lab sheet.',
      queryStatus: 'OPEN',
      raisedBy: { username: 'datamanager' },
      responseText: null,
      respondedBy: null,
    },
  ]);

  const [raiseForm, setRaiseForm] = useState({
    ecrfDataId: 1,
    studyId: 1,
    queryText: '',
  });

  const [respondForm, setRespondForm] = useState({
    responseText: '',
  });

  const handleRaiseSubmit = async (e) => {
    e.preventDefault();
    if (!raiseForm.queryText) return;
    try {
      setSubmitting(true);
      const res = await clinicalApi.raiseQuery(raiseForm);
      showToast('Data query raised successfully!', 'success');
      setQueries((prev) => [...prev, res]);
      setIsRaiseModalOpen(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to raise query', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRespondSubmit = async (e) => {
    e.preventDefault();
    if (!selectedQuery || !respondForm.responseText) return;
    try {
      setSubmitting(true);
      const res = await clinicalApi.respondQuery(selectedQuery.id, respondForm);
      showToast('Response submitted successfully!', 'success');
      setQueries((prev) => prev.map((q) => (q.id === selectedQuery.id ? res : q)));
      setIsRespondModalOpen(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to respond to query', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--forest-deep)', letterSpacing: '-0.03em' }}>
            Clinical Data Queries
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', marginTop: '0.25rem', fontWeight: 500 }}>
            eCRF Data Discrepancy Raising & Investigator Resolutions
          </p>
        </div>
        {hasRole(['ADMIN', 'DATA_MANAGER']) && (
          <button className="btn btn-primary" style={{ padding: '0.75rem 1.35rem', fontWeight: 700, borderRadius: '12px' }} onClick={() => setIsRaiseModalOpen(true)}>
            <Plus size={18} /> Raise Data Query
          </button>
        )}
      </div>

      <div className="neu-card">
        <div className="card-header" style={{ borderBottom: '2px solid var(--mint-light)', paddingBottom: '0.85rem' }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--forest-deep)' }}>Active Queries List</h3>
          <span className="badge badge-warning" style={{ fontWeight: 700 }}>{queries.filter(q => q.queryStatus === 'OPEN').length} Open</span>
        </div>

        <div className="table-responsive" style={{ marginTop: '1rem' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Query Description</th>
                <th>Status</th>
                <th>Raised By</th>
                <th>Response</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {queries.map((q) => (
                <tr key={q.id}>
                  <td style={{ fontWeight: 700, color: 'var(--forest-deep)' }}>#{q.id}</td>
                  <td style={{ maxWidth: '320px', fontWeight: 500 }}>{q.queryText}</td>
                  <td>
                    <span className={`badge ${q.queryStatus === 'OPEN' ? 'badge-warning' : 'badge-success'}`} style={{ fontWeight: 700 }}>
                      {q.queryStatus}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--forest-deep)' }}>{q.raisedBy?.username || 'DM'}</td>
                  <td style={{ maxWidth: '260px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {q.responseText || 'Pending Investigator Response'}
                  </td>
                  <td>
                    {q.queryStatus === 'OPEN' && (
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ fontWeight: 600 }}
                        onClick={() => {
                          setSelectedQuery(q);
                          setIsRespondModalOpen(true);
                        }}
                      >
                        <MessageSquare size={14} /> Respond
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Raise Query Modal */}
      <Modal isOpen={isRaiseModalOpen} onClose={() => setIsRaiseModalOpen(false)} title="Raise New Data Query">
        <form onSubmit={handleRaiseSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700 }}>Query Description *</label>
            <textarea className="form-textarea" rows={3} placeholder="Describe the data discrepancy..." value={raiseForm.queryText} onChange={(e) => setRaiseForm({ ...raiseForm, queryText: e.target.value })} required />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsRaiseModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Submitting...' : 'Raise Query'}</button>
          </div>
        </form>
      </Modal>

      {/* Respond Query Modal */}
      <Modal isOpen={isRespondModalOpen} onClose={() => setIsRespondModalOpen(false)} title={`Respond to Query #${selectedQuery?.id}`}>
        <form onSubmit={handleRespondSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700 }}>Investigator Response *</label>
            <textarea className="form-textarea" rows={3} placeholder="Enter resolution details..." value={respondForm.responseText} onChange={(e) => setRespondForm({ ...respondForm, responseText: e.target.value })} required />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsRespondModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Response'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
