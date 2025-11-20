"use client"

import { LogOut } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export default function Header() {
  return (
    <header className="bg-card border-b border-border px-8 py-4 flex items-center justify-between shadow-sm">
      <h2 className="text-2xl font-bold text-foreground">STUDIO</h2>
      
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop" />
          <AvatarFallback>PH</AvatarFallback>
        </Avatar>
        
        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
          <LogOut size={20} className="text-foreground" />
        </button>
      </div>
    </header>
  )
}