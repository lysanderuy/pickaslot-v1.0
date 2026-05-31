-- Fix court timezone identifier from 'Asia/Singapore' to 'Asia/Manila'.
-- Both are UTC+8 with no DST, so no time values change — identifier only.

ALTER TABLE public.courts ALTER COLUMN timezone SET DEFAULT 'Asia/Manila';

UPDATE public.courts SET timezone = 'Asia/Manila' WHERE timezone = 'Asia/Singapore';
