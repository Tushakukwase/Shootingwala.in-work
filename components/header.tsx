"use client"

import { LogOut, Bell, User, Settings, Edit, Camera, Menu, X } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import NotificationCenter from "./notification-center"
import PhotographerNotificationDropdown from "./studio/notification-dropdown"
import Link from "next/link"
import { isUserLoggedIn, getUserData } from '@/lib/auth-utils'

interface StudioData {
  _id: string
  name: string
  email: string
  username?: string
  photographerName?: string
  role?: string
  image?: string
  phone?: string
}

export default function Header() {
  const router = useRouter()
  const [studioData, setStudioData] = useState<StudioData | null>(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [editMode, setEditMode] = useState(false)
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    image: '',
    studioName: '',
    role: 'Photographer'
  })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check authentication status
    const authenticated = isUserLoggedIn()
    setIsAuthenticated(authenticated)
    
    if (authenticated) {
      // Get studio data from localStorage
      const data = getUserData()
      if (data) {
        // Convert to StudioData format
        const studioDataFormatted: StudioData = {
          _id: data.id,
          name: data.fullName || data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          username: data.username,
          photographerName: data.photographerName,
          role: data.role || 'photographer',
          image: data.image
        }
        
        setStudioData(studioDataFormatted)
        
        // Set profile data
        setProfileData({
          name: data.fullName || data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          image: data.image || '',
          studioName: data.studioName || '',
          role: data.role || 'Photographer'
        })
        
        // Fetch complete profile data from API
        fetchProfileData(data.id)
        
        // Load unread notification count
        loadUnreadCount(data.id)
      }
    }
  }, [])

  const fetchProfileData = async (photographerId: string) => {
    try {
      const response = await fetch(`/api/photographer-profile?id=${encodeURIComponent(photographerId)}`)
      const data = await response.json()
      
      if (data.success && data.profile) {
        const profile = data.profile
        setProfileData({
          name: profile.name || studioData?.name || studioData?.photographerName || '',
          email: profile.email || studioData?.email || '',
          phone: profile.phone || studioData?.phone || '',
          image: profile.profileImage || studioData?.image || '',
          studioName: profile.studioName || '',
          role: 'Photographer'
        })
      } else {
        // Fallback to localStorage data
        setProfileData({
          name: studioData?.name || studioData?.photographerName || '',
          email: studioData?.email || '',
          phone: studioData?.phone || '',
          image: studioData?.image || '',
          studioName: '',
          role: 'Photographer'
        })
      }
    } catch (error) {
      console.error('Error fetching profile data:', error)
      // Fallback to localStorage data
      setProfileData({
        name: studioData?.name || studioData?.photographerName || '',
        email: studioData?.email || '',
        phone: studioData?.phone || '',
        image: studioData?.image || '',
        studioName: '',
        role: 'Photographer'
      })
    }
  }

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

  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem('studio')
    localStorage.removeItem('user')
    
    // Clear cookies
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    
    // Redirect to home page
    router.push('/')
  }

  const getDisplayName = () => {
    return profileData.studioName || 
           profileData.name || 
           studioData?.name || 
           studioData?.photographerName || 
           studioData?.username || 
           studioData?.email?.split('@')[0] || 
           "Photographer"
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

  const handleProfileUpdate = async () => {
    try {
      // Update localStorage
      const currentData = localStorage.getItem('studio')
      if (currentData) {
        const parsed = JSON.parse(currentData)
        const updated = { ...parsed, ...profileData }
        localStorage.setItem('studio', JSON.stringify(updated))
        setStudioData(updated)
      }
      
      // TODO: Update in database via API
      setEditMode(false)
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile')
    }
  }

  // Don't render header if user is not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center gap-6">
        {/* Logo */}
        <Link href="/studio-dashboard" className="flex items-center space-x-2">
          <div className="bg-orange-500 p-1.5 rounded-lg">
            <Camera className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">ShootingWala</span>
        </Link>
      </div>

      {/* Desktop Navigation - Centered */}
      <nav className="hidden md:flex items-center justify-center flex-1">
        <div className="flex items-center space-x-6">
          <Link href="/studio-dashboard" className="text-sm font-medium text-foreground hover:text-orange-500 transition-colors">
            Dashboard
          </Link>
          <Link href="/studio-dashboard#portfolio" className="text-sm font-medium text-foreground hover:text-orange-500 transition-colors">
            Portfolio
          </Link>
          <Link href="/studio-dashboard#bookings" className="text-sm font-medium text-foreground hover:text-orange-500 transition-colors">
            Bookings
          </Link>
          <Link href="/studio-dashboard#calendar" className="text-sm font-medium text-foreground hover:text-orange-500 transition-colors">
            Calendar
          </Link>
          <Link href="/studio-dashboard#messages" className="text-sm font-medium text-foreground hover:text-orange-500 transition-colors">
            Messages
          </Link>
        </div>
      </nav>

      {/* Right side controls */}
      <div className="flex items-center gap-4">
        {/* Studio Name */}
        {profileData.studioName && (
          <span className="hidden md:inline text-sm font-medium text-foreground truncate max-w-[150px]">
            {profileData.studioName}
          </span>
        )}
        
        {/* Notification Bell */}
        {studioData && studioData._id && (
          <PhotographerNotificationDropdown photographerId={studioData._id} />
        )}
        
        {/* User Profile Icon */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(true)}
            className="p-1 hover:opacity-80 transition-opacity rounded-full"
            title="User Profile"
          >
            <Avatar className="w-8 h-8">
              <AvatarImage src={profileData.image || studioData?.image || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </button>

          {/* User Profile Dropdown */}
          {showProfile && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border py-2 z-50">
              <div className="px-4 py-3 border-b">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={profileData.image || studioData?.image || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {profileData.name || getDisplayName()}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{profileData.email}</p>
                    {profileData.phone && (
                      <p className="text-xs text-gray-500 truncate">{profileData.phone}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    setShowProfile(false);
                    // Navigate to profile page
                    router.push('/studio-dashboard#profile');
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile & Portfolio
                </button>
                <button
                  onClick={() => {
                    setShowProfile(false);
                    setEditMode(true);
                    // You can add any additional logic for updating profile here
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <Edit className="h-4 w-4 mr-2" />
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

        {/* Mobile Menu Button and Studio Name for mobile */}
        <div className="md:hidden flex items-center gap-2">
          {/* Studio Name for mobile */}
          {profileData.studioName && (
            <span className="text-sm font-medium text-foreground truncate max-w-[100px]">
              {profileData.studioName}
            </span>
          )}
          
          {/* Mobile Menu Button */}
          <button
            className="p-1"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  User Profile
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditMode(!editMode)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowProfile(false)
                      setEditMode(false)
                    }}
                  >
                    ×
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center mb-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={profileData.image || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </div>

              {editMode ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="studioName">Studio Name</Label>
                    <Input
                      id="studioName"
                      value={profileData.studioName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, studioName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image">Profile Image URL</Label>
                    <Input
                      id="image"
                      value={profileData.image}
                      onChange={(e) => setProfileData(prev => ({ ...prev, image: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleProfileUpdate} className="flex-1">
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setEditMode(false)} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-muted-foreground">Photographer Name</Label>
                    <p className="font-medium">{profileData.name || 'Not set'}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Studio Name</Label>
                    <p className="font-medium">{profileData.studioName || 'Not set'}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Email</Label>
                    <p className="font-medium">{profileData.email || 'Not set'}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Phone</Label>
                    <p className="font-medium">{profileData.phone || 'Not set'}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Role</Label>
                    <p className="font-medium">{profileData.role}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </header>
  )
}