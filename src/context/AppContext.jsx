import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppContext = createContext(null);

const API_URL = 'https://n8n.teljoy.io/webhook/b275943b-5eac-470b-a536-440821d67dd7';
const USE_MOCK = false;

const MOCK_ORDERS = [
  {
    id: 'ORD-001',
    contractId: 'C-1001',
    clientName: 'Sarah Al Maktoum',
    clientLocation: 'JLT Cluster D',
    clientArea: 'JLT',
    housemaidName: 'Maria Santos',
    housemaidPhone: '+971 50 111 1111',
    housemaidStatus: 'PENDING',
    maidLocation: 'Satwa',
    pickupArea: 'Satwa',
    dropoffArea: 'JLT',
    creationDate: '2026-03-03 07:30:00',
    transferDate: '2026-03-01 08:00:00',
    typeOfTheContractLabel: 'Satwa',
    assignee: null,
    pendingStatus: true,
  },
  {
    id: 'ORD-002',
    contractId: 'C-1002',
    clientName: 'Ahmed Bin Rashid',
    clientLocation: 'JLT Cluster O',
    clientArea: 'JLT',
    housemaidName: 'Priya Sharma',
    housemaidPhone: '+971 50 222 2222',
    housemaidStatus: 'PENDING',
    maidLocation: 'Satwa',
    pickupArea: 'Satwa',
    dropoffArea: 'JLT',
    creationDate: '2026-03-03 07:45:00',
    transferDate: '2026-03-01 08:00:00',
    typeOfTheContractLabel: 'Satwa',
    assignee: null,
    pendingStatus: true,
  },
  {
    id: 'ORD-003',
    contractId: 'C-1003',
    clientName: 'Fatima Hassan',
    clientLocation: 'JLT Cluster Y',
    clientArea: 'JLT',
    housemaidName: 'Lina Reyes',
    housemaidPhone: '+971 50 333 3333',
    housemaidStatus: 'PENDING',
    maidLocation: 'Satwa',
    pickupArea: 'Satwa',
    dropoffArea: 'JLT',
    creationDate: '2026-03-03 08:00:00',
    transferDate: '2026-02-28 08:00:00',
    typeOfTheContractLabel: 'Satwa',
    assignee: null,
    pendingStatus: true,
  },
  {
    id: 'ORD-004',
    contractId: 'C-1004',
    clientName: 'Khalid Nasser',
    clientLocation: 'Marina Walk Tower 2',
    clientArea: 'Dubai Marina',
    housemaidName: 'Ana Garcia',
    housemaidPhone: '+971 50 444 4444',
    housemaidStatus: 'PENDING',
    maidLocation: 'Deira',
    pickupArea: 'Deira',
    dropoffArea: 'Dubai Marina',
    creationDate: '2026-03-03 06:30:00',
    transferDate: '2026-03-02 07:00:00',
    typeOfTheContractLabel: 'Deira',
    assignee: null,
    pendingStatus: true,
  },
  {
    id: 'ORD-005',
    contractId: 'C-1005',
    clientName: 'Noura Al Ali',
    clientLocation: 'Marina Pinnacle',
    clientArea: 'Dubai Marina',
    housemaidName: 'Rosa Mendez',
    housemaidPhone: '+971 50 555 5555',
    housemaidStatus: 'PENDING',
    maidLocation: 'Deira',
    pickupArea: 'Deira',
    dropoffArea: 'Dubai Marina',
    creationDate: '2026-03-03 06:45:00',
    transferDate: '2026-03-02 07:00:00',
    typeOfTheContractLabel: 'Deira',
    assignee: null,
    pendingStatus: true,
  },
  {
    id: 'ORD-006',
    contractId: 'C-1006',
    clientName: 'Omar Saeed',
    clientLocation: 'Business Bay Executive Tower',
    clientArea: 'Business Bay',
    housemaidName: 'Jenny Cruz',
    housemaidPhone: '+971 50 666 6666',
    housemaidStatus: 'PENDING',
    maidLocation: 'International City',
    pickupArea: 'International City',
    dropoffArea: 'Business Bay',
    creationDate: '2026-03-03 07:00:00',
    transferDate: '2026-03-03 07:00:00',
    typeOfTheContractLabel: 'International City',
    assignee: null,
    pendingStatus: true,
  },
  {
    id: 'ORD-007',
    contractId: 'C-1007',
    clientName: 'Layla Mohammed',
    clientLocation: 'Silicon Oasis HQ',
    clientArea: 'Silicon Oasis',
    housemaidName: 'Rina Aquino',
    housemaidPhone: '+971 50 777 7777',
    housemaidStatus: 'PENDING',
    maidLocation: 'International City',
    pickupArea: 'International City',
    dropoffArea: 'Silicon Oasis',
    creationDate: '2026-03-03 07:15:00',
    transferDate: '2026-03-01 07:00:00',
    typeOfTheContractLabel: 'International City',
    assignee: null,
    pendingStatus: true,
  },
  {
    id: 'ORD-008',
    contractId: 'C-1008',
    clientName: 'Rashed Al Ketbi',
    clientLocation: 'Mirdif City Centre area',
    clientArea: 'Mirdif',
    housemaidName: 'Siti Nurhaliza',
    housemaidPhone: '+971 50 888 8888',
    housemaidStatus: 'PENDING',
    maidLocation: 'Mirdif',
    pickupArea: 'Mirdif',
    dropoffArea: 'Warqa',
    creationDate: '2026-03-03 08:30:00',
    transferDate: '2026-03-02 08:00:00',
    typeOfTheContractLabel: 'Mirdif',
    assignee: null,
    pendingStatus: true,
  },
  {
    id: 'ORD-009',
    contractId: 'C-1009',
    clientName: 'Hessa Al Falasi',
    clientLocation: 'Palm Jumeirah Shoreline',
    clientArea: 'Palm Jumeirah',
    housemaidName: 'Grace Dela Cruz',
    housemaidPhone: '+971 50 999 9999',
    housemaidStatus: 'WITH_CLIENT',
    maidLocation: 'JBR',
    pickupArea: 'JBR',
    dropoffArea: 'Palm Jumeirah',
    creationDate: '2026-03-03 09:00:00',
    transferDate: '2026-02-27 09:00:00',
    typeOfTheContractLabel: 'JBR',
    assignee: 'Bruce Wayne',
    pendingStatus: false,
  },
  {
    id: 'ORD-010',
    contractId: 'C-1010',
    clientName: 'Majid Sultan',
    clientLocation: 'Downtown Boulevard',
    clientArea: 'Downtown',
    housemaidName: 'Bella Fernandez',
    housemaidPhone: '+971 50 100 1000',
    housemaidStatus: 'PENDING',
    maidLocation: 'Sharjah',
    pickupArea: 'Sharjah',
    dropoffArea: 'Downtown',
    creationDate: '2026-03-03 06:00:00',
    transferDate: '2026-03-03 06:00:00',
    typeOfTheContractLabel: 'Sharjah',
    assignee: null,
    pendingStatus: true,
  },
  {
    id: 'ORD-011',
    contractId: 'C-1011',
    clientName: 'Aisha Khalifa',
    clientLocation: 'DIFC Gate Village',
    clientArea: 'DIFC',
    housemaidName: 'Mary Jane Lopez',
    housemaidPhone: '+971 50 110 1100',
    housemaidStatus: 'PENDING',
    maidLocation: 'Sharjah',
    pickupArea: 'Sharjah',
    dropoffArea: 'Downtown',
    creationDate: '2026-03-03 06:15:00',
    transferDate: '2026-03-02 06:00:00',
    typeOfTheContractLabel: 'Sharjah',
    assignee: null,
    pendingStatus: true,
  },
  {
    id: 'ORD-012',
    contractId: 'C-1012',
    clientName: 'Sultan Al Qasimi',
    clientLocation: 'JVC Diamond Views',
    clientArea: 'JVC',
    housemaidName: 'Dewi Lestari',
    housemaidPhone: '+971 50 120 1200',
    housemaidStatus: 'PENDING',
    maidLocation: 'JVC',
    pickupArea: 'JVC',
    dropoffArea: 'Sports City',
    creationDate: '2026-03-03 08:00:00',
    transferDate: '2026-03-03 08:00:00',
    typeOfTheContractLabel: 'JVC',
    assignee: null,
    pendingStatus: true,
  },
];

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
  const [followUpOrders, setFollowUpOrders] = useState(() => loadFromStorage('carlift_followup_orders', []));
  const [followUpData, setFollowUpData] = useState(() => loadFromStorage('carlift_followup_data', {}));
  // Track confirmed driver assignments per order so TripCard state survives re-clustering
  const [tripAssignments, setTripAssignments] = useState(() => loadFromStorage('carlift_trip_assignments', {}));
  const [historyOrders, setHistoryOrders] = useState(() => loadFromStorage('carlift_history_orders', []));

  // Persist to localStorage
  useEffect(() => { saveToStorage('carlift_drivers', drivers); }, [drivers]);
  useEffect(() => { saveToStorage('carlift_followup_orders', followUpOrders); }, [followUpOrders]);
  useEffect(() => { saveToStorage('carlift_followup_data', followUpData); }, [followUpData]);
  useEffect(() => { saveToStorage('carlift_trip_assignments', tripAssignments); }, [tripAssignments]);
  useEffect(() => { saveToStorage('carlift_history_orders', historyOrders); }, [historyOrders]);

  // Static fake examples with all details filled out
  const STATIC_EXAMPLES = [
    {
      id: 'FAKE-001',
      contractId: 'C-FAKE-001',
      clientName: '[FAKE] Ahmed Al Mansouri',
      clientLocation: 'Marina Walk Tower 5',
      clientArea: 'Dubai Marina',
      clientId: '999999',
      housemaidName: '[FAKE] Maria Dela Cruz',
      housemaidPhone: '+971 50 123 9876',
      housemaidStatus: 'PENDING',
      housemaidId: '99999',
      maidLocation: 'Deira',
      pickupArea: 'Deira',
      dropoffArea: 'Dubai Marina',
      creationDate: '2026-03-04 07:30:00',
      transferDate: '2026-03-02 08:00:00',
      typeOfTheContractLabel: 'Indefinite Maids.cc (live out)',
      assignee: null,
      pendingStatus: '',
      urgent: false,
      liveOut: true,
      clientMobileNumber: '+971 55 888 7777',
      clientWhatsappNumber: '+971 55 888 7777',
    },
    {
      id: 'FAKE-002',
      contractId: 'C-FAKE-002',
      clientName: '[FAKE] Khalid Nasser',
      clientLocation: 'JLT Cluster D Tower 3',
      clientArea: 'JLT',
      clientId: '999998',
      housemaidName: '[FAKE] Rosa Mendez',
      housemaidPhone: '+971 50 555 4321',
      housemaidStatus: 'PENDING',
      housemaidId: '99998',
      maidLocation: 'Satwa',
      pickupArea: 'Satwa',
      dropoffArea: 'JLT',
      creationDate: '2026-03-04 07:45:00',
      transferDate: '2026-03-01 09:00:00',
      typeOfTheContractLabel: 'Indefinite Maids.cc (live out)',
      assignee: null,
      pendingStatus: '',
      urgent: false,
      liveOut: true,
      clientMobileNumber: '+971 55 777 6666',
      clientWhatsappNumber: '+971 55 777 6666',
    },
    {
      id: 'FAKE-003',
      contractId: 'C-FAKE-003',
      clientName: '[FAKE] Fatima Hassan',
      clientLocation: 'JLT Cluster Y Tower 1',
      clientArea: 'JLT',
      clientId: '999997',
      housemaidName: '[FAKE] Lina Reyes',
      housemaidPhone: '+971 50 333 2222',
      housemaidStatus: 'PENDING',
      housemaidId: '99997',
      maidLocation: 'Satwa',
      pickupArea: 'Satwa',
      dropoffArea: 'JLT',
      creationDate: '2026-03-04 08:00:00',
      transferDate: '2026-03-03 07:00:00',
      typeOfTheContractLabel: 'Indefinite Maids.cc (live out)',
      assignee: null,
      pendingStatus: '',
      urgent: false,
      liveOut: true,
      clientMobileNumber: '+971 55 444 3333',
      clientWhatsappNumber: '+971 55 444 3333',
    },
  ];

  const mapApiOrder = (raw) => ({
    id: raw.id || String(raw.contractId),
    contractId: raw.contractId ? String(raw.contractId) : raw.id,
    clientName: raw.clientName || 'N/A',
    clientLocation: 'Location N/A',
    clientArea: 'N/A',
    clientId: raw.clientId || '',
    housemaidName: raw.housemaidName || 'N/A',
    housemaidPhone: raw.housemaidPhoneNumber && raw.housemaidPhoneNumber !== '***' ? raw.housemaidPhoneNumber : 'Phone: N/A',
    housemaidStatus: raw.housemaidStatus || '',
    housemaidId: raw.housemaidId || '',
    maidLocation: 'Location N/A',
    pickupArea: 'N/A',
    dropoffArea: 'N/A',
    creationDate: raw.creationDate || '',
    transferDate: raw.transferDate || '',
    typeOfTheContractLabel: raw.typeOfTheContractLabel || '',
    assignee: raw.assignee || null,
    pendingStatus: raw.pendingStatus || '',
    urgent: raw.urgent || false,
    liveOut: raw.liveOut || false,
    clientMobileNumber: raw.clientMobileNumber && raw.clientMobileNumber !== '***' ? raw.clientMobileNumber : 'Phone: N/A',
    clientWhatsappNumber: raw.clientWhatsappNumber && raw.clientWhatsappNumber !== '***' ? raw.clientWhatsappNumber : 'Phone: N/A',
  });

  const fetchOrders = useCallback(async () => {
    if (USE_MOCK) {
      setOrders(MOCK_ORDERS);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      const content = data.content || data || [];
      const raw = Array.isArray(content) ? content : [];
      setOrders([...STATIC_EXAMPLES, ...raw.map(mapApiOrder)]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Filter out orders that are already in follow-up
  const followUpOrderIds = new Set(followUpOrders.map(o => o.orderId));
  const waitingOrders = orders.filter(o => !followUpOrderIds.has(o.id || o.contractId));

  // Confirm a driver for a trip — stores assignment for ALL orders in the trip
  const confirmTripDriver = useCallback((orderIds, driverInfo, pickupTime) => {
    setTripAssignments(prev => {
      const next = { ...prev };
      for (const oid of orderIds) {
        next[oid] = { driverId: driverInfo.id, driverName: driverInfo.name, driverPhone: driverInfo.phone, driverPrice: driverInfo.price, pickupTime };
      }
      return next;
    });
  }, []);

  // Move a single order to follow-up with its driver/trip context
  const confirmOrder = useCallback((order, driverInfo, tripInfo) => {
    const orderId = order.id || order.contractId;
    setFollowUpOrders(prev => {
      if (prev.some(o => o.orderId === orderId)) return prev;
      return [...prev, {
        orderId,
        order,
        driverName: driverInfo.name,
        driverPhone: driverInfo.phone,
        driverPrice: driverInfo.price,
        driverId: driverInfo.id,
        routeLabel: tripInfo.routeLabel,
        pickupLabel: tripInfo.pickupLabel,
        dropoffLabel: tripInfo.dropoffLabel,
        timeWindow: tripInfo.timeWindow,
        plannedTransportation: 'Carlift',
        confirmedAt: new Date().toISOString(),
      }];
    });
    // Clean up the trip assignment for this order
    setTripAssignments(prev => {
      const next = { ...prev };
      delete next[orderId];
      return next;
    });
  }, []);

  const moveBackToWaiting = useCallback((orderId) => {
    setFollowUpOrders(prev => prev.filter(o => o.orderId !== orderId));
    setFollowUpData(prev => {
      const next = { ...prev };
      delete next[orderId];
      return next;
    });
  }, []);

  const updateFollowUp = useCallback((orderId, data) => {
    setFollowUpData(prev => ({
      ...prev,
      [orderId]: { ...(prev[orderId] || {}), ...data },
    }));
  }, []);

  const completeFollowUp = useCallback((orderId) => {
    const fo = followUpOrders.find(o => o.orderId === orderId);
    if (!fo) return;
    setHistoryOrders(prev => {
      if (prev.some(h => h.orderId === orderId)) return prev;
      return [...prev, {
        ...fo,
        followUpData: followUpData[orderId] || {},
        completedAt: new Date().toISOString(),
      }];
    });
    setFollowUpOrders(prev => prev.filter(o => o.orderId !== orderId));
    setFollowUpData(prev => {
      const next = { ...prev };
      delete next[orderId];
      return next;
    });
  }, [followUpOrders, followUpData]);

  const addDriver = useCallback((driver) => {
    setDrivers(prev => [...prev, driver]);
  }, []);

  const updateDriver = useCallback((id, updates) => {
    setDrivers(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  }, []);

  const toggleDriver = useCallback((id) => {
    setDrivers(prev => prev.map(d => d.id === id ? { ...d, active: !d.active } : d));
  }, []);

  const deleteDriver = useCallback((id) => {
    setDrivers(prev => prev.filter(d => d.id !== id));
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
      deleteDriver,
      followUpOrders,
      confirmOrder,
      confirmTripDriver,
      tripAssignments,
      moveBackToWaiting,
      followUpData,
      updateFollowUp,
      historyOrders,
      completeFollowUp,
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
