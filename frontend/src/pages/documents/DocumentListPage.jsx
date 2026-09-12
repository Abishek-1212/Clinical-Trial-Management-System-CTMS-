import React, { useEffect, useState } from 'react';
import { clinicalApi } from '../../api/clinicalApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import { FileText, Upload, Download, CheckCircle2 } from 'lucide-react';
import { Modal } from '../../components/common/Modal';

export const DocumentListPage = () => {
  const { hasRole } = useAuth();
  const { showToast } = useToast();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    studyId: 1,
    documentName: 'IRB Protocol Approval Letter v1.2',
    documentType: 'IRB_APPROVAL',
    version: 'v1.2',
    fileUrl: '/uploads/tmf_irb_approval_v1.2.pdf',
  });

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const data = await clinicalApi.getDocumentsByStudy(1);
      setDocuments(data || []);
    } catch (err) {
      showToast('Failed to fetch regulatory documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await clinicalApi.uploadDocument({
        studyId: Number(form.studyId),
        documentType: form.documentType,
        documentTitle: form.documentName,
        version: form.version,
        fileReference: form.fileUrl,
      });
      showToast('TMF Document uploaded & indexed!', 'success');
      setIsUploadOpen(false);
      fetchDocs();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to upload document', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem' }}>Trial Master File (TMF) Documents</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Regulatory Submission Vault, IRB/IEC Approval Documents & Investigator Brochures
          </p>
        </div>
        {hasRole(['ADMIN', 'REGULATORY_AFFAIRS', 'SITE_COORDINATOR']) && (
          <button className="btn btn-primary" onClick={() => setIsUploadOpen(true)}>
            <Upload size={18} /> Upload TMF Document
          </button>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h3>TMF Index Log</h3>
          <span className="badge badge-success">21 CFR Part 11 Compliant</span>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Document Title</th>
                <th>Category</th>
                <th>Version</th>
                <th>Uploaded By</th>
                <th>Upload Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center' }}>Loading documents...</td></tr>
              ) : documents.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No TMF documents uploaded yet</td></tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id}>
                    <td style={{ fontWeight: 600, color: 'var(--forest-deep)' }}>{doc.documentTitle || doc.documentName}</td>
                    <td><span className="badge badge-secondary">{doc.documentType}</span></td>
                    <td>{doc.version}</td>
                    <td>{doc.uploadedBy?.username || 'SYSTEM'}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : (doc.uploadDate || 'N/A')}</td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => showToast(`Simulating download of ${doc.documentTitle || doc.documentName}`, 'info')}>
                        <Download size={14} /> Download
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      <Modal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} title="Upload TMF Regulatory Document">
        <form onSubmit={handleUploadSubmit}>
          <div className="form-group">
            <label className="form-label">Document Name *</label>
            <input type="text" className="form-input" value={form.documentName} onChange={(e) => setForm({ ...form, documentName: e.target.value })} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Document Category *</label>
              <select className="form-select" value={form.documentType} onChange={(e) => setForm({ ...form, documentType: e.target.value })}>
                <option value="IRB_APPROVAL">IRB / IEC Approval</option>
                <option value="PROTOCOL">Clinical Protocol</option>
                <option value="INVESTIGATOR_BROCHURE">Investigator Brochure (IB)</option>
                <option value="INFORMED_CONSENT">Informed Consent Form (ICF)</option>
                <option value="REGULATORY_PERMIT">Regulatory Authority Permit</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Version *</label>
              <input type="text" className="form-input" value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">File Storage Path / Reference URL *</label>
            <input type="text" className="form-input" value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} required />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsUploadOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Indexing...' : 'Upload Document'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
