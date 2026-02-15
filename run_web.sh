#!/bin/bash

# تشغيل موقع AL-SHAMEL PAY

echo "🌐 جاري بدء تشغيل موقع AL-SHAMEL PAY..."
echo "================================="

# التحقق من وجود Node.js
if ! command -v node &> /dev/null
then
    echo "❌ Node.js غير مثبت. يرجى تثبيت Node.js أولاً"
    exit 1
fi

# التحقق من وجود pnpm
if ! command -v pnpm &> /dev/null
then
    echo "📥 تثبيت pnpm..."
    npm install -g pnpm -q
fi

# التحقق من وجود node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 تثبيت المتطلبات..."
    pnpm install
fi

# التحقق من وجود ملف .env.local
if [ ! -f ".env.local" ]; then
    echo "⚠️  ملف .env.local غير موجود"
    echo "📝 تأكد من تكوين متغيرات البيئة قبل التشغيل"
fi

# تشغيل الموقع
echo "✅ بدء تشغيل الموقع على http://localhost:3000"
echo "================================="
pnpm dev
