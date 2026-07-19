// Deterministic, sport-aware image resolution for public cards and detail pages.
// Fixed URLs keep the same record image across rerenders and refreshes.

export const SUPPORTED_SPORTS = ['Football', 'Cricket', 'Basketball', 'Tennis', 'Hockey', 'Badminton', 'Concert'];

export const SPORT_IMAGE_POOLS = {
  Football: [
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1518063319789-7217e6706b04?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=1200&q=80',
  ],
  Cricket: [
    'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600679472829-3044539ce8ed?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=1200&q=80',
  ],
  Basketball: [
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1489702932289-406b7782113c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1505666287802-931dc83948e9?auto=format&fit=crop&w=1200&q=80',
  ],
  Tennis: [
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1560012057-4372e14c5085?auto=format&fit=crop&w=1200&q=80',
  ],
  Hockey: [
    'https://images.unsplash.com/photo-1515703407324-5f753afd8be8?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1589487391730-58f20eb2c308?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1547058881-aa0edd92aab3?auto=format&fit=crop&w=1200&q=80',
  ],
  Badminton: [
    'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1618083707368-b3823daa2726?auto=format&fit=crop&w=1200&q=80',
  ],
  Concert: [
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1200&q=80',
  ]
};

// Venue images mapping keeps Metlife, Narendra Modi, Crypto.com, Arthur Ashe, Dhyan Chand, Istora unique.
const VENUE_IMAGES = {
  metlife: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=1200&q=80',
  narendra: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80',
  crypto: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&w=1200&q=80',
  arthur: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1200&q=80',
  dhyan: 'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?auto=format&fit=crop&w=1200&q=80',
  istora: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=1200&q=80',
  eden: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80',
};

export const DEFAULT_EVENT_FALLBACK = SPORT_IMAGE_POOLS.Football[0];
export const DEFAULT_STADIUM_FALLBACK = SPORT_IMAGE_POOLS.Football[1];

function normalizeSport(value = '', title = '') {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'soccer' || normalized === 'american football') return 'Football';
  const found = SUPPORTED_SPORTS.find((sport) => sport.toLowerCase() === normalized);
  if (found) return found;

  // Detect Concert Night (which has null sport in the database)
  const lowerTitle = String(title || '').toLowerCase();
  if (lowerTitle.includes('concert') || lowerTitle.includes('music') || lowerTitle.includes('show')) {
    return 'Concert';
  }
  return null;
}

function stableIndex(key, length, salt = '') {
  const text = String(key || 'stadiumgenie') + salt;
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = ((hash << 5) - hash + text.charCodeAt(index)) | 0;
  }
  return Math.abs(hash) % length;
}

function pickSportImage(sport, title, id, slug) {
  const normalizedSport = normalizeSport(sport, title) || 'Football';
  const pool = SPORT_IMAGE_POOLS[normalizedSport] || SPORT_IMAGE_POOLS.Football;

  // Decide key & seed deterministically per sport to prevent collisions.
  let key = id || slug || title;
  let seed = '0';

  if (normalizedSport === 'Cricket') {
    key = slug || title;
    seed = '0';
  } else if (normalizedSport === 'Football') {
    seed = '101';
  } else if (normalizedSport === 'Hockey') {
    seed = '10';
  } else if (normalizedSport === 'Tennis') {
    seed = '10';
  }

  return pool[stableIndex(key, pool.length, seed)];
}

export function getEventFallback(sport = '', key = '') {
  return pickSportImage(sport, '', key, '');
}

export function getEventFallbackForEvent(event) {
  return pickSportImage(
    event?.sport,
    event?.title,
    event?.id || event?._id,
    event?.slug
  );
}

export function getStadiumFallback(stadiumOrName = '') {
  const stadium = typeof stadiumOrName === 'object' && stadiumOrName ? stadiumOrName : null;
  const name = stadium ? stadium.name || '' : stadiumOrName;
  const lowerName = String(name).toLowerCase();
  for (const [keyword, image] of Object.entries(VENUE_IMAGES)) {
    if (lowerName.includes(keyword)) return image;
  }
  const sports = stadium?.sportsSupported || stadium?.sports || [];
  const primarySport = Array.isArray(sports) ? sports[0] : sports;
  return pickSportImage(primarySport, name, stadium?.id || stadium?._id, stadium?.slug || name);
}

export function resolveEventImage(event) {
  return event ? getEventFallbackForEvent(event) : DEFAULT_EVENT_FALLBACK;
}

export function resolveStadiumImage(stadium) {
  return stadium ? getStadiumFallback(stadium) : DEFAULT_STADIUM_FALLBACK;
}

export function getEventImageCategory(event) {
  return normalizeSport(event?.sport, event?.title) || 'Unsupported';
}

export function getStadiumImageCategory(stadium) {
  const sports = stadium?.sportsSupported || stadium?.sports || [];
  return normalizeSport(Array.isArray(sports) ? sports[0] : sports) || 'Football';
}
