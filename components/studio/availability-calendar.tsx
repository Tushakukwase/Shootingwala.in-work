import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function AvailabilityCalendar() {
  const daysInMonth = 31
  const firstDayOfMonth = 1
  const bookedDates = [5, 12, 15, 18, 20, 25]
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDayOfMonth - 1 })

  return (
    <Card className="bg-white">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle>Availability Calendar</CardTitle>
          <Button variant="outline" size="sm">Update Availability</Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">December 2024</h3>
            <div className="flex gap-2">
              <button className="p-1 hover:bg-muted rounded">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="p-1 hover:bg-muted rounded">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
                {day}
              </div>
            ))}
            {emptyDays.map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {days.map((day) => (
              <div
                key={day}
                className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  bookedDates.includes(day)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground hover:bg-blue-100"
                }`}
              >
                {day}
              </div>
            ))}
          </div>
          <div className="flex gap-4 text-xs pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-muted rounded"></div>
              <span className="text-muted-foreground">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded"></div>
              <span className="text-muted-foreground">Booked</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}