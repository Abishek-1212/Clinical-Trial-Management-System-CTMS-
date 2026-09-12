import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FlaskConical,
  Users,
  FileSpreadsheet,
  HelpCircle,
  AlertTriangle,
  Pill,
  FileText,
  ShieldCheck,
  User,
  LogOut,
  Shield,
  HeartPulse,
  Menu,
  X,
} from 'lucide-react';

export const AppLayout = () => {
  const { user, role, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('ctms_sidebar_open');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    return window.innerWidth >= 1024;
  });
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => {
      const next = !prev;
      localStorage.setItem('ctms_sidebar_open', JSON.stringify(next));
      return next;
    });
  };

  const handleNavClick = () => {
    // Only close drawer overlay when on small/mobile screens
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
      localStorage.setItem('ctms_sidebar_open', JSON.stringify(false));
    }
  };

  const handleLogout = async () => {
    setShowProfileMenu(false);
    await logout();
    navigate('/login');
  };

  // Close avatar dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close sidebar when clicking outside the sidebar container
  useEffect(() => {
    const handleClickOutsideSidebar = (e) => {
      if (isSidebarOpen && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        const hamburgerBtn = document.querySelector('.neu-hamburger-btn');
        if (hamburgerBtn && hamburgerBtn.contains(e.target)) {
          return;
        }
        setIsSidebarOpen(false);
        localStorage.setItem('ctms_sidebar_open', JSON.stringify(false));
      }
    };

    document.addEventListener('mousedown', handleClickOutsideSidebar);
    return () => document.removeEventListener('mousedown', handleClickOutsideSidebar);
  }, [isSidebarOpen]);

  const getDashboardPath = () => {
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

  const avatarInitial = user?.username ? user.username.charAt(0).toUpperCase() : 'U';

  const getNavSections = () => {
    if (role === 'PARTICIPANT') {
      return [
        {
          title: 'Participant Navigation',
          items: [
            { path: '/participant/dashboard', label: 'Participant Dashboard', icon: LayoutDashboard },
            { path: '/ecrf', label: 'My eCRF Data', icon: FileSpreadsheet },
            { path: '/profile', label: 'My Profile', icon: User },
          ],
        },
      ];
    }

    const sections = [];

    // 1. Primary Navigation
    const primaryItems = [
      { path: getDashboardPath(), label: 'Dashboard', icon: LayoutDashboard },
      { path: '/studies', label: 'Clinical Studies', icon: FlaskConical },
    ];
    if (role !== 'REGULATORY_AFFAIRS') {
      primaryItems.push({ path: '/participants', label: 'Participants', icon: Users });
      primaryItems.push({ path: '/ecrf', label: 'eCRF Module', icon: FileSpreadsheet });
    }
    sections.push({ title: 'Primary Navigation', items: primaryItems });

    // 2. Clinical Operations
    const clinicalItems = [];
    if (role !== 'REGULATORY_AFFAIRS') {
      clinicalItems.push({ path: '/queries', label: 'Data Queries', icon: HelpCircle });
    }
    clinicalItems.push({ path: '/adverse-events', label: 'Adverse Events', icon: AlertTriangle });
    if (role !== 'REGULATORY_AFFAIRS' && role !== 'DATA_MANAGER') {
      clinicalItems.push({ path: '/ip', label: 'IP Accountability', icon: Pill });
    }
    clinicalItems.push({ path: '/documents', label: 'TMF Documents', icon: FileText });

    if (clinicalItems.length > 0) {
      sections.push({ title: 'Clinical Operations', items: clinicalItems });
    }

    // 3. Governance & Profile
    const governanceItems = [];
    if (['ADMIN', 'SPONSOR', 'PRINCIPAL_INVESTIGATOR', 'SUB_INVESTIGATOR', 'REGULATORY_AFFAIRS'].includes(role)) {
      governanceItems.push({ path: '/admin/audit-logs', label: '21 CFR Audit Logs', icon: ShieldCheck });
    }
    if (role === 'ADMIN') {
      governanceItems.push({ path: '/admin/users', label: 'User Management', icon: Users });
    }
    governanceItems.push({ path: '/profile', label: 'My Profile', icon: User });

    sections.push({ title: 'Governance & Profile', items: governanceItems });

    return sections;
  };

  const navSections = getNavSections();

  return (
    <div className={`app-container ${isSidebarOpen ? 'has-sidebar-open' : ''}`}>
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={handleNavClick} />
      )}

      {/* Collapsible Sidebar Drawer */}
      <aside ref={sidebarRef} className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <Link to={getDashboardPath()} className="sidebar-brand" onClick={handleNavClick}>
            <div className="sidebar-logo">
              <HeartPulse size={22} />
            </div>
            <div>
              <span className="sidebar-title">CTMS Enterprise</span>
              <span className="sidebar-subtitle">Clinical Portal</span>
            </div>
          </Link>
          <button className="sidebar-close-btn" onClick={toggleSidebar} title="Close Sidebar">
            <X size={18} />
          </button>
        </div>

        <div className="sidebar-nav">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} style={{ marginTop: sIdx > 0 ? '0.85rem' : '0' }}>
              <div className="nav-label">{section.title}</div>
              {section.items.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={idx}
                    to={item.path}
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    onClick={handleNavClick}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content Layout Container */}
      <div className={`main-content ${isSidebarOpen ? 'shifted' : ''}`}>
        {/* Topbar Header */}
        <header className="topbar">
          <div className="topbar-title-section">
            <button
              className="neu-hamburger-btn"
              onClick={toggleSidebar}
              title={isSidebarOpen ? "Close Hamburger Sidebar Menu" : "Open Hamburger Sidebar Menu"}
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <Link to={getDashboardPath()} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
              <div className="topbar-icon-pill">
                <HeartPulse size={20} />
              </div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
                Clinical Enterprise Portal
              </h2>
            </Link>
          </div>

          <div className="topbar-user" style={{ position: 'relative' }} ref={profileMenuRef}>
            <span className="user-badge">{role?.replace(/_/g, ' ')}</span>

            {/* Clickable User Avatar */}
            <button
              className="neu-avatar-btn"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              title="Click for Profile & Logout"
            >
              {avatarInitial}
            </button>

            {/* Avatar Dropdown Popover */}
            {showProfileMenu && (
              <div className="neu-popover">
                <div className="neu-popover-header">
                  <div style={{ fontWeight: 800, color: 'var(--forest-deep)', fontSize: '0.975rem' }}>
                    {user?.username}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.1rem', fontWeight: 500 }}>
                    {user?.email}
                  </div>
                  <span style={{
                    display: 'inline-block',
                    padding: '0.2rem 0.65rem',
                    borderRadius: '6px',
                    backgroundColor: '#eaf5eb',
                    color: '#16a34a',
                    fontSize: '0.725rem',
                    fontWeight: 700,
                    marginTop: '0.5rem',
                    boxShadow: 'inset 1.5px 1.5px 3px rgba(182, 197, 188, 0.5), inset -1.5px -1.5px 3px #ffffff'
                  }}>
                    {role}
                  </span>
                </div>

                <Link
                  to="/profile"
                  className="neu-popover-item"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <User size={17} style={{ color: 'var(--forest-deep)' }} />
                  <span>My Profile</span>
                </Link>

                <button
                  className="neu-popover-item neu-popover-logout"
                  onClick={handleLogout}
                >
                  <LogOut size={17} />
                  <span>Logout Account</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page Body View */}
        <main className="page-wrapper">
          <Outlet />
        </main>

        {/* Dark Green Clean Footer */}
        <footer className="app-footer-clean">
          <div className="footer-clean-container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#ffffff' }}>
              <Shield size={18} style={{ color: 'var(--emerald-vibrant)' }} />
              <span>CTMS Enterprise Portal</span>
              <span style={{ opacity: 0.5, color: '#a5d6a7' }}>|</span>
              <span style={{ fontSize: '0.825rem', color: '#c8e6c9', fontWeight: 400 }}>
                © {new Date().getFullYear()} Clinical Trial Management System. All Rights Reserved.
              </span>
            </div>
            <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.8rem', fontWeight: 600 }}>
              <span className="badge" style={{ background: 'rgba(165, 214, 167, 0.2)', color: '#ffffff', border: '1px solid rgba(165, 214, 167, 0.35)' }}>
                GCP Certified
              </span>
              <span className="badge" style={{ background: 'rgba(165, 214, 167, 0.2)', color: '#ffffff', border: '1px solid rgba(165, 214, 167, 0.35)' }}>
                21 CFR Part 11 Audited
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
