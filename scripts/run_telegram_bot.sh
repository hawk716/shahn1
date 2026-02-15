#!/bin/bash

echo "==================================="
echo "تشغيل بوت التيليجرام"
echo "==================================="
echo ""

# التحقق من Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 غير مثبت"
    exit 1
fi

echo "✓ Python 3 موجود"

# الذهاب لمجلد البوت
cd "$(dirname "$0")/../bot" || exit 1

# التحقق من وجود venv
if [ ! -d "bot_venv" ]; then
    echo "📦 إنشاء بيئة افتراضية..."
    python3 -m venv bot_venv
fi

# تفعيل البيئة
echo "🔄 تفعيل البيئة الافتراضية..."
source bot_venv/bin/activate

# تثبيت المتطلبات
echo "📥 تثبيت المتطلبات..."
pip install -q -r requirements.txt 2>/dev/null

# التحقق من ملف .env
if [ ! -f ".env" ]; then
    echo "⚠️ ملف .env غير موجود"
    exit 1
fi

echo "✓ ملف .env موجود"
echo ""
echo "==================================="
echo "🤖 البوت جاهز للتشغيل"
echo "==================================="
echo ""
echo "المعلومات:"
echo "- Token: $(grep BOT_TOKEN .env | cut -d'=' -f2)"
echo "- المشرف الرئيسي: $(grep ADMIN_ID .env | cut -d'=' -f2)"
echo ""
echo "⏳ جاري تشغيل البوت..."
echo ""

# تشغيل البوت
python3 main.py
