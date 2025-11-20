"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Bell, ShoppingCart, User, LogOut, Camera, Menu } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export function DashboardHeader({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const { user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showCart, setShowCart] = useState(false)

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      // Clear all auth data
      localStorage.removeItem('user')
      localStorage.removeItem('studio')
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      logout()
      // Redirect to home page
      window.location.href = '/'
    } catch (error) {
      console.error('Logout error:', error)
      // Clear local data even if API fails
      localStorage.removeItem('user')
      localStorage.removeItem('studio')
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      logout()
      window.location.href = '/'
    }
  }

  const getInitials = () => {
    if (!user) return "U"
    const name = user.fullName || user.email || "User"
    return name
      .split(' ')
      .map((word: string) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="bg-white shadow-sm border-b fixed w-full top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Sidebar toggle button and Logo */}
          <div className="flex items-center space-x-4">
            {/* Sidebar toggle button for all screen sizes */}
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5 text-gray-700" />
            </button>
            
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-orange-500 p-2 rounded-lg">
                <Camera className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">ShootingWala</span>
            </Link>
          </div>

          {/* Right side controls - moved to the far right */}
          <div className="flex items-center space-x-4 ml-auto">
            {/* Cart Icon */}
            <button
              onClick={() => setShowCart(!showCart)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
              title="Cart"
            >
              <ShoppingCart className="h-5 w-5 text-gray-700" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Notification Icon */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
              title="Notifications"
            >
              <Bell className="h-5 w-5 text-gray-700" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 focus:outline-none"
                title="User Profile"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={undefined} />
                  <AvatarFallback className="bg-orange-500 text-white text-sm">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline text-sm font-medium text-gray-700">
                  {user?.fullName || user?.email?.split('@')[0] || "User"}
                </span>
              </button>

              {/* User Menu Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border py-2 z-50">
                  <div className="px-4 py-3 border-b">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.fullName || "User"}
                    </p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <Link 
                      href="/dashboard/profile" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="h-4 w-4 inline mr-2" />
                      Profile & Portfolio
                    </Link>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        // Add any update logic here if needed
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Update Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4 inline mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cart Panel */}
      {showCart && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Your Cart</h3>
              <button 
                onClick={() => setShowCart(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <p className="text-gray-500 text-center py-8">Your cart is empty</p>
            <Button className="w-full" onClick={() => setShowCart(false)}>
              Continue Shopping
            </Button>
          </div>
        </div>
      )}

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Notifications</h3>
              <button 
                onClick={() => setShowNotifications(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <p className="text-gray-500 text-center py-8">No new notifications</p>
            <Button variant="outline" className="w-full" onClick={() => setShowNotifications(false)}>
              View All
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}