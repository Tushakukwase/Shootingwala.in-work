"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, X, CheckCircle, Clock, Eye, ArrowRight, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { isUserLoggedIn, getUserData } from '@/lib/auth-utils'

interface Notification {
  id: string
  _id: string
  type: string
  title: string
  message: string
  userId: string
  relatedId?: string
  actionRequired: boolean
  read: boolean
  createdAt: string
  timestamp?: string
}

interface PhotographerNotificationDropdownProps {
  photographerId: string
}

export default function PhotographerNotificationDropdown({ photographerId }: PhotographerNotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check authentication status
    const authenticated = isUserLoggedIn()
    setIsAuthenticated(authenticated)
    
    if (authenticated && photographerId) {
      fetchNotifications()
      // Poll for updates every 30 seconds (reduced frequency)
      const interval = setInterval(fetchNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [photographerId])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchNotifications = async () => {
    // Validate photographerId before making the request
    if (!photographerId || photographerId.trim() === '') {
      console.warn('Photographer ID not available, skipping notifications fetch');
      setNotifications([]); // Clear notifications when ID is not available
      return;
    }
    
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        return;
      }
      
      const response = await fetch(`/api/notifications?userId=${encodeURIComponent(photographerId)}`, {
        // Add timeout and error handling
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      // Check if response is ok before parsing JSON
      if (!response.ok) {
        console.error('Failed to fetch notifications:', response.status, response.statusText);
        // Set empty notifications array in case of error to prevent UI issues
        setNotifications([]);
        return;
      }
      
      const data = await response.json();
      
      if (data.success && data.notifications) {
        setNotifications(data.notifications);
      } else {
        // Set empty notifications array if API returns no data
        setNotifications([]);
      }
    } catch (error: any) {
      // Handle different types of errors
      if (error.name === 'AbortError') {
        console.warn('Notifications fetch timed out');
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.warn('Network error while fetching notifications - likely offline or server unavailable');
      } else {
        console.error('Error fetching notifications:', error);
      }
      // Set empty notifications array in case of error to prevent UI issues
      setNotifications([]);
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: notificationId,
          read: true
        })
      })
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId ? { ...notif, read: true } : notif
          )
        )
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          markAllRead: true,
          userId: photographerId
        })
      })
      
      if (response.ok) {
        setNotifications(prev => prev.map(notif => ({ ...notif, read: true })))
      }
    } catch (error) {
      console.error('Error marking all as read:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      markAsRead(notification.id)
    }
    
    // Handle navigation based on notification type
    handleNotificationNavigation(notification)
    
    setIsOpen(false)
  }

  const handleNotificationNavigation = (notification: Notification) => {
    // Dispatch navigation events based on notification type
    if (typeof window !== 'undefined') {
      let targetPage = ''
      
      switch (notification.type) {
        case 'story_approved':
        case 'story_rejected':
          targetPage = 'real-stories'
          break
        case 'gallery_approved':
        case 'gallery_rejected':
          targetPage = 'gallery'
          break
        case 'booking_request':
          targetPage = 'bookings'
          break
        case 'profile_update':
          targetPage = 'portfolio'
          break
        default:
          targetPage = 'dashboard'
      }
      
      // Dispatch custom event to navigate
      const event = new CustomEvent('navigateFromNotification', { 
        detail: { page: targetPage, notificationId: notification.id } 
      })
      window.dispatchEvent(event)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'story_approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'story_rejected':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'gallery_approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'gallery_rejected':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Bell className="w-4 h-4 text-gray-500" />
    }
  }

  const getNotificationTab = (type: string) => {
    switch (type) {
      case 'story_approved':
      case 'story_rejected':
        return 'Stories'
      case 'gallery_approved':
      case 'gallery_rejected':
        return 'Gallery'
      case 'booking_request':
        return 'Bookings'
      case 'profile_update':
        return 'Profile'
      default:
        return 'Dashboard'
    }
  }

  const getNotificationColor = (notification: Notification) => {
    if (!notification.read) {
      if (notification.type.includes('approved')) {
        return 'border-l-4 border-l-green-500 bg-green-50'
      } else if (notification.type.includes('rejected')) {
        return 'border-l-4 border-l-red-500 bg-red-50'
      }
      return 'border-l-4 border-l-blue-500 bg-blue-50'
    }
    return 'border-l-4 border-l-gray-200 bg-gray-50'
  }

  const unreadCount = notifications.filter(n => !n.read).length
  
  // Get unread notifications by tab
  const unreadByTab = notifications
    .filter(n => !n.read)
    .reduce((acc, notification) => {
      const tab = getNotificationTab(notification.type)
      acc[tab] = (acc[tab] || 0) + 1
      return acc
    }, {} as Record<string, number>)

  // Don't render if user is not authenticated or photographerId is not provided
  if (!isAuthenticated || !photographerId) return null

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <>
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
            
            {/* Tab indicators */}
            <div className="absolute -bottom-1 -right-1 flex gap-1">
              {Object.entries(unreadByTab).slice(0, 3).map(([tab, count], index) => (
                <div
                  key={tab}
                  className={`w-2 h-2 rounded-full text-xs ${
                    tab === 'Stories' ? 'bg-purple-500' :
                    tab === 'Gallery' ? 'bg-blue-500' :
                    tab === 'Bookings' ? 'bg-orange-500' :
                    tab === 'Profile' ? 'bg-green-500' :
                    'bg-gray-500'
                  }`}
                  title={`${count} unread in ${tab}`}
                />
              ))}
            </div>
          </>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-96 max-h-96 overflow-hidden shadow-lg z-50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    disabled={loading}
                    className="text-xs"
                  >
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Tab Summary */}
            {Object.keys(unreadByTab).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {Object.entries(unreadByTab).map(([tab, count]) => (
                  <Badge
                    key={tab}
                    variant="outline"
                    className={`text-xs ${
                      tab === 'Stories' ? 'border-purple-300 bg-purple-50 text-purple-700' :
                      tab === 'Gallery' ? 'border-blue-300 bg-blue-50 text-blue-700' :
                      tab === 'Bookings' ? 'border-orange-300 bg-orange-50 text-orange-700' :
                      tab === 'Profile' ? 'border-green-300 bg-green-50 text-green-700' :
                      'border-gray-300 bg-gray-50 text-gray-700'
                    }`}
                  >
                    {tab}: {count}
                  </Badge>
                ))}
              </div>
            )}
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 cursor-pointer hover:bg-gray-100 transition-colors ${getNotificationColor(notification)} group`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {notification.title}
                          </h4>
                          <Badge variant="outline" className="text-xs ml-2 bg-white">
                            {getNotificationTab(notification.type)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {notification.timestamp || new Date(notification.createdAt).toLocaleString()}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span>Click to view</span>
                            <ArrowRight className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}