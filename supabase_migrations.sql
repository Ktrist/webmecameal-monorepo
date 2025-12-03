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
