#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const crypto = require("crypto");

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkNodeVersion() {
  log("التحقق من إصدار Node.js...", "blue");
  try {
    const version = execSync("node -v", { encoding: "utf-8" }).trim();
    const majorVersion = parseInt(version.split(".")[0].substring(1));
    
    if (majorVersion < 18) {
      log(`خطأ: Node.js ${version} مطلوب Node.js 18 أو أعلى`, "red");
      process.exit(1);
    }
    
    log(`✓ Node.js ${version}`, "green");
    return true;
  } catch (error) {
    log("خطأ: Node.js غير مثبت", "red");
    process.exit(1);
  }
}

function installDependencies() {
  log("تثبيت المكاتب...", "blue");
  try {
    execSync("npm install", { stdio: "inherit" });
    log("✓ تم تثبيت المكاتب", "green");
  } catch (error) {
    log("خطأ في تثبيت المكاتب", "red");
    process.exit(1);
  }
}

function setupLocalDatabase() {
  log("إعداد قاعدة البيانات المحلية SQLite...", "blue");
  
  try {
    // تثبيت sqlite3 إذا لم يكن مثبت
    try {
      require.resolve("sqlite3");
    } catch {
      log("تثبيت sqlite3...", "yellow");
      execSync("npm install sqlite3", { stdio: "inherit" });
    }

    const sqlite3 = require("sqlite3").verbose();
    const dbPath = path.join(process.cwd(), "data");
    
    // إنشاء مجلد البيانات
    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(dbPath, { recursive: true });
    }

    const dbFile = path.join(dbPath, "app.db");
    const db = new sqlite3.Database(dbFile);

    // إنشاء الجداول
    const schema = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        api_key TEXT UNIQUE,
        callback_url TEXT,
        balance REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token TEXT UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_name TEXT,
        amount REAL NOT NULL,
        app_name TEXT,
        date DATE,
        time TIME,
        raw_message TEXT,
        used INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      CREATE INDEX IF NOT EXISTS idx_users_api_key ON users(api_key);
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(date);

      CREATE TABLE IF NOT EXISTS verification_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        requested_name TEXT,
        requested_amount REAL,
        requested_app TEXT,
        success INTEGER,
        matched_payment_id INTEGER,
        credited_balance REAL,
        failure_reason TEXT,
        payment_ref TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS telegram_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bot_token TEXT,
        channel_id TEXT,
        is_enabled INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // تنفيذ البيانات في المتزامن
    db.exec(schema, (err) => {
      if (err) {
        log(`خطأ في إنشاء الجداول: ${err.message}`, "red");
        db.close();
        process.exit(1);
      }

      // إنشاء مستخدم المدير
      const bcrypt = require("bcryptjs");
      const adminUsername = "moatsem";
      const adminPassword = "716moatsem";
      const passwordHash = bcrypt.hashSync(adminPassword, 10);
      const apiKey = crypto.randomBytes(32).toString("hex");

      db.run(
        `INSERT OR IGNORE INTO users (username, password_hash, role, api_key, balance) 
         VALUES (?, ?, ?, ?, ?)`,
        [adminUsername, passwordHash, "admin", apiKey, 1000],
        (err) => {
          if (err) {
            log(`خطأ في إنشاء مستخدم المدير: ${err.message}`, "red");
          } else {
            log("✓ تم إنشاء قاعدة البيانات ومستخدم المدير", "green");
            log(`   اسم المستخدم: ${adminUsername}`, "green");
            log(`   كلمة المرور: ${adminPassword}`, "green");
          }
          db.close();
        }
      );
    });
  } catch (error) {
    log(`خطأ في إعداد قاعدة البيانات: ${error.message}`, "red");
    process.exit(1);
  }
}

function setupEnvFile() {
  log("إعداد متغيرات البيئة...", "blue");

  const envPath = path.join(process.cwd(), ".env.local");
  const envContent = `# Database Configuration
DATABASE_URL=sqlite:./data/app.db
SQLITE_PATH=./data/app.db

# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Session Configuration
SESSION_SECRET=${crypto.randomBytes(32).toString("hex")}

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
`;

  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, envContent);
    log("✓ تم إنشاء ملف .env.local", "green");
  } else {
    log("✓ ملف .env.local موجود بالفعل", "green");
  }
}

function setupPM2Config() {
  log("إعداد PM2 configuration...", "blue");

  const pm2ConfigPath = path.join(process.cwd(), "ecosystem.config.js");
  const pm2Config = `module.exports = {
  apps: [
    {
      name: "app",
      script: "npm",
      args: "start",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      },
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      max_restarts: 10,
      min_uptime: "10s"
    }
  ]
};`;

  fs.writeFileSync(pm2ConfigPath, pm2Config);
  log("✓ تم إنشاء ecosystem.config.js", "green");

  // إنشاء مجلد logs
  const logsDir = path.join(process.cwd(), "logs");
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
    log("✓ تم إنشاء مجلد logs", "green");
  }
}

function buildProject() {
  log("بناء المشروع...", "blue");

  try {
    execSync("npm run build", { stdio: "inherit" });
    log("✓ تم بناء المشروع بنجاح", "green");
  } catch (error) {
    log("خطأ في بناء المشروع", "red");
    process.exit(1);
  }
}

function showStartInstructions() {
  log("\n════════════════════════════════════════════════════════", "green");
  log("تم الإعداد بنجاح! 🎉", "green");
  log("════════════════════════════════════════════════════════\n", "green");

  log("للتشغيل في بيئة التطوير:", "blue");
  log("npm run dev\n", "yellow");

  log("للتشغيل في الإنتاج:", "blue");
  log("npm install -g pm2  # (مرة واحدة فقط)", "yellow");
  log("pm2 start ecosystem.config.js", "yellow");
  log("pm2 save  # حفظ القائمة");
  log("pm2 startup  # تشغيل تلقائي عند إعادة التشغيل\n", "yellow");

  log("معلومات المدير:", "blue");
  log("اسم المستخدم: moatsem", "yellow");
  log("كلمة المرور: 716moatsem", "yellow");
  log("قاعدة البيانات: ./data/app.db\n", "yellow");

  log("أوامر PM2 المفيدة:", "blue");
  log("pm2 list              # عرض التطبيقات", "yellow");
  log("pm2 logs              # عرض السجلات", "yellow");
  log("pm2 stop app          # إيقاف التطبيق", "yellow");
  log("pm2 restart app       # إعادة تشغيل التطبيق", "yellow");
  log("pm2 delete app        # حذف التطبيق\n", "yellow");

  log("════════════════════════════════════════════════════════\n", "green");
}

async function main() {
  log("بدء الإعداد الشامل للمشروع...\n", "blue");

  checkNodeVersion();
  installDependencies();
  setupLocalDatabase();
  setupEnvFile();
  setupPM2Config();
  buildProject();
  showStartInstructions();
}

main().catch((error) => {
  log(`خطأ عام: ${error.message}`, "red");
  process.exit(1);
});
