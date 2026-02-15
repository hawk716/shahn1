'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

interface App {
  name: string
  icon: string
  currencies: string[]
  min_transfer: number
  max_transfer: number
  transfer_fee: number
  accounts: string | Record<string, string>
}

export function WithdrawalForm({ userId }: { userId: number }) {
  const [apps, setApps] = useState<App[]>([])
  const [selectedApp, setSelectedApp] = useState<App | null>(null)
  const [selectedCurrency, setSelectedCurrency] = useState('')
  const [amount, setAmount] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [appDropdownOpen, setAppDropdownOpen] = useState(false)
  const [modalError, setModalError] = useState('')

  // Modals
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [successModalOpen, setSuccessModalOpen] = useState(false)
  
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // تحميل التطبيقات
  useEffect(() => {
    const loadApps = async () => {
      try {
        const response = await fetch('/withdrawal-apps.json')
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`)
        }
        const data = await response.json()
        if (data.apps && Array.isArray(data.apps)) {
          setApps(data.apps)
        } else {
          throw new Error('Invalid apps data format')
        }
      } catch (err) {
        console.error('[v0] Failed to load apps:', err)
        setError('فشل تحميل التطبيقات. الرجاء تحديث الصفحة')
      }
    }
    loadApps()
  }, [])

  const calculateTotal = () => {
    const amt = parseFloat(amount) || 0
    const fee = selectedApp?.transfer_fee || 0
    return amt + fee
  }

  const handleSubmit = () => {
    setError('')
    
    if (!selectedApp) {
      setError('اختر تطبيقاً')
      return
    }
    
    if (!selectedCurrency) {
      setError('اختر عملة')
      return
    }
    
    const amt = parseFloat(amount)
    if (!amt || amt < selectedApp.min_transfer || amt > selectedApp.max_transfer) {
      setError(`المبلغ يجب أن يكون بين ${selectedApp.min_transfer} و ${selectedApp.max_transfer}`)
      return
    }
    
    if (!accountNumber.trim()) {
      setError('أدخل رقم الحساب')
      return
    }
    
    setConfirmModalOpen(true)
  }

  const handlePasswordSubmit = async () => {
    setLoading(true)
    setModalError('')

    try {
      const response = await fetch('/api/withdrawal/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          appName: selectedApp?.name,
          currency: selectedCurrency,
          amount: parseFloat(amount),
          accountNumber,
          username,
          password,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setConfirmModalOpen(false)
        setPasswordModalOpen(false)
        setSuccessModalOpen(true)
        // Reset form
        setSelectedApp(null)
        setSelectedCurrency('')
        setAmount('')
        setAccountNumber('')
        setUsername('')
        setPassword('')
        setError('')
      } else {
        // إذا كانت رسالة الخطأ تتعلق بحقل معين، أضف تنسيق واضح
        const errorMsg = data.error || 'فشل معالجة الطلب'
        setModalError(errorMsg)
      }
    } catch (err) {
      setModalError('خطأ في الاتصال')
      console.error('[v0] Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">سحب المبلغ</h1>
        <p className="text-muted-foreground">قم بسحب أموالك إلى المحفظة أو البنك الذي تختاره</p>
      </div>

      <Card className="p-6">
        {error && (
          <div className="p-4 mb-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* اختيار التطبيق */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">اختر المحفظة أو البنك</label>
            <div className="relative">
              <button
                onClick={() => setAppDropdownOpen(!appDropdownOpen)}
                className="w-full p-3 border border-border bg-background text-foreground rounded-lg hover:bg-accent/50 transition flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {selectedApp && (
                    <img src={selectedApp.icon} alt={selectedApp.name} className="w-8 h-8 rounded-full object-cover" />
                  )}
                  <span>{selectedApp?.name || 'اختر التطبيق'}</span>
                </div>
                <span className="text-muted-foreground">{appDropdownOpen ? '▲' : '▼'}</span>
              </button>
              
              {appDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 border border-border bg-background rounded-lg shadow-lg z-50">
                  {apps.map((app) => (
                    <button
                      key={app.name}
                      onClick={() => {
                        setSelectedApp(app)
                        setSelectedCurrency('')
                        setAppDropdownOpen(false)
                      }}
                      className="w-full p-3 text-right hover:bg-accent/50 transition border-b border-border/50 last:border-b-0 flex items-center gap-3"
                    >
                      <img src={app.icon} alt={app.name} className="w-8 h-8 rounded-full object-cover" />
                      <span className="text-foreground">{app.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {selectedApp && (
            <>
              {/* اختيار العملة */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">اختر العملة</label>
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="w-full p-3 border border-border bg-background text-foreground rounded-lg focus:outline-none focus:border-ring"
                >
                  <option value="">اختر عملة</option>
                  {selectedApp.currencies.map((curr) => (
                    <option key={curr} value={curr}>{curr}</option>
                  ))}
                </select>
              </div>

              {/* إدخال المبلغ */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">المبلغ ({selectedCurrency})</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`من ${selectedApp.min_transfer} إلى ${selectedApp.max_transfer}`}
                  className="w-full p-3 border border-border bg-background text-foreground rounded-lg focus:outline-none focus:border-ring placeholder:text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  الحد الأدنى: {selectedApp.min_transfer} | الحد الأقصى: {selectedApp.max_transfer}
                </p>
              </div>

              {/* رقم الحساب */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">رقم الحساب</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="أدخل رقم حسابك في التطبيق"
                  className="w-full p-3 border border-border bg-background text-foreground rounded-lg focus:outline-none focus:border-ring placeholder:text-muted-foreground"
                />
              </div>
            </>
          )}

          {/* زر التأكيد */}
          <Button
            onClick={handleSubmit}
            disabled={!selectedApp || !selectedCurrency || !amount || !accountNumber}
            className="w-full"
          >
            تأكيد
          </Button>
        </div>
      </Card>

      {/* Modal تأكيد الطلب */}
      <Dialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">تأكيد طلب السحب</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1">التطبيق:</p>
              <div className="flex items-center gap-2 p-3 bg-accent/50 rounded-lg">
                {selectedApp && (
                  <img src={selectedApp.icon} alt={selectedApp.name} className="w-6 h-6 rounded-full object-cover" />
                )}
                <p className="font-semibold text-foreground">{selectedApp?.name}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">رقم الحساب:</p>
              <p className="font-semibold text-foreground p-3 bg-accent/50 rounded-lg">{accountNumber}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">المبلغ:</p>
              <p className="font-semibold text-foreground p-3 bg-accent/50 rounded-lg">{amount} {selectedCurrency}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">الرسوم:</p>
              <p className="font-semibold text-foreground p-3 bg-accent/50 rounded-lg">{selectedApp?.transfer_fee} {selectedCurrency}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">الإجمالي:</p>
              <p className="font-bold text-lg text-destructive p-3 bg-destructive/10 border border-destructive/20 rounded-lg">{calculateTotal()} {selectedCurrency}</p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmModalOpen(false)}
            >
              إلغاء
            </Button>
            <Button
              onClick={() => {
                setConfirmModalOpen(false)
                setPasswordModalOpen(true)
              }}
            >
              متابعة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal إدخال كلمة المرور */}
      <Dialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">تأكيد الهوية</DialogTitle>
          </DialogHeader>
          
          {modalError && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {modalError}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">اسم المستخدم</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full p-3 border rounded-lg focus:outline-none placeholder:text-muted-foreground ${
                  modalError?.includes('اسم المستخدم') 
                    ? 'border-destructive bg-destructive/5 text-destructive focus:border-destructive' 
                    : 'border-border bg-background text-foreground focus:border-ring'
                }`}
              />
              {modalError?.includes('اسم المستخدم') && (
                <p className="text-xs text-destructive mt-1 font-semibold">اسم المستخدم غير صحيح</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full p-3 border rounded-lg focus:outline-none placeholder:text-muted-foreground ${
                  modalError?.includes('كلمة المرور') 
                    ? 'border-destructive bg-destructive/5 text-destructive focus:border-destructive' 
                    : 'border-border bg-background text-foreground focus:border-ring'
                }`}
              />
              {modalError?.includes('كلمة المرور') && (
                <p className="text-xs text-destructive mt-1 font-semibold">كلمة المرور غير صحيحة</p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setPasswordModalOpen(false)
                setModalError('')
              }}
              disabled={loading}
            >
              إلغاء
            </Button>
            <Button
              onClick={handlePasswordSubmit}
              disabled={!username || !password || loading}
            >
              {loading ? 'جاري المعالجة...' : 'تأكيد'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal رسالة النجاح */}
      <Dialog open={successModalOpen} onOpenChange={setSuccessModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">تم استلام الطلب بنجاح</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 text-center">
            <div className="text-5xl">✓</div>
            <div>
              <p className="text-foreground font-semibold mb-2">تم قبول طلب السحب</p>
              <p className="text-sm text-muted-foreground">سيصلك المبلغ قريباً إلى حسابك في التطبيق. سيتم إرسال تفاصيل الطلب إلى بريدك الإلكتروني</p>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => {
                setSuccessModalOpen(false)
                window.location.href = '/'
              }}
              className="w-full"
            >
              العودة للرئيسية
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
