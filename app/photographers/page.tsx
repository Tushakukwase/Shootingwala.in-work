"use client"

import { useState, useEffect } from "react"
import NextImage from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
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

export default function PhotographersPage() {
  const router = useRouter()
  const [photographers, setPhotographers] = useState<Photographer[]>([])
  const [filteredPhotographers, setFilteredPhotographers] = useState<Photographer[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filter states
  const [filterType, setFilterType] = useState("")
  const [filterCity, setFilterCity] = useState("")
  const [filterDate, setFilterDate] = useState("")
  const [filterPrice, setFilterPrice] = useState("")
  const [sortBy, setSortBy] = useState("")

  useEffect(() => {
    fetchPhotographers()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [photographers, filterType, filterCity, filterPrice, sortBy])

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

  const applyFilters = () => {
    let filtered = [...photographers]

    // Filter by type/category
    if (filterType) {
      filtered = filtered.filter(p => 
        p.categories.some(cat => cat.toLowerCase().includes(filterType.toLowerCase())) ||
        p.tags.some(tag => tag.toLowerCase().includes(filterType.toLowerCase()))
      )
    }

    // Filter by city/location
    if (filterCity) {
      filtered = filtered.filter(p => 
        p.location.toLowerCase().includes(filterCity.toLowerCase())
      )
    }

    // Filter by price
    if (filterPrice) {
      const maxPrice = parseInt(filterPrice.replace('$', ''))
      filtered = filtered.filter(p => p.startingPrice <= maxPrice)
    }

    // Sort
    if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating)
    } else if (sortBy === 'price') {
      filtered.sort((a, b) => a.startingPrice - b.startingPrice)
    } else if (sortBy === 'experience') {
      filtered.sort((a, b) => b.experience - a.experience)
    }

    setFilteredPhotographers(filtered)
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

      {/* Search & Filters */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-black">
              🔍 Search & Filters
            </h2>
            <Card className="p-4 border-2 border-yellow-200 bg-yellow-50/30">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <div className="grid gap-2">
                  <label className="text-xs font-semibold text-black" htmlFor="type">
                    Photography Type
                  </label>
                  <select
                    id="type"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="h-10 rounded-md border-2 border-yellow-200 bg-white px-3 focus:border-yellow-400 focus:ring-yellow-400"
                  >
                    <option value="">Any</option>
                    <option>Wedding</option>
                    <option>Event</option>
                    <option>Portrait</option>
                    <option>Product</option>
                  </select>
                </div>
                
                <div className="grid gap-2">
                  <label className="text-xs font-semibold text-black" htmlFor="city">
                    Location / City
                  </label>
                  <Input 
                    id="city" 
                    placeholder="e.g. Miami" 
                    value={filterCity} 
                    onChange={(e) => setFilterCity(e.target.value)}
                    className="border-2 border-yellow-200 focus:border-yellow-400 focus:ring-yellow-400"
                  />
                </div>
                
                <div className="grid gap-2">
                  <label className="text-xs font-semibold text-black" htmlFor="date">
                    Availability Date
                  </label>
                  <Input 
                    id="date" 
                    type="date" 
                    value={filterDate} 
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="border-2 border-yellow-200 focus:border-yellow-400 focus:ring-yellow-400"
                  />
                </div>
                
                <div className="grid gap-2">
                  <label className="text-xs font-semibold text-black" htmlFor="price">
                    Max Price
                  </label>
                  <select
                    id="price"
                    value={filterPrice}
                    onChange={(e) => setFilterPrice(e.target.value)}
                    className="h-10 rounded-md border-2 border-yellow-200 bg-white px-3 focus:border-yellow-400 focus:ring-yellow-400"
                  >
                    <option value="">Any</option>
                    <option value="100">$100</option>
                    <option value="250">$250</option>
                    <option value="500">$500</option>
                    <option value="1000">$1000</option>
                  </select>
                </div>
                
                <div className="flex items-end sm:col-span-2 lg:col-span-1">
                  <Button 
                    onClick={applyFilters}
                    className="w-full rounded-full bg-yellow-400 text-black hover:bg-yellow-500 font-semibold"
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
              
              <div className="mt-4 flex items-center gap-3 text-sm flex-wrap">
                <span className="font-semibold text-black w-full sm:w-auto mb-2 sm:mb-0">Sort by:</span>
                <div className="flex gap-2 flex-wrap">
                  <button 
                    onClick={() => setSortBy(sortBy === 'rating' ? '' : 'rating')}
                    className={`rounded-full px-4 py-2 font-medium transition ${
                      sortBy === 'rating' 
                        ? 'bg-yellow-400 text-black' 
                        : 'bg-yellow-200 hover:bg-yellow-300 text-black'
                    }`}
                  >
                    ⭐ Ratings
                  </button>
                  <button 
                    onClick={() => setSortBy(sortBy === 'price' ? '' : 'price')}
                    className={`rounded-full px-4 py-2 font-medium transition ${
                      sortBy === 'price' 
                        ? 'bg-yellow-400 text-black' 
                        : 'bg-yellow-200 hover:bg-yellow-300 text-black'
                    }`}
                  >
                    💰 Price
                  </button>
                  <button 
                    onClick={() => setSortBy(sortBy === 'experience' ? '' : 'experience')}
                    className={`rounded-full px-4 py-2 font-medium transition ${
                      sortBy === 'experience' 
                        ? 'bg-yellow-400 text-black' 
                        : 'bg-yellow-200 hover:bg-yellow-300 text-black'
                    }`}
                  >
                    🎯 Experience
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Photographers Grid */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredPhotographers.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredPhotographers.map((p) => (
                <Card
                  key={p._id}
                  className="group overflow-hidden border-2 border-yellow-200 bg-white hover:border-yellow-400 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative h-40 w-full bg-yellow-50">
                    <NextImage
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
                    
                    <div className="text-sm text-gray-600 line-clamp-2">
                      {p.description || "Professional photographer with years of experience."}
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
                    
                    <div className="text-xs text-gray-500">
                      {p.experience} years experience
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
                    setFilterType("")
                    setFilterCity("")
                    setFilterPrice("")
                    setSortBy("")
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