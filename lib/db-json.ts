import fs from "fs";
import path from "path";
import { randomBytes } from "crypto";

// استخدم /tmp في Vercel أو production، و data في local development
const DB_PATH = path.join("/home/ubuntu/shahn1/data", "db.json");

interface Database {
  users: any[];
  sessions: any[];
  payments: any[];
  verification_logs: any[];
  payment_pages: any[];
  settings: any[];
  telegram_settings: any[];
  email_verifications: any[];
}

let dbCache: Database | null = null;

function ensureDbDir() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch (err) {
      // في Vercel، /tmp موجود بالفعل، فلا نقلق
      console.log("[v0] Note: Could not create DB directory, will use existing:", dir);
    }
  }
}

function loadDb(): Database {
  if (dbCache) return dbCache;

  ensureDbDir();

  if (fs.existsSync(DB_PATH)) {
    const data = fs.readFileSync(DB_PATH, "utf-8");
    try {
      dbCache = JSON.parse(data);
    } catch (e) {
      console.error("[v0] Failed to parse db.json, creating new db");
      dbCache = initDb();
    }
  } else {
    dbCache = initDb();
  }

  return dbCache;
}

function initDb(): Database {
  return {
    users: [],
    sessions: [],
    payments: [],
    verification_logs: [],
    payment_pages: [],
    settings: [],
    telegram_settings: [],
    email_verifications: [],
  };
}

function saveDb() {
  ensureDbDir();
  fs.writeFileSync(DB_PATH, JSON.stringify(dbCache, null, 2), "utf-8");
}

// ─── USERS ──────────────────────────────────────────────
export async function createUser(username: string, passwordHash: string, email?: string, role: string = "user") {
  const db = loadDb();
  const apiKey = randomBytes(32).toString("hex");
  const user = {
    id: Math.max(...db.users.map((u) => u.id || 0), 0) + 1,
    username,
    email: email || null,
    password_hash: passwordHash,
    role,
    api_key: apiKey,
    balance: 0,
    email_verified: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  db.users.push(user);
  saveDb();
  return user;
}

export async function getUserById(id: number) {
  const db = loadDb()
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id
  console.log('[v0] getUserById - Looking for ID:', numericId, 'Type:', typeof numericId)
  console.log('[v0] getUserById - Total users:', db.users.length)
  console.log('[v0] getUserById - User IDs in DB:', db.users.map(u => ({ id: u.id, username: u.username })))
  
  const user = db.users.find((u) => u.id === numericId) || null
  console.log('[v0] getUserById - Found user:', user ? { id: user.id, username: user.username } : null)
  
  return user
}

export async function getUserByUsername(username: string) {
  const db = loadDb();
  console.log("[v0] Total users in DB:", db.users.length)
  console.log("[v0] Searching for username:", username)
  
  // ابحث بطريقة حساسة للحالة أولاً، ثم بطريقة غير حساسة
  let user = db.users.find((u) => u.username === username);
  if (!user) {
    // بحث غير حساس للحالة
    user = db.users.find((u) => u.username.toLowerCase() === username.toLowerCase());
  }
  
  console.log("[v0] User found:", user ? user.username : "not found")
  return user || null;
}

export async function getUserByApiKey(apiKey: string) {
  const db = loadDb();
  return db.users.find((u) => u.api_key === apiKey) || null;
}

export async function getAllUsers() {
  const db = loadDb();
  return db.users.map((u) => ({ id: u.id, username: u.username, role: u.role, balance: u.balance, created_at: u.created_at }));
}

export async function deleteUser(userId: number) {
  const db = loadDb();
  db.users = db.users.filter((u) => u.id !== userId);
  saveDb();
}

export async function updateUserBalance(userId: number, balance: number) {
  const db = loadDb();
  const user = db.users.find((u) => u.id === userId);
  if (user) {
    user.balance = balance;
    saveDb();
  }
}

export async function transferBalance(fromUserId: number, toUsername: string, amount: number) {
  const db = loadDb();
  const fromUser = db.users.find((u) => u.id === fromUserId);
  const toUser = db.users.find((u) => u.username.toLowerCase() === toUsername.toLowerCase());

  if (!fromUser) throw new Error("المرسل غير موجود");
  if (!toUser) throw new Error("المستلم غير موجود");
  if (fromUser.id === toUser.id) throw new Error("لا يمكنك التحويل لنفسك");
  if (fromUser.balance < amount) throw new Error("رصيد غير كافٍ");

  fromUser.balance -= amount;
  toUser.balance += amount;
  
  // تسجيل العملية في السجلات (اختياري، سنستخدم سجلات التحقق مؤقتاً أو نكتفي بتحديث الرصيد)
  saveDb();
  return { fromBalance: fromUser.balance, toBalance: toUser.balance };
}

export async function regenerateApiKey(userId: number) {
  const db = loadDb();
  const user = db.users.find((u) => u.id === userId);
  if (user) {
    user.api_key = randomBytes(32).toString("hex");
    saveDb();
    return user.api_key;
  }
  throw new Error("User not found");
}

// ─── SESSIONS ───────────────────────────────────────────
export async function createSessionRecord(userId: number, token: string, expiresAt: Date) {
  const db = loadDb();
  const session = {
    id: Math.max(...db.sessions.map((s) => s.id || 0), 0) + 1,
    user_id: userId,
    token,
    expires_at: expiresAt.toISOString(),
    created_at: new Date().toISOString(),
  };
  db.sessions.push(session);
  saveDb();
  return session;
}

export async function getSessionByToken(token: string) {
  const db = loadDb();
  return db.sessions.find((s) => s.token === token && new Date(s.expires_at) > new Date()) || null;
}

export async function deleteSessionRecord(token: string) {
  const db = loadDb();
  db.sessions = db.sessions.filter((s) => s.token !== token);
  saveDb();
}

// ─── PAYMENTS ───────────────────────────────────────────
export async function createPayment(data: any) {
  const db = loadDb();
  const payment = {
    id: Math.max(...db.payments.map((p) => p.id || 0), 0) + 1,
    sender_name: data.sender_name || "",
    amount: data.amount || 0,
    app_name: data.app_name || "",
    date: data.date || "",
    time: data.time || "",
    raw_message: data.raw_message || "",
    used: false,
    user_id: null,
    payment_ref: null,
    created_at: new Date().toISOString(),
  };
  db.payments.push(payment);
  saveDb();
  return payment;
}

export async function getPayments() {
  const db = loadDb();
  return db.payments.slice().reverse().slice(0, 100);
}

export async function findUnusedPayment(name: string, amount: number, app: string) {
  const db = loadDb();
  return (
    db.payments.find((p) => p.sender_name.includes(name) && p.amount === amount && p.app_name.includes(app) && !p.used) || null
  );
}

export async function markPaymentUsed(paymentId: number, userId?: number | null, paymentRef?: string | null) {
  const db = loadDb();
  const payment = db.payments.find((p) => p.id === paymentId);
  if (payment) {
    payment.used = true;
    payment.user_id = userId || null;
    payment.payment_ref = paymentRef || null;
    saveDb();
  }
}

// ─── VERIFICATION LOGS ──────────────────────────────────
export async function logVerification(data: any) {
  const db = loadDb();
  const log = {
    id: Math.max(...db.verification_logs.map((l) => l.id || 0), 0) + 1,
    requested_name: data.requested_name,
    requested_amount: data.requested_amount,
    requested_app: data.requested_app,
    matched_payment_id: data.matched_payment_id || null,
    success: data.success ? 1 : 0,
    failure_reason: data.failure_reason || null,
    credited_balance: data.credited_balance || null,
    api_key_used: data.api_key_used,
    user_id: data.user_id || null,
    payment_ref: data.payment_ref || null,
    created_at: new Date().toISOString(),
  };
  db.verification_logs.push(log);
  saveDb();
}

export async function getVerificationLogs() {
  const db = loadDb();
  return db.verification_logs.slice().reverse().slice(0, 100);
}

export async function getLogsByUserId(userId: number) {
  const db = loadDb();
  return db.verification_logs.filter((l) => l.user_id === userId).slice().reverse().slice(0, 100);
}

// ─── PAYMENT PAGES ──────────────────────────────────────
export async function createPaymentPage(data: any) {
  const db = loadDb();
  const page = {
    id: data.id,
    sender_name: data.sender_name,
    amount: data.amount,
    app_name: data.app_name,
    payment_ref: data.payment_ref || null,
    user_id: data.user_id || null,
    status: "pending",
    created_at: new Date().toISOString(),
  };
  db.payment_pages.push(page);
  saveDb();
  return page;
}

export async function getPaymentPage(id: string) {
  const db = loadDb();
  return db.payment_pages.find((p) => p.id === id) || null;
}

export async function updatePaymentPageStatus(id: string, status: string) {
  const db = loadDb();
  const page = db.payment_pages.find((p) => p.id === id);
  if (page) {
    page.status = status;
    saveDb();
  }
}

export async function updatePaymentPageData(id: string, data: { sender_name?: string; amount?: number; app_name?: string }) {
  const db = loadDb();
  const page = db.payment_pages.find((p) => p.id === id);
  if (page) {
    if (data.sender_name !== undefined) page.sender_name = data.sender_name;
    if (data.amount !== undefined) page.amount = data.amount;
    if (data.app_name !== undefined) page.app_name = data.app_name;
    saveDb();
  }
}

// ─── SETTINGS ─────────────────────��─────────────────────
export async function getSetting(key: string) {
  const db = loadDb();
  const setting = db.settings.find((s) => s.key === key);
  return setting?.value || null;
}

export async function setSetting(key: string, value: string) {
  const db = loadDb();
  const setting = db.settings.find((s) => s.key === key);
  if (setting) {
    setting.value = value;
  } else {
    db.settings.push({
      id: Math.max(...db.settings.map((s) => s.id || 0), 0) + 1,
      key,
      value,
      created_at: new Date().toISOString(),
    });
  }
  saveDb();
}

// ─── TELEGRAM SETTINGS ──────────────────────────────────
export async function getTelegramSettings() {
  const db = loadDb();
  return db.telegram_settings[0] || null;
}

export async function updateTelegramSettings(data: { 
  apiId?: string; 
  apiHash?: string; 
  chatId?: string; 
  sessionString?: string;
  bot_token?: string; 
  notification_chat_id?: string;
  is_enabled?: boolean;
}) {
  const db = loadDb();
  if (db.telegram_settings.length === 0) {
    db.telegram_settings.push({
      id: 1,
      apiId: data.apiId || "",
      apiHash: data.apiHash || "",
      chatId: data.chatId || "",
      sessionString: data.sessionString || "",
      bot_token: data.bot_token || "",
      notification_chat_id: data.notification_chat_id || "",
      is_enabled: data.is_enabled !== false ? 1 : 0,
      created_at: new Date().toISOString(),
    });
  } else {
    db.telegram_settings[0] = {
      ...db.telegram_settings[0],
      apiId: data.apiId !== undefined ? data.apiId : db.telegram_settings[0].apiId,
      apiHash: data.apiHash !== undefined ? data.apiHash : db.telegram_settings[0].apiHash,
      chatId: data.chatId !== undefined ? data.chatId : db.telegram_settings[0].chatId,
      sessionString: data.sessionString !== undefined ? data.sessionString : db.telegram_settings[0].sessionString,
      bot_token: data.bot_token !== undefined ? data.bot_token : db.telegram_settings[0].bot_token,
      notification_chat_id: data.notification_chat_id !== undefined ? data.notification_chat_id : db.telegram_settings[0].notification_chat_id,
      is_enabled: data.is_enabled !== undefined ? (data.is_enabled ? 1 : 0) : db.telegram_settings[0].is_enabled,
      updated_at: new Date().toISOString(),
    };
  }
  saveDb();
}

// ─── STATS ──────────────────────────────────────────────
export async function getAdminStats() {
  const db = loadDb();
  const users = db.users.length;
  const payments = db.payments.length;
  const totalAmount = db.payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const usedPayments = db.payments.filter((p) => p.used).length;
  const usedAmount = db.payments.filter((p) => p.used).reduce((sum, p) => sum + (p.amount || 0), 0);
  const successLogs = db.verification_logs.filter((l) => l.success).length;
  const failLogs = db.verification_logs.filter((l) => !l.success).length;

  return {
    userCount: users,
    paymentCount: payments,
    totalAmount,
    usedPaymentCount: usedPayments,
    usedAmount,
    successfulVerifications: successLogs,
    failedVerifications: failLogs,
  };
}

export async function getUserStats(userId: number) {
  const db = loadDb();
  const user = db.users.find((u) => u.id === userId);
  const successLogs = db.verification_logs.filter((l) => l.user_id === userId && l.success).length;
  const failLogs = db.verification_logs.filter((l) => l.user_id === userId && !l.success).length;
  const totalAmount = db.payments.filter((p) => p.user_id === userId && p.used).reduce((sum, p) => sum + (p.amount || 0), 0);

  return {
    balance: user?.balance || 0,
    successfulRequests: successLogs,
    failedRequests: failLogs,
    totalAmountProcessed: totalAmount,
  };
}

// ─── UPDATE USER CALLBACK URL ──────────────────────────
export async function updateUserCallbackUrl(userId: number, callbackUrl: string) {
  const db = loadDb();
  const user = db.users.find((u) => u.id === userId);
  if (user) {
    user.callback_url = callbackUrl;
    saveDb();
  }
}

export function closeDatabase() {
  // نحتاج فقط لحفظ الملف
  if (dbCache) {
    saveDb();
    dbCache = null;
  }
}

// ─── EMAIL VERIFICATION ────────────────────────────────
export async function createEmailVerification(userId: number, email: string) {
  const db = loadDb();
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // صالح لمدة 24 ساعة
  
  const verification = {
    id: Math.max(...db.email_verifications.map((v) => v.id || 0), 0) + 1,
    user_id: userId,
    email,
    token,
    is_verified: false,
    expires_at: expiresAt.toISOString(),
    created_at: new Date().toISOString(),
  };
  
  db.email_verifications.push(verification);
  saveDb();
  return verification;
}

export async function getEmailVerificationByToken(token: string) {
  const db = loadDb();
  const verification = db.email_verifications.find((v) => v.token === token);
  
  if (!verification) return null;
  
  // تحقق من انتهاء الصلاحية
  if (new Date(verification.expires_at) < new Date()) {
    return null;
  }
  
  return verification;
}

export async function verifyEmailToken(token: string) {
  const db = loadDb();
  const verification = db.email_verifications.find((v) => v.token === token);
  
  if (!verification || new Date(verification.expires_at) < new Date()) {
    return null;
  }
  
  verification.is_verified = true;
  
  // تحديث المستخدم
  const user = db.users.find((u) => u.id === verification.user_id);
  if (user) {
    user.email_verified = true;
  }
  
  saveDb();
  return user;
}

export async function getUserByEmail(email: string) {
  const db = loadDb();
  return db.users.find((u) => u.email && u.email.toLowerCase() === email.toLowerCase()) || null;
}
