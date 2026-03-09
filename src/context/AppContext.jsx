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
  deleteHistoryOrder,
  fetchDrivers as sbFetchDrivers,
  upsertDrivers as sbUpsertDrivers,
  upsertDriver as sbUpsertDriver,
  deleteDriverFromDb,
  subscribeToDrivers,
  fetchTripAssignments as sbFetchTripAssignments,
  upsertTripAssignment,
  upsertTripAssignmentsBulk,
  deleteTripAssignment,
  subscribeToTripAssignments,
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

const DRIVER_VERSION = 2; // Bump to force localStorage reload

const INITIAL_DRIVERS = [
  { id: 'DRV-001', name: '506992368', phone: '506992368', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Al Barari', price: 300, reliability: 'High', active: true, notes: 'pick up 6:30 am and 8:15 am. second number to carlift 501286566' },
  { id: 'DRV-002', name: '50 128 6566', phone: '50 128 6566', vehicle: '', plate: '', pickupArea: 'Deira', dropArea: 'Al Barari', price: 300, reliability: 'High', active: true, notes: '' },
  { id: 'DRV-003', name: '525763287', phone: '525763287', vehicle: '', plate: '', pickupArea: 'Deira', dropArea: 'Arabian Ranches 2', price: 300, reliability: 'High', active: true, notes: '' },
  { id: 'DRV-004', name: '556949318', phone: '556949318', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Barsha South', price: 0, reliability: 'High', active: true, notes: '7 AM FROM SATWA TO BARCHA SOUTH, THEN FROM BARCHA 1 TO BUSSINESS BAY THEN FROM SATWA TO CITY WALK AND MEYDAN afternoon till 8pm' },
  { id: 'DRV-005', name: '+971 50 393 1667', phone: '+971 50 393 1667', vehicle: '', plate: '', pickupArea: 'Deira', dropArea: 'Arabian Ranches 3', price: 250, reliability: 'New', active: true, notes: '' },
  { id: 'DRV-006', name: '561633900', phone: '561633900', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Arabian Ranches 3 & Villanova', price: 350, reliability: 'High', active: true, notes: '' },
  { id: 'DRV-007', name: '525763287', phone: '525763287', vehicle: '', plate: '', pickupArea: 'Deira', dropArea: 'Arabian Ranches 3 & Villanova', price: 300, reliability: 'Low', active: true, notes: 'Call and confirm pick up location and cost' },
  { id: 'DRV-008', name: '554520081', phone: '554520081', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Arabian Ranches 3 & Villanova', price: 300, reliability: 'High', active: true, notes: 'Call and confirm pick up location and cost' },
  { id: 'DRV-009', name: '507785562', phone: '507785562', vehicle: '', plate: '', pickupArea: 'Satwa/Deira', dropArea: 'Arabian Ranches 3 & Villanova', price: 300, reliability: 'Low', active: true, notes: 'Call and confirm pick up location and cost' },
  { id: 'DRV-010', name: '552143344', phone: '552143344', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Nad al Sheba 4', price: 250, reliability: 'Low', active: true, notes: 'Call and confirm pick up location and cost' },
  { id: 'DRV-011', name: '555656254', phone: '555656254', vehicle: '', plate: '', pickupArea: 'Sharjah', dropArea: 'DIP', price: 500, reliability: 'Low', active: true, notes: 'Call and confirm pick up location and cost - 524315092' },
  { id: 'DRV-012', name: '581151191', phone: '581151191', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Damac Hills 1', price: 0, reliability: 'New', active: true, notes: '' },
  { id: 'DRV-013', name: '505093921', phone: '505093921', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Damac Hills 1', price: 400, reliability: 'Low', active: true, notes: '' },
  { id: 'DRV-014', name: '588504524', phone: '588504524', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Damac Hills 1', price: 600, reliability: 'High', active: true, notes: 'ONLY PICK UP FROM SATWA 6AM' },
  { id: 'DRV-015', name: '568060156', phone: '568060156', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Damac Hills 1', price: 300, reliability: 'High', active: true, notes: '' },
  { id: 'DRV-016', name: '555656254', phone: '555656254', vehicle: '', plate: '', pickupArea: 'Deira', dropArea: 'Damac Hills 1', price: 0, reliability: 'Low', active: true, notes: 'Call and confirm pick up location and cost - 524315092' },
  { id: 'DRV-017', name: '568757592', phone: '568757592', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Damac Hills 2', price: 500, reliability: 'High', active: true, notes: 'Call and confirm pick up location and cost' },
  { id: 'DRV-018', name: '568060156', phone: '568060156', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Damac Hills 2', price: 250, reliability: 'Low', active: true, notes: 'Call and confirm pick up location and cost' },
  { id: 'DRV-019', name: '507605903', phone: '507605903', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Damac Hills 2', price: 600, reliability: 'Low', active: true, notes: 'Call and confirm pick up location and cost' },
  { id: 'DRV-020', name: '558471126', phone: '558471126', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Creek Harbour', price: 250, reliability: 'High', active: true, notes: '' },
  { id: 'DRV-021', name: '568060156', phone: '568060156', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Creek Harbour', price: 80, reliability: 'High', active: true, notes: '(kashmir) Pickup: satwa at 6/7/8/9/10 am Return: From creek harbour at 4/5/6/7/8/9/10 pm' },
  { id: 'DRV-022', name: '568757592', phone: '568757592', vehicle: '', plate: '', pickupArea: 'Satwa/Deira', dropArea: 'Creek Harbour', price: 200, reliability: 'High', active: true, notes: 'CONFIRMED' },
  { id: 'DRV-023', name: '507007869', phone: '507007869', vehicle: '', plate: '', pickupArea: 'Deira and Satwa', dropArea: 'Creek Harbour', price: 250, reliability: 'High', active: true, notes: '' },
  { id: 'DRV-024', name: '545369913', phone: '545369913', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Dubai Hills', price: 250, reliability: 'New', active: true, notes: 'have night shift and morning shift' },
  { id: 'DRV-025', name: '507785563', phone: '507785563', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Dubai Hills', price: 250, reliability: 'High', active: true, notes: 'all times' },
  { id: 'DRV-026', name: '586660527', phone: '586660527', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Dubai Hills', price: 250, reliability: 'High', active: true, notes: 'has 7 in the morning (and other times) and 7 in the night (and other times)' },
  { id: 'DRV-027', name: '529777185', phone: '529777185', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Dubai Hills', price: 0, reliability: 'Low', active: true, notes: 'Call and confirm pick up location and cost' },
  { id: 'DRV-028', name: '522661774', phone: '522661774', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Dubai Hills', price: 0, reliability: 'Low', active: true, notes: 'Call and confirm pick up location and cost' },
  { id: 'DRV-029', name: '525296101', phone: '525296101', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Dubai Hills', price: 200, reliability: 'High', active: true, notes: '' },
  { id: 'DRV-030', name: '528512112', phone: '528512112', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Dubai Hills', price: 0, reliability: 'Low', active: true, notes: '' },
  { id: 'DRV-031', name: '582992757', phone: '582992757', vehicle: '', plate: '', pickupArea: 'Al Barsha', dropArea: 'Dubai Hills', price: 150, reliability: 'High', active: true, notes: 'Call and confirm pick up location and cost' },
  { id: 'DRV-032', name: '555656254', phone: '555656254', vehicle: '', plate: '', pickupArea: 'Deira', dropArea: 'Dubai Internet City', price: 500, reliability: 'Low', active: true, notes: 'Call and confirm pick up location and cost - 524315092' },
  { id: 'DRV-033', name: '561079413', phone: '561079413', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Dubai Investment Park', price: 350, reliability: 'High', active: true, notes: 'Whatsapp is 523160463' },
  { id: 'DRV-034', name: '563040953', phone: '563040953', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Dubai Investment Park', price: 0, reliability: 'Low', active: true, notes: 'Call and confirm pick up location and cost' },
  { id: 'DRV-035', name: '555656254', phone: '555656254', vehicle: '', plate: '', pickupArea: 'Deira', dropArea: 'Dubai Investment Park', price: 500, reliability: 'Low', active: true, notes: 'Call and confirm pick up location and cost - 524315092' },
  { id: 'DRV-036', name: '526517788', phone: '526517788', vehicle: '', plate: '', pickupArea: 'Al Khail Gate (Al Quoz)', dropArea: 'Dubai Marina', price: 300, reliability: 'High', active: true, notes: '' },
  { id: 'DRV-037', name: '547610564', phone: '547610564', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Dubai Marina', price: 500, reliability: 'High', active: true, notes: '' },
  { id: 'DRV-038', name: '553043290', phone: '553043290', vehicle: '', plate: '', pickupArea: 'Deira', dropArea: 'Dubai Silicon Oasis (DSO)', price: 350, reliability: 'High', active: true, notes: 'Call and confirm pick up location and cost' },
  { id: 'DRV-039', name: '568615411', phone: '568615411', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Eden The Valley', price: 500, reliability: 'High', active: true, notes: 'Whatsapp Only' },
  { id: 'DRV-040', name: '559265818', phone: '559265818', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'JBR Blue Water', price: 320, reliability: 'High', active: true, notes: '' },
  { id: 'DRV-041', name: '529718080', phone: '529718080', vehicle: '', plate: '', pickupArea: 'Al Rigga', dropArea: 'JBR', price: 300, reliability: 'Low', active: true, notes: 'Call and confirm pick up location and cost' },
  { id: 'DRV-042', name: '505351783', phone: '505351783', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'JLT', price: 300, reliability: 'High', active: true, notes: '6:50 pick up in front of al maya to arrive at 8 AM' },
  { id: 'DRV-043', name: '521105779', phone: '521105779', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'JLT', price: 300, reliability: 'High', active: true, notes: '' },
  { id: 'DRV-044', name: '555656254', phone: '555656254', vehicle: '', plate: '', pickupArea: 'Deira', dropArea: 'JLT', price: 500, reliability: 'Low', active: true, notes: 'Call and confirm pick up location and cost - 524315092' },
  { id: 'DRV-045', name: '528129966', phone: '528129966', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Jumeirah Park', price: 600, reliability: 'Low', active: true, notes: 'Call and confirm pick up location and cost' },
  { id: 'DRV-046', name: '522160392', phone: '522160392', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Jumeirah Park', price: 300, reliability: 'High', active: true, notes: '7-9-10 AM evening 4 6 10 12 PM' },
  { id: 'DRV-047', name: '524743751', phone: '524743751', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Jumeirah Park', price: 600, reliability: 'High', active: true, notes: 'from satwa max metro station at 7AM/9am and from JVT or Jumeirah park 5PM / 8 pm WhatsApp:0508819469' },
  { id: 'DRV-048', name: '563723501', phone: '563723501', vehicle: '', plate: '', pickupArea: 'Al Barsha', dropArea: 'JVC', price: 0, reliability: 'New', active: true, notes: '' },
  { id: 'DRV-049', name: '567410476', phone: '567410476', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'JVC', price: 600, reliability: 'High', active: true, notes: 'can do 6AM max 6:30 5 days a week' },
  { id: 'DRV-050', name: '564950851', phone: '564950851', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'JVC', price: 300, reliability: 'Low', active: true, notes: 'Call and confirm pick up location and cost - Carlift confirmed' },
  { id: 'DRV-051', name: '551278992', phone: '551278992', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'JVC', price: 300, reliability: 'Low', active: true, notes: 'Call and confirm pick up location and cost' },
  { id: 'DRV-052', name: '555480600', phone: '555480600', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'JVC', price: 300, reliability: 'High', active: true, notes: '7/8/9/10 am and pick up 4/5/6/7/10/12 pm (answers via calls)' },
  { id: 'DRV-053', name: '545250710', phone: '545250710', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'JVC', price: 600, reliability: 'Low', active: true, notes: 'Call and confirm pick up location and cost' },
  { id: 'DRV-054', name: '505860473', phone: '505860473', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'JVC', price: 600, reliability: 'Low', active: true, notes: 'Call and confirm pick up location and cost' },
  { id: 'DRV-055', name: '521105779', phone: '521105779', vehicle: '', plate: '', pickupArea: 'DMCC Metro Station', dropArea: 'JVC', price: 300, reliability: 'High', active: true, notes: 'ALAM express - Deira Rigga to JVC Circle Mall JLT DMCC ALAM express 7, 8, 9, 10 AM arrival times' },
  { id: 'DRV-056', name: '521105779', phone: '521105779', vehicle: '', plate: '', pickupArea: 'Deira', dropArea: 'JVC', price: 300, reliability: 'High', active: true, notes: '4, 5, 6, 7, 10, 12 PM drop-off times' },
  { id: 'DRV-057', name: '504986218', phone: '504986218', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Jumeirah Park and JVT / Hills', price: 600, reliability: 'High', active: true, notes: 'pick up 6:30 am / 9 am pick up / 5 pm 7pm and 8pm' },
  { id: 'DRV-058', name: '524743751', phone: '524743751', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'JVT', price: 700, reliability: 'Low', active: true, notes: 'Call and confirm pick up location and cost' },
  { id: 'DRV-059', name: '524743751', phone: '524743751', vehicle: '', plate: '', pickupArea: 'DMCC Metro Station', dropArea: 'JVT', price: 500, reliability: 'Low', active: true, notes: 'Call and confirm pick up location and cost' },
  { id: 'DRV-060', name: '568153115', phone: '568153115', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'MAG EYE', price: 400, reliability: 'High', active: true, notes: 'pick up from satwa times: 6, 7, 8, 9, 10, 12 AM drop off times from MAG city: 4:30, 6, 7, 8, 9, 10, 11 PM' },
  { id: 'DRV-061', name: '506846201', phone: '506846201', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Meydan (Nad Al Sheba 1)', price: 600, reliability: 'High', active: true, notes: 'pick up 8:30 to 7:30' },
  { id: 'DRV-062', name: '563625675', phone: '563625675', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Meydan (Nad Al Sheba 1)', price: 200, reliability: 'High', active: true, notes: 'STAMPING THE AGREEMENT IS SUPER IMPORTANT FOR HIM (Morning Satwa 7.am 9.20.am 11.10am 12.15pm) (drop off 6pm 8pm 10pm)' },
  { id: 'DRV-063', name: '545960726', phone: '545960726', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Meydan (Nad Al Sheba 1)', price: 400, reliability: 'High', active: true, notes: 'TESTING - 6:30AM to 5PM and 10 am to 9 pm' },
  { id: 'DRV-064', name: '508823438', phone: '508823438', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Mirdif', price: 300, reliability: 'Low', active: true, notes: 'Call and confirm pick up location and cost' },
  { id: 'DRV-065', name: '524222718', phone: '524222718', vehicle: '', plate: '', pickupArea: 'Deira', dropArea: 'Mirdif', price: 0, reliability: 'New', active: true, notes: '' },
  { id: 'DRV-066', name: '501247845', phone: '501247845', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Mudon', price: 300, reliability: 'New', active: true, notes: 'Call and confirm pick up location and cost' },
  { id: 'DRV-067', name: '528129966', phone: '528129966', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Mudon', price: 500, reliability: 'Low', active: true, notes: 'Call and confirm pick up location and cost' },
  { id: 'DRV-068', name: '557605277', phone: '557605277', vehicle: '', plate: '', pickupArea: 'Deira', dropArea: 'Palm Jumeirah', price: 350, reliability: 'High', active: true, notes: 'Only morning / 55 358 6999 active number' },
  { id: 'DRV-069', name: '553586999', phone: '553586999', vehicle: '', plate: '', pickupArea: 'Deira', dropArea: 'Palm Jumeirah', price: 350, reliability: 'High', active: true, notes: 'FAYAZ EXPRESS' },
  { id: 'DRV-070', name: '559335680', phone: '559335680', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Palm Jumeirah', price: 380, reliability: 'High', active: true, notes: 'Goes to the Fronds' },
  { id: 'DRV-071', name: '554998808', phone: '554998808', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Palm Jumeirah', price: 350, reliability: 'High', active: true, notes: 'Call and confirm pick up location and cost' },
  { id: 'DRV-072', name: '553627286', phone: '553627286', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Palm Jumeirah', price: 400, reliability: 'High', active: true, notes: '' },
  { id: 'DRV-073', name: '567724136', phone: '567724136', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Palm Jumeirah', price: 350, reliability: 'Low', active: true, notes: 'Call and confirm pick up location and cost' },
  { id: 'DRV-074', name: '502655804', phone: '502655804', vehicle: '', plate: '', pickupArea: 'Al Barsha', dropArea: 'Palm Jumeirah', price: 200, reliability: 'High', active: true, notes: '' },
  { id: 'DRV-075', name: '554141086', phone: '554141086', vehicle: '', plate: '', pickupArea: 'Dubai Internet City', dropArea: 'Palm Jumeirah', price: 500, reliability: 'Low', active: true, notes: 'Goes to the Fronds' },
  { id: 'DRV-076', name: '528597183', phone: '528597183', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Sharjah', price: 500, reliability: 'High', active: true, notes: '' },
  { id: 'DRV-077', name: '553738761', phone: '553738761', vehicle: '', plate: '', pickupArea: 'International City', dropArea: 'JLT', price: 300, reliability: 'Low', active: true, notes: 'Call and confirm pick up location and cost' },
  { id: 'DRV-078', name: '527472162', phone: '527472162', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Meadows', price: 300, reliability: 'High', active: true, notes: '' },
  { id: 'DRV-079', name: '522160350', phone: '522160350', vehicle: '', plate: '', pickupArea: 'Satwa/Deira', dropArea: 'Springs', price: 300, reliability: 'High', active: true, notes: 'Call and confirm pick up location and cost' },
  { id: 'DRV-080', name: '521757026', phone: '521757026', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Springs', price: 300, reliability: 'High', active: true, notes: 'only calls / 5/8/9/10 pick up' },
  { id: 'DRV-081', name: '555656254', phone: '555656254', vehicle: '', plate: '', pickupArea: 'Deira', dropArea: 'Sports City', price: 500, reliability: 'Low', active: true, notes: 'Call and confirm pick up location and cost - 524315092' },
  { id: 'DRV-082', name: '502267000', phone: '502267000', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Motor City', price: 300, reliability: 'New', active: true, notes: '' },
  { id: 'DRV-083', name: '501151191', phone: '501151191', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Motor City', price: 300, reliability: 'New', active: true, notes: '' },
  { id: 'DRV-084', name: '505093921', phone: '505093921', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Studio City + Motor City', price: 300, reliability: 'High', active: true, notes: '' },
  { id: 'DRV-085', name: '569889788', phone: '569889788', vehicle: '', plate: '', pickupArea: '', dropArea: 'Motor City + Damac Hills', price: 400, reliability: 'New', active: true, notes: '' },
  { id: 'DRV-086', name: '555656254', phone: '555656254', vehicle: '', plate: '', pickupArea: 'Deira', dropArea: 'Studio City', price: 500, reliability: 'Low', active: true, notes: 'Call and confirm pick up location and cost - 524315092' },
  { id: 'DRV-087', name: '525763287', phone: '525763287', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'The Sustainable City', price: 300, reliability: 'High', active: true, notes: 'Only to the Main Entrance' },
  { id: 'DRV-088', name: '502609947', phone: '502609947', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'The Villa', price: 600, reliability: 'Low', active: true, notes: 'Call and confirm pick up location and cost' },
  { id: 'DRV-089', name: '507605903', phone: '507605903', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'The Villa', price: 600, reliability: 'Low', active: true, notes: 'Call and confirm pick up location and cost' },
  { id: 'DRV-090', name: '525763287', phone: '525763287', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Townsquare', price: 300, reliability: 'High', active: true, notes: '7AM, 8AM, 9AM pick up - 5PM, 6PM, 7PM drop off' },
  { id: 'DRV-091', name: '525752805', phone: '525752805', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Townsquare', price: 300, reliability: 'High', active: true, notes: '10 to 10 or 10 to 6' },
  { id: 'DRV-092', name: '501247845', phone: '501247845', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Townsquare', price: 300, reliability: 'High', active: true, notes: 'Most Reliable' },
  { id: 'DRV-093', name: '522160350', phone: '522160350', vehicle: '', plate: '', pickupArea: 'Satwa/Deira', dropArea: 'VIDA Emirates Hills', price: 300, reliability: 'Low', active: true, notes: 'Call and confirm pick up location and cost' },
  { id: 'DRV-094', name: '561633900', phone: '561633900', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Wadi Al Safa 5 & Dubailand', price: 350, reliability: 'Low', active: true, notes: 'Call and confirm pick up location and cost' },
  { id: 'DRV-095', name: '501247845', phone: '501247845', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Wadi Al Safa 7', price: 300, reliability: 'High', active: true, notes: 'pick up point in satwa is at the back side of al maya, and drop point is in serena market' },
  { id: 'DRV-096', name: '558098007', phone: '558098007', vehicle: '', plate: '', pickupArea: 'Al Barsha', dropArea: 'Tilal Al Ghaf', price: 500, reliability: 'Low', active: true, notes: 'Call and confirm pick up location and cost' },
  { id: 'DRV-097', name: '522610897', phone: '522610897', vehicle: '', plate: '', pickupArea: 'Al Quoz', dropArea: 'Tilal Al Ghaf', price: 600, reliability: 'High', active: true, notes: '7:30 AM to 7 or 8 or 9 PM (will come back to work 9/1)' },
  { id: 'DRV-098', name: '508772614', phone: '508772614', vehicle: '', plate: '', pickupArea: 'Satwa, Rigga, Karama', dropArea: 'Tilal Al Ghaf + Victory Heights + Sport City', price: 300, reliability: 'High', active: true, notes: 'the timing and the agreement on the right, he only drops off at (carrefour area) on the highway' },
  { id: 'DRV-099', name: '557128445', phone: '557128445', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Motor City / Studio City / Sports City / Tilal Al Ghaf', price: 300, reliability: 'High', active: true, notes: '' },
  { id: 'DRV-100', name: '506992368', phone: '506992368', vehicle: '', plate: '', pickupArea: '', dropArea: 'Al Barari', price: 300, reliability: 'Low', active: true, notes: '' },
  { id: 'DRV-101', name: '567410476', phone: '567410476', vehicle: '', plate: '', pickupArea: '67MC+MQH Dubai', dropArea: 'Jumeirah Park', price: 600, reliability: 'Low', active: true, notes: 'we need to try it (5 to 7)' },
  { id: 'DRV-102', name: '529380774', phone: '529380774', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Jumeirah Golf Estate', price: 0, reliability: 'Low', active: true, notes: '' },
  { id: 'DRV-103', name: '600 511 115', phone: '600 511 115', vehicle: '', plate: '', pickupArea: 'Community bus', dropArea: 'Yas Island', price: 0, reliability: 'High', active: true, notes: 'community bus for yas island' },
  { id: 'DRV-104', name: '562424394', phone: '562424394', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'The Valley by Emaar', price: 350, reliability: 'High', active: true, notes: '' },
  { id: 'DRV-105', name: '559951443', phone: '559951443', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Downtown', price: 200, reliability: 'High', active: true, notes: 'in Ramadan morning 7:30 8 9 10 - evening 3 - 4 - 5 after Ramadan morning 7:30 8 9 10 evening 5 6 7' },
  { id: 'DRV-106', name: '502168958', phone: '502168958', vehicle: '', plate: '', pickupArea: 'City Centre Sharjah', dropArea: 'Serena Community', price: 900, reliability: 'New', active: true, notes: '' },
  { id: 'DRV-107', name: '505969393', phone: '505969393', vehicle: '', plate: '', pickupArea: 'Safun DHM', dropArea: 'Dubai Hills', price: 300, reliability: 'New', active: true, notes: '0505969393 / 0586181071' },
  { id: 'DRV-108', name: '506538575', phone: '506538575', vehicle: '', plate: '', pickupArea: 'Starline ALFURJAN Satwa', dropArea: 'Nakheel Mall - Palm Jumeirah', price: 300, reliability: 'New', active: true, notes: '' },
  { id: 'DRV-109', name: '523998487', phone: '523998487', vehicle: '', plate: '', pickupArea: 'Al Maya - Satwa', dropArea: 'JVC', price: 300, reliability: 'New', active: true, notes: '' },
  { id: 'DRV-110', name: '524666302', phone: '524666302', vehicle: '', plate: '', pickupArea: 'Satwa-Deira', dropArea: 'Arjan', price: 250, reliability: 'New', active: true, notes: 'Car lift Name: Abdullah - pickup available every hour starting 5:30AM' },
  { id: 'DRV-111', name: '525396204', phone: '525396204', vehicle: '', plate: '', pickupArea: 'Union Metro Station - Deira', dropArea: 'Dubai Hills', price: 300, reliability: 'High', active: true, notes: 'Car lift Name: Alamexpress99 | NA, texted him on WA' },
  { id: 'DRV-112', name: '552306994', phone: '552306994', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Arabian Ranches | Carrefour', price: 750, reliability: 'New', active: true, notes: '' },
  { id: 'DRV-113', name: '553737604', phone: '553737604', vehicle: '', plate: '', pickupArea: 'Satwa Big Mosque', dropArea: 'Sobha Hartland & Azizi Riviera', price: 150, reliability: 'New', active: true, notes: 'Car lift Name: Haroon | pickup every hour starting 6AM, Returning every hour starting 5pm' },
  { id: 'DRV-114', name: '554570081', phone: '554570081', vehicle: '', plate: '', pickupArea: 'Rigga/Deira', dropArea: 'Villanova', price: 350, reliability: 'New', active: true, notes: 'Car lift Name: Amer Khan | Departs: 6:45 7:45AM - Returns: 7PM 9PM' },
  { id: 'DRV-115', name: '556785466', phone: '556785466', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Dubai Hills', price: 250, reliability: 'New', active: true, notes: 'Car lift Name: Shakir Khan' },
  { id: 'DRV-116', name: '557123799', phone: '557123799', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Downtown', price: 300, reliability: 'New', active: true, notes: '24 hour service' },
  { id: 'DRV-117', name: '557123799', phone: '557123799', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Palm Jumeirah', price: 300, reliability: 'New', active: true, notes: 'Car lift Name: Imtiyaz' },
  { id: 'DRV-118', name: '559911906', phone: '559911906', vehicle: '', plate: '', pickupArea: 'Rigga/Deira', dropArea: 'Palm Jumeirah (inside)', price: 400, reliability: 'New', active: true, notes: 'Car lift Name: Imtiyaz' },
  { id: 'DRV-119', name: '586587582', phone: '586587582', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Palm Jumeirah Fronds', price: 350, reliability: 'New', active: true, notes: 'Car lift Name: Al Furjan' },
  { id: 'DRV-120', name: '501914838', phone: '501914838', vehicle: '', plate: '', pickupArea: 'Deira', dropArea: 'The Greens', price: 0, reliability: 'New', active: true, notes: 'To call at 4PM so we can speak the manager/coordinator' },
  { id: 'DRV-121', name: '545292312', phone: '545292312', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Polo Meydan', price: 450, reliability: 'New', active: true, notes: 'Called NA/ texted on WA | Sheik, +971 54 529 2312, Satwa to Polo Meydan, 450 dirham per month' },
  { id: 'DRV-122', name: '506181943', phone: '506181943', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Damac Hills', price: 500, reliability: 'New', active: true, notes: 'Car lift Name: Habib | should check if he has space 1st (car not van) 6AM-7PM' },
  { id: 'DRV-123', name: '501455084', phone: '501455084', vehicle: '', plate: '', pickupArea: 'Barsha', dropArea: 'Jumeirah Golf Estates', price: 500, reliability: 'New', active: true, notes: 'from 7 AM to 7 PM' },
  { id: 'DRV-124', name: '501455084', phone: '501455084', vehicle: '', plate: '', pickupArea: 'Quoz', dropArea: 'Jumeirah Golf Estates', price: 500, reliability: 'New', active: true, notes: 'from 7 AM to 7 PM (flexible)' },
  { id: 'DRV-125', name: '568757592', phone: '568757592', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Damac Hills 2', price: 500, reliability: 'New', active: true, notes: '7 am to 5 pm' },
  { id: 'DRV-126', name: '50 593 8554', phone: '50 593 8554', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'AR3', price: 300, reliability: 'High', active: true, notes: '' },
  { id: 'DRV-127', name: '545266601', phone: '545266601', vehicle: '', plate: '', pickupArea: 'Satwa', dropArea: 'Bluewater Island Dubai', price: 300, reliability: 'High', active: true, notes: '' },
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

// Reverse geocode cache — persisted to localStorage so it survives page refreshes
const GEO_CACHE_STORAGE_KEY = 'carlift_geocache';
const GEO_CACHE_VERSION = 2; // bump to invalidate old cache with "Al " prefixed values
const geoCacheRaw = loadFromStorage(GEO_CACHE_STORAGE_KEY, {});
const geoCache = (geoCacheRaw._v === GEO_CACHE_VERSION) ? geoCacheRaw : { _v: GEO_CACHE_VERSION };
function persistGeoCache() {
  saveToStorage(GEO_CACHE_STORAGE_KEY, geoCache);
}
if (geoCacheRaw._v !== GEO_CACHE_VERSION) persistGeoCache(); // clear stale cache
// Track which order+field combos have already been geocoded so we don't redo them
const geocodedKeys = new Set();
// Prevent concurrent fetchOrders from overlapping geocode work
let isFetchingOrders = false;

/**
 * Parse DMS coordinates from text, e.g. 25°14'28.3"N 55°17'04.1"E
 */
function parseDMS(text) {
  const dmsRe = /(\d+)°(\d+)[''′](\d+\.?\d*)[""″]([NS])\s*(\d+)°(\d+)[''′](\d+\.?\d*)[""″]([EW])/;
  const m = text.match(dmsRe);
  if (!m) return null;
  let lat = +m[1] + +m[2] / 60 + +m[3] / 3600;
  let lon = +m[5] + +m[6] / 60 + +m[7] / 3600;
  if (m[4] === 'S') lat = -lat;
  if (m[8] === 'W') lon = -lon;
  return { lat, lon };
}

/**
 * Extract lat/lon from any text: DMS, decimal pairs, Google Maps URLs, etc.
 * Returns { lat, lon } or null.
 */
function extractCoords(text) {
  if (!text) return null;
  const dms = parseDMS(text);
  if (dms) return dms;

  // Google Maps URL patterns: @lat,lon or q=lat,lon or ll=lat,lon or /place/lat,lon
  const urlPatterns = [
    /@(-?\d+\.\d+),(-?\d+\.\d+)/,
    /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/,
    /[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/,
    /\/place\/(-?\d+\.\d+),(-?\d+\.\d+)/,
  ];
  for (const re of urlPatterns) {
    const m = text.match(re);
    if (m) {
      const lat = +m[1], lon = +m[2];
      if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) return { lat, lon };
    }
  }

  // General decimal pair: 25.123, 55.456 (2+ decimal places)
  const decMatch = text.match(/(-?\d{1,3}\.\d{2,})\s*[,\s]\s*(-?\d{1,3}\.\d{2,})/);
  if (decMatch) {
    const lat = +decMatch[1], lon = +decMatch[2];
    if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) return { lat, lon };
  }

  return null;
}

// Known Dubai/UAE area keywords for fallback extraction from raw text
const KNOWN_AREAS = [
  // Multi-word areas (check these first — longer matches take priority)
  'Victory Heights', 'Arabian Ranches', 'Palm Jumeirah', 'Business Bay', 'Silicon Oasis',
  'Sports City', 'Motor City', 'International City', 'Discovery Gardens', 'Dubai Hills',
  'Dubai Marina', 'Dubai Downtown', 'Barsha Heights', 'Emirates Hills', 'Damac Hills',
  'Town Square', 'Townsquare', 'Tilal Al Ghaf', 'Nad Al Sheba', 'Yas Island', 'Khalifa City',
  'Dubai Land', 'Dubailand', 'Creek Beach', 'Creek Harbour', 'Al Raha Beach', 'Wadi Al Safa',
  'Bur Dubai', 'Al Barsha', 'Al Quoz', 'Al Nahda', 'Al Jafiliya', 'Al Jaffiliya',
  'Al Rigga', 'Al Mankhool', 'Al Garhoud', 'Al Muhaisnah', 'Al Qusais', 'Al Safa',
  'Al Wasl', 'Al Satwa', 'Al Furjan', 'Al Reef', 'Al Murar', 'Al Danah', 'Al Bada',
  'Al Muneera', 'Al Rahba', 'Al Ranim', 'Al Khail', 'Al Reem', 'Al Reem Island',
  'Abu Hail', 'Umm Suqeim', 'Umm Ramool', 'Um Ramool', 'Oud Metha',
  'Jumeirah Garden City', 'Jumeirah Park', 'Jumeirah Village', 'Jumeirah Islands',
  'Jumeirah Golf Estates', 'Studio City', 'Dubai Investment Park',
  'Sobha Hartland', 'Mohammed Bin Rashid City', 'MBR City', 'City Walk', 'Bluewaters',
  'Reem Island', 'Saadiyat Island', 'Yas Acres', 'Yas Aspens',
  'Meydan', 'Polo Residence', 'Serena', 'The Valley', 'Eden',
  'Mag Eye', 'MAG City', 'The Sustainable City',
  'The Villa', 'The Springs', 'The Meadows', 'The Lakes', 'The Greens', 'The Views',
  'Azizi Riviera', 'Sobha Reserve',
  'Al Seef', 'Seef Village', 'Raha Beach', 'Al Raha',
  // Abu Dhabi areas
  'Reem', 'Danah', 'Saadiyat', 'Yas', 'Corniche', 'Musaffah', 'Mussafah',
  'Khalifa City', 'Mohamed Bin Zayed City', 'MBZ City', 'Al Shamkha',
  'Al Reef Villas', 'Al Raha Gardens', 'Masdar City',
  // Single-word areas
  'JLT', 'JVC', 'JVT', 'JBR', 'DIFC', 'DIP', 'DSO', 'Downtown', 'Marina', 'Satwa', 'Deira', 'Naif',
  'Karama', 'Mirdif', 'Rashidiya', 'Jumeirah', 'Jumeriah', 'Arjan', 'Tecom',
  'Greens', 'Views', 'Springs', 'Meadows', 'Lakes', 'Remraam', 'Mudon', 'Layan',
  'Villanova', 'Warsan', 'Saadiyat', 'Sidra', 'Sharjah', 'Ajman',
  'Barsha', 'Quoz', 'Nahda', 'Mamzar', 'Warqa', 'Twar', 'Muhaisnah', 'Muteena',
  'Seef', 'Accommodation',
];

// Sort KNOWN_AREAS by length descending so longer matches win (e.g. "Yas Island" before "Yas")
const KNOWN_AREAS_SORTED = [...KNOWN_AREAS].sort((a, b) => b.length - a.length);

/**
 * Strip "Al " / "The " prefix so "Al Barsha" and "Barsha" group together.
 */
function stripAreaPrefix(name) {
  if (!name) return name;
  return name.replace(/^(Al |The )/i, '').trim();
}

/**
 * Scan raw text for a known Dubai area name. Returns the longest match (prefix-stripped) or null.
 */
function findKnownArea(text) {
  if (!text) return null;
  const upper = text.toUpperCase();
  for (const area of KNOWN_AREAS_SORTED) {
    if (upper.includes(area.toUpperCase())) return stripAreaPrefix(area);
  }
  return null;
}

async function reverseGeocode(lat, lon) {
  if (!lat || !lon) return null;
  const key = `${lat.toFixed(4)},${lon.toFixed(4)}`;
  if (geoCache[key]) return geoCache[key];

  // Helper: fetch Nominatim at a given zoom and try to match a known area
  async function tryZoom(zoom) {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=${zoom}&addressdetails=1`,
      { headers: { 'User-Agent': 'CarliftOps/1.0' } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const addr = data.address || {};
    const candidates = [
      addr.neighbourhood, addr.residential, addr.quarter,
      addr.suburb, addr.hamlet, addr.village,
      addr.town, addr.city_district, data.name,
      data.display_name,
    ].filter(Boolean);
    const allText = candidates.join(' ');
    return findKnownArea(allText);
  }

  try {
    // Try progressively broader zoom levels until we match a known area
    // zoom 16 = neighbourhood, 14 = suburb, 12 = district, 10 = city
    for (const zoom of [16, 14, 12, 10]) {
      const matched = await tryZoom(zoom);
      if (matched) {
        geoCache[key] = matched;
        persistGeoCache();
        return matched;
      }
      // Rate limit between Nominatim calls
      await new Promise(r => setTimeout(r, 1100));
    }
    return null; // No known area found at any zoom — don't cache junk
  } catch {
    return null;
  }
}

export function AppProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drivers, setDrivers] = useState(() => {
    // Start with localStorage as fallback; Supabase load will override on mount
    const storedVersion = loadFromStorage('carlift_drivers_version', 0);
    if (storedVersion < DRIVER_VERSION) {
      saveToStorage('carlift_drivers_version', DRIVER_VERSION);
      saveToStorage('carlift_drivers', INITIAL_DRIVERS);
      return INITIAL_DRIVERS;
    }
    return loadFromStorage('carlift_drivers', INITIAL_DRIVERS);
  });
  const driversLoadedFromDb = useRef(false);
  const [followUpOrders, setFollowUpOrders] = useState([]);
  const [followUpData, setFollowUpData] = useState({});
  // Track confirmed driver assignments per order so TripCard state survives re-clustering
  const [tripAssignments, setTripAssignments] = useState(() => loadFromStorage('carlift_trip_assignments', {}));
  const tripAssignmentsLoadedFromDb = useRef(false);
  const [historyOrders, setHistoryOrders] = useState([]);
  // Track manually deleted order IDs so the API re-fetch doesn't bring them back
  const deletedOrderIdsRef = useRef(new Set(loadFromStorage('carlift_deleted_orders', [])));

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

  const refreshDrivers = useCallback(async () => {
    try {
      const data = await sbFetchDrivers();
      if (data && data.length > 0) {
        setDrivers(data);
        driversLoadedFromDb.current = true;
      } else if (!driversLoadedFromDb.current) {
        // First time: DB is empty, seed it with INITIAL_DRIVERS
        await sbUpsertDrivers(INITIAL_DRIVERS);
        driversLoadedFromDb.current = true;
      }
    } catch (err) {
      console.error('Failed to load drivers from Supabase:', err);
    }
  }, []);

  const refreshTripAssignments = useCallback(async () => {
    try {
      const data = await sbFetchTripAssignments();
      setTripAssignments(data);
      tripAssignmentsLoadedFromDb.current = true;
    } catch (err) {
      console.error('Failed to load trip assignments from Supabase:', err);
    }
  }, []);

  useEffect(() => {
    // Initial load from Supabase
    refreshFollowUp();
    refreshHistory();
    refreshDrivers();
    refreshTripAssignments();

    // Realtime: re-fetch on any change so all clients stay in sync
    const unsubFollowUp = subscribeToFollowUp(() => refreshFollowUp());
    const unsubHistory = subscribeToHistory(() => refreshHistory());
    const unsubDrivers = subscribeToDrivers(() => refreshDrivers());
    const unsubTrips = subscribeToTripAssignments(() => refreshTripAssignments());

    return () => {
      unsubFollowUp();
      unsubHistory();
      unsubDrivers();
      unsubTrips();
    };
  }, [refreshFollowUp, refreshHistory, refreshDrivers, refreshTripAssignments]);

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

    // Extract lat/long from API fields, or from address text (URLs, DMS, decimal)
    let maidLat = raw.maidLat && raw.maidLat !== -1 ? raw.maidLat : null;
    let maidLong = raw.maidLong && raw.maidLong !== -1 ? raw.maidLong : null;
    let clientLat = raw.clientLat && raw.clientLat !== -1 ? raw.clientLat : null;
    let clientLong = raw.clientLong && raw.clientLong !== -1 ? raw.clientLong : null;

    if (!maidLat && raw.maidAddress) {
      const coords = extractCoords(raw.maidAddress);
      if (coords) { maidLat = coords.lat; maidLong = coords.lon; }
    }
    if (!clientLat && raw.ClientAddress) {
      const coords = extractCoords(raw.ClientAddress);
      if (coords) { clientLat = coords.lat; clientLong = coords.lon; }
    }

    // For display: full cleaned address. For clustering: just the area name.
    // Try findKnownArea first (on raw text, then cleaned text) for a short area label.
    const maidKnown = findKnownArea(raw.maidAddress) || findKnownArea(maidAddr);
    const clientKnown = findKnownArea(raw.ClientAddress) || findKnownArea(clientAddr);

    // Full text for display (detailed location shown on card)
    const maidDisplay = maidAddr || maidKnown || 'Location N/A';
    const clientDisplay = clientAddr || clientKnown || 'Location N/A';

    // Short area name for clustering/grouping (prefer known area, fallback to full)
    const maidAreaShort = maidKnown || maidAddr || 'N/A';
    const clientAreaShort = clientKnown || clientAddr || 'N/A';

    return {
      id: raw.id || String(raw.contractId),
      contractId: raw.contractId ? String(raw.contractId) : raw.id,
      clientName: raw.clientName || 'N/A',
      clientLocation: clientDisplay,
      clientArea: clientAreaShort,
      clientId: raw.clientId || '',
      housemaidName: raw.housemaidName || 'N/A',
      housemaidPhone: raw.housemaidPhoneNumber && raw.housemaidPhoneNumber !== '***' ? raw.housemaidPhoneNumber : 'Phone: N/A',
      housemaidStatus: raw.housemaidStatus || '',
      housemaidId: raw.housemaidId || '',
      maidLocation: maidDisplay,
      pickupArea: maidAreaShort,
      dropoffArea: clientAreaShort,
      creationDate: raw.creationDate || '',
      transferDate: raw.transferDate || '',
      typeOfTheContractLabel: raw.typeOfTheContractLabel || '',
      assignee: raw.assignee || null,
      pendingStatus: raw.pendingStatus || '',
      urgent: raw.urgent || false,
      liveOut: raw.liveOut || false,
      clientMobileNumber: raw.clientMobileNumber && raw.clientMobileNumber !== '***' ? raw.clientMobileNumber : 'Phone: N/A',
      clientWhatsappNumber: raw.clientWhatsappNumber && raw.clientWhatsappNumber !== '***' ? raw.clientWhatsappNumber : 'Phone: N/A',
      maidLat,
      maidLong,
      clientLat,
      clientLong,
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
    if (isFetchingOrders) return;
    isFetchingOrders = true;
    try {
      if (!hasFetchedOnce.current) setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      const content = data.data || data.content || data || [];
      const raw = Array.isArray(content) ? content : (content && typeof content === 'object' ? [content] : []);
      const withMaid = raw.filter(r => r.housemaidName && r.housemaidName.trim());
      const mapped = withMaid.map(mapApiOrder);

      const needsGeo = (area) => !area || area === 'N/A' || area === 'Location N/A';
      const allProcessed = [...STATIC_EXAMPLES, ...mapped].filter(o => !deletedOrderIdsRef.current.has(o.id || o.contractId));
      let finalOrders;
      try {
        const sbOrdersRaw = await sbFetchOrders();
        const sbOrders = sbOrdersRaw.filter(o => !deletedOrderIdsRef.current.has(o.id || o.contractId));
        const sbMap = new Map(sbOrders.map(o => [o.id || o.contractId, o]));

        const merged = allProcessed.map(o => {
          const oid = o.id || o.contractId;
          const sbVersion = sbMap.get(oid);
          if (!sbVersion) return o;
          // Pick the better (non-N/A) value between API and Supabase
          const best = (apiVal, sbVal) => {
            const apiOk = apiVal && apiVal !== 'N/A' && apiVal !== 'Location N/A';
            const sbOk = sbVal && sbVal !== 'N/A' && sbVal !== 'Location N/A';
            if (apiOk) return apiVal;
            if (sbOk) return sbVal;
            return apiVal;
          };
          return {
            ...sbVersion,
            maidLat: o.maidLat ?? sbVersion.maidLat,
            maidLong: o.maidLong ?? sbVersion.maidLong,
            clientLat: o.clientLat ?? sbVersion.clientLat,
            clientLong: o.clientLong ?? sbVersion.clientLong,
            pickupArea: best(o.pickupArea, sbVersion.pickupArea),
            dropoffArea: best(o.dropoffArea, sbVersion.dropoffArea),
            clientArea: best(o.clientArea, sbVersion.clientArea),
            maidLocation: best(o.maidLocation, sbVersion.maidLocation),
            clientLocation: best(o.clientLocation, sbVersion.clientLocation),
          };
        });

        const apiIds = new Set(allProcessed.map(o => o.id || o.contractId));
        const manualOnly = sbOrders.filter(o => !apiIds.has(o.id || o.contractId));
        finalOrders = [...merged, ...manualOnly];

        const newApiOrders = allProcessed.filter(o => !sbMap.has(o.id || o.contractId));
        if (newApiOrders.length > 0) {
          sbUpsertOrders(newApiOrders, 'api').catch(err => console.error('Supabase upsert orders failed:', err));
        }
      } catch {
        finalOrders = allProcessed;
        sbUpsertOrders(allProcessed, 'api').catch(err => console.error('Supabase upsert orders failed:', err));
      }

      // ── Apply geocode cache (localStorage-backed, so instant even after refresh) ──
      for (const order of finalOrders) {
        if (needsGeo(order.pickupArea) && order.maidLat && order.maidLong) {
          const cacheKey = `${order.maidLat.toFixed(4)},${order.maidLong.toFixed(4)}`;
          if (geoCache[cacheKey]) {
            order.maidLocation = geoCache[cacheKey];
            order.pickupArea = geoCache[cacheKey];
          }
        }
        if (needsGeo(order.dropoffArea) && order.clientLat && order.clientLong) {
          const cacheKey = `${order.clientLat.toFixed(4)},${order.clientLong.toFixed(4)}`;
          if (geoCache[cacheKey]) {
            order.clientLocation = geoCache[cacheKey];
            order.clientArea = geoCache[cacheKey];
            order.dropoffArea = geoCache[cacheKey];
          }
        }
      }

      // ── Collect UNIQUE coords that still need geocoding ──
      const uniqueCoords = new Map();
      for (const order of finalOrders) {
        const oid = order.id || order.contractId;
        if (needsGeo(order.pickupArea) && order.maidLat && order.maidLong) {
          const key = `${order.maidLat.toFixed(4)},${order.maidLong.toFixed(4)}`;
          if (!uniqueCoords.has(key)) uniqueCoords.set(key, { lat: order.maidLat, lon: order.maidLong, targets: [] });
          uniqueCoords.get(key).targets.push({ oid, field: 'pickup' });
        }
        if (needsGeo(order.dropoffArea) && order.clientLat && order.clientLong) {
          const key = `${order.clientLat.toFixed(4)},${order.clientLong.toFixed(4)}`;
          if (!uniqueCoords.has(key)) uniqueCoords.set(key, { lat: order.clientLat, lon: order.clientLong, targets: [] });
          uniqueCoords.get(key).targets.push({ oid, field: 'dropoff' });
        }
      }

      // Render immediately with whatever we have (cache hits are already resolved)
      setOrders(finalOrders);

      // Background geocode remaining N/As (non-blocking so UI isn't stuck)
      const coordEntries = [...uniqueCoords.entries()];
      if (coordEntries.length > 0) {
        (async () => {
          for (let i = 0; i < coordEntries.length; i++) {
            const [, { lat, lon, targets }] = coordEntries[i];
            const area = await reverseGeocode(lat, lon);
            if (area) {
              setOrders(prev => {
                const updated = prev.map(o => {
                  const oid = o.id || o.contractId;
                  const match = targets.find(t => t.oid === oid);
                  if (!match) return o;
                  if (match.field === 'pickup') {
                    return { ...o, maidLocation: area, pickupArea: area };
                  } else {
                    return { ...o, clientLocation: area, clientArea: area, dropoffArea: area };
                  }
                });
                // Persist to Supabase so merge never reverts these back to N/A
                const touchedOrders = updated.filter(o => targets.some(t => t.oid === (o.id || o.contractId)));
                if (touchedOrders.length > 0) {
                  sbUpsertOrders(touchedOrders, 'api').catch(err => console.error('Supabase persist geocode failed:', err));
                }
                return updated;
              });
              for (const { oid, field } of targets) geocodedKeys.add(`${oid}-${field}`);
            }
            if (i < coordEntries.length - 1) await new Promise(r => setTimeout(r, 1100));
          }
        })();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      hasFetchedOnce.current = true;
      isFetchingOrders = false;
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
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
        const noid = newOrder.id || newOrder.contractId;
        if (deletedOrderIdsRef.current.has(noid)) return;
        setOrders(prev => {
          if (prev.some(o => (o.id || o.contractId) === noid)) return prev;
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
  const confirmTripDriver = useCallback(async (orderIds, driverInfo, pickupTime) => {
    const newAssignments = {};
    setTripAssignments(prev => {
      const next = { ...prev };
      for (const oid of orderIds) {
        const assignment = { driverId: driverInfo.id, driverName: driverInfo.name, driverPhone: driverInfo.phone, driverPrice: driverInfo.price, pickupTime };
        next[oid] = assignment;
        newAssignments[oid] = assignment;
      }
      return next;
    });
    try { await upsertTripAssignmentsBulk(newAssignments); } catch (err) { console.error('Supabase upsert trip assignments failed:', err); }
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
    // Remove from waiting list so API refetch doesn't bring it back
    setOrders(prev => prev.filter(o => (o.id || o.contractId) !== orderId));
    deletedOrderIdsRef.current.add(orderId);
    saveToStorage('carlift_deleted_orders', [...deletedOrderIdsRef.current]);
    // Persist to Supabase
    try {
      await upsertFollowUpOrder(entry);
      await deleteOrderFromDb(orderId);
    } catch (err) { console.error('Supabase upsert follow-up order failed:', err); }
  }, []);

  const moveBackToWaiting = useCallback(async (orderId) => {
    // Optimistic local update
    setFollowUpOrders(prev => prev.filter(o => o.orderId !== orderId));
    setFollowUpData(prev => {
      const next = { ...prev };
      delete next[orderId];
      return next;
    });
    // Un-delete so the order can reappear in waiting list from API
    deletedOrderIdsRef.current.delete(orderId);
    saveToStorage('carlift_deleted_orders', [...deletedOrderIdsRef.current]);
    // Persist to Supabase (cascade deletes follow_up_data)
    try { await deleteFollowUpOrder(orderId); } catch (err) { console.error('Supabase delete follow-up order failed:', err); }
  }, []);

  const updateFollowUp = useCallback(async (orderId, data) => {
    // Optimistic local update — merge and pass full data to Supabase
    let merged = null;
    setFollowUpData(prev => {
      merged = { ...(prev[orderId] || {}), ...data };
      return { ...prev, [orderId]: merged };
    });
    // Persist full merged data to Supabase (so all days including 4+ are saved)
    if (merged) {
      try { await upsertFollowUpData(orderId, merged); } catch (err) { console.error('Supabase upsert follow-up data failed:', err); }
    }
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

  const addDriver = useCallback(async (driver) => {
    setDrivers(prev => [...prev, driver]);
    try { await sbUpsertDriver(driver); } catch (err) { console.error('Supabase add driver failed:', err); }
  }, []);

  const updateDriver = useCallback(async (id, updates) => {
    let updatedDriver = null;
    setDrivers(prev => prev.map(d => {
      if (d.id !== id) return d;
      updatedDriver = { ...d, ...updates };
      return updatedDriver;
    }));
    if (updatedDriver) {
      try { await sbUpsertDriver(updatedDriver); } catch (err) { console.error('Supabase update driver failed:', err); }
    }
  }, []);

  const toggleDriver = useCallback(async (id) => {
    let updatedDriver = null;
    setDrivers(prev => prev.map(d => {
      if (d.id !== id) return d;
      updatedDriver = { ...d, active: !d.active };
      return updatedDriver;
    }));
    if (updatedDriver) {
      try { await sbUpsertDriver(updatedDriver); } catch (err) { console.error('Supabase toggle driver failed:', err); }
    }
  }, []);

  const deleteDriver = useCallback(async (id) => {
    setDrivers(prev => prev.filter(d => d.id !== id));
    try { await deleteDriverFromDb(id); } catch (err) { console.error('Supabase delete driver failed:', err); }
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

  const moveHistoryToFollowUp = useCallback(async (orderId) => {
    let historyEntry = null;
    setHistoryOrders(prev => {
      historyEntry = prev.find(h => h.orderId === orderId);
      return prev.filter(h => h.orderId !== orderId);
    });
    if (!historyEntry) return;
    const followUpEntry = {
      orderId: historyEntry.orderId,
      order: historyEntry.order,
      driverName: historyEntry.driverName,
      driverPhone: historyEntry.driverPhone,
      driverPrice: historyEntry.driverPrice,
      driverId: historyEntry.driverId,
      routeLabel: historyEntry.routeLabel,
      pickupLabel: historyEntry.pickupLabel,
      dropoffLabel: historyEntry.dropoffLabel,
      timeWindow: historyEntry.timeWindow,
      plannedTransportation: historyEntry.plannedTransportation,
      confirmedAt: historyEntry.confirmedAt,
    };
    setFollowUpOrders(prev => {
      if (prev.some(o => o.orderId === orderId)) return prev;
      return [...prev, followUpEntry];
    });
    // Restore follow-up data if it existed
    const fuData = historyEntry.followUpData || {};
    if (Object.keys(fuData).length > 0) {
      setFollowUpData(prev => ({ ...prev, [orderId]: fuData }));
    }
    // Persist to Supabase
    try {
      await upsertFollowUpOrder(followUpEntry);
      if (Object.keys(fuData).length > 0) {
        await upsertFollowUpData(orderId, fuData);
      }
      await deleteHistoryOrder(orderId);
    } catch (err) { console.error('Supabase move history to follow-up failed:', err); }
  }, []);

  const deleteOrder = useCallback(async (orderId) => {
    setOrders(prev => prev.filter(o => (o.id || o.contractId) !== orderId));
    deletedOrderIdsRef.current.add(orderId);
    saveToStorage('carlift_deleted_orders', [...deletedOrderIdsRef.current]);
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
      moveHistoryToFollowUp,
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
