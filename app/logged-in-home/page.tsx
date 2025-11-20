"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import HomePage from "../page"
import { AuthHeader } from "@/components/layout/auth-header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { Sidebar } from "@/components/dashboard/sidebar"

export default function LoggedInHomePage() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, loading, router])

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