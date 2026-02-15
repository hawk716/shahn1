import { NextResponse } from 'next/server'
import fetch from 'node-fetch'

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''
const TELEGRAM_ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID || ''
const BOT_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`

interface WithdrawalRequest {
  user_id: number
  username: string
  app_name: string
  currency: string
  amount: number
  account_number: string
  total_balance: number
  previous_withdrawals: number
  account_creation_date: string
  success_count: number
  failed_count: number
}

export async function POST(request: Request) {
  try {
    const data: WithdrawalRequest = await request.json()

    // بناء رسالة الطلب
    const message = `
👤 المستخدم: ${data.username}
💰 الرصيد الكلي: ${data.total_balance}
📥 مسحوبات سابقة: ${data.previous_withdrawals}
📅 تاريخ التسجيل: ${data.account_creation_date}
📊 السجل: ${data.success_count} ناجحة | ${data.failed_count} فاشلة

📋 تفاصيل الطلب:
- التطبيق: ${data.app_name}
- المبلغ: ${data.amount} ${data.currency}
- رقم الحساب: ${data.account_number}
`

    // إرسال الرسالة مع الأزرار
    const keyboard = {
      inline_keyboard: [
        [
          {
            text: 'قبول 🟢',
            callback_data: `accept_${data.user_id}_${Date.now()}`
          },
          {
            text: 'مراسلة 📧',
            callback_data: `message_${data.user_id}`
          }
        ]
      ]
    }

    const response = await fetch(`${BOT_API_URL}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_ADMIN_CHAT_ID,
        text: message,
        reply_markup: keyboard,
        parse_mode: 'HTML'
      })
    })

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.statusText}`)
    }

    const result = await response.json()

    return NextResponse.json({
      success: true,
      message: 'تم إرسال الطلب للمشرفين',
      message_id: result.result?.message_id
    })
  } catch (error) {
    console.error('[v0] Telegram webhook error:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في إرسال الطلب' },
      { status: 500 }
    )
  }
}
