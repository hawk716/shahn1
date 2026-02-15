-- Migration v4: Add user_id to payment_pages
ALTER TABLE payment_pages ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);
