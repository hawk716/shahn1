#!/usr/bin/env python3
import subprocess
import sys

packages = ["aiogram", "python-dotenv"]

print("[v0] Installing required packages...")
for package in packages:
    try:
        __import__(package.replace("-", "_"))
        print(f"[v0] {package} is already installed")
    except ImportError:
        print(f"[v0] Installing {package}...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", package])

print("\n[v0] Starting Telegram Bot...\n")
subprocess.run([sys.executable, "/vercel/share/v0-project/bot/simple_bot.py"])
