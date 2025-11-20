import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

// Simple nav with search and actions
export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-yellow-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 h-16 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-yellow-400 text-black font-bold">
            PB
          </span>
          <span className="text-black">PhotoBook</span>
        </Link>
        
        <div className="flex-1" />
        
        <div className="hidden md:flex items-center gap-6">
          <nav className="hidden sm:flex items-center gap-4 text-sm">
            <Link className="text-black hover:text-yellow-600 transition-colors font-medium" href="#">
              Home
            </Link>
            <Link className="text-black hover:text-yellow-600 transition-colors font-medium" href="#">
              My Bookings
            </Link>
            <Link className="text-black hover:text-yellow-600 transition-colors font-medium" href="#">
              Profile
            </Link>
            <Link className="text-black hover:text-yellow-600 transition-colors font-medium" href="#">
              Offers
            </Link>
            <Link className="text-black hover:text-yellow-600 transition-colors font-medium" href="#">
              Logout
            </Link>
          </nav>
          
          <div className="relative w-72">
            <Input
              placeholder="Search by name, location, type"
              aria-label="Search photographers"
              className="pl-3 pr-10 rounded-md border-yellow-200 focus:border-yellow-400 focus:ring-yellow-400"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
              ⌘K
            </span>
          </div>
          
          <Button className="rounded-full bg-yellow-400 text-black hover:bg-yellow-500 border-0">
            Notifications
          </Button>
          
          <Avatar className="h-8 w-8 border-2 border-yellow-400">
            <AvatarFallback className="bg-yellow-100 text-black font-semibold">AX</AvatarFallback>
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