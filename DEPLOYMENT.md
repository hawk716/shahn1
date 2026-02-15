## دليل الاستنشار

### التشغيل المحلي (Local Development)

#### الموقع
```bash
chmod +x run_web.sh
./run_web.sh
```

#### البوت
```bash
chmod +x run_bot.sh
./run_bot.sh
```

### الاستنشار على الإنتاج

#### الموقع على Vercel
```bash
# تسجيل الدخول
vercel login

# استنشار المشروع
vercel --prod
```

#### البوت على Server (Linux)

1. نسخ الملفات:
```bash
scp -r bot/ user@server:/app/
scp bot/.env user@server:/app/bot/
scp bot/requirements.txt user@server:/app/bot/
```

2. على Server:
```bash
python3 -m venv bot_venv
source bot_venv/bin/activate
pip install -r bot/requirements.txt
python3 -m gunicorn --workers 1 bot.main:app
```

أو استخدام `screen` للتشغيل المستمر:
```bash
screen -S telegram_bot
python3 bot/main.py
# Ctrl+A ثم D للانفصال
```

---

## متغيرات البيئة المطلوبة

### للموقع (.env.local)
```
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
DATABASE_URL=your_database_url
```

### للبوت (bot/.env)
```
TELEGRAM_BOT_TOKEN=7807774027:AAHfTvyqerny8LfdUnj0snmOCwh-K9w8d-8
MASTER_ADMIN_ID=8083596989
DATABASE_PATH=bot_data.db
```
