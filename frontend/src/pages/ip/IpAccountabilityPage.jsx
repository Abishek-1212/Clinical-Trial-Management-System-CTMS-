import React, { useEffect, useState } from 'react';
import { clinicalApi } from '../../api/clinicalApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import { Pill, Plus, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Modal } from '../../components/common/Modal';

export const IpAccountabilityPage = () => {
  const { hasRole } = useAuth();
  const { showToast } = useToast();
  const [ipList, setIpList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isDispenseOpen, setIsDispenseOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [receiptForm, setReceiptForm] = useState({
    studyId: 1,
    kitNumber: 'KIT-XYZ-101',
    batchNumber: 'BATCH-2024-A',
    quantityReceived: 100,
    expiryDate: '2026-12-31',
  });

  const [dispenseForm, setDispenseForm] = useState({
    participantId: 1,
    studyId: 1,
    kitNumber: 'KIT-XYZ-101',
    quantityDispensed: 10,
    dosageInstruction: 'Take 1 tablet daily with meals for 10 days',
  });

  const fetchIpData = async () => {
    try {
      setLoading(true);
      const data = await clinicalApi.getIpAccountability(1);
      setIpList(data || []);
    } catch (err) {
      showToast('Failed to fetch IP accountability logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIpData();
  }, []);

  const handleReceiptSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await clinicalApi.recordIpReceipt({
        ...receiptForm,
        studyId: Number(receiptForm.studyId),
        quantityReceived: Number(receiptForm.quantityReceived),
      });
      showToast('IP Shipment receipt recorded in inventory!', 'success');
      setIsReceiptOpen(false);
      fetchIpData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to record IP receipt', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDispenseSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await clinicalApi.dispenseIp({
        ...dispenseForm,
        participantId: Number(dispenseForm.participantId),
        studyId: Number(dispenseForm.studyId),
        quantity: Number(dispenseForm.quantityDispensed),
        quantityDispensed: Number(dispenseForm.quantityDispensed),
      });
      showToast('IP drug kit dispensed to participant!', 'success');
      setIsDispenseOpen(false);
      fetchIpData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to dispense IP kit', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--forest-deep)', letterSpacing: '-0.03em' }}>
            Investigational Product (IP) Accountability
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', marginTop: '0.25rem', fontWeight: 500 }}>
            Kit Receipts, Batch Tracking, Patient Dispensing & Return Balances
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {hasRole(['ADMIN', 'SITE_COORDINATOR', 'PRINCIPAL_INVESTIGATOR']) && (
            <button className="btn btn-secondary" style={{ padding: '0.75rem 1.25rem', fontWeight: 700, borderRadius: '12px' }} onClick={() => setIsReceiptOpen(true)}>
              <Plus size={18} /> Record IP Shipment
            </button>
          )}
          {hasRole(['ADMIN', 'SUB_INVESTIGATOR', 'SITE_COORDINATOR']) && (
            <button className="btn btn-primary" style={{ padding: '0.75rem 1.25rem', fontWeight: 700, borderRadius: '12px' }} onClick={() => setIsDispenseOpen(true)}>
              <Pill size={18} /> Dispense Kit to Subject
            </button>
          )}
        </div>
      </div>

      <div className="neu-card">
        <div className="card-header" style={{ borderBottom: '2px solid var(--mint-light)', paddingBottom: '0.85rem' }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--forest-deep)' }}>IP Inventory Movement Ledger</h3>
          <span className="badge badge-info" style={{ fontWeight: 700 }}>Double-Entry Balance Tracked</span>
        </div>

        <div className="table-responsive" style={{ marginTop: '1rem' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Transaction</th>
                <th>Kit Number</th>
                <th>Batch Number</th>
                <th>Received</th>
                <th>Dispensed</th>
                <th>Balance Remaining</th>
                <th>Tx Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>Loading IP accountability...</td></tr>
              ) : ipList.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No IP logs recorded yet</td></tr>
              ) : (
                ipList.map((item) => {
                  const isDispensed = (item.quantityDispensed || 0) > 0;
                  const txDate = item.updatedAt || item.createdAt;
                  const formattedDate = txDate ? new Date(txDate).toLocaleString() : '-';
                  const balance = item.currentBalance !== undefined ? item.currentBalance : (item.quantityReceived || 0) - (item.quantityDispensed || 0);

                  return (
                    <tr key={item.id}>
                      <td>
                        {isDispensed ? (
                          <span className="badge badge-warning" style={{ fontWeight: 700 }}><ArrowUpRight size={14} /> DISPENSED</span>
                        ) : (
                          <span className="badge badge-success" style={{ fontWeight: 700 }}><ArrowDownRight size={14} /> RECEIPT</span>
                        )}
                      </td>
                      <td>
                        <span style={{
                          fontFamily: 'monospace',
                          background: '#f0f7f2',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '6px',
                          border: '1px solid var(--mint-accent)',
                          color: 'var(--forest-deep)',
                          fontSize: '0.85rem',
                          fontWeight: 800
                        }}>
                          {item.kitNumber}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{item.batchNumber}</td>
                      <td style={{ fontWeight: 600 }}>{item.quantityReceived || 0}</td>
                      <td style={{ fontWeight: 600 }}>{item.quantityDispensed || 0}</td>
                      <td style={{ fontWeight: 800, color: 'var(--forest-deep)', fontSize: '1rem' }}>{balance}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formattedDate}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* IP Receipt Modal */}
      <Modal isOpen={isReceiptOpen} onClose={() => setIsReceiptOpen(false)} title="Record Incoming IP Shipment Receipt">
        <form onSubmit={handleReceiptSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>Kit Number *</label>
              <input type="text" className="form-input" value={receiptForm.kitNumber} onChange={(e) => setReceiptForm({ ...receiptForm, kitNumber: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>Batch Number *</label>
              <input type="text" className="form-input" value={receiptForm.batchNumber} onChange={(e) => setReceiptForm({ ...receiptForm, batchNumber: e.target.value })} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>Quantity Received *</label>
              <input type="number" className="form-input" value={receiptForm.quantityReceived} onChange={(e) => setReceiptForm({ ...receiptForm, quantityReceived: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>Expiry Date *</label>
              <input type="date" className="form-input" value={receiptForm.expiryDate} onChange={(e) => setReceiptForm({ ...receiptForm, expiryDate: e.target.value })} required />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsReceiptOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Recording...' : 'Record Receipt'}</button>
          </div>
        </form>
      </Modal>

      {/* IP Dispense Modal */}
      <Modal isOpen={isDispenseOpen} onClose={() => setIsDispenseOpen(false)} title="Dispense IP Kit to Subject">
        <form onSubmit={handleDispenseSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>Kit Number *</label>
              <input type="text" className="form-input" value={dispenseForm.kitNumber} onChange={(e) => setDispenseForm({ ...dispenseForm, kitNumber: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>Quantity Dispensed *</label>
              <input type="number" className="form-input" value={dispenseForm.quantityDispensed} onChange={(e) => setDispenseForm({ ...dispenseForm, quantityDispensed: e.target.value })} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700 }}>Dosage Instructions *</label>
            <textarea className="form-textarea" rows={2} value={dispenseForm.dosageInstruction} onChange={(e) => setDispenseForm({ ...dispenseForm, dosageInstruction: e.target.value })} required />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsDispenseOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Dispensing...' : 'Dispense Kit'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
