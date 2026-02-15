'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const error = searchParams.get('error')
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    // إذا كان هناك خطأ في معامل البحث
    if (error) {
      setStatus('error')
      if (error === 'no-token') {
        setMessage('لا يوجد رمز تحقق')
      } else if (error === 'invalid-token') {
        setMessage('الرمز غير صحيح أو انتهت صلاحيته')
      } else if (error === 'server-error') {
        setMessage('حدث خطأ في الخادم')
      } else {
        setMessage('حدث خطأ غير متوقع')
      }
      return
    }

    // إذا لم يكن هناك رمز ولا خطأ
    if (!token) {
      setStatus('error')
      setMessage('لا يوجد رمز تحقق')
      return
    }

    // استدعاء API للتحقق
    const verifyEmail = async () => {
      try {
        console.log('[v0] Verifying email with token:', token)
        const response = await fetch(`/api/auth/verify-email?token=${token}`, {
          method: 'GET',
        })

        console.log('[v0] Verify response status:', response.status)

        if (response.ok) {
          setStatus('success')
          setMessage('تم التحقق من بريدك بنجاح')
          // إعادة التوجيه بعد 2 ثانية
          setTimeout(() => {
            console.log('[v0] Redirecting to home')
            router.push('/')
          }, 2000)
        } else {
          setStatus('error')
          setMessage('فشل التحقق من البريد')
          console.error('[v0] Verify failed with status:', response.status)
        }
      } catch (err) {
        setStatus('error')
        setMessage('حدث خطأ أثناء التحقق')
        console.error('[v0] Verify error:', err)
      }
    }

    verifyEmail()
  }, [token, error, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="w-12 h-12 rounded-full border-4 border-muted border-t-primary animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2 text-foreground">جاري التحقق...</h2>
              <p className="text-muted-foreground">يتم التحقق من بريدك الإلكتروني</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-12 h-12 rounded-full bg-destructive/10 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-6 h-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2 text-destructive">فشل التحقق</h2>
              <p className="text-muted-foreground mb-6">{message}</p>
              <Button onClick={() => router.push('/')}>العودة للصفحة الرئيسية</Button>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-12 h-12 rounded-full bg-green-500/10 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2 text-green-600 dark:text-green-500">تم التحقق بنجاح!</h2>
              <p className="text-muted-foreground mb-6">{message}</p>
              <p className="text-sm text-muted-foreground">سيتم التوجيه للصفحة الرئيسية خلال قليل...</p>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}
