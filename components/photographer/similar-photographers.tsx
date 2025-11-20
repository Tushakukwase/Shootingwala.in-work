"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PhotographerCard } from "@/components/photographer/photographer-card"
import Link from "next/link"
import ClientCache from "@/lib/cache-utils"

interface SimilarPhotographer {
  _id: string
  name: string
  studioName?: string
  studioBannerImage?: string
  location: string
  categories?: string[]
  tags?: string[]
  rating: number
  totalReviews: number
  startingPrice?: number
  isVerified: boolean
  experience?: number
}

interface SimilarPhotographersProps {
  currentPhotographerId: string
}

export default function SimilarPhotographers({ currentPhotographerId }: SimilarPhotographersProps) {
  const [photographers, setPhotographers] = useState<SimilarPhotographer[]>([])
  const [loading, setLoading] = useState(true)
  const [visiblePhotographers, setVisiblePhotographers] = useState<SimilarPhotographer[]>([])

  useEffect(() => {
    fetchSimilarPhotographers()
  }, [currentPhotographerId])

  const fetchSimilarPhotographers = async () => {
    try {
      setLoading(true)
      
      // Check client-side cache first
      const cacheKey = `similar-photographers-${currentPhotographerId}`
      const cachedData = ClientCache.get(cacheKey)
      if (cachedData) {
        setPhotographers(cachedData.photographers)
        setVisiblePhotographers(cachedData.visiblePhotographers)
        return
      }
      
      // Try to fetch real photographers first
      try {
        const response = await fetch('/api/photographers?approved=true&limit=12')
        const data = await response.json()
        
        if (data.success && data.photographers && data.photographers.length > 0) {
          const realPhotographers = data.photographers
            .filter((p: any) => p._id !== currentPhotographerId)
            .slice(0, 12)
            .map((p: any) => ({
              _id: p._id,
              name: p.name,
              studioName: p.studioName || p.name,
              studioBannerImage: p.studioBannerImage || p.bannerImage || p.image,
              location: p.location || 'Location not specified',
              categories: p.categories || [],
              tags: p.tags || [],
              rating: p.rating || 0,
              totalReviews: p.totalReviews || 0,
              startingPrice: p.startingPrice,
              isVerified: p.isVerified || false,
              experience: p.experience || 0
            }))
          
          if (realPhotographers.length > 0) {
            const visible = realPhotographers.slice(0, 4)
            setPhotographers(realPhotographers)
            setVisiblePhotographers(visible)
            
            // Cache the data for 2 minutes
            ClientCache.set(cacheKey, {
              photographers: realPhotographers,
              visiblePhotographers: visible
            }, 2 * 60 * 1000)
            return
          }
        }
      } catch (apiError) {
        console.log('Failed to fetch real photographers, using mock data')
      }
      
      // No fallback data - only show real photographers
      setPhotographers([])
      setVisiblePhotographers([])
    } catch (error) {
      console.error("Error fetching similar photographers:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Similar Photographers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Similar Photographers</h2>
        <Link href="/photographers">
          <Button variant="outline" size="sm">
            View All
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {visiblePhotographers.map((photographer, index) => (
          <motion.div
            key={photographer._id}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <PhotographerCard 
              photographer={{
                _id: photographer._id,
                name: photographer.name,
                studioName: photographer.studioName,
                studioBannerImage: photographer.studioBannerImage,
                location: photographer.location,
                rating: photographer.rating,
                totalReviews: photographer.totalReviews,
                startingPrice: photographer.startingPrice,
                isVerified: photographer.isVerified,
                specializations: photographer.tags || photographer.categories || [],
                experience: photographer.experience
              }} 
            />
          </motion.div>
        ))}
      </div>

      {/* Browse More */}
      <div className="text-center pt-6">
        <Link href="/photographers">
          <Button variant="outline" size="lg">
            Browse More Photographers
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </motion.div>
  )
}