-- Reference data for a local development database, loaded after initialize-postgres.sql
-- when the Docker volume is first created. No personal data: customers, orders and users
-- start empty. For a copy of production instead, run scripts/db-pull.sh.

-- Roles and what they may do
INSERT INTO roles (name) VALUES
  ('root'), ('superuser'), ('admin'), ('bestuur'), ('lid'), ('standaard');

INSERT INTO permissions (slug) VALUES
  ('activity:create'), ('activity:read'), ('activity:edit'), ('activity:delete'),
  ('order:edit_paid'), ('order:edit_global'), ('order:edit_local'), ('order:read');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON
  r.name IN ('root', 'superuser', 'admin')
  OR (r.name = 'bestuur' AND p.slug IN ('order:edit_local', 'order:read'))
  OR (r.name IN ('lid', 'standaard') AND p.slug = 'order:read');

-- The krambambouli order form is open
INSERT INTO config (config_key, config_value) VALUES
  ('krambambouli_form_enabled', to_json(true));

-- Products, prices in cents
INSERT INTO products (name, description, category, image_url, price) VALUES
  ('Krambambouli Classic', '75 cl', 'krambambouli', '/krambambouliclassic.png', 1500),
  ('Krambambouli Minus', '37,5 cl', 'krambambouli', '/krambambouliminus.png', 800),
  ('Krambambouli Gerijpt', '75 cl (2025)', 'krambambouli', '/krambambouli-gerijpt.png', 1200),
  ('Krambambouli WZC pakket', '75 cl (2025) + 75 cl (2026)', 'krambambouli', '/krambambouli-wzc.png', 2500);

-- Delivery zones by postal code, prices in cents; the cheapest matching zone applies
INSERT INTO krambambouli_delivery_zones (name, postal_code_from, postal_code_to, price) VALUES
  ('Brussels Hoofdstedelijk Gewest', 1000, 1299, 500),
  ('Vlaams Brabant', 1500, 1999, 700),
  ('Vlaams Brabant', 3000, 3499, 700),
  ('Rest van België', 1000, 9992, 1000);

-- Pickup points. The order form needs an active "Krambambouli Cantus" location whose name
-- ends in its date (dd/mm): pickups and deliveries are planned from that date.
INSERT INTO krambambouli_pickup_locations (name, active) VALUES
  ('Krambambouli Cantus (VUB Campus Etterbeek) 18/12', true),
  ('Voorbeeld ophaalpunt (1050 Elsene)', true);
