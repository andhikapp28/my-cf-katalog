CREATE TYPE "user_role" AS ENUM ('ADMIN');
CREATE TYPE "product_status" AS ENUM ('TARGET', 'PO_OPEN', 'PO_DONE', 'PURCHASED', 'CANCELLED', 'SOLD_OUT');
CREATE TYPE "priority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');
CREATE TYPE "purchase_type" AS ENUM ('PO', 'ON_THE_SPOT');
CREATE TYPE "payment_method" AS ENUM ('CASH', 'QRIS', 'CARD', 'BANK_TRANSFER', 'E_WALLET', 'OTHER');

CREATE TABLE "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" varchar(255) NOT NULL,
  "password_hash" text NOT NULL,
  "role" "user_role" NOT NULL DEFAULT 'ADMIN',
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX "users_email_unique" ON "users" ("email");

CREATE TABLE "events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" varchar(160) NOT NULL,
  "slug" varchar(180) NOT NULL,
  "description" text,
  "venue" varchar(180),
  "banner_image_url" text,
  "starts_at" timestamptz,
  "ends_at" timestamptz,
  "budget" integer NOT NULL DEFAULT 0,
  "is_active" boolean NOT NULL DEFAULT false,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX "events_slug_unique" ON "events" ("slug");
CREATE INDEX "events_active_idx" ON "events" ("is_active");

CREATE TABLE "circles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" varchar(160) NOT NULL,
  "slug" varchar(180) NOT NULL,
  "social_link" text,
  "notes" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX "circles_slug_unique" ON "circles" ("slug");
CREATE INDEX "circles_name_idx" ON "circles" ("name");

CREATE TABLE "floor_maps" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "event_id" uuid NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
  "name" varchar(160) NOT NULL,
  "image_url" text NOT NULL,
  "width" integer NOT NULL,
  "height" integer NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX "floor_maps_event_idx" ON "floor_maps" ("event_id");

CREATE TABLE "booth_locations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "event_id" uuid NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
  "circle_id" uuid NOT NULL REFERENCES "circles"("id") ON DELETE CASCADE,
  "floor_map_id" uuid NOT NULL REFERENCES "floor_maps"("id") ON DELETE CASCADE,
  "booth_code" varchar(32) NOT NULL,
  "pos_x" integer NOT NULL,
  "pos_y" integer NOT NULL,
  "notes" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX "booth_locations_event_idx" ON "booth_locations" ("event_id");
CREATE INDEX "booth_locations_circle_idx" ON "booth_locations" ("circle_id");
CREATE UNIQUE INDEX "booth_locations_event_circle_booth_unique" ON "booth_locations" ("event_id", "circle_id", "booth_code");

CREATE TABLE "products" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "event_id" uuid NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
  "circle_id" uuid NOT NULL REFERENCES "circles"("id") ON DELETE RESTRICT,
  "name" varchar(200) NOT NULL,
  "image_url" text,
  "price" integer NOT NULL DEFAULT 0,
  "po_deadline" date,
  "product_link" text,
  "status" "product_status" NOT NULL DEFAULT 'TARGET',
  "priority" "priority" NOT NULL DEFAULT 'MEDIUM',
  "quantity" integer NOT NULL DEFAULT 1,
  "notes" text,
  "purchase_type" "purchase_type" NOT NULL DEFAULT 'ON_THE_SPOT',
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX "products_event_idx" ON "products" ("event_id");
CREATE INDEX "products_circle_idx" ON "products" ("circle_id");
CREATE INDEX "products_status_idx" ON "products" ("status");
CREATE INDEX "products_priority_idx" ON "products" ("priority");
CREATE INDEX "products_deadline_idx" ON "products" ("po_deadline");

CREATE TABLE "expense_categories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" varchar(120) NOT NULL,
  "slug" varchar(140) NOT NULL,
  "color" varchar(16) NOT NULL DEFAULT '#D46A3A',
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX "expense_categories_slug_unique" ON "expense_categories" ("slug");

CREATE TABLE "expenses" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "event_id" uuid NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
  "product_id" uuid REFERENCES "products"("id") ON DELETE SET NULL,
  "category_id" uuid NOT NULL REFERENCES "expense_categories"("id") ON DELETE RESTRICT,
  "amount" integer NOT NULL,
  "expense_date" date NOT NULL,
  "note" text,
  "payment_method" "payment_method" NOT NULL DEFAULT 'CASH',
  "is_planned" boolean NOT NULL DEFAULT false,
  "is_actual" boolean NOT NULL DEFAULT true,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX "expenses_event_idx" ON "expenses" ("event_id");
CREATE INDEX "expenses_category_idx" ON "expenses" ("category_id");
CREATE INDEX "expenses_product_idx" ON "expenses" ("product_id");
CREATE INDEX "expenses_date_idx" ON "expenses" ("expense_date");

CREATE TABLE "product_status_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "product_id" uuid NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "from_status" "product_status",
  "to_status" "product_status" NOT NULL,
  "note" text,
  "created_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX "product_status_logs_product_idx" ON "product_status_logs" ("product_id", "created_at");