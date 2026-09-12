import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, ShieldCheck, Building, Clock, Shield, CheckCircle2 } from 'lucide-react';

export const ProfilePage = () => {
  const { user, role } = useAuth();

  return (
    <div style={{ padding: '0.5rem 0' }}>
      {/* Header Section */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <div className="neu-icon-badge" style={{ width: '52px', height: '52px', borderRadius: '16px', border: '2px solid var(--emerald-vibrant)', flexShrink: 0 }}>
            <User size={26} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--forest-deep)', letterSpacing: '-0.03em', margin: 0 }}>
              User Profile & Credentials
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', marginTop: '0.2rem', fontWeight: 500 }}>
              Authenticated Account Details & Role Information
            </p>
          </div>
        </div>
      </div>

      {/* Grid Layout for Neumorphic Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.75rem' }}>
        {/* Card 1: Account Overview */}
        <div className="neu-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '0.85rem', borderBottom: '1px solid rgba(165, 214, 167, 0.3)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--forest-deep)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <Shield size={20} style={{ color: 'var(--emerald-vibrant)' }} /> Account Overview
            </h3>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.3rem 0.85rem',
              borderRadius: '9999px',
              backgroundColor: '#eaf5eb',
              color: '#16a34a',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              boxShadow: 'inset 2px 2px 4px rgba(182, 197, 188, 0.5), inset -2px -2px 4px #ffffff',
              border: '1px solid rgba(102, 187, 106, 0.3)'
            }}>
              <CheckCircle2 size={13} /> ACTIVE
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Username */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="neu-icon-badge" style={{ width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0 }}>
                <User size={20} />
              </div>
              <div style={{ flexGrow: 1 }}>
                <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.15rem' }}>
                  Username
                </span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--forest-deep)', fontWeight: 700 }}>
                  {user?.username || 'admin'}
                </strong>
              </div>
            </div>

            {/* Email Address */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="neu-icon-badge" style={{ width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0 }}>
                <Mail size={20} />
              </div>
              <div style={{ flexGrow: 1 }}>
                <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.15rem' }}>
                  Email Address
                </span>
                <strong style={{ fontSize: '1.025rem', color: 'var(--text-main)', fontWeight: 600 }}>
                  {user?.email || 'admin@ctms.com'}
                </strong>
              </div>
            </div>

            {/* Assigned Role */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="neu-icon-badge" style={{ width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0 }}>
                <ShieldCheck size={20} />
              </div>
              <div style={{ flexGrow: 1 }}>
                <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Assigned Role
                </span>
                <span style={{
                  display: 'inline-block',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '8px',
                  backgroundColor: '#eaf2f8',
                  color: '#0284c7',
                  fontSize: '0.825rem',
                  fontWeight: 700,
                  boxShadow: 'inset 2px 2px 4px rgba(182, 197, 188, 0.4), inset -2px -2px 4px #ffffff',
                  border: '1px solid rgba(2, 132, 199, 0.25)'
                }}>
                  {role || 'ADMIN'}
                </span>
              </div>
            </div>

            {/* Institutional Affiliation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="neu-icon-badge" style={{ width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0 }}>
                <Building size={20} />
              </div>
              <div style={{ flexGrow: 1 }}>
                <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.15rem' }}>
                  Institutional Affiliation
                </span>
                <strong style={{ fontSize: '0.975rem', color: 'var(--text-main)', fontWeight: 600 }}>
                  Clinical Enterprise Research Network
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: GCP Compliance & JWT Session */}
        <div className="neu-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid rgba(165, 214, 167, 0.3)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--forest-deep)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <ShieldCheck size={20} style={{ color: 'var(--emerald-vibrant)' }} /> GCP Compliance & JWT Session
            </h3>
            <span style={{
              display: 'inline-block',
              padding: '0.3rem 0.85rem',
              borderRadius: '9999px',
              backgroundColor: '#fef3c7',
              color: '#d97706',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              boxShadow: 'inset 2px 2px 4px rgba(182, 197, 188, 0.5), inset -2px -2px 4px #ffffff',
              border: '1px solid rgba(217, 119, 6, 0.3)'
            }}>
              21 CFR Part 11
            </span>
          </div>

          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.6, fontWeight: 500 }}>
            Your account is authenticated via stateless JSON Web Token (JWT) with automated expiration to enforce GCP regulatory compliance.
          </p>

          <div className="neu-inset-panel" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div className="neu-icon-badge" style={{ width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0 }}>
                <Clock size={20} style={{ color: 'var(--forest-deep)' }} />
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.15rem' }}>
                  JWT Expiration Window
                </span>
                <strong style={{ fontSize: '1rem', color: 'var(--forest-deep)', fontWeight: 700 }}>
                  {role === 'PARTICIPANT' ? '24 Hours' : '8 Hours (Clinical Personnel)'}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

