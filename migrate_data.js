/**
 * Migration script: data.json → Supabase
 * Run: node migrate_data.js
 * Requires: npm install @supabase/supabase-js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://vfeifajedjuvufgggkgh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmZWlmYWplZGp1dnVmZ2dna2doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3OTUxODUsImV4cCI6MjA4NzM3MTE4NX0.m66FF4HU24ColwFvlxoHnS0S3lZL_xO8j6KkcRCBpnA';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Typo fixes
const TYPO_FIXES = {
    'Clash Roayle': 'Clash Royale',
    'Assassins Creed Vallhala': "Assassin's Creed Valhalla",
    'Asseto Corsa Ultimate Edition': 'Assetto Corsa Ultimate Edition',
};

const NOTE_FIXES = {
    'Pass Prenium': 'Pass Premium',
};

// Auto-detect genre from game title
const GENRE_MAP = {
    'BF6': 'FPS',
    'Rainbow Six Siege': 'FPS',
    'Call of Duty': 'FPS',
    'COD Mobile': 'FPS',
    'Overwatch': 'FPS',
    'Borderlands': 'FPS',
    'Cyberpunk 2077': 'RPG',
    'Diablo': 'RPG',
    'Genshin Impact': 'Gacha',
    'Ghost Of Tsushima': 'Action-Adventure',
    'GTA V': 'Action-Adventure',
    'Watch Dogs': 'Action-Adventure',
    "Marvel's Spider-Man": 'Action-Adventure',
    "Assassin's Creed": 'Action-Adventure',
    'Assassins Creed': 'Action-Adventure',
    'Monster Hunter': 'RPG',
    'Dying Light': 'Action-Adventure',
    'Hades': 'Rogue-like',
    'Star Citizen': 'Action-Adventure',
    'For The King': 'RPG',
    'SpeedRunners': 'Racing',
    'Schedule I': 'Strategy',
    'Balatro': 'Card Game',
    'Clash Royale': 'Strategy',
    'Clash Roayle': 'Strategy',
    'MoCo': 'Action-Adventure',
    'Pokemon TCG': 'Card Game',
    'FIFA': 'Sports',
    'Asseto Corsa': 'Racing',
    'Assetto Corsa': 'Racing',
};

function detectGenre(title) {
    for (const [key, genre] of Object.entries(GENRE_MAP)) {
        if (title.includes(key)) return genre;
    }
    return 'Other';
}

function fixTitle(title) {
    return TYPO_FIXES[title] || title;
}

function fixNotes(notes) {
    return NOTE_FIXES[notes] || notes;
}

async function migrate() {
    console.log('📦 Reading data.json...');
    const rawData = fs.readFileSync(path.join(__dirname, 'server', 'data.json'), 'utf8');
    const transactions = JSON.parse(rawData);

    console.log(`📊 Found ${transactions.length} transactions to migrate.`);

    const mapped = transactions.map(t => ({
        id: t._id,
        title: fixTitle(t.title),
        platform: t.platform,
        price: parseFloat(t.price) || 0,
        currency: t.currency || 'EUR',
        store: t.store || '',
        purchase_date: t.purchaseDate || new Date().toISOString().split('T')[0],
        status: t.status || 'Backlog',
        notes: fixNotes(t.notes || ''),
        genre: detectGenre(t.title),
        rating: null,
        hours_played: 0,
        cover_url: null,
        created_at: t.createdAt || new Date().toISOString(),
        updated_at: t.updatedAt || new Date().toISOString(),
    }));

    // Insert in batches of 50
    const BATCH_SIZE = 50;
    for (let i = 0; i < mapped.length; i += BATCH_SIZE) {
        const batch = mapped.slice(i, i + BATCH_SIZE);
        const { data, error } = await supabase
            .from('transactions')
            .upsert(batch, { onConflict: 'id' });

        if (error) {
            console.error(`❌ Error inserting batch starting at ${i}:`, error.message);
        } else {
            console.log(`✅ Inserted batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} records)`);
        }
    }

    console.log('🎉 Migration complete!');
}

migrate().catch(err => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
});
