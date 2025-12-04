-- =====================================================
-- FIX: Politiques RLS pour table subscriptions
-- À exécuter dans Supabase SQL Editor
-- =====================================================

-- 1. Vérifier si RLS est activé
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'subscriptions';

-- 2. Lister les politiques existantes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'subscriptions';

-- 3. Supprimer les anciennes politiques (si elles existent)
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;

-- 4. Recréer la politique SELECT pour les utilisateurs
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- 5. Vérifier que la politique a été créée
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'subscriptions';

-- =====================================================
-- TEST: Vérifier l'accès
-- =====================================================

-- Cette requête devrait retourner les abonnements de l'utilisateur connecté
SELECT * FROM subscriptions WHERE user_id = auth.uid();

-- =====================================================
-- BONUS: Politiques pour table payments
-- =====================================================

DROP POLICY IF EXISTS "Users can view own payments" ON payments;

CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);
