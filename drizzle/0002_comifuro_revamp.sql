DO $$ BEGIN
  CREATE TYPE "event_day" AS ENUM ('DAY_1', 'DAY_2', 'ALL_DAYS');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "floor_maps" ADD COLUMN IF NOT EXISTS "hall" varchar(60);
ALTER TABLE "booth_locations" ADD COLUMN IF NOT EXISTS "day" "event_day" NOT NULL DEFAULT 'ALL_DAYS';
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "target_day" "event_day" NOT NULL DEFAULT 'ALL_DAYS';
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "is_rush" boolean NOT NULL DEFAULT false;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "po_pickup_notes" text;

CREATE INDEX IF NOT EXISTS "products_target_day_idx" ON "products" ("target_day");
CREATE INDEX IF NOT EXISTS "products_is_rush_idx" ON "products" ("is_rush");
CREATE INDEX IF NOT EXISTS "booth_locations_day_idx" ON "booth_locations" ("day");
