import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// ── Follow-up Orders ────────────────────────────────────────────

export async function fetchFollowUpOrders() {
  const { data, error } = await supabase
    .from('follow_up_orders')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []).map(row => ({
    orderId: row.order_id,
    order: row.order_data,
    driverName: row.driver_name,
    driverPhone: row.driver_phone,
    driverPrice: row.driver_price,
    driverId: row.driver_id,
    routeLabel: row.route_label,
    pickupLabel: row.pickup_label,
    dropoffLabel: row.dropoff_label,
    timeWindow: row.time_window,
    plannedTransportation: row.planned_transportation,
    confirmedAt: row.confirmed_at,
  }));
}

export async function upsertFollowUpOrder(entry) {
  const { error } = await supabase
    .from('follow_up_orders')
    .upsert({
      order_id: entry.orderId,
      order_data: entry.order,
      driver_name: entry.driverName,
      driver_phone: entry.driverPhone,
      driver_price: entry.driverPrice,
      driver_id: entry.driverId,
      route_label: entry.routeLabel,
      pickup_label: entry.pickupLabel,
      dropoff_label: entry.dropoffLabel,
      time_window: entry.timeWindow,
      planned_transportation: entry.plannedTransportation,
      confirmed_at: entry.confirmedAt,
    }, { onConflict: 'order_id' });
  if (error) throw error;
}

export async function updateFollowUpOrderData(orderId, orderData) {
  const { error } = await supabase
    .from('follow_up_orders')
    .update({ order_data: orderData })
    .eq('order_id', orderId);
  if (error) throw error;
}

export async function deleteFollowUpOrder(orderId) {
  const { error } = await supabase
    .from('follow_up_orders')
    .delete()
    .eq('order_id', orderId);
  if (error) throw error;
}

// ── Follow-up Data (day tracking) ───────────────────────────────

export async function fetchFollowUpData() {
  const { data, error } = await supabase
    .from('follow_up_data')
    .select('*');
  if (error) throw error;
  const result = {};
  for (const row of (data || [])) {
    // Prefer all_days JSONB (has all days including 4+), fallback to individual columns
    if (row.all_days && Object.keys(row.all_days).length > 0) {
      result[row.order_id] = {
        priority: row.priority || 'Normal',
        ...row.all_days,
      };
    } else {
      result[row.order_id] = {
        priority: row.priority || 'Normal',
        1: row.day_1 || {},
        2: row.day_2 || {},
        3: row.day_3 || {},
      };
    }
  }
  return result;
}

export async function upsertFollowUpData(orderId, fullData) {
  // fullData is the complete merged follow-up data for this order (priority + all days)
  const row = { order_id: orderId, updated_at: new Date().toISOString() };
  if (fullData.priority !== undefined) row.priority = fullData.priority;
  // Write individual day columns for days 1-3 (backward compat)
  if (fullData[1] !== undefined) row.day_1 = fullData[1];
  if (fullData[2] !== undefined) row.day_2 = fullData[2];
  if (fullData[3] !== undefined) row.day_3 = fullData[3];
  // Write ALL days (including 4+) to the all_days JSONB column
  const allDays = {};
  for (const key of Object.keys(fullData)) {
    if (key === 'priority') continue;
    const num = Number(key);
    if (!isNaN(num) && num >= 1) allDays[num] = fullData[num];
  }
  row.all_days = allDays;

  const { error } = await supabase
    .from('follow_up_data')
    .upsert(row, { onConflict: 'order_id' });
  if (error) throw error;
}

// ── History Orders ──────────────────────────────────────────────

export async function fetchHistoryOrders() {
  const { data, error } = await supabase
    .from('history_orders')
    .select('*')
    .order('completed_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(row => ({
    orderId: row.order_id,
    order: row.order_data,
    driverName: row.driver_name,
    driverPhone: row.driver_phone,
    driverPrice: row.driver_price,
    driverId: row.driver_id,
    routeLabel: row.route_label,
    pickupLabel: row.pickup_label,
    dropoffLabel: row.dropoff_label,
    timeWindow: row.time_window,
    plannedTransportation: row.planned_transportation,
    confirmedAt: row.confirmed_at,
    followUpData: row.follow_up_data,
    completedAt: row.completed_at,
  }));
}

export async function insertHistoryOrder(entry) {
  const { error } = await supabase
    .from('history_orders')
    .upsert({
      order_id: entry.orderId,
      order_data: entry.order,
      driver_name: entry.driverName,
      driver_phone: entry.driverPhone,
      driver_price: entry.driverPrice,
      driver_id: entry.driverId,
      route_label: entry.routeLabel,
      pickup_label: entry.pickupLabel,
      dropoff_label: entry.dropoffLabel,
      time_window: entry.timeWindow,
      planned_transportation: entry.plannedTransportation,
      confirmed_at: entry.confirmedAt,
      follow_up_data: entry.followUpData,
      completed_at: entry.completedAt,
    }, { onConflict: 'order_id' });
  if (error) throw error;
}

export async function updateHistoryOrder(orderId, orderData) {
  const { error } = await supabase
    .from('history_orders')
    .update({ order_data: orderData })
    .eq('order_id', orderId);
  if (error) throw error;
}

export async function deleteHistoryOrder(orderId) {
  const { error } = await supabase
    .from('history_orders')
    .delete()
    .eq('order_id', orderId);
  if (error) throw error;
}

// ── Orders (API + manual) ───────────────────────────────────────

export async function fetchOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []).map(row => row.order_data);
}

export async function upsertOrders(orders, source = 'api') {
  if (!orders.length) return;
  const rows = orders.map(order => ({
    order_id: order.id || order.contractId,
    order_data: order,
    source,
    updated_at: new Date().toISOString(),
  }));
  const { error } = await supabase
    .from('orders')
    .upsert(rows, { onConflict: 'order_id' });
  if (error) throw error;
}

export async function upsertOrder(order, source = 'manual') {
  const { error } = await supabase
    .from('orders')
    .upsert({
      order_id: order.id || order.contractId,
      order_data: order,
      source,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'order_id' });
  if (error) throw error;
}

export async function updateOrderInDb(order) {
  const { error } = await supabase
    .from('orders')
    .update({ order_data: order, updated_at: new Date().toISOString() })
    .eq('order_id', order.id || order.contractId);
  if (error) throw error;
}

export async function deleteOrderFromDb(orderId) {
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('order_id', orderId);
  if (error) throw error;
}

// ── Drivers ─────────────────────────────────────────────────────

export async function fetchDrivers() {
  const { data, error } = await supabase
    .from('drivers')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []).map(row => row.driver_data);
}

export async function upsertDrivers(drivers) {
  if (!drivers.length) return;
  const rows = drivers.map(d => ({
    driver_id: d.id,
    driver_data: d,
    updated_at: new Date().toISOString(),
  }));
  const { error } = await supabase
    .from('drivers')
    .upsert(rows, { onConflict: 'driver_id' });
  if (error) throw error;
}

export async function upsertDriver(driver) {
  const { error } = await supabase
    .from('drivers')
    .upsert({
      driver_id: driver.id,
      driver_data: driver,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'driver_id' });
  if (error) throw error;
}

export async function deleteDriverFromDb(driverId) {
  const { error } = await supabase
    .from('drivers')
    .delete()
    .eq('driver_id', driverId);
  if (error) throw error;
}

// ── Trip Assignments ────────────────────────────────────────────

export async function fetchTripAssignments() {
  const { data, error } = await supabase
    .from('trip_assignments')
    .select('*');
  if (error) throw error;
  const result = {};
  for (const row of (data || [])) {
    result[row.order_id] = row.assignment_data;
  }
  return result;
}

export async function upsertTripAssignment(orderId, assignmentData) {
  const { error } = await supabase
    .from('trip_assignments')
    .upsert({
      order_id: orderId,
      assignment_data: assignmentData,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'order_id' });
  if (error) throw error;
}

export async function deleteTripAssignment(orderId) {
  const { error } = await supabase
    .from('trip_assignments')
    .delete()
    .eq('order_id', orderId);
  if (error) throw error;
}

export async function upsertTripAssignmentsBulk(assignments) {
  const rows = Object.entries(assignments).map(([orderId, data]) => ({
    order_id: orderId,
    assignment_data: data,
    updated_at: new Date().toISOString(),
  }));
  if (!rows.length) return;
  const { error } = await supabase
    .from('trip_assignments')
    .upsert(rows, { onConflict: 'order_id' });
  if (error) throw error;
}

// ── Realtime Subscriptions ──────────────────────────────────────

export function subscribeToFollowUp(onChangeCallback) {
  const channel = supabase
    .channel('followup-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'follow_up_orders' }, onChangeCallback)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'follow_up_data' }, onChangeCallback)
    .subscribe();
  return () => supabase.removeChannel(channel);
}

export function subscribeToOrders(onChangeCallback) {
  const channel = supabase
    .channel('orders-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, onChangeCallback)
    .subscribe();
  return () => supabase.removeChannel(channel);
}

export function subscribeToHistory(onChangeCallback) {
  const channel = supabase
    .channel('history-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'history_orders' }, onChangeCallback)
    .subscribe();
  return () => supabase.removeChannel(channel);
}

export function subscribeToDrivers(onChangeCallback) {
  const channel = supabase
    .channel('drivers-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'drivers' }, onChangeCallback)
    .subscribe();
  return () => supabase.removeChannel(channel);
}

export function subscribeToTripAssignments(onChangeCallback) {
  const channel = supabase
    .channel('trip-assignments-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'trip_assignments' }, onChangeCallback)
    .subscribe();
  return () => supabase.removeChannel(channel);
}
