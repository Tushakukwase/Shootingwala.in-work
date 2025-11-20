"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { Bell, X, CheckCircle, AlertCircle, Info, Star, Calendar, MapPin, Tag, Image } from "lucide-react"

interface Notification {
  id: string
  type: 'booking' | 'review' | 'approval' | 'city_request' | 'category_request' | 'story_approval' | 'system'
  title: string
  message: string
  timestamp: string
  read: boolean
  actionRequired?: boolean
  relatedId?: string
}

export default function NotificationCenter({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string>('')

  useEffect(() => {
    if (isOpen) {
      // Get user ID from localStorage
      const studioData = localStorage.getItem('studio')
      if (studioData) {
        try {
          const parsed = JSON.parse(studioData)
          setUserId(parsed._id)
          loadNotifications(parsed._id)
        } catch (error) {
          console.error('Error parsing studio data:', error)
        }
      }
    }
  }, [isOpen])

  const loadNotifications = async (userId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/notifications?userId=${userId}`)
      const data = await response.json()
      
      if (data.success && data.notifications) {
        setNotifications(data.notifications)
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    markAsRead(notification.id)
    
    // Handle admin notifications with direct links
    if (notification.type === 'category_suggestion' || notification.type === 'city_suggestion') {
      // For admin, redirect to approval page
      if (userId === 'admin') {
        const section = notification.type === 'category_suggestion' ? 'categories' : 'cities'
        // This would work if we had access to router or a callback
        // For now, we'll just close the modal
        onClose()
        alert(`Please check the ${section} section for pending approvals`)
      }
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: notificationId,
          read: true
        }),
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
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          markAllRead: true,
          userId
        }),
      })
      
      if (response.ok) {
        setNotifications(prev => prev.map(notif => ({ ...notif, read: true })))
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications?id=${notificationId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId))
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking': return <Calendar className="w-4 h-4 text-blue-600" />
      case 'review': return <Star className="w-4 h-4 text-yellow-600" />
      case 'approval': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'city_request': return <MapPin className="w-4 h-4 text-purple-600" />
      case 'category_request': return <Tag className="w-4 h-4 text-orange-600" />
      case 'story_approval': return <Image className="w-4 h-4 text-pink-600" />
      case 'system': return <Info className="w-4 h-4 text-gray-600" />
      default: return <Bell className="w-4 h-4 text-gray-600" />
    }
  }

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.read
    if (filter === 'action') return notif.actionRequired
    return true
  })

  const unreadCount = notifications.filter(n => !n.read).length

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
      <Card className="w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle>Notifications</CardTitle>
              {unreadCount > 0 && (
                <Badge variant="destructive">{unreadCount}</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  Mark all read
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Filter Tabs */}
          <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('action')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                filter === 'action'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Action Required ({notifications.filter(n => n.actionRequired).length})
            </button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No notifications</h3>
              <p className="text-muted-foreground">
                {filter === 'unread' 
                  ? "You're all caught up! No unread notifications."
                  : filter === 'action'
                  ? "No notifications require your action right now."
                  : "You don't have any notifications yet."
                }
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                    !notification.read ? 'bg-blue-50/50 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        {notification.actionRequired && (
                          <Badge variant="destructive" className="text-xs">Action Required</Badge>
                        )}
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{notification.timestamp}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNotification(notification.id)
                          }}
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}