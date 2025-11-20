"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { isUserLoggedIn, getUserData, clearAuthData } from '@/lib/auth-utils'

interface User {
  id: string
  fullName: string
  email: string
  phone: string
  isVerified: boolean
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (userData: User) => void
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on app start
    if (isUserLoggedIn()) {
      const userData = getUserData()
      if (userData) {
        setUser(userData)
      } else {
        clearAuthData()
      }
    } else {
      clearAuthData()
    }
    setLoading(false)
  }, [])

  const login = (userData: User) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
    
    // Force a re-render to ensure authentication state is updated
    setLoading(false)
  }

  const logout = () => {
    setUser(null)
    clearAuthData()
  }

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}