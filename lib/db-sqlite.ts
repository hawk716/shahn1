import initSqlJs, { Database as SqlJsDatabase } from "sql.js";
import fs from "fs";
import path from "path";
import { randomBytes } from "crypto";

let db: SqlJsDatabase | null = null;
let SQL: any = null;

// استخدم /tmp في Vercel production
const dbPath = process.env.SQLITE_PATH || (
  process.env.NODE_ENV === "production" 
    ? path.join("/tmp", "app.db")
    : path.join(process.cwd(), "data", "app.db")
);

async function initDatabase(): Promise<SqlJsDatabase> {
  if (db && SQL) return db;

  // Initialize SQL.js
  if (!SQL) {
    SQL = await initSqlJs();
  }

  // Create data directory if it doesn't exist (only in dev, /tmp exists in Vercel)
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true });
    } catch (err) {
      // في Vercel، المجلد موجود بالفعل
      console.log("[v0] DB directory exists or cannot create:", dataDir);
    }
  }

  // Load or create database
  if (fs.existsSync(dbPath)) {
    const filebuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(filebuffer);
  } else {
    db = new SQL.Database();
  }

  return db;
}

async function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch (err) {
        console.log("[v0] Could not create DB directory:", dataDir);
      }
    }
    fs.writeFileSync(dbPath, buffer);
  }
}

export async function runQuery(sql: string, params: any[] = []): Promise<any[]> {
  try {
    const database = await initDatabase();
    const stmt = database.prepare(sql);
    stmt.bind(params);
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  } catch (error) {
    console.error("[v0] runQuery error:", error);
    throw error;
  }
}

export async function runQuerySingle(sql: string, params: any[] = []): Promise<any | null> {
  try {
    const database = await initDatabase();
    const stmt = database.prepare(sql);
    stmt.bind(params);
    let result = null;
    if (stmt.step()) {
      result = stmt.getAsObject();
    }
    stmt.free();
    return result;
  } catch (error) {
    console.error("[v0] runQuerySingle error:", error);
    throw error;
  }
}

export async function runUpdate(sql: string, params: any[] = []): Promise<number> {
  try {
    const database = await initDatabase();
    const stmt = database.prepare(sql);
    stmt.bind(params);
    stmt.step();
    stmt.free();
    await saveDatabase();

    // Get last insert ID
    const idResult = await runQuerySingle("SELECT last_insert_rowid() as id");
    return idResult?.id || 0;
  } catch (error) {
    console.error("[v0] runUpdate error:", error);
    throw error;
  }
}

// ─── USERS ──────────────────────────────────────────────
export async function createUser(username: string, passwordHash: string, role: string = "user") {
  try {
    const apiKey = randomBytes(32).toString("hex");

    await runUpdate(
      `INSERT INTO users (username, password_hash, role, api_key, balance) 
       VALUES (?, ?, ?, ?, ?)`,
      [username, passwordHash, role, apiKey, 0]
    );

    return await getUserByUsername(username);
  } catch (error) {
    throw error;
  }
}

export async function getUserById(id: number) {
  try {
    return await runQuerySingle(`SELECT * FROM users WHERE id = ?`, [id]);
  } catch (error) {
    console.error("[v0] Error getting user by ID:", error);
    return null;
  }
}

export async function getUserByUsername(username: string) {
  try {
    return await runQuerySingle(`SELECT * FROM users WHERE username = ?`, [username]);
  } catch (error) {
    console.error("[v0] Error getting user by username:", error);
    return null;
  }
}

export async function getUserByApiKey(apiKey: string) {
  try {
    return await runQuerySingle(`SELECT * FROM users WHERE api_key = ?`, [apiKey]);
  } catch (error) {
    console.error("[v0] Error getting user by API key:", error);
    return null;
  }
}

// ─── SESSIONS ───────────────────────────────────────────
export async function createSession(userId: number, token: string, expiresAt: Date) {
  try {
    await runUpdate(
      `INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)`,
      [userId, token, expiresAt.toISOString()]
    );
  } catch (error) {
    console.error("[v0] Error creating session:", error);
  }
}

export async function getSessionByToken(token: string) {
  try {
    return await runQuerySingle(`SELECT * FROM sessions WHERE token = ?`, [token]);
  } catch (error) {
    console.error("[v0] Error getting session:", error);
    return null;
  }
}

export async function deleteSession(token: string) {
  try {
    await runUpdate(`DELETE FROM sessions WHERE token = ?`, [token]);
  } catch (error) {
    console.error("[v0] Error deleting session:", error);
  }
}

export async function deleteExpiredSessions() {
  try {
    await runUpdate(`DELETE FROM sessions WHERE expires_at < datetime('now')`);
  } catch (error) {
    console.error("[v0] Error deleting expired sessions:", error);
  }
}

// ─── SETTINGS ───────────────────────────────────────────
export async function getSetting(key: string): Promise<string | null> {
  try {
    const result = await runQuerySingle(`SELECT value FROM settings WHERE key = ?`, [key]);
    return result?.value || null;
  } catch (error) {
    console.error("[v0] Error getting setting:", error);
    return null;
  }
}

export async function setSetting(key: string, value: string): Promise<void> {
  try {
    const existing = await runQuerySingle(`SELECT id FROM settings WHERE key = ?`, [key]);
    if (existing) {
      await runUpdate(`UPDATE settings SET value = ? WHERE key = ?`, [value, key]);
    } else {
      await runUpdate(`INSERT INTO settings (key, value) VALUES (?, ?)`, [key, value]);
    }
  } catch (error) {
    console.error("[v0] Error setting setting:", error);
  }
}

// ─── PAYMENT PAGES ──────────────────────────────────────
export async function createPaymentPage(data: any) {
  try {
    await runUpdate(
      `INSERT INTO payment_pages (id, sender_name, amount, app_name, payment_ref, user_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.id,
        data.sender_name,
        data.amount,
        data.app_name,
        data.payment_ref || null,
        data.user_id || null,
        "pending",
      ]
    );
    return data;
  } catch (error) {
    throw error;
  }
}

export async function getPaymentPage(id: string) {
  try {
    return await runQuerySingle(`SELECT * FROM payment_pages WHERE id = ?`, [id]);
  } catch (error) {
    console.error("[v0] Error getting payment page:", error);
    return null;
  }
}

export async function updatePaymentPageStatus(id: string, status: string): Promise<void> {
  try {
    await runUpdate(`UPDATE payment_pages SET status = ? WHERE id = ?`, [status, id]);
  } catch (error) {
    console.error("[v0] Error updating payment page status:", error);
  }
}

// ─── PAYMENTS (EXTENDED) ────────────────────────────────
export async function createPayment(data: any) {
  try {
    await runUpdate(
      `INSERT INTO payments (sender_name, amount, app_name, date, time, raw_message)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.sender_name || "",
        data.amount || 0,
        data.app_name || "",
        data.date || "",
        data.time || "",
        data.raw_message || "",
      ]
    );
    return data;
  } catch (error) {
    console.error("[v0] Error creating payment:", error);
    throw error;
  }
}

export async function getPayments() {
  try {
    return await runQuery(`SELECT * FROM payments ORDER BY created_at DESC LIMIT 100`);
  } catch (error) {
    console.error("[v0] Error getting payments:", error);
    return [];
  }
}

export async function findUnusedPayment(name: string, amount: number, app: string) {
  try {
    return await runQuerySingle(
      `SELECT * FROM payments
       WHERE sender_name LIKE ? AND amount = ? AND app_name LIKE ? AND used = 0
       ORDER BY created_at DESC
       LIMIT 1`,
      [`%${name}%`, amount, app]
    );
  } catch (error) {
    console.error("[v0] Error finding unused payment:", error);
    return null;
  }
}

export async function markPaymentUsed(paymentId: number, userId?: number | null, paymentRef?: string | null): Promise<void> {
  try {
    await runUpdate(
      `UPDATE payments SET used = 1, user_id = ?, payment_ref = ? WHERE id = ?`,
      [userId || null, paymentRef || null, paymentId]
    );
  } catch (error) {
    console.error("[v0] Error marking payment as used:", error);
  }
}

export async function getAllPayments(limit = 50, offset = 0) {
  try {
    return await runQuery(
      `SELECT * FROM payments ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
  } catch (error) {
    console.error("[v0] Error getting all payments:", error);
    return [];
  }
}

// ─── VERIFICATION LOGS (EXTENDED) ──────────────────────
export async function logVerification(data: any): Promise<void> {
  try {
    await runUpdate(
      `INSERT INTO verification_logs
        (requested_name, requested_amount, requested_app, matched_payment_id, success, failure_reason, credited_balance, api_key_used, user_id, payment_ref)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.requested_name,
        data.requested_amount,
        data.requested_app,
        data.matched_payment_id || null,
        data.success ? 1 : 0,
        data.failure_reason || null,
        data.credited_balance || null,
        data.api_key_used,
        data.user_id || null,
        data.payment_ref || null,
      ]
    );
  } catch (error) {
    console.error("[v0] Error logging verification:", error);
  }
}

export async function getVerificationLogs(limit = 50, offset = 0) {
  try {
    return await runQuery(
      `SELECT * FROM verification_logs ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
  } catch (error) {
    console.error("[v0] Error getting verification logs:", error);
    return [];
  }
}

export async function getLogsByUserId(userId: number) {
  try {
    return await runQuery(
      `SELECT * FROM verification_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 100`,
      [userId]
    );
  } catch (error) {
    console.error("[v0] Error getting logs by user ID:", error);
    return [];
  }
}

// ─── STATS ──────────────────────────────────────────────
export async function getAdminStats() {
  try {
    const users = await runQuerySingle(`SELECT COUNT(*) as count FROM users`);
    const totalPayments = await runQuerySingle(
      `SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM payments`
    );
    const usedPayments = await runQuerySingle(
      `SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM payments WHERE used = 1`
    );
    const successLogs = await runQuerySingle(
      `SELECT COUNT(*) as count FROM verification_logs WHERE success = 1`
    );
    const failLogs = await runQuerySingle(
      `SELECT COUNT(*) as count FROM verification_logs WHERE success = 0`
    );

    return {
      userCount: users?.count || 0,
      paymentCount: totalPayments?.count || 0,
      totalAmount: Number(totalPayments?.total || 0),
      usedPaymentCount: usedPayments?.count || 0,
      usedAmount: Number(usedPayments?.total || 0),
      successfulVerifications: successLogs?.count || 0,
      failedVerifications: failLogs?.count || 0,
    };
  } catch (error) {
    console.error("[v0] Error getting admin stats:", error);
    return {
      userCount: 0,
      paymentCount: 0,
      totalAmount: 0,
      usedPaymentCount: 0,
      usedAmount: 0,
      successfulVerifications: 0,
      failedVerifications: 0,
    };
  }
}

export async function getUserStats(userId: number) {
  try {
    const user = await runQuerySingle(`SELECT balance FROM users WHERE id = ?`, [userId]);
    const successLogs = await runQuerySingle(
      `SELECT COUNT(*) as count FROM verification_logs WHERE user_id = ? AND success = 1`,
      [userId]
    );
    const failLogs = await runQuerySingle(
      `SELECT COUNT(*) as count FROM verification_logs WHERE user_id = ? AND success = 0`,
      [userId]
    );
    const totalAmount = await runQuerySingle(
      `SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE user_id = ? AND used = 1`,
      [userId]
    );

    return {
      balance: user ? Number(user.balance) : 0,
      successfulRequests: successLogs?.count || 0,
      failedRequests: failLogs?.count || 0,
      totalAmountProcessed: Number(totalAmount?.total || 0),
    };
  } catch (error) {
    console.error("[v0] Error getting user stats:", error);
    return {
      balance: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalAmountProcessed: 0,
    };
  }
}

// ─── TELEGRAM SETTINGS ──────────────────────────────────
export async function getTelegramSettings() {
  try {
    return await runQuerySingle(`SELECT * FROM telegram_settings ORDER BY id DESC LIMIT 1`);
  } catch (error) {
    console.error("[v0] Error getting telegram settings:", error);
    return null;
  }
}

export async function updateTelegramSettings(data: {
  bot_token: string;
  channel_id: string;
  is_enabled: boolean;
}) {
  try {
    const existing = await getTelegramSettings();
    if (existing) {
      await runUpdate(
        `UPDATE telegram_settings SET bot_token = ?, channel_id = ?, is_enabled = ? WHERE id = ?`,
        [data.bot_token, data.channel_id, data.is_enabled ? 1 : 0, existing.id]
      );
    } else {
      await runUpdate(
        `INSERT INTO telegram_settings (bot_token, channel_id, is_enabled) VALUES (?, ?, ?)`,
        [data.bot_token, data.channel_id, data.is_enabled ? 1 : 0]
      );
    }
  } catch (error) {
    console.error("[v0] Error updating telegram settings:", error);
  }
}

// ─── UPDATE USER BALANCE ─────────────────────────────────
export async function updateUserBalance(userId: number, newBalance: number) {
  try {
    await runUpdate(`UPDATE users SET balance = ? WHERE id = ?`, [newBalance, userId]);
  } catch (error) {
    console.error("[v0] Error updating user balance:", error);
  }
}

// ─── REGENERATE API KEY ─────────────────────────────────
export async function regenerateApiKey(userId: number) {
  try {
    const apiKey = randomBytes(32).toString("hex");
    await runUpdate(`UPDATE users SET api_key = ? WHERE id = ?`, [apiKey, userId]);
    return apiKey;
  } catch (error) {
    console.error("[v0] Error regenerating API key:", error);
    throw error;
  }
}

// ─── GET ALL USERS ──────────────────────────────────────
export async function getAllUsers() {
  try {
    return await runQuery(
      `SELECT id, username, role, balance, created_at FROM users ORDER BY created_at DESC`
    );
  } catch (error) {
    console.error("[v0] Error getting all users:", error);
    return [];
  }
}

// ─── DELETE USER ────────────────────────────────────────
export async function deleteUser(userId: number) {
  try {
    await runUpdate(`DELETE FROM users WHERE id = ?`, [userId]);
  } catch (error) {
    console.error("[v0] Error deleting user:", error);
  }
}

export function closeDatabase() {
  if (db) {
    try {
      db.close();
      db = null;
    } catch (err) {
      console.error("[v0] Error closing database:", err);
    }
  }
}
