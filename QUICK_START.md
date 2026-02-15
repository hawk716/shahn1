# تشغيل AL-SHAMEL PAY والبوت بشكل منفصل

## المتطلبات
- Node.js 18+ و pnpm
- Python 3.8+
- Terminal/Command Prompt

---

## 1️⃣ تشغيل الموقع (Next.js)

### في Terminal الأول:
```bash
chmod +x run_web.sh
./run_web.sh
```

أو مباشرة:
```bash
pnpm install
pnpm dev
```

✅ الموقع سيعمل على: **http://localhost:3000**

---

## 2️⃣ تشغيل بوت التيليجرام

### في Terminal الثاني (منفصل):
```bash
chmod +x run_bot.sh
./run_bot.sh
```

أو مباشرة:
```bash
python3 -m venv bot_venv
source bot_venv/bin/activate  # أو في Windows: bot_venv\Scripts\activate
pip install -r bot/requirements.txt
python3 bot/main.py
```

✅ البوت سيعمل ويتلقى الطلبات من الموقع

---

## 3️⃣ التحقق من الربط

1. اذهب للموقع: **http://localhost:3000**
2. سجل دخول جديد أو استخدم حساب موجود
3. اذهب لصفحة سحب المبلغ
4. أكمل عملية السحب
5. البوت سيستقبل الطلب في التيليجرام تحت معرف المسؤول: 8083596989

---

## الملفات المهمة

| الملف | الغرض |
|------|-------|
| `bot/.env` | بيانات البوت والمسؤول |
| `bot/database.py` | قاعدة البيانات |
| `bot/main.py` | منطق البوت |
| `run_bot.sh` | script تشغيل البوت |
| `run_web.sh` | script تشغيل الموقع |

---

## استكشاف الأخطاء

### البوت لا يستقبل الرسائل؟
- تحقق من token البوت في `bot/.env`: `7807774027:AAHfTvyqerny8LfdUnj0snmOCwh-K9w8d-8`
- تأكد من أن الموقع يعمل على `http://localhost:3000`
- تحقق من أن المشرف الرئيسي هو: `8083596989`

### الموقع لا يتصل بالبوت؟
- تأكد من أن البوت يعمل في terminal منفصل
- جرب إعادة تحميل الصفحة
- تحقق من سجل البوت للأخطاء

### الموقع لا يعمل؟
- تأكد من تثبيت المتطلبات: `pnpm install`
- تأكد من وجود ملف `.env.local`
- جرب حذف `node_modules` وإعادة التثبيت

---

## الأوامر المتاحة في البوت

- `/start` - بدء البوت والتحقق من الصلاحيات
- `/admin {user_id}` - إضافة مشرف جديد (للمسؤول الرئيسي فقط)
- المعاملات - عرض آخر 10 طلبات سحب مع إمكانية الموافقة أو الرفض

---

## بنية التشغيل

```
Terminal 1: pnpm dev (الموقع - http://localhost:3000)
     ↓ (يرسل طلبات)
Terminal 2: python3 bot/main.py (البوت - يستقبل الطلبات)
     ↓ (تحديثات فورية)
Telegram (واجهة المشرف)
```
