"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useState, useEffect } from "react"
import { Bell, CheckCircle, Clock, User } from "lucide-react"

// Real data will be fetched from API

export default function Dashboard() {
  const [studioData, setStudioData] = useState<any>(null)
  const [profileData, setProfileData] = useState({
    name: '',
    studioName: '',
    email: ''
  })
  const [bookingData, setBookingData] = useState<any[]>([])
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingShots: 0,
    totalEarnings: 0
  })
  const [recentNotifications, setRecentNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get studio data from localStorage
    const data = localStorage.getItem('studio')
    if (data) {
      try {
        const parsed = JSON.parse(data)
        setStudioData(parsed)
        fetchProfileData(parsed._id)
      } catch (error) {
        console.error('Error parsing studio data:', error)
      }
    }

    // Fetch real booking data
    fetchDashboardData()
  }, [])

  const fetchProfileData = async (photographerId: string) => {
    try {
      const response = await fetch(`/api/photographer-profile?id=${photographerId}`)
      const data = await response.json()
      
      if (data.success && data.profile) {
        const profile = data.profile
        setProfileData({
          name: profile.name || studioData?.name || studioData?.photographerName || '',
          studioName: profile.studioName || '',
          email: profile.email || studioData?.email || ''
        })
      } else {
        // Fallback to localStorage data
        setProfileData({
          name: studioData?.name || studioData?.photographerName || '',
          studioName: '',
          email: studioData?.email || ''
        })
      }
    } catch (error) {
      console.error('Error fetching profile data:', error)
      // Fallback to localStorage data
      setProfileData({
        name: studioData?.name || studioData?.photographerName || '',
        studioName: '',
        email: studioData?.email || ''
      })
    }
  }

  const fetchDashboardData = async () => {
    try {
      // This would fetch real data from your booking API
      // For now showing empty state until real bookings are implemented
      setBookingData([])
      setUpcomingBookings([])
      setStats({
        totalBookings: 0,
        upcomingShots: 0,
        totalEarnings: 0
      })
      
      // Fetch recent notifications for activity feed
      if (studioData?._id) {
        await fetchRecentNotifications(studioData._id)
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setLoading(false)
    }
  }

  const fetchRecentNotifications = async (photographerId: string) => {
    try {
      const response = await fetch(`/api/notifications?userId=${photographerId}`)
      const data = await response.json()
      
      if (data.success && data.notifications) {
        // Get last 3 notifications for activity feed
        const recent = data.notifications
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3)
        setRecentNotifications(recent)
      }
    } catch (error) {
      console.error('Error fetching recent notifications:', error)
    }
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        {/* Welcome Message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {getDisplayName()}!
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your photography business
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalBookings === 0 ? "No bookings yet" : "+12% from last month"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Shoots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{stats.upcomingShots}</div>
            <p className="text-xs text-muted-foreground mt-1">Next 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">${stats.totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
      </div>

      {bookingData.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Bookings Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bookingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)"
                  }}
                />
                <Bar dataKey="bookings" fill="var(--primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Bookings Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <p className="text-muted-foreground">No booking data available yet</p>
              <p className="text-sm text-muted-foreground mt-2">Start accepting bookings to see your trends here</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentNotifications.length > 0 ? (
              recentNotifications.map((notification, index) => {
                const getNotificationStyle = (type: string) => {
                  if (type.includes('approved')) {
                    return {
                      bg: 'bg-green-50 border-green-200',
                      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
                      titleColor: 'text-green-900',
                      textColor: 'text-green-700',
                      timeColor: 'text-green-600'
                    }
                  } else if (type.includes('rejected')) {
                    return {
                      bg: 'bg-red-50 border-red-200',
                      icon: <Clock className="w-5 h-5 text-red-600" />,
                      titleColor: 'text-red-900',
                      textColor: 'text-red-700',
                      timeColor: 'text-red-600'
                    }
                  } else {
                    return {
                      bg: 'bg-blue-50 border-blue-200',
                      icon: <Bell className="w-5 h-5 text-blue-600" />,
                      titleColor: 'text-blue-900',
                      textColor: 'text-blue-700',
                      timeColor: 'text-blue-600'
                    }
                  }
                }

                const getTabName = (type: string) => {
                  if (type.includes('story')) return 'Stories Tab'
                  if (type.includes('gallery')) return 'Gallery Tab'
                  if (type.includes('booking')) return 'Bookings Tab'
                  if (type.includes('profile')) return 'Profile Tab'
                  return 'Dashboard'
                }

                const style = getNotificationStyle(notification.type)
                
                return (
                  <div key={notification.id} className={`flex items-center gap-3 p-3 rounded-lg border ${style.bg}`}>
                    {style.icon}
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${style.titleColor}`}>{notification.title}</p>
                      <p className={`text-xs ${style.textColor}`}>{notification.message}</p>
                      <p className={`text-xs ${style.timeColor} mt-1`}>
                        {notification.timestamp || new Date(notification.createdAt).toLocaleString()} • {getTabName(notification.type)}
                      </p>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No recent activity</p>
                <p className="text-xs text-gray-400">Your notifications will appear here</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingBookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Client Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Event Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingBookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-border hover:bg-muted transition-colors">
                      <td className="py-3 px-4 text-foreground">{booking.client}</td>
                      <td className="py-3 px-4 text-foreground">{booking.event}</td>
                      <td className="py-3 px-4 text-foreground">{booking.date}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            booking.status === "Confirmed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No upcoming bookings</p>
              <p className="text-sm text-muted-foreground mt-2">Your upcoming bookings will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}