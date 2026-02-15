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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment pages table: stores generated payment page data
CREATE TABLE IF NOT EXISTS payment_pages (
  id TEXT PRIMARY KEY,
  sender_name TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  app_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings table for exchange rate and other config
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Insert default exchange rate (1 YER = 10 credits)
INSERT INTO settings (key, value) VALUES ('exchange_rate', '10')
ON CONFLICT (key) DO NOTHING;

-- Insert default API key
INSERT INTO settings (key, value) VALUES ('api_key', 'pk_live_default_change_me')
ON CONFLICT (key) DO NOTHING;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_payments_lookup ON payments (sender_name, amount, app_name, used);
CREATE INDEX IF NOT EXISTS idx_payments_used ON payments (used);
CREATE INDEX IF NOT EXISTS idx_verification_logs_created ON verification_logs (created_at);
