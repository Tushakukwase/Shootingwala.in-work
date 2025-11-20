"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"

interface SidebarNotificationBadgeProps {
  section: 'stories' | 'gallery' | 'categories' | 'cities' | 'photographers'
}

export default function SidebarNotificationBadge({ section }: SidebarNotificationBadgeProps) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    fetchNotificationCount()
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchNotificationCount, 30000)
    return () => clearInterval(interval)
  }, [section])

  const fetchNotificationCount = async () => {
    try {
      const response = await fetch('/api/notifications?userId=admin&unreadOnly=true')
      const data = await response.json()
      
      if (data.success && data.notifications) {
        let sectionCount = 0
        
        data.notifications.forEach((notification: any) => {
          if (!notification.actionRequired) return
          
          switch (section) {
            case 'stories':
              if (notification.type === 'story_homepage_request') {
                sectionCount++
              }
              break
            case 'gallery':
              if (notification.type === 'gallery_homepage_request') {
                sectionCount++
              }
              break
            case 'categories':
              if (notification.type === 'category_suggestion') {
                sectionCount++
              }
              break
            case 'cities':
              if (notification.type === 'city_suggestion') {
                sectionCount++
              }
              break
            case 'photographers':
              if (notification.type === 'photographer_registration') {
                sectionCount++
              }
              break
          }
        })
        
        setCount(sectionCount)
      }
    } catch (error) {
      setCount(0)
    }
  }

  if (count === 0) return null

  return (
    <Badge 
      variant="destructive" 
      className="ml-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
    >
      {count > 99 ? '99+' : count}
    </Badge>
  )
}