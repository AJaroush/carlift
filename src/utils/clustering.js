/**
 * Cluster orders into trips by pickup/dropoff proximity.
 *
 * Uses centroid-based geo-clustering (maidLat/maidLong, clientLat/clientLong)
 * when coordinates are available, falling back to text-based area matching.
 */

const GEO_RADIUS_KM = 0.5;

/**
 * Haversine distance between two lat/long points in km.
 */
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function parseTime(order) {
  const timeStr = order.creationDate?.split(' ')[1];
  if (!timeStr) return null;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m; // minutes since midnight
}

// Normalize area name: strip "Al "/"Al-" prefix, common spelling variants
function normalizeArea(name) {
  let n = name.trim().toLowerCase();
  // Strip leading "al " or "al-"
  n = n.replace(/^al[\s-]+/, '');
  // Common spelling unifications
  n = n
    .replace(/\bsatwa\b/g, 'satwa')
    .replace(/\bsawta\b/g, 'satwa')
    .replace(/\bqouz\b/g, 'quoz')
    .replace(/\bqoz\b/g, 'quoz')
    .replace(/\bbarsha\b/g, 'barsha')
    .replace(/\bmamzar\b/g, 'mamzar')
    .replace(/\bnahda\b/g, 'nahda')
    .replace(/\btwar\b/g, 'twar')
    .replace(/\bwarqa\b/g, 'warqa')
    .replace(/\bkarama\b/g, 'karama')
    .replace(/\bmuhaisnah\b/g, 'muhaisnah')
    .replace(/\bmuteena\b/g, 'muteena')
    .replace(/\bmankhool\b/g, 'mankhool')
    .replace(/\brashidiya\b/g, 'rashidiya')
    .replace(/\bmirdif\b/g, 'mirdif');
  return n;
}

// Display-friendly normalization: unify spelling but keep title case
function normalizeDisplayArea(name) {
  if (!name) return name;
  let n = name.trim();
  // Remove leading "Al "/"Al-" for unification, then re-add as "Al " for display
  const hadAl = /^al[\s-]+/i.test(n);
  n = n.replace(/^al[\s-]+/i, '');
  // Fix common spelling variants (case-insensitive replace, preserve title case)
  const fixes = [
    [/\bsawta\b/i, 'Satwa'],
    [/\bsatwa\b/i, 'Satwa'],
    [/\bqouz\b/i, 'Quoz'],
    [/\bqoz\b/i, 'Quoz'],
    [/\bbarsha\b/i, 'Barsha'],
    [/\bmamzar\b/i, 'Mamzar'],
    [/\bnahda\b/i, 'Nahda'],
    [/\btwar\b/i, 'Twar'],
    [/\bwarqa\b/i, 'Warqa'],
    [/\bkarama\b/i, 'Karama'],
    [/\bmuhaisnah\b/i, 'Muhaisnah'],
    [/\bmuteena\b/i, 'Muteena'],
    [/\bmankhool\b/i, 'Mankhool'],
    [/\brashidiya\b/i, 'Rashidiya'],
    [/\bmirdif\b/i, 'Mirdif'],
  ];
  for (const [re, replacement] of fixes) {
    n = n.replace(re, replacement);
  }
  return n;
}

function validArea(val) {
  return val && val !== 'N/A' && val !== 'Location N/A' && val !== 'Unknown' ? val : null;
}

function getPickupArea(order) {
  return normalizeArea(validArea(order.pickupArea) || validArea(order.maidLocation) || order.typeOfTheContractLabel || 'Unknown');
}

function getDropoffArea(order) {
  return normalizeArea(validArea(order.dropoffArea) || validArea(order.clientLocation) || validArea(order.clientArea) || 'Unknown');
}

function areasMatch(a, b) {
  if (!a || !b || a === 'unknown' || b === 'unknown' || a === 'n/a' || b === 'n/a') return false;
  const na = normalizeArea(a);
  const nb = normalizeArea(b);
  if (na === nb) return true;
  if (na.includes(nb) || nb.includes(na)) return true;
  const wordsA = na.split(/[,\s]+/).filter(Boolean);
  const wordsB = nb.split(/[,\s]+/).filter(Boolean);
  return wordsA.some(w => w.length > 3 && wordsB.includes(w));
}

/**
 * Extract a short area name from a full address string.
 * e.g. "2 27A St - Al Jafiliya - Dubai - United Arab Emirates" → "Al Jafiliya"
 * e.g. "Ashton Park Residences by Mirfa, JVC, Villa B05" → "JVC"
 * e.g. "Arjan, Beverley Boulevard, 313" → "Arjan"
 */
function extractAreaName(address) {
  if (!address || address === 'N/A' || address === 'Location N/A') return 'N/A';

  // Known Dubai/UAE area keywords — longer names first to match more specific areas
  const knownAreas = [
    'Victory Heights', 'Arabian Ranches', 'Palm Jumeirah', 'Business Bay', 'Silicon Oasis',
    'Sports City', 'Motor City', 'International City', 'Discovery Gardens', 'Dubai Hills',
    'Dubai Marina', 'Dubai Downtown', 'Barsha Heights', 'Emirates Hills', 'Damac Hills',
    'Town Square', 'Tilal Al Ghaf', 'Nad Al Sheba', 'Yas Island', 'Khalifa City',
    'Dubai Land', 'Dubailand', 'Creek Beach', 'Al Raha Beach', 'Wadi Al Safa',
    'Bur Dubai', 'Al Barsha', 'Al Quoz', 'Al Nahda', 'Al Jafiliya', 'Al Jaffiliya',
    'Al Rigga', 'Al Mankhool', 'Al Garhoud', 'Al Muhaisnah', 'Al Qusais', 'Al Safa',
    'Al Wasl', 'Al Satwa', 'Al Furjan', 'Al Reef', 'Al Murar', 'Al Danah', 'Al Bada',
    'Al Muneera', 'Al Rahba', 'Al Ranim',
    'Abu Hail', 'Umm Suqeim', 'Umm Ramool', 'Um Ramool', 'Oud Metha',
    'Yas Aspens', 'Yas Acres',
    'JLT', 'JVC', 'JBR', 'DIFC', 'Downtown', 'Marina', 'Satwa', 'Deira', 'Naif',
    'Karama', 'Mirdif', 'Rashidiya', 'Jumeirah', 'Jumeriah', 'Arjan', 'Tecom',
    'Greens', 'Views', 'Springs', 'Meadows', 'Lakes', 'Remraam', 'Mudon', 'Layan',
    'Villanova', 'Warsan', 'Saadiyat', 'Sidra', 'Mulberry', 'Rockwood', 'Trixis',
    'Naseem', 'Anantara',
  ];

  const upper = address.toUpperCase();
  for (const area of knownAreas) {
    if (upper.includes(area.toUpperCase())) return area;
  }

  // Clean plus codes and generic terms before splitting
  let cleaned = address
    .replace(/\b\w{4}\+\w{2,4}\b/g, '')
    .replace(/\b(Dubai|United Arab Emirates|UAE)\b/gi, '')
    .trim();

  const parts = cleaned.split(/\s*[-,]\s*/).map(s => s.trim()).filter(Boolean);
  const filtered = parts.filter(p =>
    !p.match(/^(flat|apartment|villa|building|tower|floor|road|street|st)\b/i) &&
    !p.match(/^\d+$/) &&
    p.length > 1
  );

  if (filtered.length > 0) {
    const areaPart = filtered.find(p => p.match(/^[A-Za-z]/) && p.length >= 3 && p.length <= 30);
    return areaPart || filtered[0];
  }

  return parts[0] || address;
}

/**
 * Check if two orders have nearby pickups.
 * Uses coordinates when both have them, otherwise text matching.
 */
function pickupsNear(a, b) {
  if (a.maidLat && a.maidLong && b.maidLat && b.maidLong) {
    return haversineKm(a.maidLat, a.maidLong, b.maidLat, b.maidLong) <= GEO_RADIUS_KM;
  }
  return areasMatch(getPickupArea(a), getPickupArea(b));
}

/**
 * Check if two orders have nearby dropoffs.
 * Uses coordinates when both have them, otherwise text matching.
 */
function dropoffsNear(a, b) {
  if (a.clientLat && a.clientLong && b.clientLat && b.clientLong) {
    return haversineKm(a.clientLat, a.clientLong, b.clientLat, b.clientLong) <= GEO_RADIUS_KM;
  }
  return areasMatch(getDropoffArea(a), getDropoffArea(b));
}

export function clusterOrders(orders) {
  const clusters = [];

  for (const order of orders) {
    let matched = false;
    for (const cluster of clusters) {
      // Check against EVERY order in the cluster — not just centroid.
      // All existing orders must be near the new order to prevent drift.
      const allPickupsNear = cluster.orders.every(o => pickupsNear(o, order));
      const allDropoffsNear = cluster.orders.every(o => dropoffsNear(o, order));

      if (allPickupsNear && allDropoffsNear) {
        cluster.orders.push(order);
        matched = true;
        break;
      }
    }

    if (!matched) {
      clusters.push({
        pickupArea: getPickupArea(order),
        dropoffArea: getDropoffArea(order),
        orders: [order],
      });
    }
  }

  return clusters.map((cluster) => {
    const fullPickup = cluster.orders[0].pickupArea
      || cluster.orders[0].maidLocation
      || cluster.orders[0].typeOfTheContractLabel
      || 'Unknown Pickup';
    const fullDropoff = cluster.orders[0].dropoffArea
      || cluster.orders[0].clientLocation
      || cluster.orders[0].clientArea
      || 'Unknown Dropoff';

    const shortPickup = normalizeDisplayArea(extractAreaName(fullPickup));
    const shortDropoff = normalizeDisplayArea(extractAreaName(fullDropoff));

    const stableId = cluster.orders
      .map(o => o.id || o.contractId)
      .sort()
      .join('_');

    const validTimes = cluster.orders.map(parseTime).filter(t => t !== null);
    const earliestTime = validTimes.length > 0 ? Math.min(...validTimes) : null;
    const avgTime = validTimes.length > 0
      ? Math.round(validTimes.reduce((a, b) => a + b, 0) / validTimes.length)
      : null;
    const timeWindow = formatTimeWindow(avgTime);

    return {
      id: `cluster-${stableId}`,
      routeLabel: `${shortPickup} → ${shortDropoff}`,
      pickupLabel: fullPickup,
      dropoffLabel: fullDropoff,
      timeWindow,
      avgTime,
      earliestTime,
      orders: cluster.orders,
      seatCount: cluster.orders.length,
      orderIds: cluster.orders.map(o => o.id || o.contractId),
    };
  });
}

function formatTimeWindow(avgMinutes) {
  if (avgMinutes === null) return 'Time TBD';
  const startMin = Math.max(0, avgMinutes - 30);
  const endMin = Math.min(1439, avgMinutes + 30);
  return `${formatMinutes(startMin)} - ${formatMinutes(endMin)}`;
}

function formatMinutes(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

export function formatTimeTo12h(time24) {
  if (!time24) return '—';
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
}

export function addHours(time24, hours) {
  if (!time24) return '—';
  const [h, m] = time24.split(':').map(Number);
  const newH = (h + hours) % 24;
  const period = newH >= 12 ? 'PM' : 'AM';
  const h12 = newH % 12 || 12;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
}

/**
 * Given a trip's earliestTime (minutes since midnight), return a suggested
 * pickup time value (HH:MM 24h, rounded down to the nearest 15-min slot)
 * that is 30 minutes before the earliest maid start.
 */
export function suggestedPickupTime(trip) {
  if (trip.earliestTime == null) return '';
  const target = Math.max(0, trip.earliestTime - 30);
  const h = Math.floor(target / 60);
  const m = Math.floor((target % 60) / 15) * 15;
  if (h < 5 || h > 11) return '';
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Suggest drivers for a trip based on coverage route matching and reliability.
 */
export function suggestDrivers(trip, drivers) {
  const activeDrivers = drivers.filter(d => d.active);

  const scored = activeDrivers.map(driver => {
    let score = 0;
    const dPickup = (driver.pickupArea || '').toLowerCase();
    const dDrop = (driver.dropArea || '').toLowerCase();
    const tPickup = trip.pickupArea || trip.pickupLabel?.toLowerCase() || '';
    const tDrop = trip.dropoffArea || trip.dropoffLabel?.toLowerCase() || '';

    // Check pickup area overlap
    if (areasMatch(dPickup, tPickup)) score += 3;
    // Check dropoff area overlap
    if (areasMatch(dDrop, tDrop)) score += 3;

    // Reliability bonus
    if (driver.reliability === 'High') score += 2;
    else if (driver.reliability === 'Mid') score += 1;

    return { driver, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score || a.driver.price - b.driver.price)
    .map(s => s.driver);
}
