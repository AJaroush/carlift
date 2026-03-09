import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchFollowUpOrders as sbFetchFollowUpOrders,
  fetchFollowUpData as sbFetchFollowUpData,
  fetchHistoryOrders as sbFetchHistoryOrders,
  upsertFollowUpOrder,
  upsertFollowUpData,
  deleteFollowUpOrder,
  updateFollowUpOrderData,
  insertHistoryOrder,
  subscribeToFollowUp,
  subscribeToHistory,
  upsertOrders as sbUpsertOrders,
  upsertOrder as sbUpsertOrder,
  fetchOrders as sbFetchOrders,
  subscribeToOrders,
  updateOrderInDb,
  deleteOrderFromDb,
  updateHistoryOrder,
} from '../lib/supabase';

const AppContext = createContext(null);

const API_URL = 'https://n8n-analysis.teljoy.io/webhook/b275943b-5eac-470b-a536-440821d67dd7';
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

// Reverse geocode cache to avoid repeated API calls
const geoCache = {};

async function reverseGeocode(lat, lon) {
  if (!lat || !lon) return null;
  const key = `${lat.toFixed(4)},${lon.toFixed(4)}`;
  if (geoCache[key]) return geoCache[key];
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=14`,
      { headers: { 'User-Agent': 'CarliftOps/1.0' } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const addr = data.address || {};
    const area = addr.neighbourhood || addr.suburb || addr.town || addr.city_district || addr.city || data.name || null;
    if (area) geoCache[key] = area;
    return area;
  } catch {
    return null;
  }
}

export function AppProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drivers, setDrivers] = useState(() => loadFromStorage('carlift_drivers', INITIAL_DRIVERS));
  const [followUpOrders, setFollowUpOrders] = useState([]);
  const [followUpData, setFollowUpData] = useState({});
  // Track confirmed driver assignments per order so TripCard state survives re-clustering
  const [tripAssignments, setTripAssignments] = useState(() => loadFromStorage('carlift_trip_assignments', {}));
  const [historyOrders, setHistoryOrders] = useState([]);

  // Persist drivers & trip assignments to localStorage (unchanged)
  useEffect(() => { saveToStorage('carlift_drivers', drivers); }, [drivers]);
  useEffect(() => { saveToStorage('carlift_trip_assignments', tripAssignments); }, [tripAssignments]);

  // ── Supabase: initial load + realtime subscriptions ───────────
  const refreshFollowUp = useCallback(async () => {
    try {
      const [orders, data] = await Promise.all([
        sbFetchFollowUpOrders(),
        sbFetchFollowUpData(),
      ]);
      setFollowUpOrders(orders);
      setFollowUpData(data);
    } catch (err) {
      console.error('Failed to load follow-up from Supabase:', err);
    }
  }, []);

  const refreshHistory = useCallback(async () => {
    try {
      const data = await sbFetchHistoryOrders();
      setHistoryOrders(data);
    } catch (err) {
      console.error('Failed to load history from Supabase:', err);
    }
  }, []);

  useEffect(() => {
    // Initial load from Supabase
    refreshFollowUp();
    refreshHistory();

    // Realtime: re-fetch on any change so all clients stay in sync
    const unsubFollowUp = subscribeToFollowUp(() => refreshFollowUp());
    const unsubHistory = subscribeToHistory(() => refreshHistory());

    return () => {
      unsubFollowUp();
      unsubHistory();
    };
  }, [refreshFollowUp, refreshHistory]);

  // Compound area names that start with a city name — must NOT strip the city word
  const COMPOUND_AREAS = [
    'Dubai Hills', 'Dubai Marina', 'Dubai Downtown', 'Downtown Dubai',
    'Dubai Land', 'Dubailand', 'Dubai Silicon Oasis', 'Dubai Sports City',
    'Dubai Festival City', 'Abu Dhabi Gate', 'Abu Dhabi Mall',
  ];

  const cleanAddress = (addr) => {
    if (!addr) return null;
    let clean = addr
      .replace(/https?:\/\/\S+/gi, '')                              // remove URLs
      .replace(/\s*\(.*?\)\s*/g, '')                                // remove anything in parentheses
      .replace(/\(Google Maps pin:.*$/gi, '')                        // remove Google Maps pin suffix
      .replace(/\d+°\d+'\d+\.?\d*"[NS]\s*\d+°\d+'\d+\.?\d*"[EW]/g, '') // DMS coords
      .replace(/\b\d{1,3}\.\d{4,},?\s*\d{1,3}\.\d{4,}\b/g, '')    // decimal coords like 25.242861, 55.284083
      .replace(/\b\w{4}\+\w{2,5}\b/gi, '')                         // plus codes like 67PH+FQR
      .replace(/\b\d{4}\s+\w{2,3}\b/g, '')                         // codes like "7886 MP"
      .replace(/\blocation\s*pin\s*[-:,]?\s*(\d+\.\d+,?\s*\d+\.\d+)?/gi, '') // "location pin 25.xx, 55.xx" or leftover "location pin"
      .replace(/United Arab Emirates/gi, '')
      .replace(/\n/g, ' ')                                          // newlines to spaces
      .replace(/\s{2,}/g, ' ')                                      // collapse spaces
      .trim();

    // Protect compound area names by replacing them with placeholders
    const placeholders = {};
    COMPOUND_AREAS.forEach((area, i) => {
      const re = new RegExp(area.replace(/\s+/g, '\\s+'), 'gi');
      if (re.test(clean)) {
        clean = clean.replace(re, `__AREA${i}__`);
        placeholders[`__AREA${i}__`] = area;
      }
    });

    // Now safely remove standalone city names
    clean = clean
      .replace(/\bDubai\b/gi, '')
      .replace(/\bAbu Dhabi\b/gi, '')
      .replace(/\bSharjah\b/gi, '');

    // Restore compound area names
    for (const [ph, area] of Object.entries(placeholders)) {
      clean = clean.replace(new RegExp(ph, 'g'), area);
    }

    clean = clean
      .replace(/\s{2,}/g, ' ')
      .replace(/^[\s,.\-]+|[\s,.\-]+$/g, '')
      .trim();

    // If all that's left is too short or just numbers, return null
    if (!clean || clean.length < 3 || /^\d+$/.test(clean)) return null;
    return clean;
  };

  const mapApiOrder = (raw) => {
    const maidAddr = cleanAddress(raw.maidAddress);
    const clientAddr = cleanAddress(raw.ClientAddress);
    return {
    id: raw.id || String(raw.contractId),
    contractId: raw.contractId ? String(raw.contractId) : raw.id,
    clientName: raw.clientName || 'N/A',
    clientLocation: clientAddr || 'Location N/A',
    clientArea: clientAddr || 'N/A',
    clientId: raw.clientId || '',
    housemaidName: raw.housemaidName || 'N/A',
    housemaidPhone: raw.housemaidPhoneNumber && raw.housemaidPhoneNumber !== '***' ? raw.housemaidPhoneNumber : 'Phone: N/A',
    housemaidStatus: raw.housemaidStatus || '',
    housemaidId: raw.housemaidId || '',
    maidLocation: maidAddr || 'Location N/A',
    pickupArea: maidAddr || 'N/A',
    dropoffArea: clientAddr || 'N/A',
    creationDate: raw.creationDate || '',
    transferDate: raw.transferDate || '',
    typeOfTheContractLabel: raw.typeOfTheContractLabel || '',
    assignee: raw.assignee || null,
    pendingStatus: raw.pendingStatus || '',
    urgent: raw.urgent || false,
    liveOut: raw.liveOut || false,
    clientMobileNumber: raw.clientMobileNumber && raw.clientMobileNumber !== '***' ? raw.clientMobileNumber : 'Phone: N/A',
    clientWhatsappNumber: raw.clientWhatsappNumber && raw.clientWhatsappNumber !== '***' ? raw.clientWhatsappNumber : 'Phone: N/A',
    maidLat: raw.maidLat && raw.maidLat !== -1 ? raw.maidLat : null,
    maidLong: raw.maidLong && raw.maidLong !== -1 ? raw.maidLong : null,
    clientLat: raw.clientLat && raw.clientLat !== -1 ? raw.clientLat : null,
    clientLong: raw.clientLong && raw.clientLong !== -1 ? raw.clientLong : null,
  };
  };

  const STATIC_EXAMPLES = [];

  const hasFetchedOnce = useRef(false);

  const fetchOrders = useCallback(async () => {
    if (USE_MOCK) {
      setOrders(MOCK_ORDERS);
      setLoading(false);
      return;
    }
    try {
      if (!hasFetchedOnce.current) setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      const content = data.data || data.content || data || [];
      const raw = Array.isArray(content) ? content : (content && typeof content === 'object' ? [content] : []);
      // Filter out orders without a maid assigned
      const withMaid = raw.filter(r => r.housemaidName && r.housemaidName.trim());
      const mapped = withMaid.map(mapApiOrder);

      // Reverse geocode only when API didn't provide usable addresses
      const needsGeo = (area) => !area || area === 'N/A' || area === 'Location N/A';
      const geoTasks = [];
      for (const order of mapped) {
        if (needsGeo(order.pickupArea) && order.maidLat && order.maidLong) {
          geoTasks.push({ order, field: 'pickup', lat: order.maidLat, lon: order.maidLong });
        }
        if (needsGeo(order.dropoffArea) && order.clientLat && order.clientLong) {
          geoTasks.push({ order, field: 'dropoff', lat: order.clientLat, lon: order.clientLong });
        }
      }
      // Nominatim rate limit: 1 req/sec — process sequentially with 1.1s delay
      for (let i = 0; i < geoTasks.length; i++) {
        const task = geoTasks[i];
        const area = await reverseGeocode(task.lat, task.lon);
        if (area) {
          if (task.field === 'pickup') {
            task.order.maidLocation = area;
            task.order.pickupArea = area;
          } else {
            task.order.clientLocation = area;
            task.order.clientArea = area;
            task.order.dropoffArea = area;
          }
        }
        if (i < geoTasks.length - 1) await new Promise(r => setTimeout(r, 1100));
      }

      // Merge with Supabase: prefer Supabase version for edited orders
      const allProcessed = [...STATIC_EXAMPLES, ...mapped];
      try {
        const sbOrders = await sbFetchOrders();
        const sbMap = new Map(sbOrders.map(o => [o.id || o.contractId, o]));

        // For API orders, use Supabase version if it exists (user may have edited it)
        const merged = allProcessed.map(o => {
          const oid = o.id || o.contractId;
          const sbVersion = sbMap.get(oid);
          return sbVersion || o;
        });

        // Add manual-only orders (not in API batch)
        const apiIds = new Set(allProcessed.map(o => o.id || o.contractId));
        const manualOnly = sbOrders.filter(o => !apiIds.has(o.id || o.contractId));

        setOrders([...merged, ...manualOnly]);

        // Upsert any new API orders that aren't in Supabase yet
        const newApiOrders = allProcessed.filter(o => !sbMap.has(o.id || o.contractId));
        if (newApiOrders.length > 0) {
          sbUpsertOrders(newApiOrders, 'api').catch(err => console.error('Supabase upsert orders failed:', err));
        }
      } catch {
        // Supabase unavailable — use API data directly
        setOrders(allProcessed);
        sbUpsertOrders(allProcessed, 'api').catch(err => console.error('Supabase upsert orders failed:', err));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      hasFetchedOnce.current = true;
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);

    // Note: orders realtime subscription is not needed here because
    // fetchOrders already runs every 10s and merges manual orders.
    // But we add it so manual orders from OTHER users appear faster.
  }, [fetchOrders]);

  // Realtime: when another user adds a manual order, merge it in
  useEffect(() => {
    const unsub = subscribeToOrders(async (payload) => {
      if (payload.eventType === 'INSERT' && payload.new?.source === 'manual') {
        const newOrder = payload.new.order_data;
        setOrders(prev => {
          if (prev.some(o => (o.id || o.contractId) === (newOrder.id || newOrder.contractId))) return prev;
          return [...prev, newOrder];
        });
      }
    });
    return () => unsub();
  }, []);

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
  const confirmOrder = useCallback(async (order, driverInfo, tripInfo) => {
    const orderId = order.id || order.contractId;
    const entry = {
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
    };
    // Optimistic local update
    setFollowUpOrders(prev => {
      if (prev.some(o => o.orderId === orderId)) return prev;
      return [...prev, entry];
    });
    setTripAssignments(prev => {
      const next = { ...prev };
      delete next[orderId];
      return next;
    });
    // Persist to Supabase
    try { await upsertFollowUpOrder(entry); } catch (err) { console.error('Supabase upsert follow-up order failed:', err); }
  }, []);

  const moveBackToWaiting = useCallback(async (orderId) => {
    // Optimistic local update
    setFollowUpOrders(prev => prev.filter(o => o.orderId !== orderId));
    setFollowUpData(prev => {
      const next = { ...prev };
      delete next[orderId];
      return next;
    });
    // Persist to Supabase (cascade deletes follow_up_data)
    try { await deleteFollowUpOrder(orderId); } catch (err) { console.error('Supabase delete follow-up order failed:', err); }
  }, []);

  const updateFollowUp = useCallback(async (orderId, data) => {
    // Optimistic local update
    setFollowUpData(prev => ({
      ...prev,
      [orderId]: { ...(prev[orderId] || {}), ...data },
    }));
    // Persist to Supabase
    try { await upsertFollowUpData(orderId, data); } catch (err) { console.error('Supabase upsert follow-up data failed:', err); }
  }, []);

  const completeFollowUp = useCallback(async (orderId) => {
    const fo = followUpOrders.find(o => o.orderId === orderId);
    if (!fo) return;
    const historyEntry = {
      ...fo,
      followUpData: followUpData[orderId] || {},
      completedAt: new Date().toISOString(),
    };
    // Optimistic local update
    setHistoryOrders(prev => {
      if (prev.some(h => h.orderId === orderId)) return prev;
      return [...prev, historyEntry];
    });
    setFollowUpOrders(prev => prev.filter(o => o.orderId !== orderId));
    setFollowUpData(prev => {
      const next = { ...prev };
      delete next[orderId];
      return next;
    });
    // Persist to Supabase
    try {
      await insertHistoryOrder(historyEntry);
      await deleteFollowUpOrder(orderId);
    } catch (err) { console.error('Supabase complete follow-up failed:', err); }
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

  const addManualOrder = useCallback(async (order) => {
    setOrders(prev => [...prev, order]);
    try { await sbUpsertOrder(order, 'manual'); } catch (err) { console.error('Supabase upsert manual order failed:', err); }
  }, []);

  const updateOrder = useCallback(async (orderId, updates) => {
    let mergedOrder = null;
    setOrders(prev => prev.map(o => {
      const oid = o.id || o.contractId;
      if (oid !== orderId) return o;
      mergedOrder = { ...o, ...updates };
      return mergedOrder;
    }));
    // Persist to Supabase
    if (mergedOrder) {
      try { await updateOrderInDb(mergedOrder); } catch (err) { console.error('Supabase update order failed:', err); }
    }
  }, []);

  const updateHistoryOrderData = useCallback(async (orderId, updates) => {
    let mergedOrder = null;
    setHistoryOrders(prev => prev.map(ho => {
      if (ho.orderId !== orderId) return ho;
      mergedOrder = { ...ho.order, ...updates };
      return { ...ho, order: mergedOrder };
    }));
    if (mergedOrder) {
      try { await updateHistoryOrder(orderId, mergedOrder); } catch (err) { console.error('Supabase update history order failed:', err); }
    }
  }, []);

  const updateFollowUpOrderInContext = useCallback(async (orderId, updates) => {
    let mergedOrder = null;
    setFollowUpOrders(prev => prev.map(fo => {
      if (fo.orderId !== orderId) return fo;
      mergedOrder = { ...fo.order, ...updates };
      return { ...fo, order: mergedOrder };
    }));
    if (mergedOrder) {
      try { await updateFollowUpOrderData(orderId, mergedOrder); } catch (err) { console.error('Supabase update follow-up order failed:', err); }
    }
  }, []);

  const deleteOrder = useCallback(async (orderId) => {
    setOrders(prev => prev.filter(o => (o.id || o.contractId) !== orderId));
    try { await deleteOrderFromDb(orderId); } catch (err) { console.error('Supabase delete order failed:', err); }
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
      addManualOrder,
      updateOrder,
      deleteOrder,
      updateHistoryOrderData,
      updateFollowUpOrderInContext,
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
