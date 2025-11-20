import { Card } from "@/components/ui/card"
import { useState, useEffect } from "react"

export function Bookings() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/bookings')
      .then(res => res.json())
      .then(data => {
        setBookings(data.bookings || [])
        setLoading(false)
      })
      .catch(() => {
        setBookings([])
        setLoading(false)
      })
  }, [])

  const upcoming = bookings.filter((b) => b.status !== "Past")
  const past = bookings.filter((b) => b.status === "Past")

  return (
    <section aria-labelledby="bookings" className="space-y-4">
      <h2 id="bookings" className="text-xl font-bold text-black">
        📅 My Bookings
      </h2>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4 border-2 border-yellow-200 bg-yellow-50/30">
          <h3 className="font-bold mb-3 text-black flex items-center gap-2">
            🔜 Upcoming
          </h3>
          <ul className="space-y-3">
            {upcoming.map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between rounded-lg border-2 border-yellow-200 bg-white p-3 hover:shadow-md transition-all hover:border-yellow-400"
              >
                <div>
                  <p className="font-bold text-black">{b.photographer}</p>
                  <p className="text-sm text-gray-600 font-medium">{b.date}</p>
                </div>
                <span className={`text-xs rounded-full px-3 py-1 font-bold ${
                  b.status === "Confirmed" 
                    ? "bg-yellow-400 text-black" 
                    : "bg-yellow-200 text-black"
                }`}>
                  {b.status === "Confirmed" ? "✅ " : "⏳ "}{b.status}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4 border-2 border-yellow-200 bg-yellow-50/30">
          <h3 className="font-bold mb-3 text-black flex items-center gap-2">
            📋 Past
          </h3>
          <ul className="space-y-3">
            {past.map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between rounded-lg border-2 border-yellow-200 bg-white p-3 hover:shadow-md transition-all hover:border-yellow-400"
              >
                <div>
                  <p className="font-bold text-black">{b.photographer}</p>
                  <p className="text-sm text-gray-600 font-medium">{b.date}</p>
                </div>
                <button className="text-sm text-black font-semibold underline underline-offset-4 hover:text-yellow-600 transition-colors">
                  ⭐ Leave review
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </section>
  )
}