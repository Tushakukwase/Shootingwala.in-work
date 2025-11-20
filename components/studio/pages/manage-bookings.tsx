"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"

const bookings = [
  {
    id: 1,
    client: "Sarah Johnson",
    event: "Wedding",
    date: "2025-11-15",
    location: "Central Park",
    status: "Pending",
    payment: "Paid",
  },
  {
    id: 2,
    client: "Michael Chen",
    event: "Corporate Event",
    date: "2025-11-20",
    location: "Downtown Office",
    status: "Confirmed",
    payment: "Pending",
  },
  {
    id: 3,
    client: "Emma Davis",
    event: "Portrait Session",
    date: "2025-11-25",
    location: "Studio",
    status: "Confirmed",
    payment: "Paid",
  },
  {
    id: 4,
    client: "James Wilson",
    event: "Product Photography",
    date: "2025-12-01",
    location: "Warehouse",
    status: "Pending",
    payment: "Paid",
  },
]

export default function ManageBookings() {
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Manage Bookings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Client Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Event</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Location</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Payment</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-border hover:bg-muted transition-colors">
                    <td className="py-3 px-4 text-foreground">{booking.client}</td>
                    <td className="py-3 px-4 text-foreground">{booking.event}</td>
                    <td className="py-3 px-4 text-foreground">{booking.date}</td>
                    <td className="py-3 px-4 text-foreground">{booking.location}</td>
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
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          booking.payment === "Paid" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {booking.payment}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1 text-green-600 border-green-200 bg-transparent"
                        >
                          <Check size={16} />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1 text-destructive border-destructive/20 bg-transparent"
                        >
                          <X size={16} />
                          Reject
                        </Button>
                      </div>
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