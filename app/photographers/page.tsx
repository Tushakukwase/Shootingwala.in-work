"use client"

import { useState, useEffect, useRef } from "react"
import NextImage from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { PhotographerCard } from "@/components/photographer/photographer-card"
import ClientCache from "@/lib/cache-utils"
import { PhotographerFilter } from "@/components/photographer/PhotographerFilter"

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
  // Additional properties that might be present
  studioName?: string
  studioBannerImage?: string
  bannerImage?: string
  totalReviews?: number
}

export default function PhotographersPage() {
  const router = useRouter()
  const [photographers, setPhotographers] = useState<Photographer[]>([])
  const [filteredPhotographers, setFilteredPhotographers] = useState<Photographer[]>([])
  const [loading, setLoading] = useState(true)
  
  // Scroll position preservation
  const scrollPositions = useRef<Record<string, number>>({
    window: 0
  });

  // Save scroll positions before component unmounts
  useEffect(() => {
    const saveScrollPositions = () => {
      scrollPositions.current = {
        window: window.scrollY
      };
    };

    // Save positions when navigating away
    window.addEventListener('beforeunload', saveScrollPositions);
    
    return () => {
      window.removeEventListener('beforeunload', saveScrollPositions);
    };
  }, []);

  // Restore scroll positions after component mounts
  useEffect(() => {
    // Restore scroll positions
    if (scrollPositions.current.window > 0) {
      window.scrollTo(0, scrollPositions.current.window);
    }
  }, []);

  useEffect(() => {
    fetchPhotographers()
  }, [])

  const fetchPhotographers = async () => {
    try {
      // Check cache first
      const cacheKey = 'approved-photographers'
      const cachedData = ClientCache.get(cacheKey)
      if (cachedData) {
        setPhotographers(cachedData)
        setFilteredPhotographers(cachedData)
        return
      }
      
      const response = await fetch('/api/photographers?approved=true')
      const data = await response.json()
      setPhotographers(data.photographers || [])
      setFilteredPhotographers(data.photographers || [])
      
      // Cache the data for 5 minutes
      ClientCache.set(cacheKey, data.photographers || [], 5 * 60 * 1000)
    } catch (error) {
      // Silently handle error
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.back()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading photographers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">All Photographers</h1>
              <p className="text-gray-600 mt-1">
                {filteredPhotographers.length} photographer{filteredPhotographers.length !== 1 ? 's' : ''} available
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Photographer Filter */}
      <PhotographerFilter />

      {/* Photographers Grid */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredPhotographers.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredPhotographers.map((p) => (
                <PhotographerCard 
                  key={p._id}
                  photographer={{
                    _id: p._id,
                    name: p.name,
                    studioName: p.studioName || p.name,
                    studioBannerImage: p.studioBannerImage || p.bannerImage || p.image,
                    location: p.location || 'Location not specified',
                    rating: p.rating || 0,
                    totalReviews: p.totalReviews || 0,
                    startingPrice: p.startingPrice,
                    isVerified: p.isVerified || false,
                    specializations: p.tags || p.categories || [],
                    experience: p.experience || 0
                  }} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Photographers Found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search criteria to find photographers.
                </p>
                <Button 
                  onClick={() => {
                    // Reset filters by reloading the page
                    window.location.reload()
                  }}
                  variant="outline"
                >
                  Clear All Filters
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}