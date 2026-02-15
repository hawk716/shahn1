#!/bin/bash

# تشغيل بوت التيليجرام

echo "🤖 جاري بدء تشغيل بوت التيليجرام..."
echo "================================="

# التحقق من وجود Python
if ! command -v python3 &> /dev/null
then
    echo "❌ Python3 غير مثبت. يرجى تثبيت Python3 أولاً"
    exit 1
fi

# التحقق من وجود المتطلبات
if [ ! -f "bot/requirements.txt" ]; then
    echo "❌ ملف requirements.txt غير موجود"
    exit 1
fi

# التحقق من وجود virtual environment
if [ ! -d "bot_venv" ]; then
    echo "📦 إنشاء virtual environment..."
    python3 -m venv bot_venv
fi

# تفعيل virtual environment
source bot_venv/bin/activate

# تثبيت المتطلبات
echo "📥 تثبيت المتطلبات..."
pip install -r bot/requirements.txt -q

# التحقق من وجود ملف .env
if [ ! -f "bot/.env" ]; then
    echo "⚠️  ملف .env غير موجود. سيتم استخدام القيم الافتراضية"
    cp bot/.env.example bot/.env
fi

# تشغيل البوت
echo "✅ بدء تشغيل البوت..."
echo "================================="
python3 bot/main.py
