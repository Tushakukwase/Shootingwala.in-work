"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Bell, ShoppingCart, User, LogOut, Camera, Menu } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"

export function AuthHeader() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showCart, setShowCart] = useState(false)
  const [notificationCount, setNotificationCount] = useState(3) // Mock notification count
  const [cartCount, setCartCount] = useState(2) // Mock cart count

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu || showNotifications || showCart) {
        const target = event.target as Node
        const userMenu = document.getElementById('user-menu')
        const notificationPanel = document.getElementById('notification-panel')
        const cartPanel = document.getElementById('cart-panel')
        
        if (userMenu && !userMenu.contains(target)) {
          setShowUserMenu(false)
        }
        if (notificationPanel && !notificationPanel.contains(target)) {
          setShowNotifications(false)
        }
        if (cartPanel && !cartPanel.contains(target)) {
          setShowCart(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu, showNotifications, showCart])

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
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
      // Clear local data even if API fails
      localStorage.removeItem('user')
      localStorage.removeItem('studio')
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      logout()
      router.push('/')
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

  const handleUpdateProfile = () => {
    setShowUserMenu(false)
    router.push('/dashboard/profile')
  }

  // Type assertion to access image property that might exist on user object
  const userWithImage = user as (typeof user & { image?: string });

  return (
    <header className="bg-white shadow-sm border-b fixed w-full top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-orange-500 p-2 rounded-lg">
              <Camera className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">ShootingWala</span>
          </Link>

          {/* Right side controls - moved to the far right */}
          <div className="flex items-center space-x-4 ml-auto">
            {/* Cart Icon */}
            <button
              onClick={() => {
                setShowCart(!showCart)
                setShowNotifications(false)
                setShowUserMenu(false)
              }}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
              title="Cart"
            >
              <ShoppingCart className="h-5 w-5 text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Notification Icon */}
            <button
              onClick={() => {
                setShowNotifications(!showNotifications)
                setShowCart(false)
                setShowUserMenu(false)
              }}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
              title="Notifications"
            >
              <Bell className="h-5 w-5 text-gray-700" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu)
                  setShowCart(false)
                  setShowNotifications(false)
                }}
                className="flex items-center space-x-2 focus:outline-none"
                title="User Profile"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userWithImage?.image || undefined} />
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
                <div 
                  id="user-menu"
                  className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border py-2 z-50"
                >
                  <div className="px-4 py-3 border-b">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={userWithImage?.image || undefined} />
                        <AvatarFallback className="bg-orange-500 text-white">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user?.fullName || "User"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        {user?.phone && (
                          <p className="text-xs text-gray-500 truncate">{user.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="py-1">
                    <Link 
                      href="/dashboard/profile" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profile & Portfolio
                    </Link>
                    <button
                      onClick={handleUpdateProfile}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Update Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
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
        <div 
          id="cart-panel"
          className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50"
        >
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Your Cart ({cartCount})</h3>
              <button 
                onClick={() => setShowCart(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="space-y-3">
              {/* Mock cart items */}
              <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Wedding Photography</p>
                  <p className="text-xs text-gray-500">2 hours</p>
                  <p className="text-sm font-bold">₹4,999</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Pre-Wedding Shoot</p>
                  <p className="text-xs text-gray-500">1 hour</p>
                  <p className="text-sm font-bold">₹2,499</p>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span className="font-bold">₹7,498</span>
              </div>
              <Button className="w-full" onClick={() => {
                setShowCart(false)
                router.push('/dashboard/cart')
              }}>
                Checkout
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Panel */}
      {showNotifications && (
        <div 
          id="notification-panel"
          className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50"
        >
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Notifications ({notificationCount})</h3>
              <button 
                onClick={() => setShowNotifications(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {/* Mock notifications with click handlers */}
              <div 
                className="p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                onClick={() => {
                  setShowNotifications(false);
                  router.push('/dashboard/bookings');
                }}
              >
                <div className="flex justify-between">
                  <p className="text-sm font-medium">New Booking Request</p>
                  <span className="text-xs text-gray-500">2h ago</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">You have a new booking request from John Doe for Wedding Photography</p>
              </div>
              <div 
                className="p-3 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
                onClick={() => {
                  setShowNotifications(false);
                  router.push('/dashboard/payments');
                }}
              >
                <div className="flex justify-between">
                  <p className="text-sm font-medium">Payment Received</p>
                  <span className="text-xs text-gray-500">1d ago</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">Payment of ₹4,999 received for Pre-Wedding Shoot</p>
              </div>
              <div 
                className="p-3 bg-yellow-50 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors"
                onClick={() => {
                  setShowNotifications(false);
                  router.push('/dashboard/calendar');
                }}
              >
                <div className="flex justify-between">
                  <p className="text-sm font-medium">Reminder</p>
                  <span className="text-xs text-gray-500">2d ago</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">Your booking with Jane Smith is scheduled for tomorrow</p>
              </div>
              <div 
                className="p-3 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors"
                onClick={() => {
                  setShowNotifications(false);
                  router.push('/dashboard/messages');
                }}
              >
                <div className="flex justify-between">
                  <p className="text-sm font-medium">New Message</p>
                  <span className="text-xs text-gray-500">3d ago</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">You have a new message from Photographer Studio</p>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={() => {
              setShowNotifications(false)
              router.push('/dashboard/notifications')
            }}>
              View All Notifications
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}