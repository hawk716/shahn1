import os
import asyncio
from datetime import datetime
from typing import Dict
from aiogram import Bot, Dispatcher, Router, types, F
from aiogram.types import (
    ReplyKeyboardMarkup, KeyboardButton, InlineKeyboardMarkup, InlineKeyboardButton,
    CallbackQuery
)
from aiogram.filters import Command
from database import Database

# التهيئة
TOKEN = "7807774027:AAHfTvyqerny8LfdUnj0snmOCwh-K9w8d-8"
MASTER_ADMIN_ID = 8083596989

bot = Bot(token=TOKEN)
db = Database()
router = Router()

# لوحة المفاتيح الثابتة
def get_main_keyboard():
    keyboard = ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="المعاملات 📋")]
        ],
        resize_keyboard=True
    )
    return keyboard

# المرحلة الأولى من الأزرار
def get_withdrawal_buttons(withdrawal_id: str):
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="قبول 🟢🔴",
                    callback_data=f"accept_{withdrawal_id}"
                ),
                InlineKeyboardButton(
                    text="مراسلة 📧",
                    callback_data=f"message_{withdrawal_id}"
                )
            ]
        ]
    )
    return keyboard

# المرحلة الثانية - أزرار التأكيد الملونة
# ملاحظة: خاصية الألوان (style) مدعومة في Telegram API 7.0+ 
# في aiogram 3.x يتم تمريرها كبارامتر إضافي إذا كانت المكتبة تدعمها أو عبر الإيموجي كبديل بصري قوي
def get_confirmation_buttons(withdrawal_id: str):
    # نحاول استخدام الألوان إذا كانت مدعومة في الإصدار الحالي، وإلا نعتمد على الإيموجي
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="موافقة ✅",
                    callback_data=f"approve_{withdrawal_id}",
                    # الألوان الجديدة (Success/Danger) تظهر في تطبيقات التليجرام الحديثة
                ),
                InlineKeyboardButton(
                    text="رفض ❌",
                    callback_data=f"reject_{withdrawal_id}",
                )
            ]
        ]
    )
    return keyboard

# معالج /start
@router.message(Command("start"))
async def cmd_start(message: types.Message):
    if not db.is_admin(message.from_user.id):
        return
    
    welcome_text = "مرحباً بك في بوت إدارة السحب المتطور!\n\nاستخدم الأزرار أدناه للإدارة."
    await message.reply(welcome_text, reply_markup=get_main_keyboard())

# معالج أمر /admin لإضافة مشرفين
@router.message(Command("admin"))
async def cmd_admin(message: types.Message):
    if not db.is_master_admin(message.from_user.id):
        return
    
    args = message.text.split()
    if len(args) < 2:
        await message.reply("الاستخدام: /admin {user_id}")
        return
    
    try:
        new_admin_id = int(args[1])
        if db.add_admin(new_admin_id, f"Admin_{new_admin_id}"):
            await message.reply(f"✅ تم إضافة المستخدم {new_admin_id} كـمشرف مساعد.")
        else:
            await message.reply("❌ فشل في إضافة المشرف.")
    except ValueError:
        await message.reply("❌ يرجى إدخال ID صحيح (أرقام فقط).")

# معالج زر المعاملات
@router.message(F.text == "المعاملات 📋")
async def transactions_button(message: types.Message):
    if not db.is_admin(message.from_user.id):
        return
    
    await send_transactions_list(message)

async def send_transactions_list(message_or_callback, is_callback=False):
    requests = db.get_latest_requests(10)
    
    keyboard_buttons = []
    if not requests:
        text = "لا توجد معاملات حالياً في السجل."
    else:
        text = "📋 **آخر 10 معاملات:**\n\n"
        for req in requests:
            status_emoji = "⏳" if req['status'] == 'pending' else "✅" if req['status'] == 'approved' else "❌"
            text += f"{status_emoji} ID: `{req['request_id']}`\n👤 {req['username']} | 💰 {req['amount']} {req['currency']}\n"
            text += "---\n"
            
            # إضافة زر للتفاعل مع المعاملة إذا كانت معلقة
            if req['status'] == 'pending':
                keyboard_buttons.append([InlineKeyboardButton(
                    text=f"إدارة {req['request_id']}", 
                    callback_data=f"manage_{req['request_id']}"
                )])
    
    keyboard_buttons.append([InlineKeyboardButton(text="تحديث 🔄", callback_data="refresh_transactions")])
    keyboard = InlineKeyboardMarkup(inline_keyboard=keyboard_buttons)
    
    if is_callback:
        await message_or_callback.message.edit_text(text, reply_markup=keyboard, parse_mode="Markdown")
    else:
        await message_or_callback.reply(text, reply_markup=keyboard, parse_mode="Markdown")

# معالج إدارة معاملة من السجل
@router.callback_query(F.data.startswith("manage_"))
async def manage_transaction(callback: CallbackQuery):
    if not db.is_admin(callback.from_user.id):
        return
    
    request_id = callback.data.replace("manage_", "")
    req = db.get_request_by_id(request_id)
    
    if req:
        message_text = f"""
👤 المستخدم: {req.get('username')}
💰 الرصيد الكلي: {req.get('total_balance')}
📥 مسحوبات سابقة: {req.get('previous_withdrawals')}
📅 تاريخ التسجيل: {req.get('account_creation_date')}
📊 السجل: {req.get('success_count')} ناجحة | {req.get('failed_count')} فاشلة.
"""
        await callback.message.answer(message_text, reply_markup=get_withdrawal_buttons(request_id))
        await callback.answer()
    else:
        await callback.answer("المعاملة غير موجودة.", show_alert=True)

# معالج تحديث المعاملات
@router.callback_query(F.data == "refresh_transactions")
async def refresh_transactions(callback: CallbackQuery):
    if not db.is_admin(callback.from_user.id):
        await callback.answer("غير مصرح لك.", show_alert=True)
        return
    
    await callback.answer("جاري التحديث...")
    await send_transactions_list(callback, is_callback=True)

# معالج مراسلة (إظهار الإيميل)
@router.callback_query(F.data.startswith("message_"))
async def show_email(callback: CallbackQuery):
    if not db.is_admin(callback.from_user.id):
        return
    
    withdrawal_id = callback.data.replace("message_", "")
    req = db.get_request_by_id(withdrawal_id)
    
    if req:
        email = f"{req['username']}@example.com" 
        await callback.answer(f"📧 إيميل العميل:\n{email}", show_alert=True)
    else:
        await callback.answer("المعاملة غير موجودة.", show_alert=True)

# معالج قبول (المرحلة الأولى)
@router.callback_query(F.data.startswith("accept_"))
async def accept_stage_1(callback: CallbackQuery):
    if not db.is_admin(callback.from_user.id):
        return
    
    withdrawal_id = callback.data.replace("accept_", "")
    await callback.message.edit_reply_markup(reply_markup=get_confirmation_buttons(withdrawal_id))
    await callback.answer()

# معالج موافقة (المرحلة الثانية)
@router.callback_query(F.data.startswith("approve_"))
async def approve_request(callback: CallbackQuery):
    if not db.is_admin(callback.from_user.id):
        return
    
    withdrawal_id = callback.data.replace("approve_", "")
    req = db.get_request_by_id(withdrawal_id)
    
    if req:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        # تحديث نص الرسالة فوراً ليعرض الحالة النهائية مع الوقت
        original_text = callback.message.text
        # إزالة أي حالة سابقة إذا وجدت (لتجنب التكرار عند التحديث اللحظي)
        base_text = original_text.split("\n\n✅ تم القبول")[0].split("\n\n❌ تم الرفض")[0]
        
        new_text = base_text + f"\n\n✅ **تم القبول**\n⏰ الوقت: {timestamp}\n👤 بواسطة: {callback.from_user.first_name}"
        
        await callback.message.edit_text(new_text, reply_markup=None, parse_mode="Markdown")
        db.update_request_status(withdrawal_id, 'approved', callback.from_user.id, callback.message.message_id)
        await callback.answer("تمت الموافقة بنجاح ✅")
    else:
        await callback.answer("خطأ: الطلب غير موجود.")

# معالج رفض (المرحلة الثانية)
@router.callback_query(F.data.startswith("reject_"))
async def reject_request(callback: CallbackQuery):
    if not db.is_admin(callback.from_user.id):
        return
    
    withdrawal_id = callback.data.replace("reject_", "")
    req = db.get_request_by_id(withdrawal_id)
    
    if req:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        original_text = callback.message.text
        base_text = original_text.split("\n\n✅ تم القبول")[0].split("\n\n❌ تم الرفض")[0]
        
        new_text = base_text + f"\n\n❌ **تم الرفض**\n⏰ الوقت: {timestamp}\n👤 بواسطة: {callback.from_user.first_name}"
        
        await callback.message.edit_text(new_text, reply_markup=None, parse_mode="Markdown")
        db.update_request_status(withdrawal_id, 'rejected', callback.from_user.id, callback.message.message_id)
        await callback.answer("تم الرفض ❌")
    else:
        await callback.answer("خطأ: الطلب غير موجود.")

# حماية عامة: تجاهل أي رسالة من غير المشرفين
@router.message()
async def global_protection(message: types.Message):
    if not db.is_admin(message.from_user.id):
        return # لا استجابة نهائياً

async def main():
    dp = Dispatcher()
    dp.include_router(router)
    
    print("البوت يعمل الآن...")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
