import { useState } from 'react';

const INITIAL_DRIVERS = [
  {
    id: 'DRV-001',
    name: 'Ahmed Khan',
    phone: '+971 50 123 4567',
    vehicle: 'Toyota Hiace (14 Seater)',
    plate: 'DXB A 12345',
    pickupArea: 'JBR, Marina',
    dropArea: 'JLT, Media City',
    price: 120,
    reliability: 'High',
    active: true,
  },
  {
    id: 'DRV-002',
    name: 'Mohammed Ali',
    phone: '+971 55 987 6543',
    vehicle: 'Nissan Urvan (13 Seater)',
    plate: 'DXB K 98765',
    pickupArea: 'Deira',
    dropArea: 'Bur Dubai, Karama',
    price: 100,
    reliability: 'Mid',
    active: true,
  },
  {
    id: 'DRV-003',
    name: 'Raj Patel',
    phone: '+971 52 456 7890',
    vehicle: 'Toyota Coaster (22 Seater)',
    plate: 'SHJ 4 5678',
    pickupArea: 'Sharjah',
    dropArea: 'Dubai (all areas)',
    price: 150,
    reliability: 'High',
    active: true,
  },
  {
    id: 'DRV-004',
    name: 'Khalid Omar',
    phone: '+971 50 333 4444',
    vehicle: 'Hyundai H1 (9 Seater)',
    plate: 'DXB M 33445',
    pickupArea: 'Downtown',
    dropArea: 'Business Bay, DIFC',
    price: 130,
    reliability: 'Low',
    active: false,
  },
  {
    id: 'DRV-005',
    name: 'John Doe',
    phone: '+971 56 111 2222',
    vehicle: 'Toyota Hiace (14 Seater)',
    plate: 'DXB L 11223',
    pickupArea: 'Mirdif',
    dropArea: 'Warqa, Rashidiya',
    price: 110,
    reliability: 'Mid',
    active: true,
  },
  {
    id: 'DRV-006',
    name: 'Saeed Al-Maktoum',
    phone: '+971 54 555 6666',
    vehicle: 'Nissan Civilian (26 Seater)',
    plate: 'DXB O 55667',
    pickupArea: 'International City',
    dropArea: 'Silicon Oasis',
    price: 140,
    reliability: 'High',
    active: true,
  },
  {
    id: 'DRV-007',
    name: 'Peter Parker',
    phone: '+971 58 777 8888',
    vehicle: 'Toyota Hiace (14 Seater)',
    plate: 'DXB P 77889',
    pickupArea: 'JVC',
    dropArea: 'Sports City, Motor City',
    price: 115,
    reliability: 'Mid',
    active: false,
  },
  {
    id: 'DRV-008',
    name: 'Bruce Wayne',
    phone: '+971 50 999 0000',
    vehicle: 'Mercedes Sprinter (18 Seater)',
    plate: 'DXB B 99000',
    pickupArea: 'Palm Jumeirah',
    dropArea: 'Dubai Marina',
    price: 160,
    reliability: 'High',
    active: true,
  },
];

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
};

export default function CarliftsPage() {
  const [drivers, setDrivers] = useState(INITIAL_DRIVERS);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const handleToggle = (id) => {
    setDrivers(prev =>
      prev.map(d => d.id === id ? { ...d, active: !d.active } : d)
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextNum = drivers.length + 1;
    const newDriver = {
      ...form,
      id: `DRV-${String(nextNum).padStart(3, '0')}`,
      price: Number(form.price) || 0,
      active: true,
    };
    setDrivers(prev => [...prev, newDriver]);
    setForm(EMPTY_FORM);
    setShowModal(false);
  };

  return (
    <div className="carlifts-page">
      <div className="carlifts-header">
        <div className="carlifts-title-row">
          <h1 className="carlifts-title">Carlifts</h1>
          <span className="driver-count">{drivers.length} Drivers</span>
        </div>
        <button className="add-carlift-btn" onClick={() => setShowModal(true)}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Add New Carlift
        </button>
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
              <th>ACTIVE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((driver) => (
              <DriverRow key={driver.id} driver={driver} onToggle={handleToggle} />
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Carlift</h2>
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
                  <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Ahmed Khan" required />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="+971 50 000 0000" required />
                </div>
                <div className="form-group">
                  <label>Vehicle</label>
                  <input name="vehicle" value={form.vehicle} onChange={handleChange} placeholder="e.g. Toyota Hiace (14 Seater)" required />
                </div>
                <div className="form-group">
                  <label>Plate Number</label>
                  <input name="plate" value={form.plate} onChange={handleChange} placeholder="e.g. DXB A 12345" required />
                </div>
                <div className="form-group">
                  <label>Pickup Area</label>
                  <input name="pickupArea" value={form.pickupArea} onChange={handleChange} placeholder="e.g. JBR, Marina" required />
                </div>
                <div className="form-group">
                  <label>Drop-off Area</label>
                  <input name="dropArea" value={form.dropArea} onChange={handleChange} placeholder="e.g. JLT, Media City" required />
                </div>
                <div className="form-group">
                  <label>Price (AED)</label>
                  <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="e.g. 120" required />
                </div>
                <div className="form-group">
                  <label>Reliability</label>
                  <select name="reliability" value={form.reliability} onChange={handleChange}>
                    <option value="High">High</option>
                    <option value="Mid">Mid</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-submit">Add Carlift</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function DriverRow({ driver, onToggle }) {
  const reliabilityClass =
    driver.reliability === 'High' ? 'high' :
    driver.reliability === 'Mid' ? 'mid' : 'low';

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
        <div
          className={`toggle-switch ${driver.active ? 'on' : 'off'}`}
          onClick={() => onToggle(driver.id)}
        >
          <div className="toggle-knob"></div>
        </div>
      </td>
      <td>
        <div className="carlift-actions">
          <button className="whatsapp-btn">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M12.25 6.708a5.25 5.25 0 01-.788 2.754 5.322 5.322 0 01-4.733 2.913 5.25 5.25 0 01-2.754-.787L1.75 12.25l.663-2.225A5.25 5.25 0 011.625 7.27a5.322 5.322 0 012.913-4.733A5.25 5.25 0 017.292 1.75h.312a5.306 5.306 0 015.146 5.146v.312z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            WhatsApp
          </button>
          <button className="more-btn">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="3" r="1" fill="#94A3B8"/>
              <circle cx="8" cy="8" r="1" fill="#94A3B8"/>
              <circle cx="8" cy="13" r="1" fill="#94A3B8"/>
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
}
