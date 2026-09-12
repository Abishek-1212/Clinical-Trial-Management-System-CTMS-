import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import { DataTable } from '../../components/common/DataTable';
import { Users, UserPlus, Filter, UserCheck, UserX, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export const UserManagementPage = () => {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const [users, setUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState('ALL');

  useEffect(() => {
    // Default 8 seeded users matching MySQL DataSeeder
    const defaultUsers = [
      { id: 1, username: 'sponsor', email: 'sponsor@ctms.com', role: 'SPONSOR', institutionalAffiliation: 'PharmaCorp', gcpCertNumber: 'GCPSP001', isActive: true },
      { id: 2, username: 'admin', email: 'admin@ctms.com', role: 'ADMIN', institutionalAffiliation: 'PharmaCorp', gcpCertNumber: 'N/A', isActive: true },
      { id: 3, username: 'pi_user', email: 'pi@ctms.com', role: 'PRINCIPAL_INVESTIGATOR', institutionalAffiliation: 'City Hospital', gcpCertNumber: 'GCPPI002', isActive: true },
      { id: 4, username: 'subinv', email: 'subinv@ctms.com', role: 'SUB_INVESTIGATOR', institutionalAffiliation: 'City Hospital', gcpCertNumber: 'GCPSI003', isActive: true },
      { id: 5, username: 'coordinator', email: 'coord@ctms.com', role: 'SITE_COORDINATOR', institutionalAffiliation: 'City Hospital', gcpCertNumber: 'GCPSC004', isActive: true },
      { id: 6, username: 'datamanager', email: 'dm@ctms.com', role: 'DATA_MANAGER', institutionalAffiliation: 'DataCRO', gcpCertNumber: 'GCPDM005', isActive: true },
      { id: 7, username: 'regaffairs', email: 'reg@ctms.com', role: 'REGULATORY_AFFAIRS', institutionalAffiliation: 'Regulatory Board', gcpCertNumber: 'GCPRA006', isActive: true },
      { id: 8, username: 'participant1', email: 'participant@ctms.com', role: 'PARTICIPANT', institutionalAffiliation: 'Patient', gcpCertNumber: 'N/A', isActive: true },
    ];

    let saved = JSON.parse(localStorage.getItem('ctms_registered_users') || '[]');
    if (saved.length === 0) {
      saved = defaultUsers;
      localStorage.setItem('ctms_registered_users', JSON.stringify(saved));
    } else {
      // Ensure all default users exist in saved list
      defaultUsers.forEach(def => {
        if (!saved.some(u => u.username === def.username)) {
          saved.push(def);
        }
      });
      localStorage.setItem('ctms_registered_users', JSON.stringify(saved));
    }

    setUsers(saved);
  }, [currentUser]);

  const toggleUserStatus = (id) => {
    const updated = users.map((u) => {
      if (u.id === id) {
        const next = !u.isActive;
        showToast(`User ${u.username} ${next ? 'activated' : 'deactivated'}`, next ? 'success' : 'warning');
        return { ...u, isActive: next };
      }
      return u;
    });
    setUsers(updated);
    localStorage.setItem('ctms_registered_users', JSON.stringify(updated));
  };

  // Filter users by selected role dropdown
  const filteredUsers = selectedRole === 'ALL'
    ? users
    : users.filter((u) => u.role === selectedRole);

  const columns = [
    { header: 'ID', accessor: 'id', width: '60px' },
    { header: 'Username', accessor: 'username', render: (r) => <strong style={{ color: 'var(--forest-deep)' }}>{r.username}</strong> },
    { header: 'Email', accessor: 'email' },
    { header: 'Role', accessor: 'role', render: (r) => <span className="badge badge-info">{r.role}</span> },
    { header: 'Affiliation', accessor: 'institutionalAffiliation' },
    { header: 'GCP Cert #', accessor: 'gcpCertNumber' },
    {
      header: 'Account Status',
      accessor: 'isActive',
      render: (r) => (
        <span className={`badge ${r.isActive ? 'badge-success' : 'badge-danger'}`}>
          {r.isActive ? 'ACTIVE' : 'DISABLED'}
        </span>
      ),
    },
    {
      header: 'Action',
      render: (r) => (
        <button
          className={`btn ${r.isActive ? 'btn-secondary' : 'btn-primary'} btn-sm`}
          onClick={() => toggleUserStatus(r.id)}
        >
          {r.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
          {r.isActive ? ' Deactivate' : ' Activate'}
        </button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem' }}>User Management Directory</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Dynamic Registered User Accounts, GCP Certifications & Access Controls
          </p>
        </div>
        <Link to="/register" className="btn btn-primary">
          <UserPlus size={18} /> Register New User
        </Link>
      </div>

      {/* Role Filter Dropdown Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem' }}>
            <Filter size={18} style={{ color: 'var(--primary)' }} />
            <span>Filter Users By Role:</span>
          </div>

          <select
            className="form-select"
            style={{ width: '280px' }}
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="ALL">All Roles ({users.length})</option>
            <option value="ADMIN">System Administrator</option>
            <option value="SPONSOR">Trial Sponsor</option>
            <option value="PRINCIPAL_INVESTIGATOR">Principal Investigator (PI)</option>
            <option value="SUB_INVESTIGATOR">Sub-Investigator</option>
            <option value="SITE_COORDINATOR">Site Coordinator</option>
            <option value="DATA_MANAGER">Data Manager</option>
            <option value="REGULATORY_AFFAIRS">Regulatory Affairs</option>
            <option value="PARTICIPANT">Study Participant</option>
          </select>

          {selectedRole !== 'ALL' && (
            <span className="badge badge-info" style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}>
              Showing {filteredUsers.length} user(s) matching role: {selectedRole}
            </span>
          )}
        </div>
      </div>

      <div className="card">
        <DataTable
          columns={columns}
          data={filteredUsers}
          searchPlaceholder="Search users by username or email..."
        />
      </div>
    </div>
  );
};
