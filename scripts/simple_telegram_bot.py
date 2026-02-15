#!/usr/bin/env python3
import subprocess
import sys
import os

# تثبيت المكتبات
print("[v0] Installing packages...")
packages = ["aiogram", "python-dotenv"]
for pkg in packages:
    subprocess.run([sys.executable, "-m", "pip", "install", "-q", pkg])

# استيراد المكتبات
import asyncio
from aiogram import Bot, Dispatcher, types, Router
from aiogram.filters import Command
import os
from dotenv import load_dotenv

# تحميل البيئة
load_dotenv("/vercel/share/v0-project/bot/.env")

TOKEN = os.getenv("BOT_TOKEN", "7807774027:AAHfTvyqerny8LfdUnj0snmOCwh-K9w8d-8")
ADMIN_ID = int(os.getenv("ADMIN_ID", "8083596989"))

print(f"\n[v0] Starting Telegram Bot")
print(f"[v0] Token: {TOKEN[:20]}...")
print(f"[v0] Admin ID: {ADMIN_ID}")
print(f"[v0] Bot is online and listening for messages...\n")

bot = Bot(token=TOKEN)
dp = Dispatcher()
router = Router()

@router.message(Command("start"))
async def cmd_start(message: types.Message):
    user_id = message.from_user.id
    if user_id == ADMIN_ID or user_id in []:
        await message.answer("مرحباً بك في بوت إدارة السحب\n\nالأوامر المتاحة:\n/admin - إضافة مشرف")
    else:
        await message.answer("أنت لا تملك صلاحية الوصول لهذا البوت")

@router.message()
async def echo(message: types.Message):
    if message.from_user.id == ADMIN_ID:
        await message.answer(f"تم استقبال رسالتك: {message.text}")

dp.include_router(router)

async def main():
    await dp.start_polling(bot)

if __name__ == "__main__":
    try:
        # محاولة استخدام nest_asyncio للبيئات التي تحتوي على حلقة حدث موجودة
        try:
            import nest_asyncio
            nest_asyncio.apply()
        except ImportError:
            pass
        
        # التحقق من وجود حلقة حدث موجودة
        try:
            loop = asyncio.get_running_loop()
            print("[v0] Running in existing event loop")
            # إذا كان هناك حلقة موجودة، استخدم create_task
            import threading
            thread = threading.Thread(target=lambda: asyncio.run(main()), daemon=True)
            thread.start()
            thread.join()
        except RuntimeError:
            # لا توجد حلقة موجودة، استخدم asyncio.run عادياً
            asyncio.run(main())
    except KeyboardInterrupt:
        print("\n[v0] Bot stopped")
    except Exception as e:
        print(f"[v0] Error: {e}")
        import traceback
        traceback.print_exc()
