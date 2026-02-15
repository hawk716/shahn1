"use client"

import { useEffect, useState, useCallback } from "react"
import { RefreshCw, Plus, Trash2, Shield, User, Loader2 } from "lucide-react"
import { useLocale } from "@/lib/locale-context"

interface UserData {
  id: number
  username: string
  role: string
  api_key: string
  balance: string
  created_at: string
}

export function UsersTab() {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newUsername, setNewUsername] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [newRole, setNewRole] = useState("user")
  const [addLoading, setAddLoading] = useState(false)
  const [message, setMessage] = useState("")
  const { t } = useLocale()

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/users")
      const data = await res.json()
      if (data.success) setUsers(data.data)
    } catch (err) {
      console.error("Failed to fetch users:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  async function handleAddUser() {
    if (!newUsername.trim() || !newPassword.trim()) return
    setAddLoading(true)
    setMessage("")
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername, password: newPassword, role: newRole }),
      })
      const data = await res.json()
      if (data.success) {
        setMessage(t("userCreated"))
        setNewUsername("")
        setNewPassword("")
        setNewRole("user")
        setShowAddForm(false)
        fetchUsers()
      } else {
        setMessage(`${t("error")}: ${data.error}`)
      }
    } catch (err) {
      setMessage(`${t("error")}: ${err}`)
    } finally {
      setAddLoading(false)
    }
  }

  async function handleDeleteUser(userId: number) {
    if (!confirm(t("confirmDelete"))) return
    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (data.success) {
        setMessage(t("userDeleted"))
        fetchUsers()
      }
    } catch (err) {
      setMessage(`${t("error")}: ${err}`)
    }
  }

  const inputClass =
    "w-full px-3 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-ring transition-colors"

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-foreground font-semibold text-sm truncate">{t("manageUsers")} ({users.length})</h2>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span className="hidden sm:inline">{t("addUser")}</span>
          </button>
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-secondary border border-border 
              text-muted-foreground text-xs hover:text-foreground transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">{t("refresh")}</span>
          </button>
        </div>
      </div>

      {/* Add User Form */}
      {showAddForm && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-muted-foreground text-xs mb-1.5">{t("username")}</label>
              <input
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className={inputClass}
                placeholder={t("username")}
              />
            </div>
            <div>
              <label className="block text-muted-foreground text-xs mb-1.5">{t("password")}</label>
              <input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
                type="password"
                placeholder={t("password")}
              />
            </div>
            <div>
              <label className="block text-muted-foreground text-xs mb-1.5">{t("role")}</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className={inputClass}
              >
                <option value="user">{t("user")}</option>
                <option value="admin">{t("admin")}</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddUser}
              disabled={addLoading || !newUsername.trim() || !newPassword.trim()}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg 
                bg-primary text-primary-foreground font-semibold text-sm
                hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {addLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {t("addUser")}
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-lg bg-secondary border border-border text-muted-foreground text-sm hover:text-foreground transition-colors"
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      )}

      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.startsWith(t("error"))
              ? "bg-red-500/10 border border-red-500/20 text-red-500"
              : "bg-green-500/10 border border-green-500/20 text-green-500"
          }`}
        >
          {message}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-5 h-5 text-muted-foreground animate-spin mx-auto" />
            <p className="text-muted-foreground text-sm mt-2">{t("loading")}</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground text-sm">{t("noUsers")}</p>
          </div>
        ) : (
          <div>
            <div className="sm:hidden divide-y divide-border">
              {users.map((user) => (
                <div key={user.id} className="p-3 hover:bg-background transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {user.role === "admin" ? (
                        <Shield className="w-4 h-4 text-amber-500" />
                      ) : (
                        <User className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="text-foreground text-sm font-medium">{user.username}</span>
                      <span className={`px-1.5 py-0.5 rounded text-xs ${
                        user.role === "admin"
                          ? "bg-amber-500/10 border border-amber-500/20 text-amber-500"
                          : "bg-secondary text-muted-foreground"
                      }`}>
                        {user.role === "admin" ? t("admin") : t("user")}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="flex items-center gap-1 px-2 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-500 text-xs hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{t("balance")}: <span className="font-mono text-foreground">{parseFloat(user.balance).toLocaleString()}</span></span>
                    <span className="text-border">|</span>
                    <span className="font-mono">{new Date(user.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-background">
                    <th className="text-start px-4 py-3 text-muted-foreground font-medium">{t("id")}</th>
                    <th className="text-start px-4 py-3 text-muted-foreground font-medium">{t("username")}</th>
                    <th className="text-start px-4 py-3 text-muted-foreground font-medium">{t("role")}</th>
                    <th className="text-start px-4 py-3 text-muted-foreground font-medium">{t("balance")}</th>
                    <th className="text-start px-4 py-3 text-muted-foreground font-medium">{t("apiKey")}</th>
                    <th className="text-start px-4 py-3 text-muted-foreground font-medium">{t("createdAt")}</th>
                    <th className="text-start px-4 py-3 text-muted-foreground font-medium">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-t border-border hover:bg-background transition-colors">
                      <td className="px-4 py-3 text-muted-foreground font-mono">{user.id}</td>
                      <td className="px-4 py-3 text-foreground flex items-center gap-2">
                        {user.role === "admin" ? (
                          <Shield className="w-4 h-4 text-amber-500" />
                        ) : (
                          <User className="w-4 h-4 text-muted-foreground" />
                        )}
                        {user.username}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-md text-xs ${
                          user.role === "admin"
                            ? "bg-amber-500/10 border border-amber-500/20 text-amber-500"
                            : "bg-secondary text-muted-foreground"
                        }`}>
                          {user.role === "admin" ? t("admin") : t("user")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-foreground font-mono">{parseFloat(user.balance).toLocaleString()}</td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs max-w-[150px] truncate" dir="ltr">
                        {user.api_key || "-"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs font-mono">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="flex items-center gap-1 px-2 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-500 text-xs hover:bg-red-500/20 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          {t("deleteUser")}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
