"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, Calendar, IndianRupee, Package } from "lucide-react"
import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"

export function NotificationsSection() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return
      
      try {
        // In a real app, this would fetch notifications for the specific user
        // For now, we'll use mock data but simulate an API call
        setLoading(true)
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock data - in a real app, this would come from API
        const mockNotifications = [
          {
            id: "1",
            title: "Order Delivered",
            message: "Your order ORD-001 has been delivered successfully.",
            time: "2 hours ago",
            type: "success",
            icon: Package
          },
          {
            id: "2",
            title: "Upcoming Event",
            message: "Your wedding photography session is scheduled for tomorrow.",
            time: "1 day ago",
            type: "info",
            icon: Calendar
          },
          {
            id: "3",
            title: "Special Offer",
            message: "Get 20% off on portrait sessions this week.",
            time: "2 days ago",
            type: "offer",
            icon: IndianRupee
          },
          {
            id: "4",
            title: "Order Shipped",
            message: "Your order ORD-002 has been shipped and is on its way.",
            time: "3 days ago",
            type: "info",
            icon: Package
          }
        ]
        
        setNotifications(mockNotifications)
      } catch (error) {
        console.error("Failed to fetch notifications:", error)
        // Fallback to mock data on error
        setNotifications([
          {
            id: "1",
            title: "Welcome",
            message: "Welcome to your dashboard!",
            time: "Just now",
            type: "info",
            icon: Bell
          }
        ])
      } finally {
        setLoading(false)
      }
    }
    
    fetchNotifications()
  }, [user])

  const getNotificationIcon = (Icon: any, type: string) => {
    const iconClasses = {
      success: "text-green-500",
      info: "text-blue-500",
      offer: "text-yellow-500",
      warning: "text-orange-500"
    }
    
    return <Icon className={`h-5 w-5 ${iconClasses[type as keyof typeof iconClasses] || "text-gray-500"}`} />
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse mt-1"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div key={notification.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50">
              <div className="mt-1">
                {getNotificationIcon(notification.icon, notification.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{notification.title}</h3>
                  <Badge variant={notification.type === "offer" ? "default" : "secondary"}>
                    {notification.time}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
              </div>
            </div>
          ))}
        </div>
        
        {notifications.length === 0 && (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No notifications yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}