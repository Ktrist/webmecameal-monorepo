-- Migration: Add recipe_details field to menus table
-- Date: 2025-01-05
-- US-020: Fiche recette détaillée

-- Add recipe_details column to store rich HTML content
ALTER TABLE menus
ADD COLUMN IF NOT EXISTS recipe_details TEXT;

-- Add comment for documentation
COMMENT ON COLUMN menus.recipe_details IS 'HTML content with detailed recipe information (ingredients, preparation steps, chef tips, etc.)';
