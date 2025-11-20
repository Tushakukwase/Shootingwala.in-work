"use client"

import { LayoutDashboard, ImageIcon, Calendar, Star, TrendingUp, User, BookOpen, Tag, MapPin, FileText, Camera, Package, Settings, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { isUserLoggedIn, getUserData } from '@/lib/auth-utils'

interface SidebarProps {
  currentPage: string
  onPageChange: (page: any) => void
}

export default function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const [messageCount, setMessageCount] = useState(0)
  const [studioData, setStudioData] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check authentication status
    const authenticated = isUserLoggedIn()
    setIsAuthenticated(authenticated)
    
    if (authenticated) {
      const data = getUserData()
      if (data && data.id) {
        setStudioData(data)
        fetchMessageCount(data.id)
        
        // Poll for message count updates
        const interval = setInterval(() => {
          fetchMessageCount(data.id)
        }, 30000) // Check every 30 seconds (reduced frequency)
        
        return () => clearInterval(interval)
      }
    }
  }, [])

  const fetchMessageCount = async (userId: string) => {
    try {
      // Validate userId before making the request
      if (!userId || userId.trim() === '') {
        console.warn('User ID not available, skipping message count fetch');
        setMessageCount(0); // Clear message count when ID is not available
        return;
      }
      
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        return;
      }
      
      const response = await fetch(`/api/messages?userId=${encodeURIComponent(userId)}`, {
        // Add timeout and error handling
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      // Check if response is ok before parsing JSON
      if (!response.ok) {
        console.error('Failed to fetch message count:', response.status, response.statusText);
        setMessageCount(0); // Clear message count on error
        return;
      }
      
      const data = await response.json();
      
      if (data.success && data.conversations) {
        const unreadCount = data.conversations.reduce((total: number, conv: any) => {
          return total + (conv.unreadCount || 0);
        }, 0);
        setMessageCount(unreadCount);
      } else {
        setMessageCount(0); // Clear message count if no data
      }
    } catch (error: any) {
      // Handle different types of errors
      if (error.name === 'AbortError') {
        console.warn('Message count fetch timed out');
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.warn('Network error while fetching message count - likely offline or server unavailable');
      } else {
        console.error('Error fetching message count:', error);
      }
      // Set message count to 0 in case of error to prevent UI issues
      setMessageCount(0);
    }
  }

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "portfolio", label: "Profile & Portfolio", icon: User },
    { id: "packages", label: "Packages & Pricing", icon: Package },
    { id: "gallery", label: "Gallery Management", icon: Camera },
    { id: "real-stories", label: "Stories Management", icon: FileText },
    { id: "calendar", label: "Availability Calendar", icon: Calendar },
    { id: "bookings", label: "Manage Bookings", icon: BookOpen },
    { id: "events", label: "Events Management", icon: Calendar }, // Added Events tab
    { id: "messages", label: "Messages", icon: MessageCircle },
    { id: "reviews", label: "Recent Reviews", icon: Star },
    { id: "categories", label: "Search Categories", icon: Tag },
    { id: "cities", label: "City Coverage", icon: MapPin },
    { id: "earnings", label: "Earning Summary", icon: TrendingUp },
  ]

  // Don't render sidebar if user is not authenticated
  if (!isAuthenticated) {
    return null
  }

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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative ${
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <Icon size={20} />
              <span className="text-sm font-medium">{item.label}</span>
              {item.id === 'messages' && messageCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {messageCount > 99 ? '99+' : messageCount}
                </Badge>
              )}
            </button>
          )
        })}
      </nav>

    </aside>
  )
}