-- US-033: Promo codes table for promotional campaigns
-- Supports percentage and fixed amount discounts with usage tracking

CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL CHECK (discount_value > 0),
  min_order_amount DECIMAL(10, 2) DEFAULT 0,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  first_order_only BOOLEAN DEFAULT false,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast code lookup
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON promo_codes(is_active, valid_from, valid_until);

-- Track promo code usage per user
CREATE TABLE IF NOT EXISTS promo_code_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id UUID NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id BIGINT REFERENCES orders(id) ON DELETE SET NULL,
  discount_applied DECIMAL(10, 2) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(promo_code_id, order_id)
);

CREATE INDEX IF NOT EXISTS idx_promo_usage_user ON promo_code_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_promo_usage_code ON promo_code_usage(promo_code_id);

-- Add promo code reference to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS promo_code_id UUID REFERENCES promo_codes(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0;

-- RLS Policies for promo_codes
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- Everyone can read active promo codes
CREATE POLICY "Anyone can view active promo codes"
  ON promo_codes FOR SELECT
  TO authenticated
  USING (is_active = true AND valid_from <= NOW() AND (valid_until IS NULL OR valid_until >= NOW()));

-- Only admins can manage promo codes
CREATE POLICY "Admins can manage promo codes"
  ON promo_codes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for promo_code_usage
ALTER TABLE promo_code_usage ENABLE ROW LEVEL SECURITY;

-- Users can view their own usage
CREATE POLICY "Users can view their own promo usage"
  ON promo_code_usage FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- System can insert usage records
CREATE POLICY "Authenticated users can create usage records"
  ON promo_code_usage FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Admins can view all usage
CREATE POLICY "Admins can view all promo usage"
  ON promo_code_usage FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Insert the initial -10% first order promo code
INSERT INTO promo_codes (code, description, discount_type, discount_value, first_order_only, is_active)
VALUES (
  'BIENVENUE10',
  'Réduction de 10% pour votre première commande',
  'percentage',
  10,
  true,
  true
)
ON CONFLICT (code) DO NOTHING;

COMMENT ON TABLE promo_codes IS 'Promotional discount codes with validation rules';
COMMENT ON TABLE promo_code_usage IS 'Tracks which users have used which promo codes';
