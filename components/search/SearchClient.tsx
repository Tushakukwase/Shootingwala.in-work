"use client"

import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Camera, MapPin, Star } from 'lucide-react'
import { PhotographerCard } from '@/components/photographer/photographer-card'
import ClientCache from "@/lib/cache-utils"
import { SimplePhotographerFilter } from '@/components/photographer/SimplePhotographerFilter'

export default function SearchClient() {
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState({
    category: '',
    city: '',
    priceRange: '',
    approved: ''
  })
  
  const [results, setResults] = useState<any>({
    photographers: [],
    loading: true
  })
  
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

  // Update filters when search params change
  useEffect(() => {
    setFilters({
      category: searchParams.get('category') || '',
      city: searchParams.get('city') || '',
      priceRange: searchParams.get('priceRange') || '',
      approved: searchParams.get('approved') || ''
    })
  }, [searchParams])

  // Fetch results when filters change
  useEffect(() => {
    fetchSearchResults()
  }, [filters])

  const fetchSearchResults = async () => {
    setResults({ ...results, loading: true })
    
    try {
      let photographers = []
      
      // Build query parameters
      const params = new URLSearchParams()
      if (filters.category) {
        params.append('category', filters.category)
      }
      if (filters.city) {
        params.append('city', filters.city)
      }
      if (filters.priceRange) {
        params.append('priceRange', filters.priceRange)
      }
      if (filters.approved) {
        params.append('approved', filters.approved)
      } else {
        // Default to approved photographers
        params.append('approved', 'true')
      }
      
      // Fetch photographers based on filters
      const cacheKey = `photographers-${filters.category}-${filters.city}-${filters.priceRange}-${filters.approved}`
      const cachedData = ClientCache.get(cacheKey)
      if (cachedData) {
        photographers = cachedData
      } else {
        const photographersRes = await fetch(`/api/photographers?${params.toString()}`)
        const photographersData = await photographersRes.json()
        photographers = photographersData.photographers || []
        // Cache the data for 2 minutes
        ClientCache.set(cacheKey, photographers, 2 * 60 * 1000)
      }
      
      setResults({
        photographers,
        loading: false
      })
    } catch (error) {
      console.error('Search error:', error)
      setResults({
        photographers: [],
        loading: false
      })
    }
  }

  const totalResults = results.photographers.length

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Photographer Filter */}
        <SimplePhotographerFilter />
        
        {/* Search Header */}
        <div className="mb-8 mt-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {filters.category || filters.city || filters.priceRange ? 
             `Photographers` : 
             'All Photographers'}
          </h1>
          <p className="text-gray-600">
            {results.loading ? 'Searching...' : `Found ${totalResults} photographers`}
          </p>
          
          {/* Active Filters */}
          {(filters.category || filters.city || filters.priceRange) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {filters.category && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                  Type: {filters.category}
                </span>
              )}
              {filters.city && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                  Location: {filters.city}
                </span>
              )}
              {filters.priceRange && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                  Price: {filters.priceRange}
                </span>
              )}
            </div>
          )}
        </div>

        {results.loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Searching...</p>
          </div>
        ) : totalResults === 0 ? (
          <div className="text-center py-12">
            <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No photographers found</h2>
            <p className="text-gray-500">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Photographers Results */}
            <section>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.photographers.map((photographer: any) => (
                  <PhotographerCard 
                    key={photographer._id} 
                    photographer={{
                      _id: photographer._id,
                      name: photographer.name,
                      studioName: photographer.studioName || photographer.name,
                      studioBannerImage: photographer.profileImage || photographer.studioBannerImage || photographer.image,
                      location: photographer.location || photographer.city || 'Location not specified',
                      rating: photographer.rating || 0,
                      totalReviews: photographer.totalReviews || 0,
                      startingPrice: photographer.startingPrice || photographer.minPrice,
                      isVerified: photographer.isVerified || false,
                      specializations: photographer.categories || photographer.specializations || photographer.tags || [],
                      experience: photographer.experience || 0
                    }} 
                  />
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}