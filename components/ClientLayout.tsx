"use client"

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube, 
  Apple, 
  Play, 
  User, 
  LogOut, 
  Camera, 
  Menu, 
  X, 
  Search,
  Bell,
  ShoppingCart
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import LoginModal from './login-modal'
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

// Pages that mention "PhotoBook" should not have header/footer
const PHOTOBOOK_PAGES = [
  '/register', 
  '/studio-auth',
  '/admin',
  '/photographer-register'
]

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, logout, user } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  
  // Check if current page should not have header/footer
  const shouldHideHeaderFooter = PHOTOBOOK_PAGES.some(page => pathname.startsWith(page))
  
  // Check if current page is dashboard
  const isDashboardPage = pathname.startsWith('/dashboard') || pathname.startsWith('/studio-dashboard')
  
  // Hide header on dashboard pages since they have their own header
  const shouldHideHeader = shouldHideHeaderFooter || isDashboardPage

  // Load unread notification count
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadUnreadCount(user.id)
    }
  }, [isAuthenticated, user?.id])

  const loadUnreadCount = async (userId: string) => {
    try {
      const response = await fetch(`/api/notifications?userId=${encodeURIComponent(userId)}&unreadOnly=true`)
      const data = await response.json()
      
      if (data.success && data.notifications) {
        setUnreadCount(data.notifications.length)
      }
    } catch (error) {
      console.error('Error loading unread count:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      // Clear all auth data
      localStorage.removeItem('user')
      localStorage.removeItem('studio')
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      logout()
      // Force page reload to ensure clean state
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
      setShowSearchResults(false)
      setSearchQuery('')
    }
  }

  const getDisplayName = () => {
    if (!user) return "User"
    return user.fullName || user.email?.split('@')[0] || "User"
  }

  const getInitials = () => {
    const name = getDisplayName()
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (shouldHideHeaderFooter) {
    return <>{children}</>
  }

  return (
    <>
      {/* Main Header */}
      {!shouldHideHeader && (
        <header className="bg-white shadow-lg border-b fixed w-full top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo - Moved to far left */}
              <div className="flex items-center">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="bg-orange-500 p-2 rounded-lg">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">ShootingWala</span>
                </Link>
              </div>

              {/* Search Bar - Kept in main header */}
              <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
                <form onSubmit={handleSearch} className="w-full relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search photographers, categories, galleries..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    />
                  </div>
                </form>
              </div>

              {/* Desktop Auth Buttons */}
              <div className="hidden md:flex items-center space-x-4">
                {isAuthenticated ? (
                  <>
                    {/* Notification Icon */}
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
                      title="Notifications"
                    >
                      <Bell className="w-5 h-5 text-gray-700" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    
                    {/* Cart Icon */}
                    <Link href="/cart" className="p-2 rounded-full hover:bg-gray-100 transition-colors" title="Cart">
                      <ShoppingCart className="w-5 h-5 text-gray-700" />
                    </Link>
                    
                    {/* User Profile with Name */}
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-orange-500 text-white text-sm">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-gray-700 hidden lg:inline">
                        {getDisplayName()}
                      </span>
                    </div>
                    
                    <Button
                      onClick={handleLogout}
                      variant="ghost"
                      className="text-gray-600 hover:text-red-600"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setLoginModalOpen(true)
                    }}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    title="Login / Sign Up"
                    type="button"
                  >
                    <User className="w-6 h-6 text-gray-700" />
                  </button>
                )}
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="md:hidden border-t bg-white absolute top-16 left-0 right-0 z-50">
                <div className="px-4 py-4 space-y-4">
                  {/* Mobile Navigation Links */}
                  <div className="space-y-2">
                    <Link 
                      href="/" 
                      className="block py-2 text-gray-700 hover:text-orange-500 font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Home
                    </Link>
                    <Link 
                      href="/photographers" 
                      className="block py-2 text-gray-700 hover:text-orange-500 font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Photographers
                    </Link>
                    <Link 
                      href="/gallery" 
                      className="block py-2 text-gray-700 hover:text-orange-500 font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Gallery
                    </Link>
                    <Link 
                      href="/cities" 
                      className="block py-2 text-gray-700 hover:text-orange-500 font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Cities
                    </Link>
                    <Link 
                      href="/categories" 
                      className="block py-2 text-gray-700 hover:text-orange-500 font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Categories
                    </Link>
                    <Link 
                      href="/digital-album" 
                      className="block py-2 text-gray-700 hover:text-orange-500 font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Digital Album
                    </Link>
                    <Link 
                      href="/digital-invitation" 
                      className="block py-2 text-gray-700 hover:text-orange-500 font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Digital Invitation
                    </Link>
                    <Link 
                      href="/stories" 
                      className="block py-2 text-gray-700 hover:text-orange-500 font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Real Stories
                    </Link>
                    <Link 
                      href="/about" 
                      className="block py-2 text-gray-700 hover:text-orange-500 font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      About
                    </Link>
                    <Link 
                      href="/contact" 
                      className="block py-2 text-gray-700 hover:text-orange-500 font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Contact
                    </Link>
                  </div>

                  {/* Mobile Auth Buttons - Kept in mobile menu */}
                  <div className="border-t pt-4 space-y-2">
                    {isAuthenticated ? (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-orange-500 text-white text-sm">
                                {getInitials()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium text-gray-700">
                              {getDisplayName()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 pt-2">
                          <Link 
                            href="/notifications" 
                            className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Bell className="w-5 h-5 text-gray-700" />
                            <span className="text-xs text-gray-700 mt-1">Notifications</span>
                          </Link>
                          
                          <Link 
                            href="/cart" 
                            className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <ShoppingCart className="w-5 h-5 text-gray-700" />
                            <span className="text-xs text-gray-700 mt-1">Cart</span>
                          </Link>
                          
                          <button
                            onClick={() => {
                              handleLogout()
                              setMobileMenuOpen(false)
                            }}
                            className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <LogOut className="w-5 h-5 text-gray-700" />
                            <span className="text-xs text-gray-700 mt-1">Logout</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setMobileMenuOpen(false)
                          setLoginModalOpen(true)
                        }}
                        className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        type="button"
                      >
                        <User className="w-5 h-5 mr-2 text-gray-700" />
                        <span className="text-gray-700 font-medium">Login / Sign Up</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>
      )}
      
      {/* Secondary Header Container - Contains only navigation menus */}
      <div className="fixed top-16 left-0 right-0 h-12 bg-gray-100 border-b z-40 flex items-center px-4">
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
          {/* Left side - Navigation menus */}
          <nav className="hidden md:flex items-center space-x-6 overflow-x-auto">
            <Link href="/" className="text-gray-700 hover:text-orange-500 font-medium transition-colors whitespace-nowrap">
              Home
            </Link>
            <Link href="/photographers" className="text-gray-700 hover:text-orange-500 font-medium transition-colors whitespace-nowrap">
              Photographers
            </Link>
            <Link href="/gallery" className="text-gray-700 hover:text-orange-500 font-medium transition-colors whitespace-nowrap">
              Gallery
            </Link>
            <Link href="/cities" className="text-gray-700 hover:text-orange-500 font-medium transition-colors whitespace-nowrap">
              Cities
            </Link>
            <Link href="/categories" className="text-gray-700 hover:text-orange-500 font-medium transition-colors whitespace-nowrap">
              Categories
            </Link>
            <Link href="/digital-album" className="text-gray-700 hover:text-orange-500 font-medium transition-colors whitespace-nowrap">
              Digital Album
            </Link>
            <Link href="/digital-invitation" className="text-gray-700 hover:text-orange-500 font-medium transition-colors whitespace-nowrap">
              Digital Invitation
            </Link>
            <Link href="/stories" className="text-gray-700 hover:text-orange-500 font-medium transition-colors whitespace-nowrap">
              Real Stories
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-orange-500 font-medium transition-colors whitespace-nowrap">
              About
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-orange-500 font-medium transition-colors whitespace-nowrap">
              Contact
            </Link>
          </nav>
          
          {/* Right side - Empty */}
          <div className="hidden md:flex items-center">
            {/* Intentionally left empty */}
          </div>
        </div>
      </div>
      
      <div className="pt-28">
        {children}
      </div>
      
      {/* Login Modal */}
      <LoginModal 
        isOpen={loginModalOpen} 
        onClose={() => setLoginModalOpen(false)} 
      />
      
      {/* Footer - hide on dashboard pages since they have their own footer */}
      {!isDashboardPage && (
        <footer className="bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Company Info */}
              <div className="md:col-span-1">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="bg-orange-500 p-2 rounded-lg">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-bold">ShootingWala</span>
                </div>
                <p className="text-gray-400 mb-4">
                  India's premier platform for finding and booking professional photographers for all your special moments.
                </p>
                <div className="flex space-x-4">
                  <Link href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                    <Facebook className="w-5 h-5" />
                  </Link>
                  <Link href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                    <Instagram className="w-5 h-5" />
                  </Link>
                  <Link href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                    <Twitter className="w-5 h-5" />
                  </Link>
                  <Link href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                    <Youtube className="w-5 h-5" />
                  </Link>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/" className="text-gray-400 hover:text-orange-500 transition-colors">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link href="/photographers" className="text-gray-400 hover:text-orange-500 transition-colors">
                      Find Photographers
                    </Link>
                  </li>
                  <li>
                    <Link href="/gallery" className="text-gray-400 hover:text-orange-500 transition-colors">
                      Gallery
                    </Link>
                  </li>
                  <li>
                    <Link href="/about" className="text-gray-400 hover:text-orange-500 transition-colors">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-gray-400 hover:text-orange-500 transition-colors">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>

              {/* For Photographers */}
              <div>
                <h3 className="text-lg font-semibold mb-4">For Photographers</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/photographer-register" className="text-gray-400 hover:text-orange-500 transition-colors">
                      Join as Photographer
                    </Link>
                  </li>
                  <li>
                    <Link href="/studio-registration" className="text-gray-400 hover:text-orange-500 transition-colors">
                      Studio Registration
                    </Link>
                  </li>
                  <li>
                    <Link href="/pricing" className="text-gray-400 hover:text-orange-500 transition-colors">
                      Pricing Plans
                    </Link>
                  </li>
                  <li>
                    <Link href="/resources" className="text-gray-400 hover:text-orange-500 transition-colors">
                      Resources
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Contact & App */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Get In Touch</h3>
                <div className="space-y-2 text-gray-400 mb-6">
                  <p>📧 info@shootingwala.in</p>
                  <p>📞 +91 7798766666</p>
                  <p>📍 Bhandara, Maharashtra</p>
                </div>
                
                <h4 className="text-sm font-semibold mb-3">Download Our App</h4>
                <div className="space-y-2">
                  <Link
                    href="#"
                    className="flex items-center space-x-2 bg-gray-800 rounded-lg px-3 py-2 hover:bg-gray-700 transition-colors"
                  >
                    <Apple className="w-5 h-5" />
                    <div>
                      <p className="text-xs text-gray-400">Download on</p>
                      <p className="text-sm font-semibold">App Store</p>
                    </div>
                  </Link>
                  <Link
                    href="#"
                    className="flex items-center space-x-2 bg-gray-800 rounded-lg px-3 py-2 hover:bg-gray-700 transition-colors"
                  >
                    <Play className="w-5 h-5" />
                    <div>
                      <p className="text-xs text-gray-400">Get it on</p>
                      <p className="text-sm font-semibold">Google Play</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <p className="text-sm text-gray-400">
                  © 2025 ShootingWala. All rights reserved.
                </p>
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <Link href="/privacy" className="hover:text-orange-500 transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="hover:text-orange-500 transition-colors">
                  Terms of Service
                </Link>
                <span>Design & Developed by <span className="text-orange-500">Tushar Kukwase</span></span>
              </div>
            </div>
          </div>
        </footer>
      )}
    </>
  )
}