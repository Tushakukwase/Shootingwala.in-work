"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Welcome } from "@/components/dashboard/welcome"
import { Featured } from "@/components/dashboard/featured"
import { Bookings } from "@/components/dashboard/bookings"
import { Offers } from "@/components/dashboard/offers"
import { RecentlyViewed } from "@/components/dashboard/recently-viewed"
import { HomeContent } from "@/components/home/HomeContent"

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading } = useAuth()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Instead of redirecting to /login (which causes the second login page),
      // redirect to home page where users can choose their login method
      router.push('/')
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </main>
    )
  }

  if (!isAuthenticated || !user) {
    return null // Will redirect to login
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 space-y-8">
        <Welcome userName={user.fullName.split(' ')[0]} />
        <Featured />
        <Bookings />
        <Offers />
        <RecentlyViewed />
      </div>
      
      {/* Home Page Content */}
      <HomeContent />
    </main>
  )
}