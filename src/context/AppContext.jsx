import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppContext = createContext(null);

const API_URL = '/api/webhook/371bc76a-2ff5-42a5-bd24-b408af2e51f4';

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

function loadFromStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* ignore */ }
}

export function AppProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drivers, setDrivers] = useState(() => loadFromStorage('carlift_drivers', INITIAL_DRIVERS));
  const [confirmedTrips, setConfirmedTrips] = useState(() => loadFromStorage('carlift_confirmed_trips', []));
  const [followUpData, setFollowUpData] = useState(() => loadFromStorage('carlift_followup_data', {}));

  // Persist to localStorage
  useEffect(() => { saveToStorage('carlift_drivers', drivers); }, [drivers]);
  useEffect(() => { saveToStorage('carlift_confirmed_trips', confirmedTrips); }, [confirmedTrips]);
  useEffect(() => { saveToStorage('carlift_followup_data', followUpData); }, [followUpData]);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      const content = data.content || data || [];
      setOrders(Array.isArray(content) ? content : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Filter out orders that are already confirmed (in follow-up)
  const confirmedOrderIds = new Set(confirmedTrips.flatMap(t => t.orderIds || []));
  const waitingOrders = orders.filter(o => !confirmedOrderIds.has(o.id || o.contractId));

  const confirmTrip = useCallback((trip) => {
    const tripRecord = {
      id: `TRIP-${Date.now()}`,
      ...trip,
      confirmedAt: new Date().toISOString(),
    };
    setConfirmedTrips(prev => [...prev, tripRecord]);
  }, []);

  const moveBackToWaiting = useCallback((tripId) => {
    setConfirmedTrips(prev => prev.filter(t => t.id !== tripId));
    setFollowUpData(prev => {
      const next = { ...prev };
      delete next[tripId];
      return next;
    });
  }, []);

  const updateFollowUp = useCallback((tripId, data) => {
    setFollowUpData(prev => ({
      ...prev,
      [tripId]: { ...(prev[tripId] || {}), ...data },
    }));
  }, []);

  const addDriver = useCallback((driver) => {
    setDrivers(prev => [...prev, driver]);
  }, []);

  const updateDriver = useCallback((id, updates) => {
    setDrivers(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  }, []);

  const toggleDriver = useCallback((id) => {
    setDrivers(prev => prev.map(d => d.id === id ? { ...d, active: !d.active } : d));
  }, []);

  return (
    <AppContext.Provider value={{
      orders,
      waitingOrders,
      loading,
      error,
      fetchOrders,
      drivers,
      addDriver,
      updateDriver,
      toggleDriver,
      confirmedTrips,
      confirmTrip,
      moveBackToWaiting,
      followUpData,
      updateFollowUp,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
