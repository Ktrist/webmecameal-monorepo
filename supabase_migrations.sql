-- Migration Supabase pour système d'abonnements Webmecameal
-- À exécuter dans l'éditeur SQL de Supabase Dashboard

-- =====================================================
-- TABLE: subscriptions
-- Stocke les abonnements Stripe des utilisateurs
-- =====================================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- IDs Stripe
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  stripe_price_id TEXT NOT NULL,

  -- Détails abonnement
  plan_type TEXT NOT NULL CHECK (plan_type IN ('hebdo_2j', 'hebdo_3j', 'hebdo_5j', 'mensuel')),
  status TEXT NOT NULL CHECK (status IN ('active', 'paused', 'canceled', 'past_due', 'trialing')),

  -- Prix
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'eur',

  -- Périodes
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMPTZ,

  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- RLS (Row Level Security)
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Politique: Les utilisateurs peuvent voir leurs propres abonnements
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Politique: Seul le serveur peut insérer/mettre à jour (via service role)
-- Pas de politique INSERT/UPDATE pour les utilisateurs standards

-- =====================================================
-- TABLE: payments
-- Historique des paiements (invoices Stripe)
-- =====================================================

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,

  -- IDs Stripe
  stripe_invoice_id TEXT UNIQUE NOT NULL,
  stripe_payment_intent_id TEXT,

  -- Montant
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'eur',

  -- Statut
  status TEXT NOT NULL CHECK (status IN ('paid', 'failed', 'pending', 'refunded')),

  -- Type de paiement
  payment_type TEXT CHECK (payment_type IN ('subscription', 'one_time')),

  -- Dates
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_subscription_id ON payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_invoice_id ON payments(stripe_invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- RLS (Row Level Security)
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Politique: Les utilisateurs peuvent voir leurs propres paiements
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

-- =====================================================
-- FONCTION: Mise à jour automatique du timestamp
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VUES UTILES
-- =====================================================

-- Vue: Abonnements actifs avec infos utilisateur
CREATE OR REPLACE VIEW active_subscriptions AS
SELECT
  s.id,
  s.user_id,
  s.stripe_subscription_id,
  s.plan_type,
  s.status,
  s.amount,
  s.current_period_start,
  s.current_period_end,
  p.email,
  p.first_name,
  p.last_name
FROM subscriptions s
LEFT JOIN profiles p ON s.user_id = p.id
WHERE s.status = 'active';

-- =====================================================
-- DONNÉES DE TEST (optionnel)
-- =====================================================

-- Exemple d'insertion (à adapter avec vos vrais IDs)
-- INSERT INTO subscriptions (
--   user_id,
--   stripe_subscription_id,
--   stripe_customer_id,
--   stripe_price_id,
--   plan_type,
--   status,
--   amount,
--   current_period_start,
--   current_period_end
-- ) VALUES (
--   'USER_UUID',
--   'sub_test123',
--   'cus_test123',
--   'price_test123',
--   'hebdo_3j',
--   'active',
--   35.70,
--   NOW(),
--   NOW() + INTERVAL '7 days'
-- );

-- =====================================================
-- VÉRIFICATION
-- =====================================================

-- Vérifier que les tables sont créées
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('subscriptions', 'payments');

-- Vérifier les politiques RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('subscriptions', 'payments');

-- =====================================================
-- TABLE: daily_menus
-- Menus quotidiens avec 2 choix de plats pour les abonnés
-- =====================================================

CREATE TABLE IF NOT EXISTS daily_menus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Date du menu
  menu_date DATE NOT NULL UNIQUE,

  -- Les 2 choix de plats (références vers la table menus)
  plat_1_id UUID REFERENCES menus(id) ON DELETE SET NULL,
  plat_2_id UUID REFERENCES menus(id) ON DELETE SET NULL,

  -- Statut de publication
  is_active BOOLEAN DEFAULT FALSE,

  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_daily_menus_date ON daily_menus(menu_date);
CREATE INDEX IF NOT EXISTS idx_daily_menus_active ON daily_menus(is_active);

-- RLS (Row Level Security)
ALTER TABLE daily_menus ENABLE ROW LEVEL SECURITY;

-- Politique: Tous les utilisateurs authentifiés peuvent voir les menus actifs
CREATE POLICY "Users can view active daily menus"
  ON daily_menus FOR SELECT
  USING (is_active = true OR auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
  ));

-- Politique: Seuls les admins peuvent créer/modifier
CREATE POLICY "Admins can insert daily menus"
  ON daily_menus FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
  ));

CREATE POLICY "Admins can update daily menus"
  ON daily_menus FOR UPDATE
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
  ));

CREATE POLICY "Admins can delete daily menus"
  ON daily_menus FOR DELETE
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
  ));

-- Trigger pour updated_at
CREATE TRIGGER update_daily_menus_updated_at
  BEFORE UPDATE ON daily_menus
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLE: subscriber_menu_selections
-- Sélections quotidiennes des abonnés
-- =====================================================

CREATE TABLE IF NOT EXISTS subscriber_menu_selections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Utilisateur abonné
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Menu quotidien
  daily_menu_id UUID NOT NULL REFERENCES daily_menus(id) ON DELETE CASCADE,

  -- Choix du plat (1 ou 2)
  selected_plat_number INTEGER NOT NULL CHECK (selected_plat_number IN (1, 2)),

  -- Date de sélection
  selected_at TIMESTAMPTZ DEFAULT NOW(),

  -- Contrainte: un utilisateur ne peut sélectionner qu'un seul plat par jour
  UNIQUE(user_id, daily_menu_id)
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_selections_user_id ON subscriber_menu_selections(user_id);
CREATE INDEX IF NOT EXISTS idx_selections_daily_menu_id ON subscriber_menu_selections(daily_menu_id);
CREATE INDEX IF NOT EXISTS idx_selections_date ON subscriber_menu_selections(selected_at);

-- RLS (Row Level Security)
ALTER TABLE subscriber_menu_selections ENABLE ROW LEVEL SECURITY;

-- Politique: Les utilisateurs peuvent voir leurs propres sélections
CREATE POLICY "Users can view own selections"
  ON subscriber_menu_selections FOR SELECT
  USING (auth.uid() = user_id);

-- Politique: Les abonnés actifs peuvent insérer/mettre à jour leurs sélections
CREATE POLICY "Subscribers can insert selections"
  ON subscriber_menu_selections FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM subscriptions
      WHERE user_id = auth.uid()
      AND status IN ('active', 'trialing')
    )
  );

CREATE POLICY "Subscribers can update own selections"
  ON subscriber_menu_selections FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Politique: Les admins peuvent tout voir
CREATE POLICY "Admins can view all selections"
  ON subscriber_menu_selections FOR SELECT
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
  ));
