"use client"

import { useEffect, useState, useCallback } from "react"
import { RefreshCw, Wallet, CheckCircle2, XCircle, Banknote, LayoutDashboard, Eye, EyeOff, ChevronRight, ChevronLeft } from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import { Card } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

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
  const [showBalance, setShowBalance] = useState(true)
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
    { label: "ريال يمني قديم", value: stats.balances.yer_old, currency: "ر.ي" },
    { label: "ريال سعودي", value: stats.balances.sar, currency: "ر.س" },
    { label: "دولار أمريكي", value: stats.balances.usd, currency: "$" },
    { label: "ريال يمني جديد", value: stats.balances.yer_new, currency: "ر.ي" },
  ]

  const totalRequests = stats.successfulRequests + stats.failedRequests

  const statCards = [
    { label: t("totalRequests"), value: totalRequests, icon: Banknote, color: "text-foreground", bg: "bg-secondary border-border" },
    { label: t("successfulRequests"), value: stats.successfulRequests, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10 border-green-500/20" },
    { label: t("failedRequests"), value: stats.failedRequests, icon: XCircle, color: "text-red-500", bg: "bg-red-500/10 border-red-500/20" },
    { label: t("totalProcessed"), value: `${stats.totalAmountProcessed.toLocaleString()} ${t("yer")}`, icon: Banknote, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
  ]

  return (
    <div className="space-y-6 pb-8">
      {/* Header Section */}
      <div className="flex items-center justify-between px-1">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-white">{stats.dynamicMessage}</h1>
          <p className="text-gray-400 text-sm">{user.username}</p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 bg-gray-800/50 rounded-full border border-gray-700">
            <RefreshCw className={`w-5 h-5 text-gray-300 ${loading ? "animate-spin" : ""}`} onClick={fetchStats} />
          </button>
        </div>
      </div>

      {/* Balance Slider (Jaib Style) */}
      <div className="relative px-1">
        <Carousel className="w-full" opts={{ direction: 'rtl' }}>
          <CarouselContent>
            {balanceCards.map((card, index) => (
              <CarouselItem key={index} className="basis-[90%] sm:basis-[80%] pl-4">
                <div className="bg-red-600 rounded-3xl p-6 h-48 flex flex-col justify-between relative overflow-hidden shadow-lg shadow-red-900/20">
                  {/* Background Pattern */}
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -translate-x-1/2 translate-y-1/2 blur-2xl" />
                  
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <Wallet className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-white/80 text-sm font-medium">حساب</span>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-lg">{card.label}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <p className="text-white text-3xl font-bold">
                          {showBalance ? card.value.toLocaleString() : "•••••"}
                        </p>
                        <span className="text-white/80 text-sm mt-2">{card.currency}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowBalance(!showBalance)}
                      className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                    >
                      {showBalance ? <EyeOff className="w-5 h-5 text-white" /> : <Eye className="w-5 h-5 text-white" />}
                    </button>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* Dynamic Banner Section */}
      <div className="px-1">
        <Carousel className="w-full" opts={{ loop: true }}>
          <CarouselContent>
            {stats.banners.map((banner) => (
              <CarouselItem key={banner.id}>
                <div className="relative h-32 w-full rounded-2xl overflow-hidden border border-gray-800">
                  <img 
                    src={banner.image} 
                    alt="Promotion" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent flex items-center p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-600 rounded-lg">
                        <LayoutDashboard className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-bold">خدمة فرقك</p>
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

      {/* Stats Section (Maintained) */}
      <div className="px-1">
        <h2 className="text-white font-bold mb-4 flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-red-500" />
          الإحصائيات
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {statCards.map((card) => {
            const Icon = card.icon
            return (
              <div key={card.label} className={`p-4 rounded-2xl border ${card.bg} flex flex-col gap-2`}>
                <div className={`flex items-center justify-center w-10 h-10 rounded-xl bg-background/50 ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">{card.label}</p>
                  <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
