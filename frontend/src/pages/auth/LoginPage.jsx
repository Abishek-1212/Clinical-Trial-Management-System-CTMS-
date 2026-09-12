import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import { Lock, User, Eye, EyeOff, Shield, ArrowRight, AlertCircle } from 'lucide-react';

export const LoginPage = () => {
  const { login, user: authenticatedUser, role, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && role) {
      switch (role) {
        case 'ADMIN': navigate('/admin/dashboard', { replace: true }); break;
        case 'SPONSOR': navigate('/sponsor/dashboard', { replace: true }); break;
        case 'PRINCIPAL_INVESTIGATOR':
        case 'SUB_INVESTIGATOR': navigate('/investigator/dashboard', { replace: true }); break;
        case 'SITE_COORDINATOR': navigate('/coordinator/dashboard', { replace: true }); break;
        case 'DATA_MANAGER': navigate('/datamanager/dashboard', { replace: true }); break;
        case 'REGULATORY_AFFAIRS': navigate('/regulatory/dashboard', { replace: true }); break;
        case 'PARTICIPANT': navigate('/participant/dashboard', { replace: true }); break;
        default: navigate('/profile', { replace: true }); break;
      }
    }
  }, [isAuthenticated, role, navigate]);

  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!credentials.username || !credentials.password) {
      setError('Please fill in both username and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await login(credentials);
      showToast(`Welcome back, ${user.username}!`, 'success');

      // Redirect to appropriate role dashboard
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
      const msg = err.response?.data?.message || 'Invalid username or password';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="neu-page-container">
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
          <div className="neu-icon-badge" style={{ marginBottom: '1.25rem', borderRadius: '50%', border: '2.5px solid var(--emerald-vibrant)' }}>
            <Shield size={34} />
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--forest-deep)', letterSpacing: '-0.03em' }}>
            Clinical Enterprise Sign In
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', marginTop: '0.35rem', fontWeight: 500 }}>
            Clinical Enterprise Portal
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

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--forest-deep)', marginBottom: '0.45rem', display: 'block' }}>
                Username or Pseudonym Subject ID
              </label>
              <div className="neu-input-wrapper">
                <div className="neu-icon-pill">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  name="username"
                  className="neu-input"
                  placeholder="e.g. S001-T001-795407 or username"
                  value={credentials.username}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--forest-deep)', marginBottom: '0.45rem', display: 'block' }}>
                Password
              </label>
              <div className="neu-input-wrapper">
                <div className="neu-icon-pill">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="neu-input"
                  style={{ paddingRight: '2.75rem' }}
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={handleChange}
                  disabled={loading}
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

            <button
              type="submit"
              className="neu-btn-primary"
              style={{ marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : <>Sign In <ArrowRight size={19} /></>}
            </button>
          </form>

          <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(165, 214, 167, 0.3)', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--forest-deep)', fontWeight: 700, textDecoration: 'none', marginLeft: '0.25rem' }}>
              Register User
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

