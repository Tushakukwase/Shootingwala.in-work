import { Card, CardContent } from "@/components/ui/card"
import { Calendar, DollarSign, Camera } from "lucide-react"

export function WelcomeSection() {
  const stats = [
    {
      icon: Calendar,
      label: "Total Bookings",
      value: "24",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: Camera,
      label: "Upcoming Shoots",
      value: "3",
      color: "bg-purple-100 text-purple-600",
    },
    {
      icon: DollarSign,
      label: "Earnings (This Month)",
      value: "$2,450",
      color: "bg-green-100 text-green-600",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome back, Sarah 👋</h1>
        <p className="text-muted-foreground mt-2">Here's what's happening with your photography business today</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="bg-white hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}