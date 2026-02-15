-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  balance NUMERIC(12, 2) NOT NULL DEFAULT 0,
  api_key TEXT UNIQUE,
  callback_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS public.sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id BIGSERIAL PRIMARY KEY,
  sender_name TEXT NOT NULL,
  sender_id BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
  amount NUMERIC(12, 2) NOT NULL,
  app_id BIGINT REFERENCES public.apps(id) ON DELETE SET NULL,
  app_name TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create apps table
CREATE TABLE IF NOT EXISTS public.apps (
  id BIGSERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create verification logs table
CREATE TABLE IF NOT EXISTS public.verification_logs (
  id BIGSERIAL PRIMARY KEY,
  requested_name TEXT NOT NULL,
  requested_amount NUMERIC(12, 2) NOT NULL,
  requested_app TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT FALSE,
  failure_reason TEXT,
  credited_balance NUMERIC(12, 2),
  matched_payment_id BIGINT REFERENCES public.payments(id) ON DELETE SET NULL,
  payment_ref TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create telegram settings table
CREATE TABLE IF NOT EXISTS public.telegram_settings (
  id BIGSERIAL PRIMARY KEY,
  chat_id TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_api_key ON public.users(api_key);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON public.sessions(token);
CREATE INDEX IF NOT EXISTS idx_payments_app_id ON public.payments(app_id);
CREATE INDEX IF NOT EXISTS idx_payments_sender_id ON public.payments(sender_id);
CREATE INDEX IF NOT EXISTS idx_verification_logs_created_at ON public.verification_logs(created_at);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_logs ENABLE ROW LEVEL SECURITY;
