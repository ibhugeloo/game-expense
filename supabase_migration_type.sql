-- ====================================
-- Migration: ajouter type + parent_game_id
-- A exécuter dans le SQL Editor Supabase
-- ====================================

-- 1. Ajouter les colonnes
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'game';
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS parent_game_id UUID REFERENCES transactions(id) ON DELETE SET NULL;

-- 2. Migrer les anciennes transactions DLC → type 'dlc'
UPDATE transactions SET type = 'dlc', status = 'Backlog' WHERE status = 'DLC' AND (type IS NULL OR type = 'game');

-- 3. Index pour les requêtes sur type et parent
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_parent_game_id ON transactions(parent_game_id);
