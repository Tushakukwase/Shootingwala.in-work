"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Heart, MessageCircle, Eye, TrendingUp, Users } from "lucide-react"
import { useState, useEffect } from "react"

export default function Dashboard() {
  const [bookingData, setBookingData] = useState<any[]>([])
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([])
  const [engagementData, setEngagementData] = useState({
    totalLikes: 0,
    totalComments: 0,
    engagedUsers: 0,
    contentItems: 0
  })
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingShots: 0,
    totalEarnings: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch photographer ID from localStorage
      const studioData = localStorage.getItem('studio')
      let photographerId = null
      
      if (studioData) {
        try {
          const parsed = JSON.parse(studioData)
          photographerId = parsed._id || parsed.id
        } catch (error) {
          console.error('Error parsing studio data:', error)
        }
      }

      // Fetch engagement data if photographer ID is available
      if (photographerId) {
        try {
          // Fetch photographer's content (galleries and stories)
          const [galleriesRes, storiesRes] = await Promise.all([
            fetch(`/api/photographer-galleries?photographerId=${photographerId}`),
            fetch(`/api/photographer-stories?photographerId=${photographerId}`)
          ])

          const galleriesData = await galleriesRes.json()
          const storiesData = await storiesRes.json()

          let contentIds: string[] = []
          
          if (galleriesData.success) {
            contentIds = contentIds.concat(galleriesData.galleries.map((g: any) => g._id))
          }
          
          if (storiesData.success) {
            contentIds = contentIds.concat(storiesData.stories.map((s: any) => s._id))
          }

          // Fetch likes and comments for all content
          if (contentIds.length > 0) {
            const likesPromises = contentIds.map(id => 
              fetch(`/api/likes?contentId=${id}`).then(res => res.json())
            )
            
            const commentsPromises = contentIds.map(id => 
              fetch(`/api/comments?contentId=${id}`).then(res => res.json())
            )

            const likesResults = await Promise.all(likesPromises)
            const commentsResults = await Promise.all(commentsPromises)

            const allLikes = likesResults.flatMap(result => result.success ? result.likes : [])
            const allComments = commentsResults.flatMap(result => result.success ? result.comments : [])

            // Calculate unique users
            const uniqueUsers = new Set([
              ...allLikes.map((like: any) => like.userId),
              ...allComments.map((comment: any) => comment.userId)
            ])

            setEngagementData({
              totalLikes: allLikes.length,
              totalComments: allComments.length,
              engagedUsers: uniqueUsers.size,
              contentItems: contentIds.length
            })
          }
        } catch (error) {
          console.error('Error fetching engagement data:', error)
        }
      }

      // This would fetch real data from your booking API
      // For now showing empty state until real bookings are implemented
      setBookingData([])
      setUpcomingBookings([])
      setStats({
        totalBookings: 0,
        upcomingShots: 0,
        totalEarnings: 0
      })
      setLoading(false)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Likes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-red-500">{engagementData.totalLikes}</div>
              <Heart className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {engagementData.contentItems} content items
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-blue-500">{engagementData.totalComments}</div>
              <MessageCircle className="w-6 h-6 text-blue-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From {engagementData.engagedUsers} users
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-primary">{stats.totalBookings}</div>
              <Eye className="w-6 h-6 text-primary" />
            </div>
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
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-accent">{stats.upcomingShots}</div>
              <TrendingUp className="w-6 h-6 text-accent" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Next 30 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        <Card>
          <CardHeader>
            <CardTitle>Engagement Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <Heart className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p className="font-medium">Total Likes</p>
                    <p className="text-sm text-muted-foreground">Across all your content</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-red-600">{engagementData.totalLikes}</div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">Total Comments</p>
                    <p className="text-sm text-muted-foreground">From engaged users</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-600">{engagementData.totalComments}</div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="font-medium">Engaged Users</p>
                    <p className="text-sm text-muted-foreground">Unique users interacted</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-purple-600">{engagementData.engagedUsers}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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