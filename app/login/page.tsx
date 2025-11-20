"use client"

import AuthForm from "@/components/auth-form"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function UserLoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [userType, setUserType] = useState<"user" | "studio">("user")
  const [isLogin, setIsLogin] = useState(true)
  
  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const studioData = localStorage.getItem('studio')
        const userData = localStorage.getItem('user')
        
        if (studioData || userData) {
          // User is already logged in, redirect appropriately
          try {
            if (studioData) {
              const parsed = JSON.parse(studioData)
              if (parsed.role === 'admin') {
                router.push('/admin')
              } else {
                router.push('/studio-dashboard')
              }
            } else if (userData) {
              const parsed = JSON.parse(userData)
              const username = parsed.fullName?.toLowerCase().replace(/\s+/g, '-') || 'user'
              router.push(`/user/${username}`)
            }
          } catch (e) {
            // If parsing fails, continue to login page
          }
        }
      }
    }
    
    checkAuth()
  }, [router])
  
  const handleSuccess = () => {
    setIsLoading(true)
  }
  
  const handleSwitchUserType = (type: "user" | "studio") => {
    setUserType(type)
  }
  
  const handleSetIsLogin = (value: boolean) => {
    setIsLogin(value)
  }
  
  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Redirecting...</p>
        </div>
      </main>
    )
  }
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <AuthForm 
        userType={userType}
        isLogin={isLogin}
        setIsLogin={handleSetIsLogin}
        onSuccess={handleSuccess}
        onSwitchUserType={handleSwitchUserType}
      />
    </main>
  )
}