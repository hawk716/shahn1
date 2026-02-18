const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// محاكاة دقيقة لآلية التشفير في lib/password.ts باستخدام Node.js crypto
async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  // PBKDF2 مع 100,000 تكرار و SHA-256
  const derivedKey = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
  
  const saltHex = salt.toString('hex');
  const hashHex = derivedKey.toString('hex');
  return `${saltHex}:${hashHex}`;
}

const DB_PATH = path.join(__dirname, 'data', 'db.json');

async function fixAdmin() {
  const username = 'moatsem';
  const password = '716moatsem';

  if (!fs.existsSync(DB_PATH)) {
    console.error('Database not found!');
    return;
  }

  const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  
  // حذف أي نسخة قديمة لضمان النظافة
  db.users = db.users.filter(u => u.username.toLowerCase() !== username.toLowerCase());
  
  console.log(`Creating fresh admin user: ${username}`);
  const passwordHash = await hashPassword(password);
  const apiKey = crypto.randomBytes(32).toString('hex');
  
  const user = {
    id: Math.max(...db.users.map((u) => u.id || 0), 0) + 1,
    username,
    email: 'admin@example.com',
    password_hash: passwordHash,
    role: 'admin',
    api_key: apiKey,
    balance: 1000000,
    email_verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  db.users.push(user);
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  console.log('Admin user fixed and saved successfully!');
}

fixAdmin().catch(console.error);
