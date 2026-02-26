import { BookOpen, Copy, CheckCircle2, Info, Shield, Zap, Code2 } from "lucide-react"
import Link from "next/link"

export default function PublicDocsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">الشامل - الوثائق</h1>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            العودة للرئيسية
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-8 mb-12 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground">توثيق API</h2>
              <p className="text-muted-foreground text-lg mt-2">دليل شامل لاستخدام خدمات منصة الشامل</p>
            </div>
          </div>
        </div>

        {/* Quick Start */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-foreground mb-6">البدء السريع</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 mb-4">
                <Code2 className="w-6 h-6 text-primary" />
              </div>
              <h4 className="text-foreground font-bold mb-2">الخطوة 1: احصل على API Key</h4>
              <p className="text-muted-foreground text-sm">قم بتسجيل الدخول إلى حسابك واحصل على مفتاح API الخاص بك من لوحة التحكم.</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h4 className="text-foreground font-bold mb-2">الخطوة 2: اختبر الـ API</h4>
              <p className="text-muted-foreground text-sm">استخدم أحد الأمثلة البرمجية أدناه لاختبار الاتصال بخدماتنا.</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h4 className="text-foreground font-bold mb-2">الخطوة 3: أمّن اتصالك</h4>
              <p className="text-muted-foreground text-sm">استخدم HTTPS دائماً وأرسل مفتاح API في رؤوس الطلب (Headers).</p>
            </div>
          </div>
        </section>

        {/* API Endpoints */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-foreground mb-6">نقاط الاتصال (Endpoints)</h3>
          
          <div className="space-y-6">
            {/* Endpoint 1 */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-4 border-b border-border bg-secondary/30">
                <h4 className="text-foreground font-bold">1. إنشاء رابط دفع</h4>
                <p className="text-muted-foreground text-sm mt-1">POST /api/create-payment-page</p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <h5 className="text-foreground font-semibold mb-2">الوصف</h5>
                  <p className="text-muted-foreground text-sm">إنشاء رابط دفع جديد لعملية معينة.</p>
                </div>
                <div>
                  <h5 className="text-foreground font-semibold mb-2">المعاملات المطلوبة</h5>
                  <div className="bg-background border border-border rounded-lg p-4 font-mono text-xs text-muted-foreground overflow-x-auto">
                    <div>payment_ref: string (مرجع العملية الفريد)</div>
                    <div>amount: number (المبلغ)</div>
                    <div>currency: string (العملة: YER-OLD, SAR, USD, YER-NEW)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Endpoint 2 */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-4 border-b border-border bg-secondary/30">
                <h4 className="text-foreground font-bold">2. التحقق من الدفع</h4>
                <p className="text-muted-foreground text-sm mt-1">POST /api/verify-payment</p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <h5 className="text-foreground font-semibold mb-2">الوصف</h5>
                  <p className="text-muted-foreground text-sm">التحقق من استلام الدفع وتسجيله في النظام.</p>
                </div>
                <div>
                  <h5 className="text-foreground font-semibold mb-2">المعاملات المطلوبة</h5>
                  <div className="bg-background border border-border rounded-lg p-4 font-mono text-xs text-muted-foreground overflow-x-auto">
                    <div>name: string (اسم المرسل)</div>
                    <div>amount: number (المبلغ المستلم)</div>
                    <div>currency: string (العملة)</div>
                    <div>app: string (اسم التطبيق/المحفظة)</div>
                    <div>payment_ref: string (مرجع العملية)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Security */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-foreground mb-6">الأمان</h3>
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-start gap-4">
              <Shield className="w-6 h-6 text-primary shrink-0 mt-1" />
              <div>
                <h4 className="text-foreground font-bold mb-3">معايير الأمان</h4>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li>✓ تشفير SSL/TLS 256-bit لجميع الاتصالات</li>
                  <li>✓ مصادقة API Key في جميع الطلبات</li>
                  <li>✓ تسجيل جميع العمليات لأغراض التدقيق</li>
                  <li>✓ معايير PCI DSS معتمدة دولياً</li>
                  <li>✓ حماية ضد هجمات DDoS و SQL Injection</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Support */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-foreground mb-6">الدعم والمساعدة</h3>
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-8">
            <p className="text-muted-foreground mb-4">هل لديك أسئلة أو تواجه مشاكل؟</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/" className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                تواصل مع الدعم
              </Link>
              <Link href="/" className="px-6 py-3 border border-primary text-primary rounded-lg font-semibold hover:bg-primary/10 transition-colors">
                العودة للرئيسية
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm py-8 px-4 mt-12">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground text-sm">
          <p>© 2024 منصة الشامل. جميع الحقوق محفوظة.</p>
          <p className="mt-2">نظام مشفر بمعايير SSL العالمية لضمان أمان معاملاتك.</p>
        </div>
      </footer>
    </div>
  )
}
