# الأوامر السريعة

## الإعداد والتثبيت

```bash
# تثبيت سريع
bash setup.sh

# تثبيت يدوي
npm install

# بناء المشروع
npm run build
```

## التشغيل

```bash
# وضع التطوير
npm run dev

# وضع الإنتاج
npm start

# مع PM2
pm2 start ecosystem.config.js
pm2 logs
pm2 restart app
pm2 stop app
pm2 delete app
```

## قاعدة البيانات SQLite

```bash
# الاتصال المباشر
sqlite3 data/app.db

# عرض الجداول
sqlite3 data/app.db ".tables"

# عرض schema الجدول
sqlite3 data/app.db ".schema users"

# تنفيذ استعلام
sqlite3 data/app.db "SELECT * FROM users LIMIT 5;"

# النسخ الاحتياطية
sqlite3 data/app.db ".dump" > backup.sql
sqlite3 data/app.db < backup.sql

# تنظيف قاعدة البيانات
sqlite3 data/app.db "VACUUM;"
```

## PM2 Commands

```bash
# التثبيت
npm install -g pm2

# البدء
pm2 start ecosystem.config.js
pm2 start "npm start" --name "app"

# المراقبة
pm2 list
pm2 logs
pm2 logs app
pm2 monit
pm2 info app

# الإدارة
pm2 restart app
pm2 stop app
pm2 delete app
pm2 kill

# الحفظ والتشغيل التلقائي
pm2 save
pm2 startup
pm2 unstartup
```

## تصحيح الأخطاء

```bash
# معرفة أي عملية تستخدم المنفذ
lsof -i :3000

# إيقاف العملية
kill -9 <PID>

# البحث عن port مختلف
PORT=3001 npm run dev

# مسح node_modules وإعادة التثبيت
rm -rf node_modules package-lock.json
npm install
```

## السجلات والمراقبة

```bash
# PM2 السجلات
pm2 logs app

# سجلات الأخطاء
tail -f logs/err.log

# آخر 100 سطر
tail -n 100 logs/err.log

# البحث في السجلات
grep "error" logs/err.log

# حذف السجلات
rm logs/*.log
```

## النسخ الاحتياطية والاستعادة

```bash
# نسخة احتياطية من قاعدة البيانات
cp data/app.db backup/app-$(date +%Y%m%d-%H%M%S).db

# نسخة احتياطية من المشروع بالكامل
tar -czf backup/project-$(date +%Y%m%d).tar.gz .

# استعادة من نسخة احتياطية
cp backup/app-20260206.db data/app.db

# استخراج backup
tar -xzf backup/project-20260206.tar.gz
```

## صيانة النظام

```bash
# تحديث npm
npm update

# فحص الحزم المتقادمة
npm outdated

# تنظيف قاعدة البيانات
sqlite3 data/app.db "DELETE FROM sessions WHERE expires_at < datetime('now');"

# فحص استهلاك الموارد
pm2 monit

# إعادة تشغيل كاملة
pm2 stop all && pm2 delete all && pm2 flush
pm2 start ecosystem.config.js
```

## تطوير وتصحيح

```bash
# تشغيل مع متغيرات بيئة
DEBUG=* npm run dev

# بناء وتشغيل معاً
npm run build && npm start

# تشغيل مع port مختلف
PORT=8000 npm run dev

# تشغيل مع linting
npm run lint

# إصلاح مشاكل linting
npm run lint -- --fix
```

## الإنتاج

```bash
# بناء الإنتاج
npm run build

# اختبار الإنتاج محلياً
npm run build
npm start

# نشر مع PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# تحديث الإنتاج
git pull
npm install
npm run build
pm2 restart app
```

## حل المشاكل الشائعة

```bash
# Port في الاستخدام
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# قاعدة البيانات مقفولة
rm data/app.db
bash setup.sh

# مشاكل npm
npm cache clean --force
rm -rf node_modules
npm install

# مشاكل Build
npm run build -- --verbose

# فحص الذاكرة
pm2 list
pm2 monit

# إعادة تشغيل كاملة
pm2 delete all
npm cache clean --force
rm -rf data/app.db
bash setup.sh
pm2 start ecosystem.config.js
```

## معلومات مفيدة

```bash
# إصدار Node.js
node -v

# إصدار npm
npm -v

# معلومات النظام
uname -a

# استخدام المساحة
du -sh data/

# أحجام الملفات
ls -lh data/

# حالة الحرية في التخزين
df -h

# استهلاك الموارد
top
htop
```
