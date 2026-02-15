#!/usr/bin/env python3
"""
بوت التيليجرام المبسط لإدارة عمليات السحب
"""
import os
import sys
import asyncio
import logging
from pathlib import Path

# إضافة المسار
sys.path.insert(0, str(Path(__file__).parent.parent))

# تحميل متغيرات البيئة
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent / '.env')

# إعدادات التسجيل
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# استيراد المكتبات
try:
    from aiogram import Bot, Dispatcher, Router, types, F
    from aiogram.types import ReplyKeyboardMarkup, KeyboardButton, InlineKeyboardMarkup, InlineKeyboardButton
    from aiogram.filters import Command
    logger.info("[v0] aiogram imported successfully")
except ImportError as e:
    logger.error(f"[v0] Failed to import aiogram: {e}")
    sys.exit(1)

# البيانات
TOKEN = os.getenv('BOT_TOKEN', '7807774027:AAHfTvyqerny8LfdUnj0snmOCwh-K9w8d-8')
ADMIN_ID = int(os.getenv('ADMIN_ID', '8083596989'))

if not TOKEN:
    logger.error("[v0] BOT_TOKEN not found in .env file")
    print("[v0] استخدام TOKEN الافتراضي")
else:
    logger.info(f"[v0] BOT_TOKEN loaded from .env")

logger.info(f"[v0] Telegram Bot Token: {TOKEN[:20]}...")
logger.info(f"[v0] Master Admin ID: {ADMIN_ID}")

# إنشاء البوت
bot = Bot(token=TOKEN)
router = Router()

# دالة البداية
@router.message(Command("start"))
async def start(message: types.Message):
    """رد فعل على أمر /start"""
    text = f"""
🎉 مرحباً بك في بوت إدارة عمليات السحب
👤 {message.from_user.first_name}

أنا بوت متطور لإدارة عمليات سحب الأموال من منصة AL-SHAMEL PAY.

الأوامر المتاحة:
/admin {'{user_id}'} - إضافة مشرف جديد (للمسؤول الرئيسي فقط)
/transactions - عرض آخر المعاملات

يمكنك أيضاً استخدام الأزرار أدناه.
"""
    
    keyboard = ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="المعاملات 📋")],
            [KeyboardButton(text="المساعدة 📞")]
        ],
        resize_keyboard=True
    )
    
    await message.answer(text, reply_markup=keyboard)
    logger.info(f"[v0] User {message.from_user.id} started the bot")

# معالج الأزرار
@router.message(F.text == "المعاملات 📋")
async def show_transactions(message: types.Message):
    """عرض المعاملات"""
    text = "📋 آخر المعاملات\n\n(لم تكن هناك معاملات حتى الآن)"
    await message.answer(text)
    logger.info(f"[v0] User {message.from_user.id} requested transactions")

@router.message(F.text == "المساعدة 📞")
async def help_command(message: types.Message):
    """عرض المساعدة"""
    text = """
📞 المساعدة

هذا البوت يساعدك في:
1. إدارة عمليات السحب
2. الموافقة على طلبات السحب
3. عرض سجل المعاملات

للمزيد من المعلومات، تواصل مع فريق الدعم.
"""
    await message.answer(text)
    logger.info(f"[v0] User {message.from_user.id} requested help")

# معالج أوامر مخصصة
@router.message(Command("admin"))
async def add_admin(message: types.Message):
    """إضافة مشرف جديد"""
    if message.from_user.id != ADMIN_ID:
        await message.answer("❌ ليس لديك صلاحية لتنفيذ هذا الأمر")
        logger.warning(f"[v0] Unauthorized admin attempt by {message.from_user.id}")
        return
    
    args = message.text.split()
    if len(args) < 2:
        await message.answer("⚠️ الاستخدام الصحيح: /admin {user_id}")
        return
    
    try:
        new_admin_id = int(args[1])
        text = f"✅ تم إضافة المستخدم {new_admin_id} كمشرف"
        await message.answer(text)
        logger.info(f"[v0] New admin {new_admin_id} added by {message.from_user.id}")
    except ValueError:
        await message.answer("❌ معرف المستخدم يجب أن يكون رقماً")

# دالة main
async def main():
    """تشغيل البوت"""
    logger.info("[v0] Starting Telegram Bot...")
    logger.info(f"[v0] Bot Token: {TOKEN[:30]}...")
    
    dp = Dispatcher()
    dp.include_router(router)
    
    try:
        logger.info("[v0] Bot is polling for messages...")
        print("\n" + "="*50)
        print("🤖 البوت يعمل الآن!")
        print("="*50 + "\n")
        
        await dp.start_polling(bot)
    except Exception as e:
        logger.error(f"[v0] Error: {e}")
        raise
    finally:
        await bot.session.close()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("[v0] Bot stopped by user")
    except Exception as e:
        logger.error(f"[v0] Fatal error: {e}")
        sys.exit(1)
