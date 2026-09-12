import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const UnauthorizedPage = () => {
  const { role } = useAuth();

  const getHomePath = () => {
    switch (role) {
      case 'ADMIN': return '/admin/dashboard';
      case 'SPONSOR': return '/sponsor/dashboard';
      case 'PRINCIPAL_INVESTIGATOR':
      case 'SUB_INVESTIGATOR': return '/investigator/dashboard';
      case 'SITE_COORDINATOR': return '/coordinator/dashboard';
      case 'DATA_MANAGER': return '/datamanager/dashboard';
      case 'REGULATORY_AFFAIRS': return '/regulatory/dashboard';
      case 'PARTICIPANT': return '/participant/dashboard';
      default: return '/dashboard';
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div className="card" style={{ maxWidth: '480px', padding: '2.5rem' }}>
        <ShieldAlert size={56} style={{ color: '#ef4444', marginBottom: '1rem' }} />
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>403 — Unauthorized Access</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          You do not have the required role permissions to access this page. The backend Security Context has denied this request.
        </p>
        <Link to={getHomePath()} className="btn btn-primary">
          <ArrowLeft size={18} /> Return to Your Dashboard
        </Link>
      </div>
    </div>
  );
};
