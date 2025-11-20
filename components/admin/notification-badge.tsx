"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function NotificationBadge() {
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    fetchPendingCount()
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchPendingCount, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchPendingCount = async () => {
    try {
      // Try to fetch notifications silently
      const notificationsResponse = await fetch('/api/notifications')
      
      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json()
        
        if (notificationsData.success && notificationsData.notifications && Array.isArray(notificationsData.notifications)) {
          const pendingRequests = notificationsData.notifications.filter((n: any) => 
            n.actionRequired && (n.type === 'gallery_homepage_request' || n.type === 'story_homepage_request')
          )
          setPendingCount(pendingRequests.length)
          return
        }
      }
      
      // Silently set to 0 if API fails - no console errors
      setPendingCount(0)
      
    } catch (error) {
      // Silently handle errors - no console logging
      setPendingCount(0)
    }
  }

  return (
    <div className="relative">
      <Bell className="w-6 h-6 text-gray-600" />
      {pendingCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
        >
          {pendingCount > 99 ? '99+' : pendingCount}
        </Badge>
      )}
    </div>
  )
}