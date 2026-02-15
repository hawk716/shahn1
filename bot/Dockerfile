FROM python:3.11-slim

WORKDIR /app

# تثبيت المتطلبات النظام
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# نسخ ملفات المتطلبات
COPY requirements.txt .

# تثبيت Python packages
RUN pip install --no-cache-dir -r requirements.txt

# نسخ كود البوت
COPY . .

# تشغيل البوت
CMD ["python", "main.py"]
