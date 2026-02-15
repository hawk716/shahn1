# نظام التحقق من البريد الإلكتروني

تم إضافة نظام التحقق من البريد الإلكتروني عند إنشاء حساب جديد. إليك كيفية عمله:

## العملية الأساسية:

1. **التسجيل**: المستخدم ينشئ حساب جديد مع اسم المستخدم والبريد الإلكتروني وكلمة المرور
2. **الرمز**: يتم إنشاء رمز تحقق فريد (token) صالح لمدة 24 ساعة
3. **البريد**: يتم إرسال رابط التحقق إلى البريد الإلكتروني
4. **التحقق**: المستخدم ينقر على الرابط للتحقق من البريد
5. **تفعيل**: بعد التحقق، يتم تفعيل الحساب وتسجيل الدخول تلقائياً

## الملفات الجديدة:

- `/app/api/auth/register/route.ts` - تم تحديثه: يطلب البريد الإلكتروني وينشئ رمز التحقق
- `/app/api/auth/verify-email/route.ts` - جديد: يتحقق من الرمز وينشط الحساب
- `/app/verify-email/page.tsx` - جديد: صفحة التحقق من البريد
- `/lib/db-json.ts` - تم تحديثه: إضافة وظائف التحقق من البريد
- `/data/db.json` - تم تحديثه: إضافة جدول التحقق من البريد

## إرسال رسائل البريد:

### محلياً (Local Development):
حالياً، يتم طباعة رابط التحقق في السجلات (console logs).
يمكنك نسخ الرابط من السجلات واستخدامه.

### في الإنتاج - استخدام Resend:

1. تثبيت المكتبة:
```bash
npm install resend
```

2. إضافة API Key في متغيرات البيئة:
```
RESEND_API_KEY=your_api_key_here
```

3. تحديث دالة `sendVerificationEmail` في `/app/api/auth/register/route.ts`:

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/verify-email?token=${token}`
  
  try {
    await resend.emails.send({
      from: "noreply@example.com",
      to: email,
      subject: "تحقق من بريدك الإلكتروني",
      html: `
        <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right;">
          <h2>مرحباً!</h2>
          <p>شكراً لإنشاء حسابك. يرجى التحقق من بريدك الإلكتروني بالضغط على الرابط أدناه:</p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
            تحقق من البريد
          </a>
          <p>أو انسخ الرابط أدناه في المتصفح:</p>
          <p>${verificationUrl}</p>
          <p>الرابط صالح لمدة 24 ساعة.</p>
        </div>
      `
    });
    return true;
  } catch (error) {
    console.error("[v0] Email sending error:", error);
    return false;
  }
}
```

### أو استخدام SendGrid:

1. تثبيت المكتبة:
```bash
npm install @sendgrid/mail
```

2. إضافة API Key:
```
SENDGRID_API_KEY=your_api_key_here
```

3. تحديث الدالة:
```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/verify-email?token=${token}`
  
  try {
    await sgMail.send({
      to: email,
      from: 'noreply@example.com',
      subject: 'تحقق من بريدك الإلكتروني',
      html: `...` // نفس محتوى HTML أعلاه
    });
    return true;
  } catch (error) {
    console.error("[v0] Email sending error:", error);
    return false;
  }
}
```

## متغيرات البيئة المطلوبة (للإنتاج):

```
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
RESEND_API_KEY=your_resend_api_key (اختياري - إذا استخدمت Resend)
SENDGRID_API_KEY=your_sendgrid_api_key (اختياري - إذا استخدمت SendGrid)
```

## اختبار النظام:

1. انتقل إلى صفحة التسجيل
2. أدخل:
   - اسم مستخدم (3 أحرف على الأقل)
   - بريد إلكتروني صحيح
   - كلمة مرور (6 أحرف على الأقل)
3. انقر على "تسجيل"
4. سترى رسالة تخبرك بفحص بريدك
5. في البيئة المحلية، انسخ الرابط من السجلات
6. أو في الإنتاج، سيصل البريد إلى صندوقك

## ملاحظات:

- البريد الإلكتروني مطلوب الآن (يجب ألا يكون فارغاً)
- الحساب لا يكون نشطاً إلا بعد التحقق من البريد
- الرمز صالح لمدة 24 ساعة فقط
- بعد التحقق، يتم تسجيل الدخول تلقائياً وإعادة التوجيه للصفحة الرئيسية
