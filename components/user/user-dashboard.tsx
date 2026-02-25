"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { RefreshCw, CheckCircle2, XCircle, Banknote, LayoutDashboard, Eye, EyeOff } from "lucide-react"
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
  const [cardVisibility, setCardVisibility] = useState<Record<number, boolean>>({})
  const [pullRefreshProgress, setPullRefreshProgress] = useState(0)
  const [isPulling, setIsPulling] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const startYRef = useRef(0)
  const { t } = useLocale()

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/user/stats")
      const data = await res.json()
      if (data.success) {
        setStats(data.data)
        // Initialize card visibility
        setCardVisibility({
          0: false,
          1: false,
          2: false,
          3: false,
        })
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err)
    } finally {
      setLoading(false)
      setPullRefreshProgress(0)
      setIsPulling(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  // Pull-to-Refresh Handler
  const handleTouchStart = (e: React.TouchEvent) => {
    if (scrollContainerRef.current?.scrollTop === 0) {
      startYRef.current = e.touches[0].clientY
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (scrollContainerRef.current?.scrollTop === 0 && startYRef.current > 0) {
      const currentY = e.touches[0].clientY
      const diff = currentY - startYRef.current
      if (diff > 0) {
        const progress = Math.min(diff / 100, 1)
        setPullRefreshProgress(progress)
        setIsPulling(true)
      }
    }
  }

  const handleTouchEnd = () => {
    if (pullRefreshProgress > 0.5 && !loading) {
      setLoading(true)
      fetchStats()
    } else {
      setPullRefreshProgress(0)
      setIsPulling(false)
    }
    startYRef.current = 0
  }

  if (loading && !stats) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <RefreshCw className="w-5 h-5 text-muted-foreground animate-spin mx-auto" />
        <p className="text-muted-foreground text-sm mt-2">{t("loading")}</p>
      </div>
    )
  }

  if (!stats) return null

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

  const toggleCardVisibility = (index: number) => {
    setCardVisibility(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  return (
    <div 
      ref={scrollContainerRef}
      className="space-y-4 pb-8 relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-Refresh Indicator */}
      {isPulling && (
        <div className="flex flex-col items-center justify-center py-4 px-1">
          <div className="relative w-8 h-8 flex items-center justify-center">
            <RefreshCw 
              className="w-5 h-5 text-primary" 
              style={{
                opacity: pullRefreshProgress,
                transform: `rotate(${pullRefreshProgress * 360}deg)`,
                transition: 'transform 0.1s linear'
              }}
            />
          </div>
          <p className="text-muted-foreground text-xs mt-2">
            {pullRefreshProgress > 0.5 ? "حرر للتحديث" : "اسحب للأسفل للتحديث"}
          </p>
        </div>
      )}

      {/* Balance Carousel - 3D-like منحني */}
      <div className="relative px-1">
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
              <CarouselItem key={index} className="basis-[90%] sm:basis-[80%] md:basis-[70%] pl-3">
                <div className="perspective">
                  <div 
                    className={`bg-gradient-to-br ${card.color} rounded-3xl p-5 h-40 flex flex-col justify-between relative overflow-hidden shadow-lg shadow-red-900/30 border border-red-500/20 transition-transform duration-300`}
                    style={{
                      transform: 'perspective(1000px) rotateY(-5deg) rotateX(2deg)',
                    }}
                  >
                    {/* Background Pattern */}
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
                        <div className="w-8 h-8 relative">
                          <Image 
                            src="/logo-shamel.jpg" 
                            alt="Al-Shamel Logo" 
                            width={32} 
                            height={32}
                            className="rounded-full"
                          />
                        </div>
                        <span className="text-white/90 text-xs font-medium">حساب</span>
                      </div>
                      <button
                        onClick={() => toggleCardVisibility(index)}
                        className="p-1.5 bg-white/20 rounded-full hover:bg-white/30 transition-colors backdrop-blur-sm"
                      >
                        {cardVisibility[index] ? (
                          <EyeOff className="w-4 h-4 text-white" />
                        ) : (
                          <Eye className="w-4 h-4 text-white" />
                        )}
                      </button>
                    </div>

                    <div className="flex justify-between items-end relative z-10">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <p className="text-white text-3xl font-bold tracking-tight">
                            {cardVisibility[index] ? card.value.toLocaleString() : "••••"}
                          </p>
                          <span className="text-white/80 text-xs mt-2 font-semibold">{card.currency}</span>
                        </div>
                      </div>
                      <p className="text-white/90 text-xs font-medium text-right">{card.label}</p>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* Dynamic Banner Section - أصغر */}
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
                <div className="relative h-24 w-full rounded-2xl overflow-hidden border border-gray-800 shadow-lg">
                  <img 
                    src={banner.image} 
                    alt="Promotion" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center p-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-red-600 rounded-lg shadow-lg">
                        <LayoutDashboard className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-xs">خدمة فرقك</p>
                        <p className="text-white/70 text-[10px]">قسم فاتورتك بالشكل الذي يناسبك</p>
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
        <h2 className="text-white font-bold text-xs mb-2 flex items-center gap-2">
          <div className="w-5 h-5 bg-red-600/20 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="w-3 h-3 text-red-500" />
          </div>
          الإحصائيات
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {statCards.map((card) => {
            const Icon = card.icon
            return (
              <div key={card.label} className={`p-2 rounded-lg border ${card.bg} flex flex-col gap-1.5`}>
                <div className={`flex items-center justify-center w-6 h-6 rounded-lg bg-background/50 ${card.color}`}>
                  <Icon className="w-3 h-3" />
                </div>
                <div>
                  <p className="text-muted-foreground text-[9px] truncate">{card.label}</p>
                  <p className={`text-sm font-bold ${card.color}`}>{card.value}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Total Processed - بطاقة منفصلة أصغر */}
      <div className="px-1">
        <div className="p-3 rounded-lg border bg-amber-500/10 border-amber-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-background/50 text-amber-400">
                <Banknote className="w-4 h-4" />
              </div>
              <div>
                <p className="text-muted-foreground text-[10px]">{t("totalProcessed")}</p>
                <p className="text-base font-bold text-amber-400">{stats.totalAmountProcessed.toLocaleString()} {t("yer")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
