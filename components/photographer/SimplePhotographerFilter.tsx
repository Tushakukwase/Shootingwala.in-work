"use client"

import { useState, useEffect } from "react"
import { Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"

export function SimplePhotographerFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [categories, setCategories] = useState<any[]>([])
  const [cities, setCities] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedPriceRange, setSelectedPriceRange] = useState("")
  
  // Price range options
  const priceRanges = [
    { id: "low", label: "Under ₹500", min: 0, max: 500 },
    { id: "medium", label: "₹500 - ₹1500", min: 500, max: 1500 },
    { id: "high", label: "₹1500 - ₹5000", min: 1500, max: 5000 },
    { id: "premium", label: "Above ₹5000", min: 5000, max: 999999 }
  ]

  useEffect(() => {
    // Fetch categories
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.categories) {
          setCategories(data.categories)
        }
      })
      .catch(err => console.error('Failed to fetch categories:', err))

    // Fetch cities
    fetch('/api/cities')
      .then(res => res.json())
      .then(data => {
        if (data.cities) {
          setCities(data.cities)
        }
      })
      .catch(err => console.error('Failed to fetch cities:', err))
      
    // Set initial values from URL params
    setSelectedCategory(searchParams.get('category') || "")
    setSelectedCity(searchParams.get('city') || "")
    setSelectedPriceRange(searchParams.get('priceRange') || "")
  }, [])

  const handleSearch = () => {
    // Build search params
    const params = new URLSearchParams()
    
    if (selectedCategory) {
      params.append('category', selectedCategory)
    }
    
    if (selectedCity) {
      params.append('city', selectedCity)
    }
    
    if (selectedPriceRange) {
      params.append('priceRange', selectedPriceRange)
    }
    
    // Always show approved photographers
    params.append('approved', 'true')
    
    // Navigate to search results page
    router.push(`/search?${params.toString()}`)
  }

  const handleReset = () => {
    setSelectedCategory("")
    setSelectedCity("")
    setSelectedPriceRange("")
    
    // Navigate to search page with no filters
    router.push('/search')
  }

  return (
    <section className="bg-gradient-to-r from-orange-50 to-yellow-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            {/* Category Dropdown */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Photographer Type
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900"
              >
                <option value="">All Types</option>
                {categories.map((category) => (
                  <option key={category._id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* City Dropdown */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900"
              >
                <option value="">All Cities</option>
                {cities.map((city) => (
                  <option key={city._id} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Dropdown */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Price Range
              </label>
              <select
                value={selectedPriceRange}
                onChange={(e) => setSelectedPriceRange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900"
              >
                <option value="">Any Price</option>
                {priceRanges.map((range) => (
                  <option key={range.id} value={range.id}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Button */}
            <div className="flex gap-2">
              <Button
                onClick={handleSearch}
                className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 h-[50px]"
              >
                <Search className="w-5 h-5" />
                Search
              </Button>
              
              <Button
                onClick={handleReset}
                variant="outline"
                className="border-orange-500 text-orange-500 hover:bg-orange-50 font-semibold px-4 py-3 rounded-lg h-[50px]"
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}