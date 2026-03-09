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
    result[row.order_id] = {
      priority: row.priority || 'Normal',
      1: row.day_1 || {},
      2: row.day_2 || {},
      3: row.day_3 || {},
    };
  }
  return result;
}

export async function upsertFollowUpData(orderId, updates) {
  // Build the row to upsert — only include day fields that are in updates
  const row = { order_id: orderId, updated_at: new Date().toISOString() };
  if (updates.priority !== undefined) row.priority = updates.priority;
  if (updates[1] !== undefined) row.day_1 = updates[1];
  if (updates[2] !== undefined) row.day_2 = updates[2];
  if (updates[3] !== undefined) row.day_3 = updates[3];

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
