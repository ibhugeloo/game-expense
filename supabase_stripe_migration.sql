-- ====================================
-- Migration: Stripe columns on subscriptions
-- A exécuter dans le SQL Editor Supabase
-- ====================================

-- 1. Ajouter les colonnes Stripe
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- 2. Index pour lookup par IDs Stripe
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
