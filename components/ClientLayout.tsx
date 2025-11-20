"use client"

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Facebook, Instagram, Twitter, Youtube, Apple, Play, User, LogOut, Camera, Menu, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

// Pages that mention "PhotoBook" should not have header/footer
const PHOTOBOOK_PAGES = [
  '/register', 
  '/studio-auth',
  '/admin',
  '/photographer-register'
]

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isAuthenticated, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Check if current page should not have header/footer
  const shouldHideHeaderFooter = PHOTOBOOK_PAGES.some(page => pathname.startsWith(page))
  
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      logout()
    } catch (error) {
      console.error('Logout error:', error)
      logout() // Logout locally even if API fails
    }
  }

  if (shouldHideHeaderFooter) {
    return <>{children}</>
  }

  return (
    <>
      {/* Main Header */}
      <header className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-orange-500 p-2 rounded-lg">
                <Camera className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">ShootingWala</span>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">
                Home
              </Link>
              <Link href="/photographers" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">
                Photographers
              </Link>
              <Link href="/gallery" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">
                Gallery
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">
                Contact
              </Link>
            </nav>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard">
                    <Button
                      variant="outline"
                      className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
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
                <>
                  <Link href="/register">
                    <Button
                      variant="ghost"
                      className="text-gray-700 hover:text-orange-500"
                    >
                      Sign Up
                    </Button>
                  </Link>
                  <Link href="/studio-auth">
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                      Log In
                    </Button>
                  </Link>
                </>
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
            <div className="md:hidden border-t bg-white">
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

                {/* Mobile Auth Buttons */}
                <div className="border-t pt-4 space-y-2">
                  {isAuthenticated ? (
                    <>
                      <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                        <Button
                          variant="outline"
                          className="w-full justify-start border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                        >
                          <User className="w-4 h-4 mr-2" />
                          Dashboard
                        </Button>
                      </Link>
                      <Button
                        onClick={() => {
                          handleLogout()
                          setMobileMenuOpen(false)
                        }}
                        variant="ghost"
                        className="w-full justify-start text-gray-600 hover:text-red-600"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-gray-700 hover:text-orange-500"
                        >
                          Sign Up
                        </Button>
                      </Link>
                      <Link href="/studio-auth" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                          Log In
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>
      
      {children}
      
      {/* Footer */}
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
              <span>Made with ❤️ by <span className="text-orange-500">Swahtech</span></span>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}