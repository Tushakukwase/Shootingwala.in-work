"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  User, 
  ShoppingCart, 
  FileText, 
  Bell, 
  CreditCard, 
  Calendar, 
  Headphones,
  Home,
  Shield
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

const navItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Profile", href: "/dashboard/profile", icon: User },
  { name: "Orders & Bookings", href: "/dashboard/orders", icon: FileText },
  { name: "Wishlist", href: "/dashboard/wishlist", icon: ShoppingCart },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { name: "Payment History", href: "/dashboard/payments", icon: CreditCard },
  // Events removed from client dashboard
  { name: "Security", href: "/dashboard/security", icon: Shield },
  { name: "Support", href: "/dashboard/support", icon: Headphones },
]

export function Sidebar({ onNavigate }: { onNavigate?: (href: string) => void }) {
  const pathname = usePathname()

  const handleClick = (href: string, e: React.MouseEvent) => {
    // If onNavigate is provided, use it for client-side navigation
    if (onNavigate) {
      e.preventDefault()
      onNavigate(href)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon
            // For dashboard home, check if it's the root path
            const isActive = item.href === "/" ? pathname === "/" : pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={(e) => handleClick(item.href, e)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-yellow-100 text-yellow-900"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
      {/* Removed logout button from bottom */}
    </div>
  )
}