"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const daysInMonth = 30
const firstDayOfMonth = 3 // November 2025 starts on Wednesday

export default function AvailabilityCalendar() {
  const [bookedDates, setBookedDates] = useState<number[]>([5, 10, 15, 20, 25])

  const toggleDate = (day: number) => {
    setBookedDates((prev) => 
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const calendarDays = Array(firstDayOfMonth)
    .fill(null)
    .concat(Array.from({ length: daysInMonth }, (_, i) => i + 1))

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Availability Calendar</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>November 2025</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-7 gap-2">
            {days.map((day) => (
              <div key={day} className="text-center font-semibold text-muted-foreground text-sm py-2">
                {day}
              </div>
            ))}
            {calendarDays.map((day, index) => (
              <button
                key={index}
                onClick={() => day && toggleDate(day)}
                disabled={!day}
                className={`aspect-square rounded-lg font-semibold text-sm transition-colors ${
                  !day
                    ? "bg-transparent"
                    : bookedDates.includes(day)
                    ? "bg-destructive text-destructive-foreground"
                    : "bg-green-100 text-green-800 hover:bg-green-200"
                }`}
              >
                {day}
              </button>
            ))}
          </div>
          
          <div className="flex gap-4 pt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-100"></div>
              <span className="text-sm text-foreground">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-destructive"></div>
              <span className="text-sm text-foreground">Booked</span>
            </div>
          </div>
          
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            Update Availability
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}