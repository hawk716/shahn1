# خطوات إعداد التطبيق

## المتطلبات
- Node.js 18+
- حساب Neon للقاعدة البيانات
- متغيرات البيئة مضبوطة

## خطوات الإعداد

### 1. تثبيت المكتبات
```bash
npm install
```

### 2. إعداد متغيرات البيئة
أضف المتغيرات التالية إلى ملف `.env.local`:

```
DATABASE_URL=your_neon_database_url
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url  # إن كنت تستخدم Supabase
SUPABASE_SERVICE_ROLE_KEY=your_supabase_key  # إن كنت تستخدم Supabase
```

### 3. بدء خادم التطوير
```bash
npm run dev
```

### 4. إعداد قاعدة البيانات والمدير
1. اذهب إلى `http://localhost:3000/admin-setup`
2. انقر على زر "بدء الإعداد"
3. انتظر حتى اكتمال الإعداد
4. سيتم إنشاء الجداول تلقائياً وإضافة مستخدم المدير

### 5. تسجيل الدخول إلى لوحة التحكم
1. اذهب إلى `http://localhost:3000`
2. أدخل بيانات المدير:
   - **اسم المستخدم:** moatsem
   - **كلمة المرور:** 716moatsem

## بيانات المدير الافتراضية
- **اسم المستخدم:** moatsem
- **كلمة المرور:** 716moatsem

⚠️ **تنبيه أمان:** يرجى تغيير كلمة المرور بعد الدخول الأول

## هيكل قاعدة البيانات

### جدول users
```
- id (BIGSERIAL PRIMARY KEY)
- username (VARCHAR UNIQUE)
- password_hash (VARCHAR)
- role (VARCHAR) - 'admin' أو 'user'
- api_key (VARCHAR UNIQUE)
- callback_url (TEXT)
- balance (DECIMAL)
- created_at, updated_at
```

### جدول sessions
```
- id (BIGSERIAL PRIMARY KEY)
- user_id (BIGINT)
- token (VARCHAR UNIQUE)
- expires_at (TIMESTAMP)
- created_at
```

### جدول payments
```
- id (BIGSERIAL PRIMARY KEY)
- sender_name (VARCHAR)
- amount (DECIMAL)
- app_name (VARCHAR)
- date (DATE)
- time (TIME)
- raw_message (TEXT)
- used (BOOLEAN)
- created_at
```

## استكشاف الأخطاء

### خطأ: "DATABASE_URL not configured"
- تأكد من أن متغير `DATABASE_URL` مضبوط بشكل صحيح

### خطأ: "Could not find the table"
- انقر على الزر "بدء الإعداد" مجدداً لإنشاء الجداول

### مشاكل الاتصال
- تحقق من اتصالك بالإنترنت
- تأكد من أن Neon database معروض

## الميزات

### لوحة التحكم (Admin)
- عرض الإحصائيات والبيانات
- إدارة المستخدمين
- عرض السجلات
- إعدادات Telegram
- اختبار النظام

### بوابة المستخدم (User)
- عرض الرصيد
- إدارة مفتاح API
- عرض الطلبات
- قراءة التوثيق

## الدعم اللغوي
- العربية (ع)
- English (en)
