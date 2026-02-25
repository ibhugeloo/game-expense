-- ====================================
-- Migration: ajouter user_id + RLS
-- A exécuter dans le SQL Editor Supabase
-- ====================================

-- 1. Ajouter user_id aux tables si la colonne n'existe pas
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 2. Mettre à jour les lignes existantes sans user_id (les associer à ton compte)
-- Remplace TON_USER_ID par ton vrai user id (visible dans Supabase > Authentication > Users)
-- UPDATE transactions SET user_id = 'TON_USER_ID' WHERE user_id IS NULL;
-- UPDATE budgets SET user_id = 'TON_USER_ID' WHERE user_id IS NULL;

-- 3. Rendre user_id NOT NULL (une fois que toutes les lignes ont un user_id)
-- ALTER TABLE transactions ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE budgets ALTER COLUMN user_id SET NOT NULL;

-- 4. Remplacer la contrainte unique du budget (month,year) → (month,year,user_id)
-- Supprime l'ancienne contrainte (le nom peut varier, vérifie dans Table Editor > budgets > Constraints)
ALTER TABLE budgets DROP CONSTRAINT IF EXISTS budgets_month_year_key;
ALTER TABLE budgets DROP CONSTRAINT IF EXISTS budgets_month_year_user_key;
ALTER TABLE budgets ADD CONSTRAINT budgets_month_year_user_key UNIQUE(month, year, user_id);

-- 5. Index
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);

-- 6. Activer RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- 7. Supprimer les anciennes policies permissives (ignorer si elles n'existent pas)
DROP POLICY IF EXISTS "Allow all access to transactions" ON transactions;
DROP POLICY IF EXISTS "Allow all access to budgets" ON budgets;
DROP POLICY IF EXISTS "Enable access for all users" ON transactions;
DROP POLICY IF EXISTS "Enable access for all users" ON budgets;

-- 8. Créer les policies scoped par utilisateur
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions"
    ON transactions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
CREATE POLICY "Users can insert own transactions"
    ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
CREATE POLICY "Users can update own transactions"
    ON transactions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;
CREATE POLICY "Users can delete own transactions"
    ON transactions FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own budgets" ON budgets;
CREATE POLICY "Users can view own budgets"
    ON budgets FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own budgets" ON budgets;
CREATE POLICY "Users can insert own budgets"
    ON budgets FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own budgets" ON budgets;
CREATE POLICY "Users can update own budgets"
    ON budgets FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own budgets" ON budgets;
CREATE POLICY "Users can delete own budgets"
    ON budgets FOR DELETE USING (auth.uid() = user_id);
