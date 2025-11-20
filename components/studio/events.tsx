"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Trophy, User } from "lucide-react"
import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"

export default function EventsSection() {
  const { user } = useAuth()
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) return
      
      try {
        // In a real app, this would fetch events for the specific user
        // For now, we'll use mock data but simulate an API call
        setLoading(true)
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock data - in a real app, this would come from API
        const mockEvents = [
          {
            id: "1",
            name: "Mumbai Wedding Photography Contest",
            date: "2023-07-15",
            status: "Registered",
            result: "Pending"
          },
          {
            id: "2",
            name: "Portrait Mastery Workshop",
            date: "2023-06-30",
            status: "Attended",
            result: "Winner"
          },
          {
            id: "3",
            name: "Street Photography Challenge",
            date: "2023-05-20",
            status: "Completed",
            result: "2nd Place"
          }
        ]
        
        setEvents(mockEvents)
      } catch (error) {
        console.error("Failed to fetch events:", error)
        // Fallback to mock data on error
        setEvents([
          {
            id: "1",
            name: "Sample Event",
            date: "2023-06-15",
            status: "Registered",
            result: "Pending"
          }
        ])
      } finally {
        setLoading(false)
      }
    }
    
    fetchEvents()
  }, [user])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Registered":
        return <Badge variant="outline">{status}</Badge>
      case "Attended":
        return <Badge variant="secondary">{status}</Badge>
      case "Completed":
        return <Badge>{status}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getResultBadge = (result: string) => {
    switch (result) {
      case "Winner":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">🏆 {result}</Badge>
      case "2nd Place":
        return <Badge variant="secondary">🥈 {result}</Badge>
      case "3rd Place":
        return <Badge variant="outline">🥉 {result}</Badge>
      case "Pending":
        return <Badge variant="outline">{result}</Badge>
      default:
        return <Badge variant="outline">{result}</Badge>
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Events Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-lg">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
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
        <CardTitle>Events Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{event.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{event.date}</span>
                </div>
                <div>
                  {getStatusBadge(event.status)}
                </div>
                <div>
                  {getResultBadge(event.result)}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {events.length === 0 && (
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No events registered yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}