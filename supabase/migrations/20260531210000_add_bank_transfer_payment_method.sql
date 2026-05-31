-- Add bank_transfer to payment_method enum
DO $$ BEGIN
    ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'bank_transfer';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
