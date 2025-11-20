"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

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
    const userData = localStorage.getItem('user')
    const studioData = localStorage.getItem('studio')
    
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('user')
        // Also clear cookies
        document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
        document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      }
    } else if (studioData) {
      try {
        const parsedStudio = JSON.parse(studioData)
        // Convert studio data to user format
        setUser({
          id: parsedStudio._id || parsedStudio.id,
          fullName: parsedStudio.name || parsedStudio.username,
          email: parsedStudio.email,
          phone: parsedStudio.mobile || '',
          isVerified: true
        })
      } catch (error) {
        console.error('Error parsing studio data:', error)
        localStorage.removeItem('studio')
      }
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
    localStorage.removeItem('user')
    localStorage.removeItem('studio')
    // Clear cookies
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
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