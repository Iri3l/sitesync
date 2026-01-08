"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"

interface User {
  id: string
  email: string
  name: string | null
  role: string
  createdAt: Date
  _count: {
    sites: number
    snags: number
    siteDiaries: number
  }
}

interface UsersTableProps {
  users: User[]
  currentUserId: string
}

export function UsersTable({ users, currentUserId }: UsersTableProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [resetPasswordUserId, setResetPasswordUserId] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState("")

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "director":
        return "bg-purple-100 text-purple-700 border-purple-300"
      case "manager":
        return "bg-blue-100 text-blue-700 border-blue-300"
      case "supervisor":
        return "bg-green-100 text-green-700 border-green-300"
      default:
        return "bg-gray-100 text-gray-700 border-gray-300"
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (userId === currentUserId) {
      alert("You cannot change your own role from here. Use the Profile page.")
      return
    }

    setLoading(userId)
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update role")
      }

      router.refresh()
    } catch (err: any) {
      alert(err.message || "An error occurred")
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = async (userId: string, email: string) => {
    if (userId === currentUserId) {
      alert("You cannot delete your own account")
      return
    }

    if (!confirm(`Are you sure you want to delete user "${email}"? This action cannot be undone.`)) {
      return
    }

    setLoading(userId)
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete user")
      }

      router.refresh()
    } catch (err: any) {
      alert(err.message || "An error occurred")
    } finally {
      setLoading(null)
    }
  }

  const handleResetPassword = async (userId: string) => {
    if (!newPassword || newPassword.length < 6) {
      alert("Password must be at least 6 characters")
      return
    }

    setLoading(userId)
    try {
      const response = await fetch(`/api/users/${userId}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to reset password")
      }

      alert("Password reset successfully!")
      setResetPasswordUserId(null)
      setNewPassword("")
    } catch (err: any) {
      alert(err.message || "An error occurred")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="text-left p-3 font-medium">User</th>
            <th className="text-left p-3 font-medium">Role</th>
            <th className="text-left p-3 font-medium">Stats</th>
            <th className="text-left p-3 font-medium">Joined</th>
            <th className="text-left p-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b hover:bg-muted/30">
              <td className="p-3">
                <div>
                  <p className="font-medium">{user.name || "—"}</p>
                  <p className="text-muted-foreground text-xs">{user.email}</p>
                </div>
              </td>
              <td className="p-3">
                {user.role === "director" || user.id === currentUserId ? (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadge(user.role)}`}>
                    {user.role.toUpperCase()}
                  </span>
                ) : (
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    disabled={loading === user.id}
                    className={`px-2 py-1 rounded text-xs font-medium border ${getRoleBadge(user.role)} cursor-pointer`}
                  >
                    <option value="user">USER</option>
                    <option value="supervisor">SUPERVISOR</option>
                    <option value="manager">MANAGER</option>
                  </select>
                )}
              </td>
              <td className="p-3">
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <p>{user._count.sites} sites</p>
                  <p>{user._count.snags} snags</p>
                </div>
              </td>
              <td className="p-3 text-muted-foreground">
                {format(new Date(user.createdAt), "PP")}
              </td>
              <td className="p-3">
                {user.role !== "director" && user.id !== currentUserId && (
                  <div className="flex items-center gap-2">
                    {resetPasswordUserId === user.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="password"
                          placeholder="New password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="h-8 w-32 text-xs"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResetPassword(user.id)}
                          disabled={loading === user.id}
                          className="h-8 text-xs"
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setResetPasswordUserId(null)
                            setNewPassword("")
                          }}
                          className="h-8 text-xs"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setResetPasswordUserId(user.id)}
                          disabled={loading === user.id}
                          className="h-8 text-xs"
                        >
                          Reset Password
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(user.id, user.email)}
                          disabled={loading === user.id}
                          className="h-8 text-xs"
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                )}
                {user.id === currentUserId && (
                  <span className="text-xs text-muted-foreground italic">You</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

