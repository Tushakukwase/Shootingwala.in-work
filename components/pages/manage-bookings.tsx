"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { Search, Filter, Calendar, Clock, User, MapPin, Phone, Mail, Eye, Edit, Trash2, CheckCircle, XCircle, X, DollarSign } from "lucide-react"

interface Booking {
  id: string
  clientName: string
  clientEmail: string
  clientPhone: string
  eventName: string
  date: string
  time: string
  duration: string
  location: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  totalAmount: number
  paidAmount: number
  notes?: string
  createdAt: string
  photographerId: string
}

export default function ManageBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
  const [photographerId, setPhotographerId] = useState<string>('')

  useEffect(() => {
    // Get photographer ID from localStorage
    const studioData = localStorage.getItem('studio')
    if (studioData) {
      try {
        const parsed = JSON.parse(studioData)
        setPhotographerId(parsed._id)
        loadBookings(parsed._id)
      } catch (error) {
        console.error('Error parsing studio data:', error)
      }
    }
  }, [])

  const loadBookings = async (photographerId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/bookings?photographerId=${photographerId}`)
      const data = await response.json()
      
      if (data.success) {
        setBookings(data.data)
      }
    } catch (error) {
      console.error('Error loading bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/bookings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: bookingId,
          status: newStatus
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setBookings(prev => 
          prev.map(booking => 
            booking.id === bookingId ? { ...booking, status: newStatus as any } : booking
          )
        )
        alert('Booking status updated successfully!')
      }
    } catch (error) {
      console.error('Error updating booking status:', error)
      alert('Failed to update booking status')
    }
  }

  const handleDeleteBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to delete this booking?')) return
    
    try {
      const response = await fetch(`/api/bookings?id=${bookingId}`, {
        method: 'DELETE',
      })
      
      const data = await response.json()
      
      if (data.success) {
        setBookings(prev => prev.filter(booking => booking.id !== bookingId))
        alert('Booking deleted successfully!')
      }
    } catch (error) {
      console.error('Error deleting booking:', error)
      alert('Failed to delete booking')
    }
  }

  const handleEditBooking = async () => {
    if (!editingBooking) return
    
    try {
      const response = await fetch('/api/bookings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingBooking),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setBookings(prev => 
          prev.map(booking => 
            booking.id === editingBooking.id ? data.data : booking
          )
        )
        setEditingBooking(null)
        alert('Booking updated successfully!')
      }
    } catch (error) {
      console.error('Error updating booking:', error)
      alert('Failed to update booking')
    }
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.clientEmail.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'confirmed':
        return <Badge className="bg-blue-100 text-blue-800">Confirmed</Badge>
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
      default:
        return null
    }
  }

  const getPaymentStatus = (booking: Booking) => {
    if (booking.paidAmount === 0) return 'Unpaid'
    if (booking.paidAmount >= booking.totalAmount) return 'Paid'
    return 'Partial'
  }

  const getPaymentBadge = (booking: Booking) => {
    const status = getPaymentStatus(booking)
    switch (status) {
      case 'Paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>
      case 'Partial':
        return <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>
      case 'Unpaid':
        return <Badge className="bg-red-100 text-red-800">Unpaid</Badge>
      default:
        return null
    }
  }

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    totalRevenue: bookings.reduce((sum, b) => sum + b.paidAmount, 0),
    pendingRevenue: bookings.reduce((sum, b) => sum + (b.totalAmount - b.paidAmount), 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Manage Bookings</h1>
        <div className="flex items-center gap-4">
          <Badge variant="outline">{stats.total} Total</Badge>
          <Badge className="bg-blue-100 text-blue-800">{stats.confirmed} Confirmed</Badge>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.confirmed}</div>
            <div className="text-sm text-muted-foreground">Confirmed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
            <div className="text-sm text-muted-foreground">Cancelled</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">${stats.totalRevenue}</div>
            <div className="text-sm text-muted-foreground">Revenue</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">${stats.pendingRevenue}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-input rounded-md bg-background text-sm"
        >
          <option value="all">All Bookings</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading bookings...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Your bookings will appear here once clients start booking your services'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredBookings.map(booking => (
            <Card key={booking.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{booking.eventName}</h3>
                    <p className="text-sm text-muted-foreground">{booking.clientName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(booking.status)}
                    {getPaymentBadge(booking)}
                  </div>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    <span>{booking.date} at {booking.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span>{booking.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-muted-foreground" />
                    <span>{booking.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-3 h-3 text-muted-foreground" />
                    <span>${booking.paidAmount} / ${booking.totalAmount}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      setSelectedBooking(booking)
                      setShowDetailsModal(true)
                    }}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setEditingBooking(booking)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  {booking.status === 'pending' && (
                    <Button 
                      size="sm" 
                      onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Confirm
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleDeleteBooking(booking.id)}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Booking Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Booking Details</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowDetailsModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedBooking.status)}
                {getPaymentBadge(selectedBooking)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Event Information</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Event</Label>
                      <p className="font-medium">{selectedBooking.eventName}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Date & Time</Label>
                      <p className="font-medium">{selectedBooking.date} at {selectedBooking.time}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Duration</Label>
                      <p className="font-medium">{selectedBooking.duration}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Location</Label>
                      <p className="font-medium">{selectedBooking.location}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Client Information</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Name</Label>
                      <p className="font-medium">{selectedBooking.clientName}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Email</Label>
                      <p className="font-medium">{selectedBooking.clientEmail}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Phone</Label>
                      <p className="font-medium">{selectedBooking.clientPhone}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Payment Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Total Amount</Label>
                    <p className="font-medium">${selectedBooking.totalAmount}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Paid Amount</Label>
                    <p className="font-medium">${selectedBooking.paidAmount}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Remaining</Label>
                    <p className="font-medium">${selectedBooking.totalAmount - selectedBooking.paidAmount}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Payment Status</Label>
                    <p className="font-medium">{getPaymentStatus(selectedBooking)}</p>
                  </div>
                </div>
              </div>

              {selectedBooking.notes && (
                <div>
                  <h4 className="font-semibold mb-2">Notes</h4>
                  <p className="text-sm bg-muted p-3 rounded-md">{selectedBooking.notes}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                <select
                  value={selectedBooking.status}
                  onChange={(e) => handleStatusUpdate(selectedBooking.id, e.target.value)}
                  className="px-3 py-2 border border-input rounded-md bg-background text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <Button variant="outline" onClick={() => setEditingBooking(selectedBooking)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Booking
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Booking Modal */}
      {editingBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Edit Booking</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setEditingBooking(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-eventName">Event Name</Label>
                <Input
                  id="edit-eventName"
                  value={editingBooking.eventName}
                  onChange={(e) => setEditingBooking(prev => prev ? { ...prev, eventName: e.target.value } : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-clientName">Client Name</Label>
                <Input
                  id="edit-clientName"
                  value={editingBooking.clientName}
                  onChange={(e) => setEditingBooking(prev => prev ? { ...prev, clientName: e.target.value } : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editingBooking.date}
                  onChange={(e) => setEditingBooking(prev => prev ? { ...prev, date: e.target.value } : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-time">Time</Label>
                <Input
                  id="edit-time"
                  value={editingBooking.time}
                  onChange={(e) => setEditingBooking(prev => prev ? { ...prev, time: e.target.value } : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={editingBooking.location}
                  onChange={(e) => setEditingBooking(prev => prev ? { ...prev, location: e.target.value } : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-totalAmount">Total Amount</Label>
                <Input
                  id="edit-totalAmount"
                  type="number"
                  value={editingBooking.totalAmount}
                  onChange={(e) => setEditingBooking(prev => prev ? { ...prev, totalAmount: Number(e.target.value) } : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-paidAmount">Paid Amount</Label>
                <Input
                  id="edit-paidAmount"
                  type="number"
                  value={editingBooking.paidAmount}
                  onChange={(e) => setEditingBooking(prev => prev ? { ...prev, paidAmount: Number(e.target.value) } : null)}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleEditBooking} className="flex-1">
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditingBooking(null)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}