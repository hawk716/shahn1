import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { getUserById, getUserByUsername } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 })
    }

    const { toUsername, amount } = await req.json()

    if (!toUsername || !amount) {
      return NextResponse.json({ success: false, error: "جميع الحقول مطلوبة" }, { status: 400 })
    }

    const numericAmount = parseFloat(amount)
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ success: false, error: "مبلغ غير صالح" }, { status: 400 })
    }

    // التحقق من المرسل ورصيده
    const fromUser = await getUserById(session.userId)
    if (!fromUser) {
      return NextResponse.json({ success: false, error: "المستخدم غير موجود" }, { status: 404 })
    }

    if (fromUser.balance < numericAmount) {
      return NextResponse.json({ success: false, error: "رصيدك غير كافٍ لإتمام هذه العملية" }, { status: 400 })
    }

    // التحقق من وجود المستلم
    const toUser = await getUserByUsername(toUsername)
    if (!toUser) {
      return NextResponse.json({ success: false, error: "اسم مستخدم المستلم غير موجود" }, { status: 404 })
    }

    if (fromUser.id === toUser.id) {
      return NextResponse.json({ success: false, error: "لا يمكنك التحويل لنفسك" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[v0] Transfer Check API error:", err)
    return NextResponse.json({ success: false, error: "خطأ في الخادم" }, { status: 500 })
  }
}
