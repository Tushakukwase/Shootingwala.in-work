"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  ShoppingCart, 
  Calendar, 
  Wallet, 
  Bell,
  Camera,
  FileText
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"

export function DashboardOverview() {
  const { user } = useAuth()
  const [stats, setStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return
      
      try {
        // In a real app, this would fetch dashboard stats for the specific user
        // For now, we'll use mock data but simulate an API call
        setLoading(true)
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock data - in a real app, this would come from API
        const mockStats = [
          { title: "Total Orders", value: "12", icon: FileText, change: "+2 from last month" },
          { title: "Upcoming Events", value: "3", icon: Calendar, change: "2 this week" },
          { title: "Wallet Balance", value: "₹2,450", icon: Wallet, change: "₹500 in credits" },
          { title: "Notifications", value: "5", icon: Bell, change: "3 unread" },
        ]
        
        setStats(mockStats)
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error)
        // Fallback to mock data on error
        setStats([
          { title: "Total Orders", value: "0", icon: FileText, change: "0 from last month" },
          { title: "Upcoming Events", value: "0", icon: Calendar, change: "0 this week" },
          { title: "Wallet Balance", value: "₹0", icon: Wallet, change: "₹0 in credits" },
          { title: "Notifications", value: "0", icon: Bell, change: "0 unread" },
        ])
      } finally {
        setLoading(false)
      }
    }
    
    fetchStats()
  }, [user])

  const quickActions = [
    { name: "Shop Now", href: "/gallery", icon: Camera },
    { name: "View Orders", href: "/dashboard/orders", icon: FileText },
    { name: "Book Event", href: "/photographers", icon: Calendar },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-4 w-4 bg-gray-200 rounded-full animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActions.map((action, index) => {
          const Icon = action.icon
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <Link href={action.href}>
                  <Button className="w-full h-16 flex flex-col items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black">
                    <Icon className="h-6 w-6" />
                    <span className="font-semibold">{action.name}</span>
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}