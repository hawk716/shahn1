# دليل إعداد المشروع على VPS

## المتطلبات

- **Node.js 18+**
- **npm أو yarn**

## التثبيت السريع (أمر واحد)

```bash
bash setup.sh
```

هذا السكريبت سيقوم بـ:
- التحقق من إصدار Node.js
- تثبيت جميع المكاتب المطلوبة
- إنشاء قاعدة بيانات SQLite محلية
- إعداد متغيرات البيئة تلقائياً
- بناء المشروع

## التشغيل

### في بيئة التطوير

```bash
npm run dev
```

الموقع سيكون على: `http://localhost:3000`

### في الإنتاج

```bash
# تثبيت PM2 (مرة واحدة فقط)
npm install -g pm2

# تشغيل التطبيق
pm2 start ecosystem.config.js

# حفظ قائمة التطبيقات
pm2 save

# تشغيل تلقائي عند إعادة تشغيل السيرفر
pm2 startup
```

## بيانات المدير الافتراضية

بعد تشغيل setup.sh:

- **اسم المستخدم:** `moatsem`
- **كلمة المرور:** `716moatsem`
- **قاعدة البيانات:** `./data/app.db` (SQLite)

## أوامر PM2 المفيدة

```bash
# عرض قائمة التطبيقات
pm2 list

# عرض السجلات الفورية
pm2 logs

# عرض السجلات لتطبيق معين
pm2 logs app

# إيقاف التطبيق
pm2 stop app

# إعادة تشغيل التطبيق
pm2 restart app

# حذف التطبيق
pm2 delete app

# عرض معلومات التطبيق
pm2 info app

# مراقبة الموارد
pm2 monit
```

## استكشاف الأخطاء

### المشروع لا يعمل بعد التشغيل

```bash
# تحقق من السجلات
pm2 logs app

# تحقق من الملف الشامل
tail -f logs/err.log
```

### خطأ "Address already in use"

المنفذ 3000 مشغول بالفعل:

```bash
# غير المنفذ في ecosystem.config.js أو استخدم:
lsof -i :3000  # البحث عن العملية
kill -9 <PID>  # إيقافها
```

### قاعدة البيانات معطوبة

```bash
# احذف قاعدة البيانات وأعد الإعداد
rm -rf data/app.db
bash setup.sh
```

## ملفات مهمة

- `setup.sh` - سكريبت الإعداد الرئيسي
- `scripts/setup-vps.js` - سكريبت الإعداد التفصيلي
- `ecosystem.config.js` - إعدادات PM2
- `.env.local` - متغيرات البيئة (انشئ تلقائياً)
- `data/app.db` - قاعدة البيانات المحلية

## النسخ الاحتياطية

احفظ هذه المجلدات بانتظام:

```bash
# قاعدة البيانات
cp -r data/ backup/data-$(date +%Y%m%d)

# السجلات
cp -r logs/ backup/logs-$(date +%Y%m%d)
```

## التحديثات

لتحديث المشروع:

```bash
git pull origin main
npm install
npm run build
pm2 restart app
```

## الدعم

في حالة حدوث مشاكل:
1. تحقق من السجلات: `pm2 logs`
2. تأكد من Node.js: `node -v`
3. أعد تشغيل PM2: `pm2 restart app`
4. أعد الإعداد كاملاً: `bash setup.sh`
