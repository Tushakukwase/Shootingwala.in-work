"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Photographer {
  _id: string
  name: string
  email: string
  phone: string
  location: string
  categories: string[]
  image: string
  description: string
  experience: number
  rating: number
  isVerified: boolean
  isApproved: boolean
  createdBy: 'admin' | 'self'
  startingPrice: number
  tags: string[]
  createdAt: string
}

export function Featured() {
  const [photographers, setPhotographers] = useState<Photographer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPhotographers()
  }, [])

  const fetchPhotographers = async () => {
    try {
      const response = await fetch('/api/photographers?approved=true')
      const data = await response.json()
      setPhotographers(data.photographers || [])
      setLoading(false)
    } catch (error) {
      // Silently handle error
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section aria-labelledby="featured" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 id="featured" className="text-xl font-bold text-black">
            ⭐ Recommended for you
          </h2>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading photographers...</p>
        </div>
      </section>
    )
  }

  return (
    <section aria-labelledby="featured" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 id="featured" className="text-xl font-bold text-black">
          ⭐ Recommended for you
        </h2>
        <Link href="/photographers">
          <Button 
            variant="ghost" 
            className="rounded-full text-black hover:bg-yellow-100 font-semibold"
          >
            See all →
          </Button>
        </Link>
      </div>
      
      {photographers.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No photographers available at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {photographers.slice(0, 8).map((p) => (
            <Card
              key={p._id}
              className="group overflow-hidden border-2 border-yellow-200 bg-white hover:border-yellow-400 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative h-40 w-full bg-yellow-50">
                <Image
                  src={p.image || `/placeholder.svg?height=160&width=320&query=photographer+studio`}
                  alt={`${p.name} studio banner`}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover"
                />
                {p.rating > 0 && (
                  <div className="absolute top-2 right-2 bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-bold">
                    ⭐ {p.rating.toFixed(1)}
                  </div>
                )}
              </div>
              
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-black">{p.name}</CardTitle>
                <p className="text-sm text-gray-600 font-medium">{p.location}</p>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2 text-xs">
                  {(p.tags || p.categories || []).slice(0, 3).map((t: string) => (
                    <span 
                      key={t} 
                      className="rounded-full bg-yellow-200 text-black px-3 py-1 font-semibold"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  {p.rating > 0 ? (
                    <span className="text-gray-600 font-medium">
                      {"⭐".repeat(Math.round(p.rating))} {p.rating.toFixed(1)}
                    </span>
                  ) : (
                    <span className="text-gray-500 font-medium text-xs">New Photographer</span>
                  )}
                  <span className="font-bold text-black">From ${p.startingPrice}</span>
                </div>
                
                <Button 
                  className={cn(
                    "w-full rounded-full mt-2 bg-yellow-400 text-black hover:bg-yellow-500 font-semibold transition-all hover:shadow-md focus-visible:ring-2 focus-visible:ring-yellow-400"
                  )}
                >
                  📞 Book Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}