"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, MessageCircle, Users, Camera } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface EngagementData {
  totalLikes: number
  totalComments: number
  engagedUsers: number
  contentItems: number
}

interface EngagementTrend {
  date: string
  likes: number
  comments: number
}

export default function EngagementMetrics() {
  const [engagementData, setEngagementData] = useState<EngagementData>({
    totalLikes: 0,
    totalComments: 0,
    engagedUsers: 0,
    contentItems: 0
  })
  
  const [engagementTrend, setEngagementTrend] = useState<EngagementTrend[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEngagementData()
    fetchEngagementTrend()
  }, [])

  const fetchEngagementData = async () => {
    try {
      setLoading(true)
      
      // Fetch all galleries and stories to get content IDs
      const [galleriesRes, storiesRes] = await Promise.all([
        fetch('/api/photographer-galleries'),
        fetch('/api/photographer-stories')
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
    } finally {
      setLoading(false)
    }
  }

  const fetchEngagementTrend = async () => {
    try {
      // Simulate trend data - in a real implementation, this would come from your analytics
      const trendData = [
        { date: 'Jan', likes: 120, comments: 45 },
        { date: 'Feb', likes: 190, comments: 67 },
        { date: 'Mar', likes: 150, comments: 52 },
        { date: 'Apr', likes: 210, comments: 78 },
        { date: 'May', likes: 280, comments: 95 },
        { date: 'Jun', likes: 240, comments: 88 }
      ]
      setEngagementTrend(trendData)
    } catch (error) {
      console.error('Error fetching engagement trend:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Engagement Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              Across {engagementData.contentItems} content items
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Engaged Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-purple-500">{engagementData.engagedUsers}</div>
              <Users className="w-6 h-6 text-purple-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active content interactors
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Content Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-green-500">{engagementData.contentItems}</div>
              <Camera className="w-6 h-6 text-green-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Galleries and stories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={engagementTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "var(--card)", 
                  border: "1px solid var(--border)" 
                }} 
              />
              <Bar dataKey="likes" fill="var(--red-500)" radius={[4, 4, 0, 0]} name="Likes" />
              <Bar dataKey="comments" fill="var(--blue-500)" radius={[4, 4, 0, 0]} name="Comments" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}