/**
 * Export transactions to CSV and trigger download.
 * @param {Array} transactions - Array of transaction objects
 * @param {string} filename - Output filename (default: mosaic-export.csv)
 */
export function exportTransactionsCsv(transactions, filename = 'mosaic-export.csv') {
    if (!transactions || transactions.length === 0) return;

    const headers = [
        'Name',
        'Type',
        'Price',
        'Currency',
        'Platform',
        'Genre',
        'Store',
        'Status',
        'Date',
        'Parent Game',
        'Notes',
    ];

    const rows = transactions.map(tx => [
        escapeCsv(tx.title || ''),
        escapeCsv(tx.type || 'game'),
        tx.price || 0,
        tx.currency || 'EUR',
        escapeCsv(tx.platform || ''),
        escapeCsv(tx.genre || ''),
        escapeCsv(tx.store || ''),
        escapeCsv(tx.status || ''),
        tx.purchase_date || '',
        escapeCsv(tx.parent_game_name || ''),
        escapeCsv(tx.notes || ''),
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(',')),
    ].join('\n');

    // BOM for Excel UTF-8 compatibility
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function escapeCsv(value) {
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}
