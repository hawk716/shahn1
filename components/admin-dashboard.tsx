"use client"

import { useState, useEffect } from "react"
import { AdminHeader } from "./admin/admin-header"
import { AdminLogin } from "./admin/admin-login"
import { TabNav } from "./admin/tab-nav"
import { PaymentsTab } from "./admin/payments-tab"
import { LogsTab } from "./admin/logs-tab"
import { TestTab } from "./admin/test-tab"
import { SettingsTab } from "./admin/settings-tab"
import { TelegramTab } from "./admin/telegram-tab"
import { StatsTab } from "./admin/stats-tab"
import { UsersTab } from "./admin/users-tab"

interface AdminSession {
  id: number
  username: string
  role: string
}

export function AdminDashboard() {
  const [admin, setAdmin] = useState<AdminSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("stats")

  useEffect(() => {
    checkSession()
  }, [])

  async function checkSession() {
    try {
      const res = await fetch("/api/auth/me?portal=admin")
      const data = await res.json()
      
      // Validate that data.user is a proper object with expected properties
      if (
        data.authenticated &&
        data.user &&
        typeof data.user === "object" &&
        !Array.isArray(data.user) &&
        "id" in data.user &&
        "username" in data.user &&
        "role" in data.user
      ) {
        setAdmin(data.user as AdminSession)
      }
    } catch (error) {
      console.error("[v0] Session check error:", error)
      // Not authenticated
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ portal: "admin" }),
    })
    setAdmin(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!admin) {
    return <AdminLogin onLogin={(a) => setAdmin(a)} />
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader username={admin.username} onLogout={handleLogout} />
      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="mt-6">
          {activeTab === "stats" && <StatsTab />}
          {activeTab === "payments" && <PaymentsTab />}
          {activeTab === "logs" && <LogsTab />}
          {activeTab === "users" && <UsersTab />}
          {activeTab === "telegram" && <TelegramTab />}
          {activeTab === "test" && <TestTab />}
          {activeTab === "settings" && <SettingsTab />}
        </div>
      </main>
    </div>
  )
}
