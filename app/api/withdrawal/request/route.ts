import { NextResponse } from 'next/server'
import { getUserById, getUserByUsername } from '@/lib/db-json'
import { verifyPassword } from '@/lib/password'
import fs from 'fs'
import path from 'path'
import { sendWithdrawalConfirmationEmail } from '@/lib/email-service-gmail'

export async function POST(request: Request) {
  try {
    const { userId, appName, currency, amount, accountNumber, username, password } = await request.json()

    console.log('[v0] Withdrawal request received:', { userId, appName, username, amount })

    // التحقق من المستخدم
    const user = await getUserById(userId)
    console.log('[v0] User lookup result:', user ? 'Found' : 'Not found', { userId })
    
    if (!user) {
      console.error('[v0] User not found for ID:', userId)
      return NextResponse.json({ success: false, error: 'المستخدم غير موجود' }, { status: 404 })
    }

    // التحقق من اسم المستخدم المدخل
    if (user.username !== username) {
      return NextResponse.json({ 
        success: false, 
        error: 'اسم المستخدم غير صحيح. تأكد من اسم المستخدم أو كلمة المرور، ثم حاول مجدداً',
        field: 'username'
      }, { status: 401 })
    }

    // التحقق من كلمة المرور
    const passwordValid = await verifyPassword(password, user.password_hash)
    if (!passwordValid) {
      return NextResponse.json({ 
        success: false, 
        error: 'كلمة المرور غير صحيحة. تأكد من اسم المستخدم أو كلمة المرور، ثم حاول مجدداً',
        field: 'password'
      }, { status: 401 })
    }

    // قراءة بيانات التطبيقات من public
    const appsPath = path.join(process.cwd(), 'public', 'withdrawal-apps.json')
    
    if (!fs.existsSync(appsPath)) {
      return NextResponse.json({ success: false, error: 'ملف التطبيقات غير موجود' }, { status: 500 })
    }
    
    const appsData = JSON.parse(fs.readFileSync(appsPath, 'utf-8'))
    const app = appsData.apps.find((a: any) => a.name === appName)

    if (!app) {
      return NextResponse.json({ success: false, error: 'التطبيق غير موجود' }, { status: 404 })
    }

    // التحقق من الحد الأدنى والأقصى
    if (amount < app.min_transfer) {
      return NextResponse.json({ 
        success: false, 
        error: `الحد الأدنى للتحويل هو ${app.min_transfer}` 
      }, { status: 400 })
    }

    if (amount > app.max_transfer) {
      return NextResponse.json({ 
        success: false, 
        error: `الحد الأقصى للتحويل هو ${app.max_transfer}` 
      }, { status: 400 })
    }

    // التحقق من رصيد المستخدم
    const totalAmount = amount + app.transfer_fee
    if (user.balance < totalAmount) {
      return NextResponse.json({ 
        success: false, 
        error: 'رصيدك غير كافي' 
      }, { status: 400 })
    }

    // خصم المبلغ من رصيد المستخدم
    user.balance -= totalAmount

    // إنشاء سجل السحب
    const withdrawalRecord = {
      id: Date.now(),
      userId: user.id,
      appName,
      currency,
      amount,
      fee: app.transfer_fee,
      totalAmount,
      accountNumber,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    // حفظ السجل في db.json
    const dbPath = path.join(process.cwd(), 'data', 'db.json')
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'))
    if (!db.withdrawals) {
      db.withdrawals = []
    }
    db.withdrawals.push(withdrawalRecord)
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))

    // إرسال بريد تأكيد
    await sendWithdrawalConfirmationEmail({
      to: user.email,
      appName,
      currency,
      amount,
      fee: app.transfer_fee,
      accountNumber,
      totalAmount,
      date: new Date().toLocaleDateString('ar-EG'),
    })

    // إرسال الطلب إلى بوت التيليجرام
    try {
      const telegramResponse = await fetch('http://localhost:3000/api/telegram/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          username: user.username,
          app_name: appName,
          currency,
          amount,
          account_number: accountNumber,
          total_balance: user.balance,
          previous_withdrawals: 0,
          account_creation_date: user.created_at,
          success_count: 0,
          failed_count: 0,
        }),
      })
      
      if (telegramResponse.ok) {
        console.log('[v0] Telegram notification sent successfully')
      } else {
        console.warn('[v0] Failed to send Telegram notification:', telegramResponse.statusText)
      }
    } catch (err) {
      console.warn('[v0] Telegram notification error (non-critical):', err)
    }

    console.log('[v0] Withdrawal request created:', withdrawalRecord)

    return NextResponse.json({
      success: true,
      message: 'تم طلب السحب بنجاح',
      withdrawal: withdrawalRecord,
    })
  } catch (error) {
    console.error('[v0] Withdrawal error:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في معالجة الطلب' },
      { status: 500 }
    )
  }
}
