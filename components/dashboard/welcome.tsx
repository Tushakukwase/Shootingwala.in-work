"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"

export function Welcome({ userName }: { userName: string }) {
  const { user } = useAuth()
  
  return (
    <section aria-labelledby="welcome" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 id="welcome" className="text-2xl md:text-3xl font-bold text-black text-balance">
            {`Hi ${userName}!`}
          </h1>
          {user && (
            <p className="text-gray-600 mt-1">Welcome back to your dashboard</p>
          )}
        </div>
        {user && (
          <div className="text-right">
            <p className="text-sm text-gray-500">Logged in as</p>
            <p className="font-semibold text-gray-900">{user.email}</p>
          </div>
        )}
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/photographers">
          <Button className="rounded-full px-6 py-6 h-12 bg-yellow-400 text-black hover:bg-yellow-500 font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
            📸 Book a Photographer
          </Button>
        </Link>
        <Button 
          variant="outline" 
          className="rounded-full px-6 py-6 h-12 border-2 border-yellow-400 text-black hover:bg-yellow-50 font-semibold shadow-md hover:shadow-lg transition-all"
        >
          📅 View My Bookings
        </Button>
      </div>
    </section>
  )
}