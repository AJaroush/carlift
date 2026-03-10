import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';

const EMPTY_FORM = {
  name: '',
  phone: '',
  vehicle: '',
  plate: '',
  pickupArea: '',
  dropArea: '',
  price: '',
  reliability: 'Mid',
  active: true,
  operatingHours: '',
  scheduleImage: '',
};

export default function CarliftsPage() {
  const { drivers, addDriver, updateDriver, toggleDriver, deleteDriver } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');

  const filteredDrivers = drivers.filter(d => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (d.phone || '').toLowerCase().includes(q)
      || (d.name || '').toLowerCase().includes(q);
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setEditingDriver(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEditModal = (driver) => {
    setEditingDriver(driver);
    setForm({
      name: driver.name,
      phone: driver.phone,
      vehicle: driver.vehicle || '',
      plate: driver.plate || '',
      pickupArea: driver.pickupArea,
      dropArea: driver.dropArea,
      price: String(driver.price),
      reliability: driver.reliability,
      active: driver.active,
      operatingHours: driver.operatingHours || '',
      scheduleImage: driver.scheduleImage || '',
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingDriver) {
      updateDriver(editingDriver.id, {
        ...form,
        price: Number(form.price) || 0,
      });
    } else {
      const nextNum = drivers.length + 1;
      addDriver({
        ...form,
        id: `DRV-${String(nextNum).padStart(3, '0')}`,
        price: Number(form.price) || 0,
        active: true,
      });
    }
    setForm(EMPTY_FORM);
    setEditingDriver(null);
    setShowModal(false);
  };

  return (
    <div className="carlifts-page">
      <div className="carlifts-header">
        <div className="carlifts-title-row">
          <h1 className="carlifts-title">Carlifts</h1>
          <span className="driver-count">{filteredDrivers.length} Drivers</span>
        </div>
        <div className="carlifts-actions-row">
          <input
            className="carlifts-search"
            type="text"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="add-carlift-btn" onClick={openAddModal}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Add New Carlift
          </button>
        </div>
      </div>

      <div className="carlifts-table-container">
        <table className="carlifts-table">
          <thead>
            <tr>
              <th>ID / DRIVER</th>
              <th>CONTACT</th>
              <th>VEHICLE INFO</th>
              <th>COVERAGE ROUTE</th>
              <th>PRICE</th>
              <th>RELIABILITY</th>
              <th>OPERATING HOURS</th>
              <th>ACTIVE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredDrivers.map((driver) => (
              <DriverRow
                key={driver.id}
                driver={driver}
                onToggle={toggleDriver}
                onEdit={openEditModal}
                onDelete={deleteDriver}
                onUpdate={updateDriver}
              />
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingDriver ? 'Edit Carlift' : 'Add New Carlift'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M15 5L5 15M5 5l10 10" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Driver Name</label>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Ahmed Khan" />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="+971 50 000 0000" />
                </div>
                <div className="form-group">
                  <label>Vehicle</label>
                  <input name="vehicle" value={form.vehicle} onChange={handleChange} placeholder="e.g. Toyota Hiace (14 Seater)" />
                </div>
                <div className="form-group">
                  <label>Plate Number</label>
                  <input name="plate" value={form.plate} onChange={handleChange} placeholder="e.g. DXB A 12345" />
                </div>
                <div className="form-group">
                  <label>Pickup Area</label>
                  <input name="pickupArea" value={form.pickupArea} onChange={handleChange} placeholder="e.g. JBR, Marina" />
                </div>
                <div className="form-group">
                  <label>Drop-off Area</label>
                  <input name="dropArea" value={form.dropArea} onChange={handleChange} placeholder="e.g. JLT, Media City" />
                </div>
                <div className="form-group">
                  <label>Price (AED)</label>
                  <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="e.g. 120" />
                </div>
                <div className="form-group">
                  <label>Reliability</label>
                  <select name="reliability" value={form.reliability} onChange={handleChange}>
                    <option value="High">High</option>
                    <option value="Mid">Mid</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div className="form-group form-group-full">
                  <label>Operating Hours</label>
                  <input name="operatingHours" value={form.operatingHours} onChange={handleChange} placeholder="e.g. 6:00 AM - 10:00 PM, or Sun-Thu 7AM-9PM" />
                </div>
                <div className="form-group form-group-full">
                  <label>Schedule Image</label>
                  <div className="schedule-image-input">
                    {form.scheduleImage && (
                      <div className="schedule-image-preview-modal">
                        <img src={form.scheduleImage} alt="Schedule" />
                        <button type="button" className="remove-image-btn" onClick={() => setForm(prev => ({ ...prev, scheduleImage: '' }))}>Remove</button>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => setForm(prev => ({ ...prev, scheduleImage: ev.target.result }));
                        reader.readAsDataURL(file);
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-submit">
                  {editingDriver ? 'Save Changes' : 'Add Carlift'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function DriverRow({ driver, onToggle, onEdit, onDelete, onUpdate }) {
  const reliabilityClass =
    driver.reliability === 'High' ? 'high' :
    driver.reliability === 'Mid' ? 'mid' : 'low';

  const [editingHours, setEditingHours] = useState(false);
  const [hoursValue, setHoursValue] = useState(driver.operatingHours || '');
  const [showImagePopup, setShowImagePopup] = useState(false);
  const fileInputRef = useRef(null);

  const saveHours = () => {
    onUpdate(driver.id, { operatingHours: hoursValue });
    setEditingHours(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      onUpdate(driver.id, { scheduleImage: ev.target.result });
    };
    reader.readAsDataURL(file);
  };

  return (
    <tr>
      <td>
        <div className="driver-id-cell">
          <div className="driver-cell-name">{driver.name}</div>
          <div className="driver-cell-id">{driver.id}</div>
        </div>
      </td>
      <td>
        <div className="contact-cell">
          <svg className="phone-icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M12.833 9.88v1.787a1.19 1.19 0 01-1.298 1.19 11.783 11.783 0 01-5.14-1.828 11.61 11.61 0 01-3.571-3.572A11.783 11.783 0 010.996 2.3 1.19 1.19 0 012.18 1.006h1.786A1.19 1.19 0 015.16 2.03a7.647 7.647 0 00.417 1.674 1.19 1.19 0 01-.268 1.256l-.756.756a9.524 9.524 0 003.572 3.572l.756-.756a1.19 1.19 0 011.256-.268 7.647 7.647 0 001.674.417 1.19 1.19 0 011.023 1.2z" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="contact-number">{driver.phone}</span>
        </div>
      </td>
      <td>
        <div className="vehicle-cell">
          <svg className="vehicle-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M14.25 11.25h.75a1.5 1.5 0 001.5-1.5V6.75a1.5 1.5 0 00-1.5-1.5h-.75M3.75 5.25H3a1.5 1.5 0 00-1.5 1.5v3a1.5 1.5 0 001.5 1.5h.75" stroke="#3B82F6" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="3.75" y="3" width="10.5" height="12" rx="1.5" stroke="#3B82F6" strokeWidth="1.2"/>
            <path d="M6.75 7.5h4.5M6.75 10.5h4.5" stroke="#3B82F6" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <div>
            <div className="vehicle-name">{driver.vehicle}</div>
            <div className="vehicle-plate">{driver.plate}</div>
          </div>
        </div>
      </td>
      <td>
        <div className="route-cell">
          <div className="route-row"><span className="route-label">P:</span> {driver.pickupArea}</div>
          <div className="route-row"><span className="route-label">D:</span> {driver.dropArea}</div>
        </div>
      </td>
      <td>
        <div className="carlift-price">AED {driver.price}</div>
      </td>
      <td>
        <span className={`reliability-badge ${reliabilityClass}`}>{driver.reliability}</span>
      </td>
      <td>
        <div className="operating-hours-cell">
          {editingHours ? (
            <div className="hours-edit-inline">
              <input
                className="hours-input"
                value={hoursValue}
                onChange={(e) => setHoursValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') saveHours(); if (e.key === 'Escape') setEditingHours(false); }}
                placeholder="e.g. 6AM-10PM"
                autoFocus
              />
              <button className="hours-save-btn" onClick={saveHours}>Save</button>
            </div>
          ) : (
            <div className="hours-display" onClick={() => { setHoursValue(driver.operatingHours || ''); setEditingHours(true); }}>
              {driver.operatingHours || <span className="hours-placeholder">Click to set</span>}
            </div>
          )}
          <div className="schedule-image-actions">
            {driver.scheduleImage ? (
              <>
                <button className="view-schedule-btn" onClick={() => setShowImagePopup(true)}>View</button>
                <button className="remove-schedule-btn" onClick={() => onUpdate(driver.id, { scheduleImage: '' })}>X</button>
              </>
            ) : (
              <button className="upload-schedule-btn" onClick={() => fileInputRef.current?.click()}>
                Upload
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
          </div>
          {showImagePopup && driver.scheduleImage && (
            <div className="schedule-popup-overlay" onClick={() => setShowImagePopup(false)}>
              <div className="schedule-popup" onClick={(e) => e.stopPropagation()}>
                <button className="schedule-popup-close" onClick={() => setShowImagePopup(false)}>X</button>
                <img src={driver.scheduleImage} alt="Driver schedule" />
              </div>
            </div>
          )}
        </div>
      </td>
      <td>
        <div
          className={`toggle-switch ${driver.active ? 'on' : 'off'}`}
          onClick={() => onToggle(driver.id)}
        >
          <div className="toggle-knob"></div>
        </div>
      </td>
      <td>
        <div className="carlift-actions">
          <button className="edit-driver-btn" onClick={() => onEdit(driver)}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9.917 1.75a1.65 1.65 0 012.333 2.333L4.667 11.667 1.75 12.25l.583-2.917L9.917 1.75z" stroke="currentColor" strokeWidth="1.2"/>
            </svg>
            Edit
          </button>
          <button className="delete-driver-btn" onClick={() => { if (window.confirm(`Delete driver "${driver.name}"?`)) onDelete(driver.id); }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1.75 3.5h10.5M4.667 3.5V2.333a1.167 1.167 0 011.166-1.166h2.334a1.167 1.167 0 011.166 1.166V3.5m1.75 0v8.167a1.167 1.167 0 01-1.166 1.166H4.083a1.167 1.167 0 01-1.166-1.166V3.5h8.166z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
