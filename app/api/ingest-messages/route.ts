import { NextResponse } from "next/server"
import { createPayment } from "@/lib/db-json"
import { getAdminSession } from "@/lib/session"
import { parseTransferMessage, parseMultipleMessages } from "@/lib/message-parser"

/**
 * POST /api/ingest-messages
 * Accepts raw Telegram messages and parses + stores them.
 * 
 * Body: { message: string } for single or { messages: string } for multi-line
 */
export async function POST(request: Request) {
  const admin = await getAdminSession()
  if (!admin) {
    return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { message, messages } = body

    const results: Array<{ success: boolean; data?: Record<string, unknown>; error?: string; raw?: string }> = []

    if (message) {
      // Single message
      const parsed = parseTransferMessage(message)
      if (parsed) {
        const saved = await createPayment(parsed)
        results.push({ success: true, data: saved })
      } else {
        results.push({ success: false, error: "Failed to parse message", raw: message })
      }
    } else if (messages) {
      // Multiple messages (newline separated)
      const parsedList = parseMultipleMessages(messages)
      for (const parsed of parsedList) {
        const saved = await createPayment(parsed)
        results.push({ success: true, data: saved })
      }
      if (parsedList.length === 0) {
        results.push({ success: false, error: "No valid messages found in input" })
      }
    } else {
      return NextResponse.json(
        { success: false, error: "Provide 'message' or 'messages' field" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      total_processed: results.filter((r) => r.success).length,
      total_failed: results.filter((r) => !r.success).length,
      results,
    })
  } catch (error) {
    console.error("ingest-messages error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
