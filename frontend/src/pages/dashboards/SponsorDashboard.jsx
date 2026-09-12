import React, { useEffect, useState } from 'react';
import { studyApi } from '../../api/studyApi';
import { useToast } from '../../components/common/Toast';
import { FlaskConical, Target, CheckCircle2, Lock, Plus, FileText, ArrowRight, Pill } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SponsorDashboard = () => {
  const { showToast } = useToast();
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudies = async () => {
      try {
        setLoading(true);
        const data = await studyApi.getAll();
        setStudies(data || []);
      } catch (err) {
        showToast('Failed to fetch trial portfolio', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchStudies();
  }, [showToast]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem' }}>Sponsor Trial Portfolio</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Clinical Protocol Administration & Trial Monitoring Oversight
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/ip" className="btn btn-secondary">
            <Pill size={18} /> IP Accountability
          </Link>
          <Link to="/documents" className="btn btn-secondary">
            <FileText size={18} /> TMF Documents
          </Link>
          <Link to="/studies" className="btn btn-primary">
            <Plus size={18} /> Setup New Protocol
          </Link>
        </div>
      </div>

      {/* Top Stat Summary */}
      <div className="grid-stats">
        <div className="stat-card">
          <div className="stat-icon indigo"><FlaskConical size={24} /></div>
          <div className="stat-info">
            <h4>Total Active Protocols</h4>
            <div className="value">{studies.length}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon emerald"><Target size={24} /></div>
          <div className="stat-info">
            <h4>Target Total Enrollment</h4>
            <div className="value">
              {studies.reduce((sum, s) => sum + (s.targetEnrollment || 0), 0)}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon cyan"><CheckCircle2 size={24} /></div>
          <div className="stat-info">
            <h4>Enrolled Subjects</h4>
            <div className="value">
              {studies.reduce((sum, s) => sum + (s.actualEnrollment || 0), 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Protocol Cards List */}
      <div className="card">
        <div className="card-header">
          <h3>Active Clinical Studies Overview</h3>
          <span className="badge badge-info">Real MySQL Records</span>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Protocol & Study Title</th>
                <th>Phase</th>
                <th>Therapeutic Area</th>
                <th>Status</th>
                <th>Enrollment Progress</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center' }}>Loading trial portfolio...</td></tr>
              ) : studies.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No studies found</td></tr>
              ) : (
                studies.map((s) => {
                  const pct = Math.min(100, Math.round(((s.actualEnrollment || 0) / (s.targetEnrollment || 1)) * 100));
                  return (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600 }}>{s.studyTitle}</td>
                      <td><span className="badge badge-secondary">{s.phase}</span></td>
                      <td>{s.therapeuticArea}</td>
                      <td>
                        <span className={`badge ${s.databaseLocked ? 'badge-danger' : 'badge-success'}`}>
                          {s.databaseLocked ? 'LOCKED' : s.studyStatus}
                        </span>
                      </td>
                      <td style={{ width: '200px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                          <span>{s.actualEnrollment} / {s.targetEnrollment}</span>
                          <span>{pct}%</span>
                        </div>
                        <div style={{ height: '6px', width: '100%', backgroundColor: 'var(--bg-app)', borderRadius: '99px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', backgroundColor: 'var(--primary)', borderRadius: '99px' }} />
                        </div>
                      </td>
                      <td>
                        <Link to={`/studies`} className="btn btn-secondary btn-sm">
                          Details <ArrowRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supply Chain & Regulatory Oversight Quick Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div className="stat-icon emerald" style={{ width: '38px', height: '38px' }}>
                <Pill size={20} />
              </div>
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Investigational Product (IP) Accountability</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Monitor drug supply chains, batch numbers, kit distributions, and stock accountability logs across trial sites.
            </p>
          </div>
          <Link to="/ip" className="btn btn-secondary" style={{ width: 'fit-content' }}>
            Manage IP Supply Chain <ArrowRight size={14} />
          </Link>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div className="stat-icon indigo" style={{ width: '38px', height: '38px' }}>
                <FileText size={20} />
              </div>
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Trial Master File (TMF) & Regulatory Documents</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Access regulatory submissions, IRB/Ethics approval letters, FDA filings, and protocol amendments.
            </p>
          </div>
          <Link to="/documents" className="btn btn-secondary" style={{ width: 'fit-content' }}>
            View TMF Documents <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};
