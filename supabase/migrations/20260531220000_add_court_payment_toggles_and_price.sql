-- Add payment method toggle columns
ALTER TABLE courts ADD COLUMN accepts_gcash boolean NOT NULL DEFAULT true;
ALTER TABLE courts ADD COLUMN accepts_cash boolean NOT NULL DEFAULT true;

-- Add house_rules_updated_at for tracking when house rules were last modified
ALTER TABLE courts ADD COLUMN house_rules_updated_at timestamp with time zone;

-- Note: price_per_hour_cents remains but will be interpreted as PHP directly (not cents)
-- Existing values like 20000 cents = 200 PHP should be divided by 100
-- This migration does NOT auto-convert; admin should verify prices after deployment
