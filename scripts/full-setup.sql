-- Full database setup: All tables combined (v1 + v2 + v3)

-- Settings table for config
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  api_key TEXT UNIQUE,
  balance NUMERIC(14, 2) DEFAULT 0,
  callback_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments table: stores parsed Telegram transfer messages
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  sender_name TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  app_name TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  raw_message TEXT NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  payment_ref TEXT,
  user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verification logs table: logs every verify attempt
CREATE TABLE IF NOT EXISTS verification_logs (
  id SERIAL PRIMARY KEY,
  requested_name TEXT,
  requested_amount NUMERIC(12, 2),
  requested_app TEXT,
  matched_payment_id INTEGER REFERENCES payments(id),
  success BOOLEAN NOT NULL,
  failure_reason TEXT,
  credited_balance NUMERIC(12, 2),
  api_key_used TEXT,
  user_id INTEGER REFERENCES users(id),
  payment_ref TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment pages table: stores generated payment page data
CREATE TABLE IF NOT EXISTS payment_pages (
  id TEXT PRIMARY KEY,
  sender_name TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  app_name TEXT NOT NULL,
  payment_ref TEXT,
  user_id INTEGER REFERENCES users(id),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default settings
INSERT INTO settings (key, value) VALUES ('exchange_rate', '10') ON CONFLICT (key) DO NOTHING;
INSERT INTO settings (key, value) VALUES ('telegram_api_id', '') ON CONFLICT (key) DO NOTHING;
INSERT INTO settings (key, value) VALUES ('telegram_api_hash', '') ON CONFLICT (key) DO NOTHING;
INSERT INTO settings (key, value) VALUES ('telegram_chat_id', '') ON CONFLICT (key) DO NOTHING;
INSERT INTO settings (key, value) VALUES ('telegram_session_string', '') ON CONFLICT (key) DO NOTHING;
INSERT INTO settings (key, value) VALUES ('admin_initialized', 'false') ON CONFLICT (key) DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payments_lookup ON payments (sender_name, amount, app_name, used);
CREATE INDEX IF NOT EXISTS idx_payments_used ON payments (used);
CREATE INDEX IF NOT EXISTS idx_verification_logs_created ON verification_logs (created_at);
CREATE INDEX IF NOT EXISTS idx_users_api_key ON users (api_key);
CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
CREATE INDEX IF NOT EXISTS idx_verification_logs_user ON verification_logs (user_id);
