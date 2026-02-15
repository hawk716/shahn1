-- V2 Migration: Users system, payment_id support, telegram settings

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  api_key TEXT UNIQUE,
  balance NUMERIC(14, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add user_id to verification_logs
ALTER TABLE verification_logs ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);
ALTER TABLE verification_logs ADD COLUMN IF NOT EXISTS payment_ref TEXT;

-- Add payment_ref to payments (external payment_id sent by the API caller)
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_ref TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS verified_by_user_id INTEGER REFERENCES users(id);

-- Add payment_ref to payment_pages
ALTER TABLE payment_pages ADD COLUMN IF NOT EXISTS payment_ref TEXT;

-- Default telegram settings
INSERT INTO settings (key, value) VALUES ('telegram_api_id', '')
ON CONFLICT (key) DO NOTHING;

INSERT INTO settings (key, value) VALUES ('telegram_api_hash', '')
ON CONFLICT (key) DO NOTHING;

INSERT INTO settings (key, value) VALUES ('telegram_channel_id', '')
ON CONFLICT (key) DO NOTHING;

INSERT INTO settings (key, value) VALUES ('telegram_session', '')
ON CONFLICT (key) DO NOTHING;

-- Default admin password (admin / admin123) - bcrypt hash of "admin123"
INSERT INTO settings (key, value) VALUES ('admin_password_hash', '$2b$10$placeholder_change_me')
ON CONFLICT (key) DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_api_key ON users (api_key);
CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
CREATE INDEX IF NOT EXISTS idx_verification_logs_user ON verification_logs (user_id);
