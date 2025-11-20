"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import NextImage from "next/image"
import Link from "next/link"
import { Search, Tag } from "lucide-react"
import ClientCache from "@/lib/cache-utils"

interface Category {
  name: string
  photographerCount: number
  imageUrl?: string
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      // Check cache first
      const cacheKey = 'categories'
      const cachedData = ClientCache.get(cacheKey)
      if (cachedData) {
        setCategories(cachedData)
        setLoading(false)
        return
      }
      
      const response = await fetch('/api/categories')
      const data = await response.json()
      if (data.success) {
        setCategories(data.categories)
        // Cache the data for 5 minutes
        ClientCache.set(cacheKey, data.categories, 5 * 60 * 1000)
      } else {
        setError(data.error || 'Failed to load categories')
      }
    } catch (error: any) {
      console.error('Failed to fetch categories:', error)
      setError(error.message || 'Failed to connect to the database. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading categories...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Categories Unavailable</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Browse photographers by specialization and service categories
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <Card className="mb-8 shadow-lg">
          <CardContent className="p-6">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Categories Grid */}
        {filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No categories found</h3>
            <p className="text-gray-500">Try adjusting your search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredCategories.map((category, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="relative h-48 overflow-hidden">
                  <NextImage
                    src={category.imageUrl || "/placeholder.svg?height=200&width=300"}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-xl font-bold">{category.name}</h3>
                    <p className="text-sm">{category.photographerCount} photographers</p>
                  </div>
                </div>
                <CardContent className="p-4">
                  <Link href={`/photographers?category=${encodeURIComponent(category.name)}`}>
                    <Button className="w-full" variant="outline">
                      View Photographers
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}