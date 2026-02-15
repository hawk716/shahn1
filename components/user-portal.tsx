"use client"

import { useState, useEffect } from "react"
import { UserLogin } from "./user/user-login"
import { UserSidebar } from "./user/user-sidebar"
import { UserDashboard } from "./user/user-dashboard"
import { UserApiKey } from "./user/user-api-key"
import { UserRequests } from "./user/user-requests"
import { ApiDocsPage } from "./user/api-docs-page"
import { WithdrawalForm } from "./withdrawal/withdrawal-form"

interface UserSession {
  id: number
  username: string
  role: string
  balance: number
  api_key: string
}

export function UserPortal() {
  const [user, setUser] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [activePage, setActivePage] = useState("dashboard")

  useEffect(() => {
    checkSession()
  }, [])

  async function checkSession() {
    try {
      const res = await fetch("/api/auth/me")
      const data = await res.json()
      if (data.authenticated) {
        setUser(data.user)
      }
    } catch (err) {
      console.error("[v0] Session check error:", err)
      setError("فشل التحقق من الجلسة")
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ portal: "user" }),
    })
    setUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
            <p className="text-red-500 font-semibold mb-4">{error}</p>
            <button
              onClick={() => {
                setError("")
                setLoading(true)
                checkSession()
              }}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              إعادة محاولة
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <UserLogin onLogin={(u) => setUser(u)} />
  }

  return (
    <div className="min-h-screen bg-background flex">
      <UserSidebar
        username={user.username}
        activePage={activePage}
        onPageChange={setActivePage}
        onLogout={handleLogout}
      />
      <main className="flex-1 pt-14 pb-16 md:pt-0 md:pb-0 p-3 sm:p-6 overflow-auto">
        <div className="max-w-5xl mx-auto">
          {activePage === "dashboard" && <UserDashboard user={user} />}
          {activePage === "withdrawal" && <WithdrawalForm userId={user.id} />}
          {activePage === "api-key" && <UserApiKey user={user} onUpdate={checkSession} />}
          {activePage === "requests" && <UserRequests />}
          {activePage === "docs" && <ApiDocsPage apiKey={user.api_key} />}
        </div>
      </main>
    </div>
  )
}
