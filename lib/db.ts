// استخدم JSON بدلاً من Neon
// يمكنك تعديل هذا لاستخدام Neon لاحقاً إذا أردت

import {
  createUser as createUserJson,
  getUserByUsername as getUserByUsernameJson,
  getUserById as getUserByIdJson,
  getUserByApiKey as getUserByApiKeyJson,
  regenerateApiKey as regenerateApiKeyJson,
  getAllUsers as getAllUsersJson,
  updateUserBalance as updateUserBalanceJson,
  deleteUser as deleteUserJson,
  createPayment as createPaymentJson,
  getPayments as getPaymentsJson,
  findUnusedPayment as findUnusedPaymentJson,
  markPaymentUsed as markPaymentUsedJson,
  logVerification as logVerificationJson,
  getVerificationLogs as getVerificationLogsJson,
  getLogsByUserId as getLogsByUserIdJson,
  createPaymentPage as createPaymentPageJson,
  getPaymentPage as getPaymentPageJson,
  updatePaymentPageStatus as updatePaymentPageStatusJson,
  getAdminStats as getAdminStatsJson,
  getUserStats as getUserStatsJson,
  getTelegramSettings as getTelegramSettingsJson,
  updateTelegramSettings as updateTelegramSettingsJson,
  getSetting as getSettingJson,
  setSetting as setSettingJson,
  transferBalance as transferBalanceJson,
} from "./db-json"

export function getDb() {
  throw new Error("Use db.ts functions instead (they use db-json.ts internally)")
}

// ─── SETTINGS ───────────────────────────────────────────
export async function getSetting(key: string): Promise<string | null> {
  return getSettingJson(key)
}

export async function setSetting(key: string, value: string) {
  return setSettingJson(key, value)
}

// ─── USERS ──────────────────────────────────────────────
export async function createUser(username: string, passwordHash: string, role: string = "user") {
  return createUserJson(username, passwordHash, role)
}

export async function getUserByUsername(username: string) {
  return getUserByUsernameJson(username)
}

export async function getUserById(id: number) {
  return getUserByIdJson(id)
}

export async function getUserByApiKey(apiKey: string) {
  return getUserByApiKeyJson(apiKey)
}

export async function regenerateApiKey(userId: number) {
  return regenerateApiKeyJson(userId)
}

export async function getAllUsers() {
  return getAllUsersJson()
}

export async function updateUserBalance(userId: number, amount: number) {
  return updateUserBalanceJson(userId, amount)
}

export async function transferBalance(fromUserId: number, toUsername: string, amount: number) {
  return transferBalanceJson(fromUserId, toUsername, amount)
}

export async function deleteUser(userId: number) {
  return deleteUserJson(userId)
}

// ─── PAYMENTS ───────────────────────────────────────────
export async function insertPayment(data: {
  sender_name: string
  amount: number
  app_name: string
  date: string
  time: string
  raw_message: string
}) {
  return createPaymentJson(data)
}

export async function findUnusedPayment(name: string, amount: number, app: string) {
  return findUnusedPaymentJson(name, amount, app)
}

export async function markPaymentUsed(paymentId: number, userId?: number | null, paymentRef?: string | null) {
  return markPaymentUsedJson(paymentId, userId, paymentRef)
}

export async function getAllPayments(limit = 50, offset = 0) {
  const payments = await getPaymentsJson()
  return payments.slice(offset, offset + limit)
}

// ─── VERIFICATION LOGS ──────────────────────────────────
export async function logVerification(data: {
  requested_name: string
  requested_amount: number
  requested_app: string
  matched_payment_id: number | null
  success: boolean
  failure_reason: string | null
  credited_balance: number | null
  api_key_used: string
  user_id?: number | null
  payment_ref?: string | null
}) {
  return logVerificationJson(data)
}

export async function getVerificationLogs(limit = 50, offset = 0) {
  const logs = await getVerificationLogsJson()
  return logs.slice(offset, offset + limit)
}

export async function getLogsByUserId(userId: number) {
  return getLogsByUserIdJson(userId)
}

// ─── PAYMENT PAGES ──────────────────────────────────────
export async function createPaymentPage(data: {
  id: string
  sender_name: string
  amount: number
  app_name: string
  payment_ref?: string
  user_id?: number
}) {
  return createPaymentPageJson(data)
}

export async function getPaymentPage(id: string) {
  return getPaymentPageJson(id)
}

export async function updatePaymentPageStatus(id: string, status: string) {
  return updatePaymentPageStatusJson(id, status)
}

// ─── STATS ──────────────────────────────────────────────
export async function getAdminStats() {
  return getAdminStatsJson()
}

export async function getUserStats(userId: number) {
  return getUserStatsJson(userId)
}

// ─── TELEGRAM SETTINGS ──────────────────────────────────
export async function getTelegramSettings() {
  return getTelegramSettingsJson()
}

export async function saveTelegramSettings(data: { apiId: string; apiHash: string; chatId: string; sessionString: string }) {
  return updateTelegramSettingsJson(data)
}
