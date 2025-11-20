"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Filter, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"

export function PhotographerFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [categories, setCategories] = useState<any[]>([])
  const [cities, setCities] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedPriceRange, setSelectedPriceRange] = useState("")
  
  // Search states
  const [categorySearch, setCategorySearch] = useState("")
  const [citySearch, setCitySearch] = useState("")
  
  // Dropdown open states
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false)
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false)
  
  // Filtered lists
  const [filteredCategories, setFilteredCategories] = useState<any[]>([])
  const [filteredCities, setFilteredCities] = useState<any[]>([])
  
  // Refs for dropdowns
  const categoryDropdownRef = useRef<HTMLDivElement>(null)
  const cityDropdownRef = useRef<HTMLDivElement>(null)
  
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
          setFilteredCategories(data.categories)
        }
      })
      .catch(err => console.error('Failed to fetch categories:', err))

    // Fetch cities
    fetch('/api/cities')
      .then(res => res.json())
      .then(data => {
        if (data.cities) {
          setCities(data.cities)
          setFilteredCities(data.cities)
        }
      })
      .catch(err => console.error('Failed to fetch cities:', err))
      
    // Set initial values from URL params
    setSelectedCategory(searchParams.get('category') || "")
    setSelectedCity(searchParams.get('city') || "")
    setSelectedPriceRange(searchParams.get('priceRange') || "")
  }, [])

  // Filter categories based on search term
  useEffect(() => {
    if (categorySearch.trim() === "") {
      setFilteredCategories(categories)
    } else {
      const filtered = categories.filter(category => 
        category.name.toLowerCase().includes(categorySearch.toLowerCase())
      )
      setFilteredCategories(filtered)
    }
  }, [categorySearch, categories])

  // Filter cities based on search term
  useEffect(() => {
    if (citySearch.trim() === "") {
      setFilteredCities(cities)
    } else {
      const filtered = cities.filter(city => 
        city.name.toLowerCase().includes(citySearch.toLowerCase())
      )
      setFilteredCities(filtered)
    }
  }, [citySearch, cities])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false)
      }
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
        setIsCityDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
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
    setCategorySearch("")
    setCitySearch("")
    
    // Navigate to search page with no filters
    router.push('/search')
  }

  // Get display text for category dropdown
  const getCategoryDisplayText = () => {
    if (selectedCategory) {
      return selectedCategory
    }
    return "All Types"
  }

  // Get display text for city dropdown
  const getCityDisplayText = () => {
    if (selectedCity) {
      return selectedCity
    }
    return "All Cities"
  }

  return (
    <section className="bg-gradient-to-r from-orange-50 to-yellow-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            {/* Category Custom Dropdown with Search */}
            <div className="flex-1" ref={categoryDropdownRef}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Photographer Type
              </label>
              <div className="relative">
                <button
                  type="button"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900 text-left flex justify-between items-center"
                  onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                >
                  <span className="truncate">{getCategoryDisplayText()}</span>
                  <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isCategoryDropdownOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
                    {/* Search Input */}
                    <div className="p-2 border-b border-gray-200">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search categories..."
                          value={categorySearch}
                          onChange={(e) => setCategorySearch(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                        {categorySearch && (
                          <button
                            onClick={() => setCategorySearch("")}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            <X className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Options */}
                    <div className="py-1">
                      <button
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-orange-50 ${!selectedCategory ? 'bg-orange-50 font-medium' : ''}`}
                        onClick={() => {
                          setSelectedCategory("")
                          setIsCategoryDropdownOpen(false)
                        }}
                      >
                        All Types
                      </button>
                      {filteredCategories.map((category) => (
                        <button
                          key={category._id}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-orange-50 truncate ${selectedCategory === category.name ? 'bg-orange-50 font-medium' : ''}`}
                          onClick={() => {
                            setSelectedCategory(category.name)
                            setIsCategoryDropdownOpen(false)
                          }}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* City Custom Dropdown with Search */}
            <div className="flex-1" ref={cityDropdownRef}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location
              </label>
              <div className="relative">
                <button
                  type="button"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900 text-left flex justify-between items-center"
                  onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                >
                  <span className="truncate">{getCityDisplayText()}</span>
                  <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${isCityDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isCityDropdownOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
                    {/* Search Input */}
                    <div className="p-2 border-b border-gray-200">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search cities..."
                          value={citySearch}
                          onChange={(e) => setCitySearch(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                        {citySearch && (
                          <button
                            onClick={() => setCitySearch("")}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            <X className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Options */}
                    <div className="py-1">
                      <button
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-orange-50 ${!selectedCity ? 'bg-orange-50 font-medium' : ''}`}
                        onClick={() => {
                          setSelectedCity("")
                          setIsCityDropdownOpen(false)
                        }}
                      >
                        All Cities
                      </button>
                      {filteredCities.map((city) => (
                        <button
                          key={city._id}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-orange-50 truncate ${selectedCity === city.name ? 'bg-orange-50 font-medium' : ''}`}
                          onClick={() => {
                            setSelectedCity(city.name)
                            setIsCityDropdownOpen(false)
                          }}
                        >
                          {city.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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