"use client"

import { LogOut, Bell, User, Settings, Edit } from "lucide-react"
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

interface StudioData {
  _id: string
  name: string
  email: string
  username?: string
  photographerName?: string
  role?: string
  image?: string
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
    image: ''
  })

  useEffect(() => {
    // Get studio data from localStorage
    const data = localStorage.getItem('studio')
    if (data) {
      try {
        const parsed = JSON.parse(data)
        setStudioData(parsed)
        setProfileData({
          name: parsed.name || parsed.photographerName || '',
          email: parsed.email || '',
          phone: parsed.phone || '',
          image: parsed.image || ''
        })
        
        // Load unread notification count
        loadUnreadCount(parsed._id)
      } catch (error) {
        console.error('Error parsing studio data:', error)
      }
    }
  }, [])

  const loadUnreadCount = async (userId: string) => {
    try {
      const response = await fetch(`/api/notifications?userId=${userId}&unreadOnly=true`)
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
    
    // Redirect to login
    router.push('/studio-auth')
  }

  const getDisplayName = () => {
    if (!studioData) return "Photographer"
    
    return studioData.name || 
           studioData.photographerName || 
           studioData.username || 
           studioData.email?.split('@')[0] || 
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

  return (
    <header className="bg-card border-b border-border px-8 py-4 flex items-center justify-between shadow-sm">
      <h2 className="text-2xl font-bold text-foreground">STUDIO DASHBOARD</h2>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-foreground">{getDisplayName()}</p>
          <p className="text-xs text-muted-foreground">
            {studioData?.role === 'admin' ? 'Administrator' : 'Photographer'}
          </p>
        </div>
        
        {/* Notification Bell */}
        {studioData && (
          <PhotographerNotificationDropdown photographerId={studioData._id} />
        )}
        
        <button
          onClick={() => setShowProfile(true)}
          className="p-0 hover:opacity-80 transition-opacity"
        >
          <Avatar>
            <AvatarImage src={studioData?.image || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </button>
        <button 
          onClick={handleLogout}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
          title="Logout"
        >
          <LogOut size={20} className="text-foreground" />
        </button>
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
                    <Label className="text-sm text-muted-foreground">Name</Label>
                    <p className="font-medium">{profileData.name || 'Not set'}</p>
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
                    <p className="font-medium">{studioData?.role === 'admin' ? 'Administrator' : 'Photographer'}</p>
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