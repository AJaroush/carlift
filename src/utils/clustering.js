/**
 * Cluster orders into trips by pickup/dropoff proximity and time window.
 *
 * Uses geo-coordinates (maidLat/maidLong, clientLat/clientLong) when available
 * for distance-based clustering, falling back to text-based area matching.
 */

const TIME_WINDOW_MINUTES = 60;
const GEO_RADIUS_KM = 5; // max distance in km to cluster maids together

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

function getPickupArea(order) {
  return normalizeArea(order.pickupArea || order.maidLocation || order.typeOfTheContractLabel || 'Unknown');
}

function getDropoffArea(order) {
  return normalizeArea(order.dropoffArea || order.clientLocation || order.clientArea || 'Unknown');
}

function areasMatch(a, b) {
  const na = normalizeArea(a);
  const nb = normalizeArea(b);
  if (na === nb) return true;
  const wordsA = na.split(/[,\s]+/).filter(Boolean);
  const wordsB = nb.split(/[,\s]+/).filter(Boolean);
  return wordsA.some(w => w.length > 2 && wordsB.includes(w));
}

function timesClose(t1, t2) {
  if (t1 === null || t2 === null) return true;
  return Math.abs(t1 - t2) <= TIME_WINDOW_MINUTES;
}

/**
 * Check if two orders are near each other based on maid pickup locations.
 * Uses geo-coordinates if both have them, otherwise falls back to text matching.
 */
function pickupsNear(orderA, orderB) {
  if (orderA.maidLat && orderA.maidLong && orderB.maidLat && orderB.maidLong) {
    return haversineKm(orderA.maidLat, orderA.maidLong, orderB.maidLat, orderB.maidLong) <= GEO_RADIUS_KM;
  }
  return areasMatch(getPickupArea(orderA), getPickupArea(orderB));
}

/**
 * Check if two orders have nearby dropoff (client) locations.
 * Uses geo-coordinates if both have them, otherwise falls back to text matching.
 */
function dropoffsNear(orderA, orderB) {
  if (orderA.clientLat && orderA.clientLong && orderB.clientLat && orderB.clientLong) {
    return haversineKm(orderA.clientLat, orderA.clientLong, orderB.clientLat, orderB.clientLong) <= GEO_RADIUS_KM;
  }
  return areasMatch(getDropoffArea(orderA), getDropoffArea(orderB));
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
    // Multi-word areas first (longer names matched before shorter)
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
    // Short/single-word areas
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

  // Fallback: split by common delimiters and pick the most meaningful segment
  const parts = cleaned.split(/\s*[-,]\s*/).map(s => s.trim()).filter(Boolean);
  const filtered = parts.filter(p =>
    !p.match(/^(flat|apartment|villa|building|tower|floor|road|street|st)\b/i) &&
    !p.match(/^\d+$/) &&
    p.length > 1
  );

  if (filtered.length > 0) {
    // Prefer a part that looks like an area name (starts with letter, reasonable length)
    const areaPart = filtered.find(p => p.match(/^[A-Za-z]/) && p.length >= 3 && p.length <= 30);
    return areaPart || filtered[0];
  }

  return parts[0] || address;
}

export function clusterOrders(orders) {
  const clusters = [];

  for (const order of orders) {
    const time = parseTime(order);

    let matched = false;
    for (const cluster of clusters) {
      const representative = cluster.orders[0];
      if (
        pickupsNear(representative, order) &&
        dropoffsNear(representative, order) &&
        timesClose(cluster.avgTime, time)
      ) {
        cluster.orders.push(order);
        const validTimes = cluster.orders.map(parseTime).filter(t => t !== null);
        cluster.avgTime = validTimes.length > 0
          ? Math.round(validTimes.reduce((a, b) => a + b, 0) / validTimes.length)
          : null;
        matched = true;
        break;
      }
    }

    if (!matched) {
      clusters.push({
        pickupArea: getPickupArea(order),
        dropoffArea: getDropoffArea(order),
        avgTime: time,
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

    // Short area name for route label (header), full address for inside card
    const shortPickup = normalizeDisplayArea(extractAreaName(fullPickup));
    const shortDropoff = normalizeDisplayArea(extractAreaName(fullDropoff));

    const timeWindow = formatTimeWindow(cluster.avgTime);

    // Stable ID based on sorted order IDs so it doesn't shift when other clusters change
    const stableId = cluster.orders
      .map(o => o.id || o.contractId)
      .sort()
      .join('_');

    const validTimes = cluster.orders.map(parseTime).filter(t => t !== null);
    const earliestTime = validTimes.length > 0 ? Math.min(...validTimes) : null;

    return {
      id: `cluster-${stableId}`,
      routeLabel: `${shortPickup} → ${shortDropoff}`,
      pickupLabel: fullPickup,
      dropoffLabel: fullDropoff,
      timeWindow,
      avgTime: cluster.avgTime,
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
