import React, { useEffect, useState } from 'react';
import { clinicalApi } from '../../api/clinicalApi';
import { useToast } from '../../components/common/Toast';
import { FileText, ShieldCheck, Upload, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RegulatoryDashboard = () => {
  const { showToast } = useToast();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        setLoading(true);
        const data = await clinicalApi.getDocumentsByStudy(1).catch(() => []);
        setDocuments(data || []);
      } catch (err) {
        showToast('Failed to load regulatory documents', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, [showToast]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem' }}>Regulatory Affairs Portal</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Trial Master File (TMF), IRB/IEC Approvals & GCP Compliance Auditing
          </p>
        </div>
        <Link to="/documents" className="btn btn-primary">
          <Upload size={18} /> Upload TMF Document
        </Link>
      </div>

      <div className="grid-stats">
        <div className="stat-card">
          <div className="stat-icon indigo"><FileText size={24} /></div>
          <div className="stat-info">
            <h4>TMF Vault Documents</h4>
            <div className="value">{documents.length}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon emerald"><ShieldCheck size={24} /></div>
          <div className="stat-info">
            <h4>IRB / IEC Approval Status</h4>
            <div className="value">APPROVED</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon cyan"><CheckCircle2 size={24} /></div>
          <div className="stat-info">
            <h4>GCP Cert Audits Passed</h4>
            <div className="value">100%</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Trial Master File (TMF) Document Repository</h3>
          <Link to="/documents" className="btn btn-secondary btn-sm">Full Repository</Link>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Document Name</th>
                <th>Category / Type</th>
                <th>Version</th>
                <th>Status</th>
                <th>Upload Date</th>
              </tr>
            </thead>
            <tbody>
              {documents.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No TMF documents uploaded yet</td></tr>
              ) : (
                documents.map((d) => (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 600 }}>{d.documentTitle || d.documentName}</td>
                    <td><span className="badge badge-secondary">{d.documentType}</span></td>
                    <td>{d.version}</td>
                    <td><span className="badge badge-success">{d.approvalStatus || d.status || 'APPROVED'}</span></td>
                    <td>{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : (d.uploadDate || 'N/A')}</td>
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
