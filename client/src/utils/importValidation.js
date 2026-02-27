// Valid enum values matching TransactionForm.jsx and DB schema
export const VALID_TYPES = ['game', 'dlc', 'skin', 'battle_pass', 'currency', 'loot_box', 'subscription'];
export const VALID_PLATFORMS = ['PC', 'Steam', 'PS5', 'PS4', 'Switch', 'Xbox Series', 'Xbox One', 'Mobile'];
export const VALID_CURRENCIES = ['EUR', 'USD', 'GBP', 'JPY'];
export const VALID_STATUSES = ['Backlog', 'Playing', 'Completed', 'Wishlist', 'Abandoned'];
export const VALID_GENRES = [
  'FPS', 'RPG', 'MOBA', 'Racing', 'Action-Adventure',
  'Rogue-like', 'Sports', 'Strategy', 'Gacha', 'Card Game',
  'Simulation', 'Horror', 'Puzzle', 'Platformer', 'Battle Royale', 'Other',
];

// Fuzzy alias maps — lowercase key → canonical value
export const TYPE_ALIASES = {
  'game': 'game', 'jeu': 'game', 'jeux': 'game',
  'dlc': 'dlc', 'extension': 'dlc', 'add-on': 'dlc', 'addon': 'dlc',
  'skin': 'skin', 'cosmetic': 'skin', 'cosmétique': 'skin',
  'battle pass': 'battle_pass', 'battle_pass': 'battle_pass', 'battlepass': 'battle_pass', 'pass de combat': 'battle_pass',
  'currency': 'currency', 'monnaie': 'currency', 'in-game currency': 'currency', 'monnaie in-game': 'currency', 'v-bucks': 'currency',
  'loot box': 'loot_box', 'loot_box': 'loot_box', 'lootbox': 'loot_box', 'caisse': 'loot_box',
  'subscription': 'subscription', 'sub': 'subscription', 'abonnement': 'subscription', 'abo': 'subscription',
};

export const PLATFORM_ALIASES = {
  'pc': 'PC', 'windows': 'PC', 'mac': 'PC', 'linux': 'PC',
  'steam': 'Steam', 'steam deck': 'Steam',
  'ps5': 'PS5', 'playstation 5': 'PS5', 'playstation5': 'PS5',
  'ps4': 'PS4', 'playstation 4': 'PS4', 'playstation4': 'PS4',
  'switch': 'Switch', 'nintendo switch': 'Switch', 'nintendo': 'Switch',
  'xbox series': 'Xbox Series', 'xbox series x': 'Xbox Series', 'xbox series s': 'Xbox Series', 'xsx': 'Xbox Series',
  'xbox one': 'Xbox One', 'xone': 'Xbox One', 'xb1': 'Xbox One',
  'mobile': 'Mobile', 'ios': 'Mobile', 'android': 'Mobile', 'phone': 'Mobile', 'téléphone': 'Mobile',
};

export const STATUS_ALIASES = {
  'backlog': 'Backlog', 'à jouer': 'Backlog', 'a jouer': 'Backlog', 'not started': 'Backlog', 'pas commencé': 'Backlog',
  'playing': 'Playing', 'en cours': 'Playing', 'in progress': 'Playing', 'started': 'Playing',
  'completed': 'Completed', 'terminé': 'Completed', 'termine': 'Completed', 'fini': 'Completed', 'done': 'Completed', 'finished': 'Completed',
  'wishlist': 'Wishlist', 'liste de souhaits': 'Wishlist', 'souhaité': 'Wishlist', 'want': 'Wishlist',
  'abandoned': 'Abandoned', 'abandonné': 'Abandoned', 'abandonne': 'Abandoned', 'dropped': 'Abandoned',
};

export const GENRE_ALIASES = {
  'fps': 'FPS', 'shooter': 'FPS', 'tir': 'FPS',
  'rpg': 'RPG', 'jeu de rôle': 'RPG', 'role playing': 'RPG',
  'moba': 'MOBA',
  'racing': 'Racing', 'course': 'Racing',
  'action-adventure': 'Action-Adventure', 'action adventure': 'Action-Adventure', 'action': 'Action-Adventure', 'aventure': 'Action-Adventure', 'adventure': 'Action-Adventure',
  'rogue-like': 'Rogue-like', 'roguelike': 'Rogue-like', 'rogue like': 'Rogue-like', 'roguelite': 'Rogue-like',
  'sports': 'Sports', 'sport': 'Sports',
  'strategy': 'Strategy', 'stratégie': 'Strategy', 'strategie': 'Strategy',
  'gacha': 'Gacha',
  'card game': 'Card Game', 'jeu de cartes': 'Card Game', 'cards': 'Card Game', 'cartes': 'Card Game',
  'simulation': 'Simulation', 'sim': 'Simulation',
  'horror': 'Horror', 'horreur': 'Horror',
  'puzzle': 'Puzzle', 'réflexion': 'Puzzle',
  'platformer': 'Platformer', 'plateforme': 'Platformer', 'platform': 'Platformer',
  'battle royale': 'Battle Royale', 'br': 'Battle Royale',
  'other': 'Other', 'autre': 'Other',
};

export const CURRENCY_ALIASES = {
  'eur': 'EUR', '€': 'EUR', 'euro': 'EUR', 'euros': 'EUR',
  'usd': 'USD', '$': 'USD', 'dollar': 'USD', 'dollars': 'USD',
  'gbp': 'GBP', '£': 'GBP', 'pound': 'GBP', 'livre': 'GBP',
  'jpy': 'JPY', '¥': 'JPY', 'yen': 'JPY',
};

/**
 * Parse a price string, handling FR comma decimals (29,99 → 29.99)
 */
function parsePrice(value) {
  if (value == null || value === '') return null;
  const str = String(value).trim();
  // Replace comma with dot for FR decimals
  const normalized = str.replace(',', '.');
  const num = parseFloat(normalized);
  return isNaN(num) ? null : num;
}

/**
 * Parse a date string, accepting YYYY-MM-DD, DD/MM/YYYY, ISO string.
 * Returns YYYY-MM-DD string or null.
 */
function parseDate(value) {
  if (!value) return null;
  const str = String(value).trim();

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  // DD/MM/YYYY
  const frMatch = str.match(/^(\d{1,2})[/.](\d{1,2})[/.](\d{4})$/);
  if (frMatch) {
    const [, day, month, year] = frMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // ISO string (2024-01-15T00:00:00.000Z)
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split('T')[0];
  }

  return null;
}

/**
 * Resolve a value against an alias map (case-insensitive).
 * Returns { value, matched } where matched indicates if found.
 */
function resolveAlias(input, aliasMap, validValues) {
  if (!input) return { value: null, matched: false };
  const str = String(input).trim();

  // Direct match (case-insensitive against valid values)
  const directMatch = validValues.find(v => v.toLowerCase() === str.toLowerCase());
  if (directMatch) return { value: directMatch, matched: true };

  // Alias lookup
  const alias = aliasMap[str.toLowerCase()];
  if (alias) return { value: alias, matched: true };

  return { value: null, matched: false };
}

/**
 * Validate a single transaction row.
 * @param {Object} row - Raw parsed row with potential fields: title, type, price, currency, platform, genre, store, status, purchase_date, parent_game_name, notes
 * @returns {{ data: Object, warnings: string[], errors: string[] }}
 */
export function validateTransaction(row) {
  const warnings = [];
  const errors = [];

  // Title — required
  const title = (row.title || '').trim();
  if (!title) {
    errors.push('title_required');
  }

  // Type
  let type = 'game';
  if (row.type) {
    const resolved = resolveAlias(row.type, TYPE_ALIASES, VALID_TYPES);
    if (resolved.matched) {
      type = resolved.value;
    } else {
      warnings.push('unknown_type');
    }
  }

  // Price
  const price = parsePrice(row.price);
  if (row.price && price === null) {
    warnings.push('invalid_price');
  }

  // Currency
  let currency = 'EUR';
  if (row.currency) {
    const resolved = resolveAlias(row.currency, CURRENCY_ALIASES, VALID_CURRENCIES);
    if (resolved.matched) {
      currency = resolved.value;
    } else {
      warnings.push('unknown_currency');
    }
  }

  // Platform
  let platform = 'PC';
  if (row.platform) {
    const resolved = resolveAlias(row.platform, PLATFORM_ALIASES, VALID_PLATFORMS);
    if (resolved.matched) {
      platform = resolved.value;
    } else {
      warnings.push('unknown_platform');
    }
  }

  // Genre
  let genre = 'Other';
  if (row.genre) {
    const resolved = resolveAlias(row.genre, GENRE_ALIASES, VALID_GENRES);
    if (resolved.matched) {
      genre = resolved.value;
    } else {
      warnings.push('unknown_genre');
    }
  }

  // Status
  let status = 'Backlog';
  if (row.status) {
    const resolved = resolveAlias(row.status, STATUS_ALIASES, VALID_STATUSES);
    if (resolved.matched) {
      status = resolved.value;
    } else {
      warnings.push('unknown_status');
    }
  }

  // Date
  const today = new Date().toISOString().split('T')[0];
  let purchase_date = today;
  if (row.purchase_date) {
    const parsed = parseDate(row.purchase_date);
    if (parsed) {
      purchase_date = parsed;
    } else {
      warnings.push('invalid_date');
    }
  }

  // Store — free text, no validation needed
  const store = (row.store || '').trim();

  // Notes — free text
  const notes = (row.notes || '').trim();

  // Parent game name — free text
  const parent_game_name = (row.parent_game_name || '').trim();

  const data = {
    title,
    type,
    price: price ?? 0,
    currency,
    platform,
    genre,
    store,
    status,
    purchase_date,
    notes,
    parent_game_name,
  };

  return { data, warnings, errors };
}
