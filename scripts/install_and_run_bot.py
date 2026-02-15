#!/usr/bin/env python3
import subprocess
import sys
import os

# تثبيت المكتبات المطلوبة
print("[v0] Installing required packages...")
packages = ["aiogram", "python-dotenv"]

for package in packages:
    try:
        __import__(package.replace("-", "_"))
        print(f"[v0] {package} is already installed")
    except ImportError:
        print(f"[v0] Installing {package}...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])

# إضافة مسار المشروع
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# تشغيل البوت
print("[v0] Starting Telegram Bot...")
from bot.main import main

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n[v0] Bot stopped by user")
    except Exception as e:
        print(f"[v0] Error: {e}")
        sys.exit(1)
