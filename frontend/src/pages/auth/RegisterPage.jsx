import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import { UserPlus, User, Mail, Lock, Building, ShieldCheck, ArrowRight, Eye, EyeOff, AlertCircle, Shield, Award, Calendar } from 'lucide-react';

export const RegisterPage = () => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'SITE_COORDINATOR',
    institutionalAffiliation: '',
    gcpCertNumber: '',
    gcpExpiryDate: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isClinicalRole = formData.role !== 'PARTICIPANT' && formData.role !== 'ADMIN';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (isClinicalRole && !formData.gcpCertNumber) {
      setError('GCP Certification number is required for clinical personnel.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        institutionalAffiliation: formData.institutionalAffiliation || null,
        gcpCertNumber: formData.gcpCertNumber || null,
        gcpExpiryDate: formData.gcpExpiryDate || null,
      };

      const user = await register(payload);
      showToast('Registration successful! Account saved to database.', 'success');

      // Save user to dynamic registry list for User Management page
      const existing = JSON.parse(localStorage.getItem('ctms_registered_users') || '[]');
      const newUserEntry = {
        id: user.userId || Date.now(),
        username: user.username,
        email: user.email,
        role: user.role,
        institutionalAffiliation: formData.institutionalAffiliation || 'N/A',
        gcpCertNumber: formData.gcpCertNumber || 'N/A',
        isActive: true,
      };
      if (!existing.some(u => u.username === user.username)) {
        existing.push(newUserEntry);
        localStorage.setItem('ctms_registered_users', JSON.stringify(existing));
      }

      switch (user.role) {
        case 'ADMIN': navigate('/admin/dashboard'); break;
        case 'SPONSOR': navigate('/sponsor/dashboard'); break;
        case 'PRINCIPAL_INVESTIGATOR':
        case 'SUB_INVESTIGATOR': navigate('/investigator/dashboard'); break;
        case 'SITE_COORDINATOR': navigate('/coordinator/dashboard'); break;
        case 'DATA_MANAGER': navigate('/datamanager/dashboard'); break;
        case 'REGULATORY_AFFAIRS': navigate('/regulatory/dashboard'); break;
        case 'PARTICIPANT': navigate('/participant/dashboard'); break;
        default: navigate('/dashboard'); break;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Check your data.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="neu-page-container">
      <div style={{ width: '100%', maxWidth: '580px' }}>
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="neu-icon-badge" style={{ marginBottom: '1.1rem', borderRadius: '50%', border: '2.5px solid var(--emerald-vibrant)' }}>
            <UserPlus size={34} />
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--forest-deep)', letterSpacing: '-0.03em' }}>
            Register Account
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', marginTop: '0.35rem', fontWeight: 500 }}>
            Clinical Trial Management System User Onboarding
          </p>
        </div>

        {/* Neumorphic Form Card */}
        <div className="neu-card">
          {error && (
            <div className="neu-alert-error">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Grid Row 1: Username & Email */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--forest-deep)', marginBottom: '0.45rem', display: 'block' }}>
                  Username *
                </label>
                <div className="neu-input-wrapper">
                  <div className="neu-icon-pill">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    name="username"
                    className="neu-input"
                    placeholder="johndoe"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--forest-deep)', marginBottom: '0.45rem', display: 'block' }}>
                  Email Address *
                </label>
                <div className="neu-input-wrapper">
                  <div className="neu-icon-pill">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    className="neu-input"
                    placeholder="john@ctms.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Grid Row 2: Password & Confirm Password */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--forest-deep)', marginBottom: '0.45rem', display: 'block' }}>
                  Password *
                </label>
                <div className="neu-input-wrapper">
                  <div className="neu-icon-pill">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className="neu-input"
                    style={{ paddingRight: '2.5rem' }}
                    placeholder="Demo@1234"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="neu-action-btn"
                    style={{ position: 'absolute', right: '10px' }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--forest-deep)', marginBottom: '0.45rem', display: 'block' }}>
                  Confirm Password *
                </label>
                <div className="neu-input-wrapper">
                  <div className="neu-icon-pill">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    className="neu-input"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                </div>
              </div>
            </div>

            {/* System Role */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--forest-deep)', marginBottom: '0.45rem', display: 'block' }}>
                System Role *
              </label>
              <div className="neu-input-wrapper">
                <div className="neu-icon-pill">
                  <Shield size={18} />
                </div>
                <select
                  name="role"
                  className="neu-input neu-select"
                  value={formData.role}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="ADMIN">System Administrator</option>
                  <option value="SPONSOR">Trial Sponsor</option>
                  <option value="PRINCIPAL_INVESTIGATOR">Principal Investigator (PI)</option>
                  <option value="SUB_INVESTIGATOR">Sub-Investigator</option>
                  <option value="SITE_COORDINATOR">Site Coordinator</option>
                  <option value="DATA_MANAGER">Data Manager</option>
                  <option value="REGULATORY_AFFAIRS">Regulatory Affairs</option>
                  <option value="PARTICIPANT">Study Participant</option>
                </select>
              </div>
            </div>

            {/* Institutional Affiliation */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--forest-deep)', marginBottom: '0.45rem', display: 'block' }}>
                Institutional Affiliation
              </label>
              <div className="neu-input-wrapper">
                <div className="neu-icon-pill">
                  <Building size={18} />
                </div>
                <input
                  type="text"
                  name="institutionalAffiliation"
                  className="neu-input"
                  placeholder="e.g. City General Hospital / PharmaCorp"
                  value={formData.institutionalAffiliation}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            {/* GCP Compliance Inset Panel */}
            {isClinicalRole && (
              <div className="neu-inset-panel" style={{ marginTop: '0.25rem', marginBottom: '0.25rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--forest-deep)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={18} style={{ color: 'var(--emerald-vibrant)' }} />
                  GCP Compliance Details Required
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--forest-deep)', marginBottom: '0.35rem', display: 'block' }}>
                      GCP Cert Number *
                    </label>
                    <div className="neu-input-wrapper" style={{ height: '46px' }}>
                      <div className="neu-icon-pill" style={{ height: '32px', width: '32px' }}>
                        <Award size={16} />
                      </div>
                      <input
                        type="text"
                        name="gcpCertNumber"
                        className="neu-input"
                        style={{ paddingLeft: '3rem' }}
                        placeholder="GCP-SC-999"
                        value={formData.gcpCertNumber}
                        onChange={handleChange}
                        disabled={loading}
                        required={isClinicalRole}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--forest-deep)', marginBottom: '0.35rem', display: 'block' }}>
                      GCP Expiry Date
                    </label>
                    <div className="neu-input-wrapper" style={{ height: '46px' }}>
                      <div className="neu-icon-pill" style={{ height: '32px', width: '32px' }}>
                        <Calendar size={16} />
                      </div>
                      <input
                        type="date"
                        name="gcpExpiryDate"
                        className="neu-input"
                        style={{ paddingLeft: '3rem', paddingRight: '0.75rem' }}
                        value={formData.gcpExpiryDate}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Complete Registration Button */}
            <button
              type="submit"
              className="neu-btn-primary"
              style={{ marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : <>Complete Registration <ArrowRight size={19} /></>}
            </button>
          </form>

          {/* Footer Link */}
          <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(165, 214, 167, 0.3)', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--forest-deep)', fontWeight: 700, textDecoration: 'none', marginLeft: '0.25rem' }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

