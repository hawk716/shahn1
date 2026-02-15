#!/usr/bin/env python3
"""
بوت التيليجرام لإدارة عمليات السحب - نسخة مباشرة
"""
import subprocess
import sys

# تثبيت المكتبات
print("[v0] Installing required packages...")
subprocess.run([sys.executable, "-m", "pip", "install", "-q", "aiogram", "python-dotenv", "nest_asyncio"], 
               capture_output=True)

# البوت الكامل مدمج
import asyncio
import logging
import os
from datetime import datetime

try:
    from aiogram import Bot, Dispatcher, Router, types, F
    from aiogram.types import ReplyKeyboardMarkup, KeyboardButton
    from aiogram.filters import Command
    from dotenv import load_dotenv
except ImportError as e:
    print(f"[v0] Import error: {e}")
    sys.exit(1)

# تحميل البيئة
load_dotenv()

# إعدادات
TOKEN = os.getenv('BOT_TOKEN', '7807774027:AAHfTvyqerny8LfdUnj0snmOCwh-K9w8d-8')
ADMIN_ID = int(os.getenv('ADMIN_ID', '8083596989'))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

print(f"\n{'='*50}")
print(f"[v0] Starting Telegram Bot")
print(f"[v0] Token: {TOKEN[:20]}...")
print(f"[v0] Admin ID: {ADMIN_ID}")
print(f"{'='*50}\n")

# البوت
bot = Bot(token=TOKEN)
router = Router()

@router.message(Command("start"))
async def start(message: types.Message):
    keyboard = ReplyKeyboardMarkup(
        keyboard=[[KeyboardButton(text="المعاملات 📋")]],
        resize_keyboard=True
    )
    await message.answer(
        "مرحباً بك في بوت إدارة السحب!\n\n"
        "أنت لديك صلاحيات المشرف.",
        reply_markup=keyboard
    )

@router.message(F.text == "المعاملات 📋")
async def transactions(message: types.Message):
    await message.answer("📋 لا توجد معاملات معلقة حالياً")

async def main():
    dp = Dispatcher()
    dp.include_router(router)
    print("[v0] Bot is running and waiting for messages...")
    print("[v0] Press Ctrl+C to stop\n")
    await dp.start_polling(bot)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except RuntimeError as e:
        if "asyncio.run() cannot be called from a running event loop" in str(e):
            print("[v0] Running in event loop context, starting bot directly...")
            import nest_asyncio
            nest_asyncio.apply()
            asyncio.run(main())
        else:
            raise
