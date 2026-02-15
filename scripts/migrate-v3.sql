-- V3 Migration: Add role to users, callback_url, ensure telegram settings keys match code

-- Add role column to users if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Add callback_url column to users for webhook notifications on successful payments
ALTER TABLE users ADD COLUMN IF NOT EXISTS callback_url TEXT DEFAULT '';

-- Add user_id to payments if not exists (for tracking who verified)
ALTER TABLE payments ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);

-- Ensure telegram settings exist with the correct keys used in code
INSERT INTO settings (key, value) VALUES ('telegram_api_id', '') ON CONFLICT (key) DO NOTHING;
INSERT INTO settings (key, value) VALUES ('telegram_api_hash', '') ON CONFLICT (key) DO NOTHING;
INSERT INTO settings (key, value) VALUES ('telegram_chat_id', '') ON CONFLICT (key) DO NOTHING;
INSERT INTO settings (key, value) VALUES ('telegram_session_string', '') ON CONFLICT (key) DO NOTHING;

-- Create default admin user (username: admin, password: admin123)
-- The hash will be set via the app on first login
INSERT INTO settings (key, value) VALUES ('admin_initialized', 'false') ON CONFLICT (key) DO NOTHING;
