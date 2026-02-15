## AL-SHAMEL PAY - ملخص المشروع

### نظرة عامة
نظام دفع متكامل يجمع بين موقع ويب وبوت تيليجرام متطور لإدارة عمليات السحب والمحافظ الرقمية.

---

## المكونات الرئيسية

### 1. الموقع (Next.js + TypeScript)
- **المسار**: `/app`
- **الميزات**:
  - نظام مستخدمين مع تحقق من البريد
  - لوحة تحكم للمشرفين
  - بوابة للمستخدمين
  - نظام سحب أموال متقدم
  - API كامل للعمليات

### 2. بوت التيليجرام (Python 3.11)
- **المسار**: `/bot`
- **الميزات**:
  - نظام صلاحيات ثنائي المستويات
  - قاعدة بيانات SQLite
  - أزرار تفاعلية ملونة
  - إدارة معاملات فورية
  - واجهة احترافية

### 3. API Integration
- **الموقع**: `/app/api/telegram/webhook`
- **الغرض**: ربط الموقع بالبوت مباشرة

---

## التشغيل

### المحلي (Development)

**Terminal 1 - الموقع:**
```bash
./run_web.sh
# أو
pnpm dev
```

**Terminal 2 - البوت:**
```bash
./run_bot.sh
# أو
python3 bot/main.py
```

### على الإنتاج

استخدم `docker-compose`:
```bash
docker-compose up -d
```

أو راجع `DEPLOYMENT.md` للتفاصيل الكاملة.

---

## البيانات الحساسة

### Token البوت
```
7807774027:AAHfTvyqerny8LfdUnj0snmOCwh-K9w8d-8
```

### المسؤول الرئيسي
```
ID: 8083596989
```

---

## ملفات مهمة

| الملف | الغرض |
|------|-------|
| `QUICK_START.md` | دليل التشغيل السريع |
| `DEPLOYMENT.md` | دليل الاستنشار |
| `BOT_SETUP.md` | تفاصيل إعداد البوت |
| `TELEGRAM_BOT_README.md` | توثيق البوت الكامل |
| `bot/.env` | متغيرات البيئة للبوت |
| `.env.local` | متغيرات البيئة للموقع |

---

## الأوامر المتاحة

### للبوت
- `/start` - بدء البوت
- `/admin {user_id}` - إضافة مشرف جديد

### للموقع
- `/verify-email` - صفحة تحقق البريد
- `/user/withdrawal` - صفحة السحب

---

## الاتصالات

```
Telegram User
     ↓
Telegram Bot (Python)
     ↓
Database (SQLite)
     ↓
API (/api/telegram/webhook)
     ↓
Website (Next.js)
     ↓
User Dashboard
```

---

## دعم التقنيات المستخدمة

- **Frontend**: Next.js 16, React 19, TailwindCSS
- **Backend**: Node.js, TypeScript
- **Bot**: Python 3.11, aiogram, SQLite
- **Email**: Gmail SMTP
- **Database**: JSON + SQLite

---

## الخطوات التالية

1. تشغيل الموقع: `pnpm dev`
2. تشغيل البوت: `python3 bot/main.py`
3. اختبار عملية سحب من الموقع
4. تتبع الطلب في بوت التيليجرام
