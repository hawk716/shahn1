import { NextResponse } from "next/server"
import { getTelegramSettings, updateTelegramSettings } from "@/lib/db-json"
import { getAdminSession } from "@/lib/session"

export async function GET() {
  const admin = await getAdminSession()
  if (!admin) {
    return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 })
  }

  try {
    const settings = await getTelegramSettings()
    return NextResponse.json({ success: true, data: settings })
  } catch (error) {
    console.error("telegram settings GET error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const admin = await getAdminSession()
  if (!admin) {
    return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { apiId, apiHash, chatId, sessionString, bot_token, notification_chat_id } = body
    
    await updateTelegramSettings({ 
      apiId, 
      apiHash, 
      chatId, 
      sessionString,
      bot_token,
      notification_chat_id,
      is_enabled: true 
    })
    
    return NextResponse.json({ success: true, message: "Telegram settings saved" })
  } catch (error) {
    console.error("telegram settings PUT error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
