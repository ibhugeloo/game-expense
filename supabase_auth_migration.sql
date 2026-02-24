-- ====================================
-- Mosaic Analytics — Auth Migration
-- Execute this in Supabase SQL Editor
-- ====================================

-- 1. Add user_id column to transactions
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 2. Add user_id column to budgets
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 3. Drop old unique constraint on budgets and recreate with user_id
ALTER TABLE budgets DROP CONSTRAINT IF EXISTS budgets_month_year_key;
ALTER TABLE budgets ADD CONSTRAINT budgets_month_year_user_key UNIQUE(month, year, user_id);

-- 4. Create index on user_id for both tables
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);

-- 5. Drop old permissive RLS policies
DROP POLICY IF EXISTS "Allow all access to transactions" ON transactions;
DROP POLICY IF EXISTS "Allow all access to budgets" ON budgets;

-- 6. Create user-scoped RLS policies for transactions
CREATE POLICY "Users can view own transactions"
    ON transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
    ON transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
    ON transactions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
    ON transactions FOR DELETE
    USING (auth.uid() = user_id);

-- 7. Create user-scoped RLS policies for budgets
CREATE POLICY "Users can view own budgets"
    ON budgets FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets"
    ON budgets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets"
    ON budgets FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets"
    ON budgets FOR DELETE
    USING (auth.uid() = user_id);

-- ====================================
-- AFTER your first sign-up, run this to claim your existing data:
-- Replace 'YOUR_USER_ID' with your actual auth user ID from Supabase Dashboard > Authentication
--
-- UPDATE transactions SET user_id = 'YOUR_USER_ID' WHERE user_id IS NULL;
-- UPDATE budgets SET user_id = 'YOUR_USER_ID' WHERE user_id IS NULL;
-- ====================================
