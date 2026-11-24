-- Sync activities from the BSK calendar.
-- The code from before this migration keeps working with it.

ALTER TABLE activities
  -- Set for activities synced from the BSK calendar; NULL for ones added by hand.
  ADD COLUMN bsk_id TEXT UNIQUE,
  -- When this copy last changed. The BSK sync sets it to the BSK's edit time; any other
  -- UPDATE must set it to now() itself, or the next sync overwrites that change.
  ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Some BSK activities have no place.
  ALTER COLUMN location_name DROP NOT NULL;
