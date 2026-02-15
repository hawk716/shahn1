#!/usr/bin/env python3
import subprocess
import sys
import os

# تثبيت المتطلبات
print("[v0] Installing required packages...")
subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "aiogram", "python-dotenv"])

# تشغيل البوت
print("[v0] Starting Telegram Bot...")
bot_dir = os.path.join(os.getcwd(), "bot")
subprocess.call([sys.executable, os.path.join(bot_dir, "simple_bot.py")])
