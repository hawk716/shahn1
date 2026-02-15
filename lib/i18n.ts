export type Locale = "ع" | "en"

export const translations = {
  ع: {
    // General
    appName: "نظام التحقق من المدفوعات",
    adminDashboard: "لوحة التحكم",
    paymentVerification: "التحقق الآلي من المدفوعات",
    dashboard: "الرئيسية",
    logout: "تسجيل الخروج",

    // Auth - Admin
    adminAccess: "دخول الإدارة",
    adminLogin: "تسجيل دخول المدير",
    enterApiKey: "أدخل بيانات المدير للمتابعة",

    // Auth - User
    userLogin: "تسجيل دخول المستخدم",
    userPortal: "بوابة المستخدم",
    username: "اسم المستخدم",
    password: "كلمة المرور",
    login: "تسجيل الدخول",
    loginError: "اسم المستخدم أو كلمة المرور غير صحيحة",
    noAccount: "ليس لديك حساب؟",
    hasAccount: "لديك حساب بالفعل؟",
    register: "إنشاء حساب",
    registerTitle: "إنشاء حساب جديد",

    // Tabs - Admin
    payments: "المدفوعات",
    verificationLogs: "سجل التحققات",
    testAndIngest: "اختبار وإدخال",
    settings: "الإعدادات",
    telegramSettings: "إعدادات تيليجرام",
    users: "المستخدمون",
    statistics: "الإحصائيات",

    // Tabs - User
    myBalance: "رصيدي",
    myApiKey: "مفتاح API",
    withdrawal: "سحب المبلغ",
    myRequests: "طلباتي",
    apiDocs: "توثيق API",

    // Stats
    totalUsers: "إجمالي المستخدمين",
    totalPayments: "إجمالي المدفوعات",
    usedPayments: "المدفوعات المستخدمة",
    totalAmount: "إجمالي المبالغ",
    usedAmount: "المبالغ المستخدمة",
    successfulVerifications: "تحققات ناجحة",
    failedVerifications: "تحققات فاشلة",
    successRate: "نسبة النجاح",

    // Payments tab
    allPayments: "جميع المدفوعات",
    refresh: "تحديث",
    loadingPayments: "جاري تحميل المدفوعات...",
    noPayments: "لا توجد مدفوعات. أدخل رسائل للبدء.",
    id: "الرقم",
    sender: "المرسل",
    amount: "المبلغ",
    app: "التطبيق",
    date: "التاريخ",
    status: "الحالة",
    used: "مستخدم",
    available: "متاح",
    paymentRef: "معرف الدفع",
    owner: "المالك",

    // Logs tab
    loadingLogs: "جاري تحميل السجلات...",
    noLogs: "لا توجد محاولات تحقق بعد.",
    name: "الاسم",
    balance: "الرصيد",
    paymentId: "رقم الدفعة",
    result: "النتيجة",
    success: "نجاح",
    failed: "فشل",
    reason: "السبب",

    // Test tab
    ingestMessage: "إدخال رسالة",
    rawTelegramMessage: "رسالة تيليجرام الخام",
    ingest: "إدخال الرسالة",
    verifyPayment: "التحقق من الدفع",
    verify: "تحقق",
    createPaymentPage: "إنشاء صفحة دفع",
    senderName: "اسم المرسل",
    create: "إنشاء",
    adminSetupCreate: "إنشاء مستخدم المدير",

    // Telegram Settings
    telegramApiId: "API ID",
    telegramApiHash: "API Hash",
    telegramChatId: "معرف المحادثة (Chat ID)",
    telegramSessionString: "سلسلة الجلسة (Session String)",
    telegramApiIdHint: "احصل عليه من my.telegram.org",
    telegramApiHashHint: "احصل عليه من my.telegram.org",
    telegramChatIdHint: "معرف المحادثة المراد مراقبتها",
    telegramSessionStringHint: "سلسلة الجلسة للاتصال بتيليجرام",
    saveTelegramSettings: "حفظ إعدادات تيليجرام",
    telegramSettingsSaved: "تم حفظ إعدادات تيليجرام",
    telegramConnection: "اتصال تيليجرام",

    // Settings tab
    systemSettings: "إعدادات النظام",
    exchangeRate: "سعر الصرف (رصيد لكل 1 ر.ي)",
    exchangeRateHint: "مثال: إذا كان السعر 10، فإن دفعة 100 ر.ي = 1,000 رصيد",
    apiKey: "مفتاح API",
    apiKeyHint: "يُستخدم لمصادقة طلبات API (ترويسة x-api-key)",
    saveSettings: "حفظ الإعدادات",
    settingsSaved: "تم حفظ الإعدادات بنجاح",
    loadingSettings: "جاري تحميل الإعدادات...",
    loading: "جاري التحميل...",

    // User Management
    manageUsers: "إدارة المستخدمين",
    addUser: "إضافة مستخدم",
    noUsers: "لا يوجد مستخدمين",
    role: "الدور",
    admin: "مدير",
    user: "مستخدم",
    deleteUser: "حذف",
    confirmDelete: "هل أنت متأكد من حذف هذا المستخدم؟",
    userCreated: "تم إنشاء المستخدم بنجاح",
    userDeleted: "تم حذف المستخدم",
    createdAt: "تاريخ الإنشاء",

    // User Portal
    currentBalance: "الرصيد الحالي",
    credits: "رصيد",
    yourApiKey: "مفتاح API الخاص بك",
    regenerateKey: "تجديد المفتاح",
    regenerateConfirm: "هل أنت متأكد؟ سيتم تعطيل المفتاح القديم.",
    copyKey: "نسخ",
    copied: "تم النسخ",
    totalRequests: "إجمالي الطلبات",
    successfulRequests: "طلبات ناجحة",
    failedRequests: "طلبات فاشلة",
    recentRequests: "أحدث الطلبات",
    totalProcessed: "إجمالي المعالج",

    // API Docs
    apiDocumentation: "توثيق API",
    apiDocsIntro: "استخدم هذا الـ API للتحقق من المدفوعات في تطبيقك",
    endpoint: "نقطة الوصول",
    method: "الطريقة",
    headers: "الترويسات",
    requestBody: "جسم الطلب",
    responseSuccess: "الاستجابة (نجاح)",
    responseFail: "الاستجابة (فشل)",
    parameters: "المعاملات",
    paramName: "اسم المحول",
    paramAmount: "المبلغ بالريال اليمني",
    paramApp: "اسم تطبيق الدفع (مثل Jaib)",
    paramPaymentRef: "معرف الدفع الفريد لتتبع المستخدم في نظامك",
    example: "مثال",
    tryIt: "جرب الآن",

    // Payment page
    confirmPayment: "تأكيد الدفع",
    verifyingTransfer: "التحقق من عملية التحويل",
    senderNameLabel: "اسم المحول",
    amountLabel: "المبلغ",
    paymentApp: "��طبيق الدفع",
    verifiedSuccessfully: "تم التحقق بنجاح",
    creditedBalance: "الرصيد المضاف",
    exchangeRateLabel: "سعر الصرف",
    verificationFailed: "فشل التحقق",
    alreadyVerified: "تم التحقق من هذا الدفع مسبقاً",
    verifying: "جاري التحقق...",
    verified: "تم التحقق",
    confirmPaymentBtn: "تأكيد الدفع",
    autoVerificationSystem: "نظام التحقق الآلي من المدفوعات",
    yer: "ر.ي",
    pageNotFound: "صفحة الدفع غير موجودة",
    pageExpired: "هذه الصفحة غير موجودة أو منتهية الصلاحية",
    backToHome: "العودة للرئيسية",

    // Theme
    theme: "المظهر",
    light: "فاتح",
    dark: "داكن",
    system: "النظام",

    // Language
    language: "اللغة",
    arabic: "العربية",
    english: "English",

    // Mobile
    menu: "القائمة",
    goToAdminPanel: "الذهاب للوحة التحكم",
    apiKeyManageHint: "إدارة مفتاح API الخاص بك ورابط Callback",
    callbackUrl: "رابط Callback",
    callbackUrlHint: "سيتم إرسال إشعارات الدفع إلى هذا الرابط",
    navigation: "التنقل",

    // Error
    error: "خطأ",
    connectionError: "خطأ في الاتصال. حاول مرة أخرى.",
    save: "حفظ",
    cancel: "إلغاء",
    close: "إغلاق",
    actions: "الإجراءات",
  },
  en: {
    // General
    appName: "Payment Verification System",
    adminDashboard: "Admin Dashboard",
    paymentVerification: "Automated Payment Verification",
    dashboard: "Dashboard",
    logout: "Logout",

    // Auth - Admin
    adminAccess: "Admin Access",
    adminLogin: "Admin Login",
    enterApiKey: "Enter admin credentials to continue",

    // Auth - User
    userLogin: "User Login",
    userPortal: "User Portal",
    username: "Username",
    password: "Password",
    login: "Login",
    loginError: "Invalid username or password",
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",
    register: "Register",
    registerTitle: "Create New Account",

    // Tabs - Admin
    payments: "Payments",
    verificationLogs: "Verification Logs",
    testAndIngest: "Test & Ingest",
    settings: "Settings",
    telegramSettings: "Telegram Settings",
    users: "Users",
    statistics: "Statistics",

    // Tabs - User
    myBalance: "My Balance",
    myApiKey: "API Key",
    withdrawal: "Withdraw",
    myRequests: "My Requests",
    apiDocs: "API Docs",

    // Stats
    totalUsers: "Total Users",
    totalPayments: "Total Payments",
    usedPayments: "Used Payments",
    totalAmount: "Total Amount",
    usedAmount: "Used Amount",
    successfulVerifications: "Successful Verifications",
    failedVerifications: "Failed Verifications",
    successRate: "Success Rate",

    // Payments tab
    allPayments: "All Payments",
    refresh: "Refresh",
    loadingPayments: "Loading payments...",
    noPayments: "No payments found. Ingest messages to get started.",
    id: "ID",
    sender: "Sender",
    amount: "Amount",
    app: "App",
    date: "Date",
    status: "Status",
    used: "Used",
    available: "Available",
    paymentRef: "Payment Ref",
    owner: "Owner",

    // Logs tab
    loadingLogs: "Loading logs...",
    noLogs: "No verification attempts yet.",
    name: "Name",
    balance: "Balance",
    paymentId: "Payment",
    result: "Result",
    success: "Success",
    failed: "Failed",
    reason: "Reason",

    // Test tab
    ingestMessage: "Ingest Message",
    rawTelegramMessage: "Raw Telegram Message",
    ingest: "Ingest Message",
    verifyPayment: "Verify Payment",
    verify: "Verify",
    createPaymentPage: "Create Payment Page",
    senderName: "Sender Name",
    create: "Create",
    adminSetupCreate: "Create Admin User",

    // Telegram Settings
    telegramApiId: "API ID",
    telegramApiHash: "API Hash",
    telegramChatId: "Chat ID",
    telegramSessionString: "Session String",
    telegramApiIdHint: "Get it from my.telegram.org",
    telegramApiHashHint: "Get it from my.telegram.org",
    telegramChatIdHint: "The chat ID to monitor for messages",
    telegramSessionStringHint: "Session string for Telegram connection",
    saveTelegramSettings: "Save Telegram Settings",
    telegramSettingsSaved: "Telegram settings saved",
    telegramConnection: "Telegram Connection",

    // Settings tab
    systemSettings: "System Settings",
    exchangeRate: "Exchange Rate (credits per 1 YER)",
    exchangeRateHint: "Example: If rate is 10, a payment of 100 YER = 1,000 credits",
    apiKey: "API Key",
    apiKeyHint: "Used for authenticating API requests (x-api-key header)",
    saveSettings: "Save Settings",
    settingsSaved: "Settings saved successfully",
    loadingSettings: "Loading settings...",
    loading: "Loading...",

    // User Management
    manageUsers: "Manage Users",
    addUser: "Add User",
    noUsers: "No users found",
    role: "Role",
    admin: "Admin",
    user: "User",
    deleteUser: "Delete",
    confirmDelete: "Are you sure you want to delete this user?",
    userCreated: "User created successfully",
    userDeleted: "User deleted",
    createdAt: "Created At",

    // User Portal
    currentBalance: "Current Balance",
    credits: "credits",
    yourApiKey: "Your API Key",
    regenerateKey: "Regenerate Key",
    regenerateConfirm: "Are you sure? The old key will be deactivated.",
    copyKey: "Copy",
    copied: "Copied",
    totalRequests: "Total Requests",
    successfulRequests: "Successful Requests",
    failedRequests: "Failed Requests",
    recentRequests: "Recent Requests",
    totalProcessed: "Total Processed",

    // API Docs
    apiDocumentation: "API Documentation",
    apiDocsIntro: "Use this API to verify payments in your application",
    endpoint: "Endpoint",
    method: "Method",
    headers: "Headers",
    requestBody: "Request Body",
    responseSuccess: "Response (Success)",
    responseFail: "Response (Failure)",
    parameters: "Parameters",
    paramName: "Sender name from transfer",
    paramAmount: "Amount in YER",
    paramApp: "Payment app name (e.g. Jaib)",
    paramPaymentRef: "Unique payment ID to track the user in your system",
    example: "Example",
    tryIt: "Try It",

    // Payment page
    confirmPayment: "Confirm Payment",
    verifyingTransfer: "Verify transfer operation",
    senderNameLabel: "Sender Name",
    amountLabel: "Amount",
    paymentApp: "Payment App",
    verifiedSuccessfully: "Verified Successfully",
    creditedBalance: "Credited Balance",
    exchangeRateLabel: "Exchange Rate",
    verificationFailed: "Verification Failed",
    alreadyVerified: "This payment has already been verified",
    verifying: "Verifying...",
    verified: "Verified",
    confirmPaymentBtn: "Confirm Payment",
    autoVerificationSystem: "Automated Payment Verification System",
    yer: "YER",
    pageNotFound: "Payment page not found",
    pageExpired: "This page does not exist or has expired",
    backToHome: "Back to Home",

    // Theme
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    system: "System",

    // Language
    language: "Language",
    arabic: "العربية",
    english: "English",

    // Mobile
    menu: "Menu",
    goToAdminPanel: "Go to Admin Panel",
    apiKeyManageHint: "Manage your API key and Callback URL",
    callbackUrl: "Callback URL",
    callbackUrlHint: "Payment notifications will be sent to this URL",
    navigation: "Navigation",

    // Error
    error: "Error",
    connectionError: "Connection error. Please try again.",
    save: "Save",
    cancel: "Cancel",
    close: "Close",
    actions: "Actions",
  },
} as const

export type TranslationKey = keyof typeof translations.ع
