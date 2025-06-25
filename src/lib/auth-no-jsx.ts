"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import type { Id } from "../../convex/_generated/dataModel"

interface User {
  _id: Id<"users">
  name: string
  homeName: string
  lastName: string
  contactNo: string
  role: "admin" | "user"
  createdAt: number
}

interface RegisterData {
  name: string
  homeName: string
  lastName: string
  contactNo: string
  password: string
  role: "admin" | "user"
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (contactNo: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [initialLoading, setInitialLoading] = useState(true)

  const loginMutation = useMutation(api.auth.login)
  const registerMutation = useMutation(api.auth.register)
  const logoutMutation = useMutation(api.auth.logout)

  const user = useQuery(api.auth.getCurrentUser, token ? { token } : "skip")

  useEffect(() => {
    const savedToken = localStorage.getItem("auth-token")
    if (savedToken) {
      setToken(savedToken)
    }
    setInitialLoading(false)
  }, [])

  const login = async (contactNo: string, password: string) => {
    try {
      const result = await loginMutation({ contactNo, password })
      setToken(result.token)
      localStorage.setItem("auth-token", result.token)
    } catch (error) {
      throw error
    }
  }

  const register = async (data: RegisterData) => {
    try {
      await registerMutation(data)
      // Don't auto-login after registration, let user login manually
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    if (token) {
      try {
        await logoutMutation({ token })
      } catch (error) {
        // Handle logout error silently
        console.error("Logout error:", error)
      }
    }
    setToken(null)
    localStorage.removeItem("auth-token")
  }

  // Calculate loading state properly
  const loading = initialLoading || (!!token && user === undefined)

  const value: AuthContextType = {
    user: user || null,
    token,
    login,
    register,
    logout,
    loading,
  }

  return React.createElement(AuthContext.Provider, { value }, children)
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
