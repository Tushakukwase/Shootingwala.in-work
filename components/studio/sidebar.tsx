"use client"

import { LayoutDashboard, ImageIcon, Calendar, Star, TrendingUp, User, BookOpen, Camera, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  currentPage: string
  onPageChange: (page: any) => void
}

export default function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "portfolio", label: "Portfolio", icon: ImageIcon },
    { id: "gallery", label: "Gallery", icon: Camera },
    { id: "real-stories", label: "Real Stories", icon: FileText },
    { id: "calendar", label: "Availability Calendar", icon: Calendar },
    { id: "reviews", label: "Recent Reviews", icon: Star },
    { id: "earnings", label: "Earning Summary", icon: TrendingUp },
    { id: "profile", label: "Edit Profile", icon: User },
    { id: "bookings", label: "Manage Bookings", icon: BookOpen },
  ]

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-2xl font-bold text-sidebar-primary">STUDIO</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <Icon size={20} />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}