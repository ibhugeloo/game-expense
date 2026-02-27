/**
 * CSV Parser — no external dependencies.
 * Handles BOM, CRLF, quoted fields, escaped quotes.
 */

// Header name → DB column mapping with FR/EN aliases
const HEADER_MAP = {
  // title
  'name': 'title', 'nom': 'title', 'game': 'title', 'jeu': 'title',
  'title': 'title', 'titre': 'title', 'game title': 'title', 'titre du jeu': 'title',
  // type
  'type': 'type', "type d'achat": 'type', 'purchase type': 'type',
  // price
  'price': 'price', 'prix': 'price', 'amount': 'price', 'montant': 'price', 'cost': 'price', 'coût': 'price', 'cout': 'price',
  // currency
  'currency': 'currency', 'devise': 'currency',
  // platform
  'platform': 'platform', 'plateforme': 'platform',
  // genre
  'genre': 'genre',
  // store
  'store': 'store', "lieu d'achat": 'store', 'boutique': 'store', 'magasin': 'store', 'shop': 'store',
  // status
  'status': 'status', 'statut': 'status', 'état': 'status', 'etat': 'status',
  // date
  'date': 'purchase_date', 'purchase date': 'purchase_date', "date d'achat": 'purchase_date',
  'purchase_date': 'purchase_date',
  // parent game
  'parent game': 'parent_game_name', 'jeu parent': 'parent_game_name', 'parent_game': 'parent_game_name',
  'parent game name': 'parent_game_name',
  // notes
  'notes': 'notes', 'commentaires': 'notes', 'comments': 'notes',
};

/**
 * Parse CSV text into an array of string arrays (rows).
 * Handles: BOM, CRLF/LF, quoted fields, escaped double-quotes.
 */
export function parseCsvText(text) {
  // Strip BOM
  let input = text;
  if (input.charCodeAt(0) === 0xFEFF) {
    input = input.slice(1);
  }

  // Normalize line endings
  input = input.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  const rows = [];
  let i = 0;
  const len = input.length;

  while (i < len) {
    const row = [];
    // Parse one row
    while (i < len) {
      if (input[i] === '"') {
        // Quoted field
        i++; // skip opening quote
        let field = '';
        while (i < len) {
          if (input[i] === '"') {
            if (i + 1 < len && input[i + 1] === '"') {
              // Escaped quote
              field += '"';
              i += 2;
            } else {
              // End of quoted field
              i++; // skip closing quote
              break;
            }
          } else {
            field += input[i];
            i++;
          }
        }
        row.push(field);
      } else {
        // Unquoted field
        let field = '';
        while (i < len && input[i] !== ',' && input[i] !== '\n') {
          field += input[i];
          i++;
        }
        row.push(field);
      }

      if (i < len && input[i] === ',') {
        i++; // skip comma, continue to next field
      } else {
        // End of row (newline or end of input)
        if (i < len && input[i] === '\n') {
          i++;
        }
        break;
      }
    }

    // Skip completely empty rows
    if (row.length === 1 && row[0].trim() === '') continue;

    rows.push(row);
  }

  return rows;
}

/**
 * Auto-detect column mapping from CSV headers.
 * @param {string[]} headers - First row of CSV
 * @returns {{ mapping: Object<number, string>, unmapped: string[] }}
 *   mapping: index → DB column name
 *   unmapped: header names that couldn't be mapped
 */
export function autoDetectColumns(headers) {
  const mapping = {};
  const unmapped = [];
  const usedColumns = new Set();

  headers.forEach((header, index) => {
    const normalized = header.trim().toLowerCase();
    const column = HEADER_MAP[normalized];
    if (column && !usedColumns.has(column)) {
      mapping[index] = column;
      usedColumns.add(column);
    } else if (!column) {
      unmapped.push(header.trim());
    }
  });

  return { mapping, unmapped };
}

/**
 * Apply column mapping to parsed CSV rows (excluding header row).
 * @param {string[][]} dataRows - Rows without header
 * @param {Object<number, string>} mapping - index → column name
 * @returns {Object[]} Array of raw transaction objects
 */
export function applyMapping(dataRows, mapping) {
  return dataRows.map(row => {
    const obj = {};
    Object.entries(mapping).forEach(([index, column]) => {
      const value = row[parseInt(index)];
      if (value !== undefined) {
        obj[column] = value.trim();
      }
    });
    return obj;
  });
}
