"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function SearchFilterSection() {
  const router = useRouter()
  const [categories, setCategories] = useState<any[]>([])
  const [photographers, setPhotographers] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedPhotographer, setSelectedPhotographer] = useState("")

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

    // Fetch approved photographers
    fetch('/api/photographers?approved=true')
      .then(res => res.json())
      .then(data => {
        if (data.photographers) {
          setPhotographers(data.photographers)
        }
      })
      .catch(err => console.error('Failed to fetch photographers:', err))
  }, [])

  const handleSearch = () => {
    // Build search params
    const params = new URLSearchParams()
    
    if (selectedCategory) {
      params.append('category', selectedCategory)
    }
    
    if (selectedPhotographer) {
      params.append('photographer', selectedPhotographer)
    }
    
    // Navigate to search results page
    if (params.toString()) {
      router.push(`/search?${params.toString()}`)
    }
  }

  return (
    <section className="bg-gradient-to-r from-orange-50 to-yellow-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900">
            Find Your Perfect Photographer
          </h2>
          
          <div className="flex flex-col md:flex-row gap-4 items-end">
            {/* Category Dropdown */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Photographer Dropdown */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Photographer
              </label>
              <select
                value={selectedPhotographer}
                onChange={(e) => setSelectedPhotographer(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900"
              >
                <option value="">All Photographers</option>
                {photographers.map((photographer) => (
                  <option key={photographer._id} value={photographer._id}>
                    {photographer.studioName || photographer.name || photographer.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Button */}
            <div className="w-full md:w-auto">
              <Button
                onClick={handleSearch}
                disabled={!selectedCategory && !selectedPhotographer}
                className="w-full md:w-auto bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed h-[50px]"
              >
                <Search className="w-5 h-5" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
