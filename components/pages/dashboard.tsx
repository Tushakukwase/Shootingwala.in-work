"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useState, useEffect } from "react"

const bookingData = [
  { month: "Jan", bookings: 12 },
  { month: "Feb", bookings: 19 },
  { month: "Mar", bookings: 15 },
  { month: "Apr", bookings: 25 },
  { month: "May", bookings: 22 },
  { month: "Jun", bookings: 28 },
]

const upcomingBookings = [
  { id: 1, client: "Sarah Johnson", event: "Wedding", date: "2025-11-15", status: "Confirmed" },
  { id: 2, client: "Michael Chen", event: "Corporate Event", date: "2025-11-20", status: "Pending" },
  { id: 3, client: "Emma Davis", event: "Portrait Session", date: "2025-11-25", status: "Confirmed" },
  { id: 4, client: "James Wilson", event: "Product Photography", date: "2025-12-01", status: "Confirmed" },
]

export default function Dashboard() {
  const [studioData, setStudioData] = useState<any>(null)

  useEffect(() => {
    // Get studio data from localStorage
    const data = localStorage.getItem('studio')
    if (data) {
      try {
        const parsed = JSON.parse(data)
        setStudioData(parsed)
      } catch (error) {
        console.error('Error parsing studio data:', error)
      }
    }
  }, [])

  const getDisplayName = () => {
    if (!studioData) return "Photographer"
    
    return studioData.name || 
           studioData.photographerName || 
           studioData.username || 
           studioData.email?.split('@')[0] || 
           "Photographer"
  }

  return (
    <div className="p-8 space-y-8">
      {/* Welcome Message */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, {getDisplayName()}!
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your photography business
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">142</div>
            <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Shoots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">8</div>
            <p className="text-xs text-muted-foreground mt-1">Next 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">$12,450</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
      </div>

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

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Bookings</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  )
}