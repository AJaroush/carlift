import { useState } from 'react';

export default function EditOrderModal({ order, onSave, onClose }) {
  const [form, setForm] = useState({
    housemaidName: order.housemaidName || '',
    housemaidPhone: order.housemaidPhone || '',
    clientName: order.clientName || '',
    clientLocation: order.clientLocation || '',
    pickupArea: order.pickupArea || '',
    dropoffArea: order.dropoffArea || '',
    maidLocation: order.maidLocation || '',
  });

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const updates = {};
    if (form.housemaidName !== order.housemaidName) updates.housemaidName = form.housemaidName;
    if (form.housemaidPhone !== order.housemaidPhone) updates.housemaidPhone = form.housemaidPhone;
    if (form.clientName !== order.clientName) updates.clientName = form.clientName;
    if (form.clientLocation !== order.clientLocation) {
      updates.clientLocation = form.clientLocation;
      updates.clientArea = form.clientLocation;
    }
    if (form.pickupArea !== order.pickupArea) updates.pickupArea = form.pickupArea;
    if (form.dropoffArea !== order.dropoffArea) updates.dropoffArea = form.dropoffArea;
    if (form.maidLocation !== order.maidLocation) updates.maidLocation = form.maidLocation;
    onSave(updates);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content add-order-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Order</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4.5 4.5l9 9M13.5 4.5l-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="add-order-form">
          <div className="form-row">
            <div className="form-group">
              <label>Maid Name</label>
              <input type="text" value={form.housemaidName} onChange={set('housemaidName')} />
            </div>
            <div className="form-group">
              <label>Maid Phone</label>
              <input type="text" value={form.housemaidPhone} onChange={set('housemaidPhone')} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Client Name</label>
              <input type="text" value={form.clientName} onChange={set('clientName')} />
            </div>
            <div className="form-group">
              <label>Client Location</label>
              <input type="text" value={form.clientLocation} onChange={set('clientLocation')} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Pickup Area (Maid Location)</label>
              <input type="text" value={form.pickupArea} onChange={set('pickupArea')} />
            </div>
            <div className="form-group">
              <label>Dropoff Area</label>
              <input type="text" value={form.dropoffArea} onChange={set('dropoffArea')} />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="submit-btn">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}
