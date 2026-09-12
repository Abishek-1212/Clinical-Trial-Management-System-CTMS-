import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div className="card" style={{ maxWidth: '480px', padding: '2.5rem' }}>
        <FileQuestion size={56} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>404 — Page Not Found</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          The clinical route or endpoint you are looking for does not exist.
        </p>
        <Link to="/login" className="btn btn-primary">
          <ArrowLeft size={18} /> Return to Application
        </Link>
      </div>
    </div>
  );
};
