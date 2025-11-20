"use client"

import { useEffect, useState, use } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import HomePage from "@/app/page"
import { AuthHeader } from "@/components/layout/auth-header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { Sidebar } from "@/components/dashboard/sidebar"

export default function UserHomePage({ params }: { params: Promise<{ username: string }> }) {
  const router = useRouter()
  const { isAuthenticated, loading, user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Unwrap the params promise
  const unwrappedParams = use(params)
  const { username } = unwrappedParams || {}

  // Redirect to login if not authenticated or if username doesn't match
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/')
      } else if (user && username && user.fullName?.toLowerCase().replace(/\s+/g, '-') !== username) {
        // Redirect to correct user URL if needed
        const correctUsername = user.fullName?.toLowerCase().replace(/\s+/g, '-') || 'user'
        router.push(`/user/${correctUsername}`)
      }
    }
  }, [isAuthenticated, loading, user, username, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  // Check if the username in URL matches the logged in user
  const urlUsername = username
  const actualUsername = user?.fullName?.toLowerCase().replace(/\s+/g, '-') || 'user'
  
  if (urlUsername !== actualUsername) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Redirecting to your personalized page...</p>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <AuthHeader />
      
      {/* Main Content - with top margin to account for fixed header */}
      <main className="flex-grow mt-16">
        {/* Sidebar toggle button - fixed position on left side */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-20 left-4 z-40 bg-white p-2 rounded-lg shadow-md"
          aria-label="Toggle dashboard menu"
        >
          <Menu className="h-5 w-5 text-gray-700" />
        </button>
        
        {/* Sidebar for mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50">
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setSidebarOpen(false)}
            />
            
            {/* Sidebar */}
            <div className="relative w-64 h-full bg-white shadow-lg">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Dashboard Menu</h2>
              </div>
              <div className="p-2">
                <Sidebar />
              </div>
            </div>
          </div>
        )}
        
        <HomePage />
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  )
}