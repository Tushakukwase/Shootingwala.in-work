"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import { useState, useEffect } from "react"

export default function ManageBookings() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      // This would fetch real bookings from your API
      // For now showing empty state until real bookings are implemented
      setBookings([])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching bookings:', error)
      setLoading(false)
    }
  }

  const handleAcceptBooking = async (bookingId: string) => {
    // Handle booking acceptance
    console.log('Accepting booking:', bookingId)
  }

  const handleRejectBooking = async (bookingId: string) => {
    // Handle booking rejection
    console.log('Rejecting booking:', bookingId)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Manage Bookings</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length > 0 ? (
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
                            onClick={() => handleAcceptBooking(booking.id)}
                          >
                            <Check size={16} />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-1 text-destructive border-destructive/20 bg-transparent"
                            onClick={() => handleRejectBooking(booking.id)}
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
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No bookings yet</p>
              <p className="text-sm text-muted-foreground mt-2">Your booking requests will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}