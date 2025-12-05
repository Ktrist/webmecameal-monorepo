-- Migration: Add allergens field to menus table
-- Date: 2025-01-05
-- US-031: Liste des allergènes

-- Add allergens column to store array of allergen names
ALTER TABLE menus
ADD COLUMN IF NOT EXISTS allergens JSONB DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN menus.allergens IS 'Array of allergen names (e.g., ["gluten", "lait", "oeufs"]) conforming to EU regulation 1169/2011';

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_menus_allergens ON menus USING GIN (allergens);
