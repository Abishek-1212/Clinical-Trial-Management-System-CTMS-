import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { useToast } from '../../components/common/Toast';
import { DataTable } from '../../components/common/DataTable';
import { ShieldCheck, Hash, Key } from 'lucide-react';

export const AuditLogPage = () => {
  const { showToast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const data = await adminApi.getAuditLogs(0, 50);
        setLogs(data?.content || []);
      } catch (err) {
        showToast('Failed to fetch 21 CFR Part 11 Audit Logs', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [showToast]);

  const columns = [
    { header: 'ID', accessor: 'id', width: '60px' },
    {
      header: 'Action',
      accessor: 'action',
      render: (r) => <span className="badge badge-info">{r.action}</span>,
    },
    { header: 'Target Entity', render: (r) => `${r.entityType} #${r.entityId || 'N/A'}` },
    { header: 'User', render: (r) => r.user?.username || 'SYSTEM' },
    { header: 'Old Value', accessor: 'oldValue', render: (r) => <span style={{ color: 'var(--text-muted)' }}>{r.oldValue || '-'}</span> },
    { header: 'New Value', accessor: 'newValue', render: (r) => <span style={{ color: '#34d399' }}>{r.newValue || '-'}</span> },
    {
      header: 'SHA-256 Hash Chain',
      accessor: 'currentHash',
      render: (r) => (
        <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: '#818cf8' }} title={`Prev: ${r.previousHash}`}>
          {r.currentHash?.substring(0, 16)}...
        </span>
      ),
    },
    { header: 'Timestamp', render: (r) => new Date(r.timestamp).toLocaleString() },
  ];

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem' }}>21 CFR Part 11 Audit Log Trail</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Immutable SHA-256 Cryptographic Ledger for Regulatory Integrity & Inspection Readiness
        </p>
      </div>

      <div className="card">
        <DataTable columns={columns} data={logs} loading={loading} searchPlaceholder="Search audit actions or users..." />
      </div>
    </div>
  );
};
