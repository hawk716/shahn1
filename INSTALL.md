# دليل التثبيت والتشغيل الشامل

## للبدء السريعة (أمر واحد)

```bash
bash setup.sh
```

هذا يقوم بـ:
- التحقق من Node.js
- تثبيت جميع المكاتب
- إنشاء قاعدة بيانات SQLite
- إعداد البيئة التلقائية
- بناء التطبيق

## التثبيت اليدوي

إذا حدثت مشاكل مع الـ script:

```bash
# 1. تثبيت المكاتب
npm install

# 2. إنشاء مجلد البيانات
mkdir -p data logs

# 3. إنشاء ملف .env.local
cat > .env.local << EOF
DATABASE_URL=sqlite:./data/app.db
SQLITE_PATH=./data/app.db
NEXT_PUBLIC_APP_URL=http://localhost:3000
SESSION_SECRET=$(openssl rand -base64 32)
NEXT_PUBLIC_API_URL=http://localhost:3000/api
EOF

# 4. بناء التطبيق
npm run build

# 5. التشغيل
npm start
```

## الملفات المهمة بعد الإعداد

```
project/
├── data/app.db              # قاعدة البيانات SQLite
├── logs/                    # السجلات
├── .env.local              # متغيرات البيئة (أنشئ تلقائياً)
├── ecosystem.config.js     # إعدادات PM2
└── scripts/setup-vps.js    # سكريبت الإعداد
```

## أوضاع التشغيل

### 1. وضع التطوير

```bash
npm run dev
```

- الموقع: `http://localhost:3000`
- إعادة تحميل تلقائية عند التعديل
- معلومات تصحيح شاملة

### 2. وضع الإنتاج (مع PM2)

```bash
# التثبيت الأول
npm install -g pm2

# التشغيل
npm run build
pm2 start ecosystem.config.js

# حفظ الإعدادات
pm2 save
pm2 startup
```

### 3. وضع الإنتاج (بدون PM2)

```bash
npm run build
npm start
```

## بيانات المدير

بعد الإعداد يمكنك تسجيل الدخول بـ:

- **المستخدم:** `moatsem`
- **كلمة المرور:** `716moatsem`

## قاعدة البيانات

### هيكل الجداول

#### جدول users
```sql
id INTEGER PRIMARY KEY
username TEXT UNIQUE
password_hash TEXT
role TEXT (admin/user)
api_key TEXT UNIQUE
callback_url TEXT
balance REAL
created_at TIMESTAMP
updated_at TIMESTAMP
```

#### جدول sessions
```sql
id INTEGER PRIMARY KEY
user_id INTEGER
token TEXT UNIQUE
expires_at DATETIME
created_at TIMESTAMP
```

#### جدول payments
```sql
id INTEGER PRIMARY KEY
sender_name TEXT
amount REAL
app_name TEXT
date DATE
time TIME
raw_message TEXT
used INTEGER (0/1)
created_at TIMESTAMP
```

### الاتصال المباشر بـ SQLite

```bash
# من سطر الأوامر
sqlite3 data/app.db

# استعلام بسيط
sqlite3 data/app.db "SELECT * FROM users;"

# استيراد بيانات
sqlite3 data/app.db < backup.sql

# تصدير بيانات
sqlite3 data/app.db ".dump" > backup.sql
```

## المراقبة والصيانة

### عرض السجلات

```bash
# PM2 السجلات
pm2 logs

# سجلات الأخطاء
tail -f logs/err.log

# سجلات الإخراج
tail -f logs/out.log
```

### تنظيف قاعدة البيانات

```bash
# حذف الجلسات المنتهية
sqlite3 data/app.db "DELETE FROM sessions WHERE expires_at < datetime('now');"

# حذف سجلات قديمة (مثل أكثر من 30 يوم)
sqlite3 data/app.db "DELETE FROM verification_logs WHERE created_at < datetime('now', '-30 days');"
```

### النسخ الاحتياطية

```bash
# نسخ احتياطية يومية
cp data/app.db backup/app-$(date +%Y%m%d).db

# ترجيع من نسخة احتياطية
cp backup/app-20260206.db data/app.db
```

## استكشاف الأخطاء والمشاكل

### "Port 3000 is already in use"

```bash
# ابحث عن العملية التي تستخدم المنفذ
lsof -i :3000

# أيقف العملية (استبدل PID بـ رقم العملية)
kill -9 <PID>

# أو استخدم منفذ مختلف
PORT=3001 npm run dev
```

### "Database is locked"

يحدث عندما يكون الملف قيد الاستخدام:

```bash
# تأكد من أنه لا توجد عمليات قيد التشغيل
pm2 stop app
pm2 delete app

# أعد المحاولة
pm2 start ecosystem.config.js
```

### "Cannot find module 'sqlite3'"

```bash
npm install sqlite3
# إذا فشل الأمر السابق:
npm rebuild
```

### التطبيق بطيء جداً

```bash
# تحقق من استخدام الموارد
pm2 monit

# تحقق من قاعدة البيانات
sqlite3 data/app.db "VACUUM;"

# قد تحتاج لإضافة indexes
sqlite3 data/app.db "CREATE INDEX IF NOT EXISTS idx_name ON table_name(column_name);"
```

## الترقيات

### من Vercel إلى VPS

```bash
# انسخ ملف .env.local من Vercel
# استخدم النسخة المحلية من قاعدة البيانات

# لا تنسى تحديث:
# - DATABASE_URL في .env.local
# - استخدام pm2 للتشغيل الدائم
```

### تحديث المشروع

```bash
git pull origin main
npm install
npm run build
pm2 restart app
```

## الأداء

### نصائح لتحسين الأداء

1. **استخدم Nginx كـ reverse proxy**
   ```bash
   # قم بتثبيت Nginx وإعداد upstream
   ```

2. **قم بتفعيل caching**
   ```bash
   # في الكود استخدم HTTP caching headers
   ```

3. **راقب استهلاك الموارد**
   ```bash
   pm2 monit
   ```

4. **حافظ على قاعدة البيانات نظيفة**
   ```bash
   sqlite3 data/app.db "VACUUM;"
   ```

## الأمان

### تغيير كلمة مرور المدير

```bash
# ادخل قاعدة البيانات
sqlite3 data/app.db

# عديل كلمة المرور
UPDATE users SET password_hash = 'new_hash' WHERE username = 'moatsem';
```

### الحماية من الهجمات

1. استخدم HTTPS/SSL في الإنتاج
2. قم بتحديث الحزم بانتظام: `npm update`
3. راقب السجلات بحثاً عن نشاط غريب
4. استخدم جدار الحماية (firewall)

## الدعم والمساعدة

إذا واجهت مشكلة:

1. تحقق من السجلات: `pm2 logs`
2. تأكد من Node.js: `node -v` (يجب أن يكون 18+)
3. جرب إعادة الإعداد: `bash setup.sh`
4. تحقق من قاعدة البيانات: `sqlite3 data/app.db ".tables"`
5. استعيد نسخة احتياطية إذا لزم الأمر

## الموارد الإضافية

- [Next.js Documentation](https://nextjs.org/docs)
- [PM2 Documentation](https://pm2.keymetrics.io/docs)
- [SQLite Documentation](https://sqlite.org/docs.html)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides)
