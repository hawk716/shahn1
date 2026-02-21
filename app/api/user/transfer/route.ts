import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { getUserById, transferBalance } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 })
    }

    const { toUsername, amount, password } = await req.json()

    if (!toUsername || !amount || !password) {
      return NextResponse.json({ success: false, error: "جميع الحقول مطلوبة" }, { status: 400 })
    }

    const numericAmount = parseFloat(amount)
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ success: false, error: "مبلغ غير صالح" }, { status: 400 })
    }

    // التحقق من كلمة المرور
    const user = await getUserById(session.userId)
    if (!user) {
      return NextResponse.json({ success: false, error: "المستخدم غير موجود" }, { status: 404 })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash)
    if (!isPasswordValid) {
      return NextResponse.json({ success: false, error: "كلمة المرور غير صحيحة" }, { status: 401 })
    }

    // تنفيذ التحويل
    try {
      const result = await transferBalance(session.userId, toUsername, numericAmount)
      return NextResponse.json({ 
        success: true, 
        message: "تم التحويل بنجاح",
        newBalance: result.fromBalance 
      })
    } catch (err: any) {
      return NextResponse.json({ success: false, error: err.message }, { status: 400 })
    }
  } catch (err) {
    console.error("[v0] Transfer API error:", err)
    return NextResponse.json({ success: false, error: "خطأ في الخادم" }, { status: 500 })
  }
}
