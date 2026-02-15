#!/usr/bin/env python3
import subprocess
import sys
import os

print("[v0] تثبيت المكتبات المطلوبة...")
subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "aiogram", "python-dotenv"])

print("[v0] بدء تشغيل البوت...")
bot_path = os.path.join(os.getcwd(), 'bot', 'simple_bot.py')
print(f"[v0] Bot path: {bot_path}")
print(f"[v0] Bot exists: {os.path.exists(bot_path)}")

if os.path.exists(bot_path):
    exec(open(bot_path).read())
else:
    print(f"[v0] Error: Bot file not found at {bot_path}")
    sys.exit(1)
