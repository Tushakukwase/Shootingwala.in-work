import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar } from "lucide-react"

export function UpcomingBookings() {
  const bookings = [
    {
      id: 1,
      client: "Emma Wilson",
      event: "Wedding",
      date: "Dec 15, 2024",
      location: "Central Park, NYC",
      status: "confirmed",
    },
    {
      id: 2,
      client: "Michael Chen",
      event: "Corporate Event",
      date: "Dec 18, 2024",
      location: "Downtown Studio",
      status: "pending",
    },
    {
      id: 3,
      client: "Jessica Brown",
      event: "Portrait Session",
      date: "Dec 20, 2024",
      location: "Beach Location",
      status: "confirmed",
    },
  ]

  const getStatusColor = (status: string) => {
    return status === "confirmed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
  }

  return (
    <Card className="bg-white">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle>Upcoming Bookings</CardTitle>
          <Button variant="outline" size="sm">View All Bookings</Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Client Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Event Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Location</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-foreground font-medium">{booking.client}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{booking.event}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {booking.date}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {booking.location}
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={`${getStatusColor(booking.status)} border-0`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}