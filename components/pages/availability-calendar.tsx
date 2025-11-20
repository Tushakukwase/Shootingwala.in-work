"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { Calendar, Clock, Plus, X, User, MapPin, Phone, Mail, ChevronLeft, ChevronRight } from "lucide-react"

interface BookingEvent {
  id: string
  date: string
  time: string
  eventName: string
  clientName: string
  clientPhone: string
  clientEmail: string
  location: string
  status: 'confirmed' | 'pending' | 'blocked'
  duration: string
  notes?: string
  photographerId: string
}

interface AvailabilitySlot {
  id: string
  photographerId: string
  date: string
  timeSlots: string[]
  available: boolean
}

export default function AvailabilityCalendar() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showAddEventModal, setShowAddEventModal] = useState(false)
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<BookingEvent | null>(null)
  const [bookings, setBookings] = useState<BookingEvent[]>([])
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [photographerId, setPhotographerId] = useState<string>('')
  const [newEvent, setNewEvent] = useState({
    eventName: '',
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    location: '',
    time: '',
    duration: '',
    notes: ''
  })
  const [availabilityData, setAvailabilityData] = useState({
    available: true,
    timeSlots: ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM']
  })

  useEffect(() => {
    // Get photographer ID from localStorage
    const studioData = localStorage.getItem('studio')
    if (studioData) {
      try {
        const parsed = JSON.parse(studioData)
        setPhotographerId(parsed._id)
        loadBookings(parsed._id)
        loadAvailability(parsed._id)
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

  const loadAvailability = async (photographerId: string) => {
    try {
      const response = await fetch(`/api/availability?photographerId=${photographerId}`)
      const data = await response.json()
      
      if (data.success) {
        setAvailability(data.data)
      }
    } catch (error) {
      console.error('Error loading availability:', error)
    }
  }

  const handleAddEvent = async () => {
    if (!selectedDate || !photographerId) return
    
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newEvent,
          date: selectedDate,
          photographerId
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setBookings(prev => [...prev, data.data])
        setNewEvent({
          eventName: '',
          clientName: '',
          clientPhone: '',
          clientEmail: '',
          location: '',
          time: '',
          duration: '',
          notes: ''
        })
        setShowAddEventModal(false)
        alert('Event added successfully!')
      }
    } catch (error) {
      console.error('Error adding event:', error)
      alert('Failed to add event')
    }
  }

  const handleSetAvailability = async () => {
    if (!selectedDate || !photographerId) return
    
    try {
      const response = await fetch('/api/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photographerId,
          date: selectedDate,
          ...availabilityData
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setAvailability(prev => {
          const filtered = prev.filter(slot => !(slot.photographerId === photographerId && slot.date === selectedDate))
          return [...filtered, data.data]
        })
        setShowAvailabilityModal(false)
        alert('Availability updated successfully!')
      }
    } catch (error) {
      console.error('Error setting availability:', error)
      alert('Failed to update availability')
    }
  }

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const current = new Date(startDate)
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const getBookingForDate = (date: string) => {
    return bookings.find(booking => booking.date === date)
  }

  const getAvailabilityForDate = (date: string) => {
    return availability.find(slot => slot.date === date)
  }

  const handleDateClick = (date: Date) => {
    const dateStr = formatDate(date)
    const booking = getBookingForDate(dateStr)
    
    if (booking) {
      setSelectedEvent(booking)
      setShowEventModal(true)
    } else {
      setSelectedDate(dateStr)
      // Show options to add event or set availability
    }
  }

  const getDayStatus = (date: Date) => {
    const dateStr = formatDate(date)
    const booking = getBookingForDate(dateStr)
    const availabilitySlot = getAvailabilityForDate(dateStr)
    
    if (booking) {
      return booking.status === 'confirmed' ? 'booked' : 'pending'
    }
    
    if (availabilitySlot) {
      return availabilitySlot.available ? 'available' : 'unavailable'
    }
    
    return 'default'
  }

  const getDayClassName = (date: Date) => {
    const status = getDayStatus(date)
    const isCurrentMonth = date.getMonth() === currentMonth.getMonth()
    const isToday = formatDate(date) === formatDate(new Date())
    
    let className = "w-10 h-10 flex items-center justify-center text-sm rounded-lg cursor-pointer transition-colors "
    
    if (!isCurrentMonth) {
      className += "text-muted-foreground "
    }
    
    if (isToday) {
      className += "ring-2 ring-primary "
    }
    
    switch (status) {
      case 'booked':
        className += "bg-red-100 text-red-800 hover:bg-red-200 "
        break
      case 'pending':
        className += "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 "
        break
      case 'available':
        className += "bg-green-100 text-green-800 hover:bg-green-200 "
        break
      case 'unavailable':
        className += "bg-gray-100 text-gray-800 hover:bg-gray-200 "
        break
      default:
        className += "hover:bg-muted "
    }
    
    return className
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Availability Calendar</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedDate(formatDate(new Date()))
              setShowAvailabilityModal(true)
            }}
          >
            <Clock className="w-4 h-4 mr-2" />
            Set Availability
          </Button>
          <Button
            onClick={() => {
              setSelectedDate(formatDate(new Date()))
              setShowAddEventModal(true)
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 rounded"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 rounded"></div>
          <span>Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-100 rounded"></div>
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 rounded"></div>
          <span>Unavailable</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(new Date())}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading calendar...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {generateCalendarDays().map((date, index) => (
                  <div
                    key={index}
                    className={getDayClassName(date)}
                    onClick={() => handleDateClick(date)}
                  >
                    {date.getDate()}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Details Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Event Details</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowEventModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={
                  selectedEvent.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                  selectedEvent.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }>
                  {selectedEvent.status.charAt(0).toUpperCase() + selectedEvent.status.slice(1)}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-sm text-muted-foreground">Event</Label>
                  <p className="font-medium">{selectedEvent.eventName}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Date & Time</Label>
                  <p className="font-medium">{selectedEvent.date} at {selectedEvent.time}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Duration</Label>
                  <p className="font-medium">{selectedEvent.duration}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Client</Label>
                  <p className="font-medium">{selectedEvent.clientName}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Contact</Label>
                  <p className="font-medium">{selectedEvent.clientPhone}</p>
                  <p className="text-sm text-muted-foreground">{selectedEvent.clientEmail}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Location</Label>
                  <p className="font-medium">{selectedEvent.location}</p>
                </div>
                {selectedEvent.notes && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Notes</Label>
                    <p className="font-medium">{selectedEvent.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Event Modal */}
      {showAddEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Add New Event</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowAddEventModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="eventName">Event Name</Label>
                <Input
                  id="eventName"
                  value={newEvent.eventName}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, eventName: e.target.value }))}
                  placeholder="e.g., Wedding Photography"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  value={newEvent.clientName}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, clientName: e.target.value }))}
                  placeholder="Client's full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientPhone">Client Phone</Label>
                <Input
                  id="clientPhone"
                  value={newEvent.clientPhone}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, clientPhone: e.target.value }))}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Client Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={newEvent.clientEmail}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, clientEmail: e.target.value }))}
                  placeholder="client@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                  placeholder="10:00 AM"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={newEvent.duration}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="2 hours"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Event location"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <textarea
                  id="notes"
                  value={newEvent.notes}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes..."
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground resize-none"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddEvent} className="flex-1">
                  Add Event
                </Button>
                <Button variant="outline" onClick={() => setShowAddEventModal(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Set Availability Modal */}
      {showAvailabilityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Set Availability</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowAvailabilityModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <p className="font-medium">{selectedDate}</p>
              </div>
              
              <div className="space-y-2">
                <Label>Availability Status</Label>
                <div className="flex gap-2">
                  <Button
                    variant={availabilityData.available ? "default" : "outline"}
                    onClick={() => setAvailabilityData(prev => ({ ...prev, available: true }))}
                    className="flex-1"
                  >
                    Available
                  </Button>
                  <Button
                    variant={!availabilityData.available ? "default" : "outline"}
                    onClick={() => setAvailabilityData(prev => ({ ...prev, available: false }))}
                    className="flex-1"
                  >
                    Unavailable
                  </Button>
                </div>
              </div>

              {availabilityData.available && (
                <div className="space-y-2">
                  <Label>Available Time Slots</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'].map(time => (
                      <Button
                        key={time}
                        variant={availabilityData.timeSlots.includes(time) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setAvailabilityData(prev => ({
                            ...prev,
                            timeSlots: prev.timeSlots.includes(time)
                              ? prev.timeSlots.filter(t => t !== time)
                              : [...prev.timeSlots, time]
                          }))
                        }}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={handleSetAvailability} className="flex-1">
                  Save Availability
                </Button>
                <Button variant="outline" onClick={() => setShowAvailabilityModal(false)} className="flex-1">
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