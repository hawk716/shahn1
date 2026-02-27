"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { RefreshCw, CheckCircle2, XCircle, Banknote, LayoutDashboard, Eye, EyeOff, ChevronDown } from "lucide-react"
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
  const [isDarkMode, setIsDarkMode] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const startYRef = useRef(0)
  const { t, locale, dir } = useLocale()

  // Detect dark/light mode
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark')
      setIsDarkMode(isDark)
    }
    checkDarkMode()
    
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    
    return () => observer.disconnect()
  }, [])

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/user/stats", { cache: 'no-store' })
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
    { label: locale === "ع" ? "ريال سعودي" : "Saudi Riyal", value: stats.balances.sar, currency: locale === "ع" ? "ر.س" : "SAR" },
    { label: locale === "ع" ? "ريال يمني قديم" : "Yemeni Riyal (Old)", value: stats.balances.yer_old, currency: locale === "ع" ? "ر.ي" : "YER" },
    { label: locale === "ع" ? "ريال يمني جديد" : "Yemeni Riyal (New)", value: stats.balances.yer_new, currency: locale === "ع" ? "ر.ي" : "YER" },
    { label: locale === "ع" ? "دولار أمريكي" : "US Dollar", value: stats.balances.usd, currency: "$" },
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
      <div className="sticky top-0 z-10 flex flex-col items-center justify-center py-3 px-1">
        {isPulling && (
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <ChevronDown 
                className="w-6 h-6 text-primary" 
                style={{
                  opacity: pullRefreshProgress,
                  transform: `translateY(${pullRefreshProgress * 8}px) scaleY(${0.5 + pullRefreshProgress * 0.5})`,
                  transition: 'transform 0.1s linear'
                }}
              />
            </div>
            <p className="text-muted-foreground text-xs font-medium">
              {pullRefreshProgress > 0.5 ? (locale === "ع" ? "حرر للتحديث ✓" : "Release to refresh ✓") : (locale === "ع" ? "اسحب للأسفل للتحديث ↓" : "Pull down to refresh ↓")}
            </p>
          </div>
        )}
      </div>

      {/* Balance Carousel */}
      <div className="relative px-1" dir={dir}>
        <Carousel 
          className="w-full" 
          opts={{ 
            direction: dir,
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
          <CarouselContent className={dir === 'rtl' ? 'ml-0' : '-ml-4'}>
            {balanceCards.map((card, index) => (
              <CarouselItem key={index} className="basis-[90%] sm:basis-[80%] md:basis-[70%] pl-3">
                <div className="perspective">
                  <div 
                    className={`rounded-3xl p-5 h-40 flex flex-col justify-between relative overflow-hidden shadow-lg border transition-transform duration-300
                      ${isDarkMode 
                        ? 'bg-white text-black border-gray-200 shadow-white/5' 
                        : 'bg-red-600 text-white border-red-500 shadow-red-900/30'}`}
                    style={{
                      transform: 'perspective(1000px) rotateY(-5deg) rotateX(2deg)',
                    }}
                  >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <svg className="w-full h-full" viewBox="0 0 400 300" preserveAspectRatio="none">
                        <path d="M0,50 Q100,30 200,50 T400,50" stroke="currentColor" strokeWidth="2" fill="none" />
                        <path d="M0,100 Q100,80 200,100 T400,100" stroke="currentColor" strokeWidth="2" fill="none" />
                        <path d="M0,150 Q100,130 200,150 T400,150" stroke="currentColor" strokeWidth="2" fill="none" />
                        <circle cx="350" cy="250" r="40" fill="currentColor" opacity="0.1" />
                        <circle cx="50" cy="200" r="30" fill="currentColor" opacity="0.08" />
                      </svg>
                    </div>
                    
                    {/* Top Section */}
                    <div className="flex justify-between items-center relative z-10">
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
                        <span className="opacity-90 text-xs font-medium">{locale === "ع" ? "حساب" : "Account"}</span>
                      </div>
                      <p className="opacity-90 text-xs font-medium">{card.label}</p>
                    </div>

                    {/* Bottom Section */}
                    <div className="flex justify-between items-end relative z-10">
                      <button
                        onClick={() => toggleCardVisibility(index)}
                        className={`p-1.5 rounded-full transition-colors backdrop-blur-sm ${isDarkMode ? 'bg-black/10 hover:bg-black/20' : 'bg-white/20 hover:bg-white/30'}`}
                      >
                        {cardVisibility[index] ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      <div className="flex items-center gap-2">
                        <p className="text-3xl font-bold tracking-tight">
                          {cardVisibility[index] ? card.value.toLocaleString() : "••••"}
                        </p>
                        <span className="opacity-80 text-xs mt-2 font-semibold">{card.currency}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* Dynamic Banner Section */}
      <div className="px-1" dir={dir}>
        <Carousel 
          className="w-full" 
          opts={{ 
            loop: true,
            align: 'center',
            direction: dir
          }}
          plugins={[
            Autoplay({
              delay: 4000,
              stopOnInteraction: true,
            }) as any
          ]}
        >
          <CarouselContent className={dir === 'rtl' ? 'ml-0' : '-ml-4'}>
            {stats.banners.map((banner) => (
              <CarouselItem key={banner.id} className="pl-4">
                <div className="relative h-24 w-full rounded-2xl overflow-hidden border border-border shadow-lg">
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
                        <p className="text-white font-bold text-xs">{locale === "ع" ? "خدمة الشامل" : "Al-Shamel Service"}</p>
                        <p className="text-white/70 text-[10px]">{locale === "ع" ? "إدارة مالية ذكية" : "Smart Financial Management"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 px-1">
        {statCards.map((stat, index) => (
          <div key={index} className={`p-4 rounded-2xl border ${stat.bg} flex items-center justify-between`}>
            <div>
              <p className="text-muted-foreground text-xs font-medium mb-1">{stat.label}</p>
              <p className="text-xl font-bold text-foreground">{stat.value.toLocaleString()}</p>
            </div>
            <stat.icon className={`w-8 h-8 ${stat.color} opacity-80`} />
          </div>
        ))}
      </div>

      {/* Message Section */}
      <div className="px-1">
        <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
          <p className="text-sm text-foreground font-medium">{stats.dynamicMessage}</p>
        </div>
      </div>
    </div>
  )
}
