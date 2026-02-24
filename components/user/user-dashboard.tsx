"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { RefreshCw, Wallet, CheckCircle2, XCircle, Banknote, LayoutDashboard, Eye, EyeOff } from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import Image from "next/image"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"

interface UserDashboardProps {
  user: { id: number; username: string; balance: number; api_key: string }
}

interface UserStats {
  balance: number
  balances: {
    yer_old: number
    sar: number
    usd: number
    yer_new: number
  }
  dynamicMessage: string
  banners: Array<{ id: number; image: string; link: string }>
  successfulRequests: number
  failedRequests: number
  totalAmountProcessed: number
  api_key: string
}

export function UserDashboard({ user }: UserDashboardProps) {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showBalance, setShowBalance] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(1) // ابدأ من الثاني (الريال اليمني القديم في المنتصف)
  const autoplayRef = useRef<ReturnType<typeof Autoplay>>(null)
  const { t } = useLocale()

  const fetchStats = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/user/stats")
      const data = await res.json()
      if (data.success) setStats(data.data)
    } catch (err) {
      console.error("Failed to fetch stats:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  if (loading || !stats) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <RefreshCw className="w-5 h-5 text-muted-foreground animate-spin mx-auto" />
        <p className="text-muted-foreground text-sm mt-2">{t("loading")}</p>
      </div>
    )
  }

  const balanceCards = [
    { label: "ريال سعودي", value: stats.balances.sar, currency: "ر.س", color: "from-amber-600 to-amber-700" },
    { label: "ريال يمني قديم", value: stats.balances.yer_old, currency: "ر.ي", color: "from-red-600 to-red-700" },
    { label: "ريال يمني جديد", value: stats.balances.yer_new, currency: "ر.ي", color: "from-orange-600 to-orange-700" },
    { label: "دولار أمريكي", value: stats.balances.usd, currency: "$", color: "from-green-600 to-green-700" },
  ]

  const totalRequests = stats.successfulRequests + stats.failedRequests

  const statCards = [
    { label: t("totalRequests"), value: totalRequests, icon: Banknote, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
    { label: t("successfulRequests"), value: stats.successfulRequests, icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
    { label: t("failedRequests"), value: stats.failedRequests, icon: XCircle, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
  ]

  return (
    <div className="space-y-6 pb-8">
      {/* Header Section - محسّن */}
      <div className="flex items-center justify-between px-1">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-white">{stats.dynamicMessage}</h1>
          <p className="text-gray-400 text-xs mt-1">مرحباً بك في لوحة التحكم</p>
        </div>
        <button 
          onClick={fetchStats}
          disabled={loading}
          className="p-2 bg-gray-800/50 rounded-full border border-gray-700 hover:bg-gray-700/50 transition-colors"
        >
          <RefreshCw className={`w-5 h-5 text-gray-300 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Logo + Balance Slider Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 relative">
              <Image 
                src="/logo-shamel.jpg" 
                alt="Al-Shamel Logo" 
                width={32} 
                height={32}
                className="rounded-full"
              />
            </div>
            <span className="text-gray-300 text-xs font-semibold">أرصدتك</span>
          </div>
          <button 
            onClick={() => setShowBalance(!showBalance)}
            className="p-2 bg-gray-800/50 rounded-full border border-gray-700 hover:bg-gray-700/50 transition-colors"
          >
            {showBalance ? <EyeOff className="w-4 h-4 text-gray-300" /> : <Eye className="w-4 h-4 text-gray-300" />}
          </button>
        </div>

        {/* Balance Carousel - مركزي مع بطاقة في المنتصف */}
        <div className="relative">
          <Carousel 
            className="w-full" 
            opts={{ 
              direction: 'rtl',
              align: 'center',
              loop: true,
              startIndex: 1
            }}
            plugins={[
              Autoplay({
                delay: 5000,
                stopOnInteraction: false,
              }) as any
            ]}
          >
            <CarouselContent className="ml-0">
              {balanceCards.map((card, index) => (
                <CarouselItem key={index} className="basis-[85%] sm:basis-[75%] md:basis-[65%] pl-3">
                  <div className={`bg-gradient-to-br ${card.color} rounded-3xl p-6 h-52 flex flex-col justify-between relative overflow-hidden shadow-lg shadow-red-900/30 border border-red-500/20`}>
                    {/* Background Pattern - خطوط انسيابية مستوحاة من شعار الشامل */}
                    <div className="absolute inset-0 opacity-10">
                      <svg className="w-full h-full" viewBox="0 0 400 300" preserveAspectRatio="none">
                        <path d="M0,50 Q100,30 200,50 T400,50" stroke="white" strokeWidth="2" fill="none" />
                        <path d="M0,100 Q100,80 200,100 T400,100" stroke="white" strokeWidth="2" fill="none" />
                        <path d="M0,150 Q100,130 200,150 T400,150" stroke="white" strokeWidth="2" fill="none" />
                        <circle cx="350" cy="250" r="40" fill="white" opacity="0.1" />
                        <circle cx="50" cy="200" r="30" fill="white" opacity="0.08" />
                      </svg>
                    </div>
                    
                    <div className="flex justify-between items-start relative z-10">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                          <Wallet className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-white/90 text-sm font-medium">حساب</span>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold text-base">{card.label}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-end relative z-10">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <p className="text-white text-4xl font-bold tracking-tight">
                            {showBalance ? card.value.toLocaleString() : "••••"}
                          </p>
                          <span className="text-white/80 text-sm mt-3 font-semibold">{card.currency}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>

      {/* Dynamic Banner Section - Auto-play */}
      <div className="px-1">
        <Carousel 
          className="w-full" 
          opts={{ 
            loop: true,
            align: 'center'
          }}
          plugins={[
            Autoplay({
              delay: 4000,
              stopOnInteraction: true,
            }) as any
          ]}
        >
          <CarouselContent>
            {stats.banners.map((banner) => (
              <CarouselItem key={banner.id}>
                <div className="relative h-36 w-full rounded-2xl overflow-hidden border border-gray-800 shadow-lg">
                  <img 
                    src={banner.image} 
                    alt="Promotion" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-600 rounded-lg shadow-lg">
                        <LayoutDashboard className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">خدمة فرقك</p>
                        <p className="text-white/70 text-xs">قسم فاتورتك بالشكل الذي يناسبك</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* Stats Section - محسّن وأصغر */}
      <div className="px-1">
        <h2 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
          <div className="w-6 h-6 bg-red-600/20 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="w-4 h-4 text-red-500" />
          </div>
          الإحصائيات
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {statCards.map((card) => {
            const Icon = card.icon
            return (
              <div key={card.label} className={`p-3 rounded-xl border ${card.bg} flex flex-col gap-2`}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg bg-background/50 ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-muted-foreground text-[10px] truncate">{card.label}</p>
                  <p className={`text-base font-bold ${card.color}`}>{card.value}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Total Processed - بطاقة منفصلة */}
      <div className="px-1">
        <div className="p-4 rounded-xl border bg-amber-500/10 border-amber-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-background/50 text-amber-400">
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">{t("totalProcessed")}</p>
                <p className="text-lg font-bold text-amber-400">{stats.totalAmountProcessed.toLocaleString()} {t("yer")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
