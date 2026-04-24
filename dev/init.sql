/* For development purposes only */

CREATE TABLE IF NOT EXISTS config (
    config_key TEXT PRIMARY KEY,
    config_value JSONB NOT NULL
);

INSERT INTO config (config_key, config_value) VALUES
    ('krambambouli_enabled', to_jsonb(true)),
    ('lustrumgalabal_enabled', to_jsonb(false))
ON CONFLICT (config_key) DO NOTHING;

CREATE TABLE IF NOT EXISTS roles (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);

INSERT INTO roles (name) VALUES
    ('root'),
    ('admin'),
    ('boardMember')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT,
    role_id INT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS activities (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location_name TEXT NOT NULL,
    location_address TEXT,
    location_url TEXT,
    facebook_url TEXT
);

CREATE TABLE IF NOT EXISTS email_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    recipient TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    retries INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY ,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    image_url TEXT,
    euros INTEGER DEFAULT 0,
    cents INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS krambambouli_customers (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS krambambouli_orders (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    delivery_option TEXT NOT NULL,
    owed_euros INTEGER DEFAULT 0,
    owed_cents INTEGER DEFAULT 0,
    paid BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_customer
        FOREIGN KEY (customer_id)
        REFERENCES krambambouli_customers(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS krambambouli_order_items (
    order_id BIGINT NOT NULL,
    product_id INTEGER NOT NULL,
    amount INTEGER NOT NULL,

    PRIMARY KEY (order_id, product_id),

    CONSTRAINT fk_order
        FOREIGN KEY (order_id)
        REFERENCES krambambouli_orders(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
);


CREATE TABLE IF NOT EXISTS krambambouli_pickup_locations (
    order_id BIGINT PRIMARY KEY,
    pickup_location TEXT NOT NULL,

    CONSTRAINT fk_order
        FOREIGN KEY (order_id)
        REFERENCES krambambouli_orders(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS krambambouli_delivery_locations (
    order_id BIGINT PRIMARY KEY,
    street_name TEXT NOT NULL,
    house_number TEXT NOT NULL,
    bus TEXT,
    postal_code TEXT NOT NULL,
    city TEXT,

    CONSTRAINT fk_order
        FOREIGN KEY (order_id)
        REFERENCES krambambouli_orders(id)
        ON DELETE CASCADE
);
