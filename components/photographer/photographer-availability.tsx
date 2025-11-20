"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Calendar, Clock, CheckCircle, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface AvailabilityItem {
  date: string
  isAvailable: boolean
}

interface PhotographerAvailabilityProps {
  availability: AvailabilityItem[]
}

export default function PhotographerAvailability({ availability }: PhotographerAvailabilityProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }
    
    return days
  }

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const getAvailabilityForDate = (dateString: string) => {
    return availability.find(item => item.date === dateString)
  }

  const isDateInPast = (year: number, month: number, day: number) => {
    const date = new Date(year, month, day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const days = getDaysInMonth(currentMonth)
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const handleBookNow = () => {
    if (selectedDate) {
      console.log('Booking for date:', selectedDate)
      // Handle booking logic
    }
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Calendar className="w-5 h-5 text-primary" />
            Availability
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Calendar Header */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              ←
            </Button>
            <h3 className="font-semibold">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              →
            </Button>
          </div>

          {/* Day Names */}
          <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-gray-600">
            {dayNames.map(day => (
              <div key={day} className="p-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="p-2"></div>
              }

              const dateString = formatDate(
                currentMonth.getFullYear(),
                currentMonth.getMonth(),
                day
              )
              const availabilityInfo = getAvailabilityForDate(dateString)
              const isPast = isDateInPast(currentMonth.getFullYear(), currentMonth.getMonth(), day)
              const isSelected = selectedDate === dateString
              const isAvailable = availabilityInfo?.isAvailable ?? true
              const isBookable = !isPast && isAvailable

              return (
                <button
                  key={`${currentMonth.getFullYear()}-${currentMonth.getMonth()}-${day}`}
                  onClick={() => isBookable ? setSelectedDate(dateString) : null}
                  disabled={isPast || !isAvailable}
                  className={`
                    p-2 text-sm rounded-lg transition-all duration-200 relative
                    ${isPast 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : isAvailable
                        ? isSelected
                          ? 'bg-primary text-white'
                          : 'hover:bg-primary/10 text-gray-900'
                        : 'text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  {day}
                  
                  {/* Availability Indicator */}
                  {!isPast && (
                    <div className={`absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${
                      isAvailable ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                  )}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 text-xs text-gray-600 pt-2 border-t">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Booked</span>
            </div>
          </div>

          {/* Selected Date Info */}
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-primary/5 rounded-lg p-4 space-y-3"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-medium">
                  {new Date(selectedDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                This date is available for booking. Click below to proceed with your booking request.
              </p>
              <Button onClick={handleBookNow} className="w-full">
                <Clock className="w-4 h-4 mr-2" />
                Book This Date
              </Button>
            </motion.div>
          )}

          {/* Quick Actions */}
          <div className="space-y-2 pt-2 border-t">
            <Button variant="outline" className="w-full" size="sm">
              Check Availability for Custom Date
            </Button>
            <p className="text-xs text-gray-500 text-center">
              Need a different date? Contact directly for custom availability.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}