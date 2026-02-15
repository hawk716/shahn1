/**
 * Telegram MTProto Service Configuration
 * 
 * This module provides the integration pattern for reading messages
 * from a Telegram channel/group using GramJS (MTProto).
 * 
 * SETUP INSTRUCTIONS:
 * 1. Get your Telegram API credentials from https://my.telegram.org
 * 2. Set environment variables:
 *    - TELEGRAM_API_ID: Your API ID
 *    - TELEGRAM_API_HASH: Your API hash
 *    - TELEGRAM_SESSION: Session string (generated after first login)
 *    - TELEGRAM_CHANNEL_ID: The channel/group ID to monitor
 * 
 * USAGE:
 * This service is designed to run as a separate process or cron job
 * that fetches new messages and posts them to /api/ingest-messages.
 * 
 * For production, you can either:
 * a) Run the Telethon/GramJS script externally and POST to the API
 * b) Use a Vercel Cron Job to periodically check for new messages
 * 
 * Below is the reference implementation pattern:
 */

// ─── External Script Pattern (Node.js with GramJS) ────────────
// Run this as a separate Node.js process (not inside Next.js)
export const GRAMJS_SCRIPT_EXAMPLE = `
// telegram-listener.js (run separately with Node.js)
// npm install telegram input

const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");

const API_ID = parseInt(process.env.TELEGRAM_API_ID);
const API_HASH = process.env.TELEGRAM_API_HASH;
const SESSION = process.env.TELEGRAM_SESSION || "";
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";
const API_KEY = process.env.PAYMENT_API_KEY;

async function main() {
  const client = new TelegramClient(
    new StringSession(SESSION),
    API_ID,
    API_HASH,
    { connectionRetries: 5 }
  );

  await client.start({
    phoneNumber: async () => prompt("Phone number: "),
    password: async () => prompt("2FA Password: "),
    phoneCode: async () => prompt("Code: "),
    onError: (err) => console.error(err),
  });

  console.log("Session:", client.session.save());
  console.log("Connected to Telegram!");

  // Listen for new messages
  client.addEventHandler(async (event) => {
    const message = event.message;
    if (!message || !message.text) return;

    // Filter: only process messages containing "ر.ي" (Yemeni Rial)
    if (!message.text.includes("ر.ي")) return;

    console.log("New payment message:", message.text);

    try {
      const response = await fetch(API_BASE_URL + "/api/ingest-messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify({ message: message.text }),
      });

      const result = await response.json();
      console.log("Ingested:", result);
    } catch (err) {
      console.error("Failed to ingest:", err);
    }
  });

  console.log("Listening for new messages...");
}

main().catch(console.error);
`

// ─── Python Telethon Pattern ───────────────────────────────────
export const TELETHON_SCRIPT_EXAMPLE = `
# telegram_listener.py (run separately with Python)
# pip install telethon requests

import os
import json
import requests
from telethon import TelegramClient, events

API_ID = int(os.environ["TELEGRAM_API_ID"])
API_HASH = os.environ["TELEGRAM_API_HASH"]
CHANNEL_ID = int(os.environ.get("TELEGRAM_CHANNEL_ID", "0"))
API_BASE_URL = os.environ.get("API_BASE_URL", "http://localhost:3000")
API_KEY = os.environ["PAYMENT_API_KEY"]

client = TelegramClient("session", API_ID, API_HASH)

@client.on(events.NewMessage(chats=CHANNEL_ID))
async def handler(event):
    text = event.raw_text
    if "ر.ي" not in text:
        return

    print(f"New payment message: {text}")

    try:
        response = requests.post(
            f"{API_BASE_URL}/api/ingest-messages",
            json={"message": text},
            headers={
                "Content-Type": "application/json",
                "x-api-key": API_KEY,
            },
        )
        print(f"Ingested: {response.json()}")
    except Exception as e:
        print(f"Failed to ingest: {e}")

with client:
    print("Listening for new messages...")
    client.run_until_disconnected()
`

/**
 * Helper: Simulate a Telegram message for testing.
 * This can be called from the admin dashboard for testing purposes.
 */
export function generateTestMessage(
  name: string,
  amount: number,
  app: string
): string {
  const now = new Date()
  const day = String(now.getDate()).padStart(2, "0")
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const year = now.getFullYear()
  const hours = String(now.getHours()).padStart(2, "0")
  const minutes = String(now.getMinutes()).padStart(2, "0")
  const seconds = String(now.getSeconds()).padStart(2, "0")

  return `-> com.motorola.messaging:${day}-${month}-${year} ${hours}:${minutes}:${seconds} - ${app} - اضيف ${amount}ر.ي ... من ${name}`
}
