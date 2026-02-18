const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// محاكاة آلية التشفير المستخدمة في المشروع (PBKDF2)
async function deriveKey(password, salt) {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 100000, 32, 'sha256', (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });
}

async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const derived = await deriveKey(password, salt);
  const saltHex = salt.toString('hex');
  const hashHex = derived.toString('hex');
  return `${saltHex}:${hashHex}`;
}

const DB_PATH = path.join(__dirname, 'data', 'db.json');

async function createAdmin() {
  const username = 'moatsem';
  const password = '716moatsem';
  const role = 'admin';

  if (!fs.existsSync(DB_PATH)) {
    console.log('Database file not found, creating new one...');
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify({
      users: [],
      sessions: [],
      payments: [],
      verification_logs: [],
      payment_pages: [],
      settings: [],
      telegram_settings: [],
      email_verifications: [],
    }, null, 2));
  }

  const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  
  // التحقق إذا كان المستخدم موجوداً
  const existingUser = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (existingUser) {
    console.log(`User ${username} already exists. Updating password and role to admin...`);
    existingUser.password_hash = await hashPassword(password);
    existingUser.role = 'admin';
    existingUser.email_verified = true;
  } else {
    console.log(`Creating new admin user: ${username}`);
    const passwordHash = await hashPassword(password);
    const apiKey = crypto.randomBytes(32).toString('hex');
    const user = {
      id: Math.max(...db.users.map((u) => u.id || 0), 0) + 1,
      username,
      email: 'admin@example.com',
      password_hash: passwordHash,
      role,
      api_key: apiKey,
      balance: 1000000, // رصيد افتراضي كبير للأدمن
      email_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.users.push(user);
  }

  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  console.log('Admin user created/updated successfully!');
}

createAdmin().catch(console.error);
