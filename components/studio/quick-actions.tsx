import { Plus, Calendar, DollarSign, User } from "lucide-react"

export function QuickActions() {
  const actions = [
    { icon: Plus, label: "Add Portfolio", color: "bg-blue-100 hover:bg-blue-200 text-blue-600" },
    { icon: Calendar, label: "Manage Bookings", color: "bg-purple-100 hover:bg-purple-200 text-purple-600" },
    { icon: DollarSign, label: "View Payments", color: "bg-green-100 hover:bg-green-200 text-green-600" },
    { icon: User, label: "Edit Profile", color: "bg-orange-100 hover:bg-orange-200 text-orange-600" },
  ]

  return (
    <div className="bg-white rounded-lg p-6 border border-border">
      <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon
          return (
            <button
              key={index}
              className={`flex flex-col items-center justify-center gap-3 p-4 rounded-lg transition-colors ${action.color}`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-sm font-medium text-center">{action.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}