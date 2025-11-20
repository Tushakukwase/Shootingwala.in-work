import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { Search } from "lucide-react"
import { usePathname } from "next/navigation"

// Simple nav with search and actions
export function Navbar() {
  const { user } = useAuth()
  const pathname = usePathname()
  
  return (
    <header className="sticky top-0 z-40 w-full border-b border-yellow-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 h-16 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-yellow-400 text-black font-bold">
            {user?.fullName?.charAt(0) || 'U'}
          </span>
        </Link>
        
        <div className="flex-1" />
        
        <div className="hidden md:flex items-center gap-6">
          <div className="relative w-72">
            <Input
              placeholder="Search by name, location, type"
              aria-label="Search photographers"
              className="pl-3 pr-10 rounded-md border-yellow-200 focus:border-yellow-400 focus:ring-yellow-400"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
          </div>
          
          <Button className="rounded-full bg-yellow-400 text-black hover:bg-yellow-500 border-0">
            Notifications
          </Button>
          
          <Avatar className="h-8 w-8 border-2 border-yellow-400">
            <AvatarFallback className="bg-yellow-100 text-black font-semibold">
              {user?.fullName?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
        
        <div className="md:hidden flex items-center gap-3">
          <Input 
            placeholder="Search" 
            className={cn("h-9 w-40 border-yellow-200 focus:border-yellow-400")} 
          />
          <Button className="h-9 rounded-full bg-yellow-400 text-black hover:bg-yellow-500">
            🔔
          </Button>
        </div>
      </div>
    </header>
  )
}