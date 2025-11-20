"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, X, CheckCircle, Clock, Eye, ArrowRight, MoreHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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
  photographerId?: string
  photographerName?: string
  contentType?: string
  contentTitle?: string
}

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchNotifications()
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

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
    try {
      const response = await fetch('/api/notifications?userId=admin')
      
      if (!response.ok) {
        console.error('Failed to fetch notifications:', response.status, response.statusText)
        return
      }
      
      const data = await response.json()
      
      if (data.success && data.notifications) {
        setNotifications(data.notifications)
      } else {
        // Set empty array if no notifications
        setNotifications([])
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      // Set empty array on error to prevent UI issues
      setNotifications([])
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
          userId: 'admin'
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

    // Handle different notification types with redirects
    if (notification.actionRequired) {
      if (notification.type === 'story_homepage_request') {
        // Redirect to stories manager
        window.location.href = '/admin#stories'
      } else if (notification.type === 'gallery_homepage_request') {
        // Redirect to gallery manager  
        window.location.href = '/admin#gallery'
      } else if (notification.type === 'category_suggestion') {
        // Redirect to categories manager
        window.location.href = '/admin#categories'
      } else if (notification.type === 'city_suggestion') {
        // Redirect to cities manager
        window.location.href = '/admin#cities'
      } else if (notification.type === 'photographer_registration') {
        // Redirect to photographer approvals
        window.location.href = '/admin#photographers'
      }
    }
    
    setIsOpen(false)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'story_homepage_request':
      case 'gallery_homepage_request':
        return <Eye className="w-4 h-4 text-blue-500" />
      case 'category_suggestion':
      case 'city_suggestion':
        return <ArrowRight className="w-4 h-4 text-orange-500" />
      case 'photographer_registration':
        return <Bell className="w-4 h-4 text-green-500" />
      default:
        return <Bell className="w-4 h-4 text-gray-500" />
    }
  }

  const getNotificationColor = (notification: Notification) => {
    if (!notification.read && notification.actionRequired) {
      return 'border-l-4 border-l-red-500 bg-red-50'
    } else if (!notification.read) {
      return 'border-l-4 border-l-blue-500 bg-blue-50'
    }
    return 'border-l-4 border-l-gray-200 bg-gray-50'
  }

  const unreadCount = notifications.filter(n => !n.read).length
  const actionRequiredCount = notifications.filter(n => n.actionRequired && !n.read).length

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
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute left-full top-0 ml-2 w-72 max-h-80 overflow-hidden shadow-lg z-50 border border-gray-200">
          <CardHeader className="pb-1 px-3 pt-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Notifications</CardTitle>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    disabled={loading}
                    className="text-xs px-2 py-1 h-6"
                  >
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="p-1 h-6 w-6"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
            {actionRequiredCount > 0 && (
              <div className="text-xs text-red-600 font-medium mt-1">
                {actionRequiredCount} action{actionRequiredCount > 1 ? 's' : ''} required
              </div>
            )}
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-2 cursor-pointer hover:bg-gray-100 transition-colors ${getNotificationColor(notification)}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className="text-xs font-medium text-gray-900 line-clamp-1 pr-1">
                            {notification.title}
                          </h4>
                          {notification.actionRequired && (
                            <Badge variant="destructive" className="text-xs px-1 py-0 h-4 text-[10px] flex-shrink-0">
                              Action
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5 line-clamp-2 leading-tight">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] text-gray-500">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </span>
                          {notification.actionRequired && (
                            <ArrowRight className="w-2.5 h-2.5 text-gray-400" />
                          )}
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