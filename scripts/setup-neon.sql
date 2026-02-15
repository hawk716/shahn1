CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  api_key VARCHAR(100) UNIQUE,
  callback_url TEXT,
  balance NUMERIC(15,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  sender_name VARCHAR(100),
  amount NUMERIC(15,2) NOT NULL,
  app_name VARCHAR(100),
  date TEXT,
  time TEXT,
  raw_message TEXT,
  used BOOLEAN DEFAULT FALSE,
  user_id INTEGER,
  payment_ref TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS verification_logs (
  id SERIAL PRIMARY KEY,
  requested_name TEXT,
  requested_amount NUMERIC(15,2),
  requested_app TEXT,
  matched_payment_id INTEGER,
  success BOOLEAN,
  failure_reason TEXT,
  credited_balance NUMERIC(15,2),
  api_key_used TEXT,
  user_id INTEGER,
  payment_ref TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_pages (
  id TEXT PRIMARY KEY,
  sender_name TEXT,
  amount NUMERIC(15,2),
  app_name TEXT,
  payment_ref TEXT,
  user_id INTEGER,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS telegram_settings (
  id SERIAL PRIMARY KEY,
  bot_token TEXT,
  channel_id TEXT,
  is_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
