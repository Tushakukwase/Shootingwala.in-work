"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Image as ImageIcon, User, Search } from "lucide-react"
import NextImage from "next/image"
import Link from "next/link"
import ClientCache from "@/lib/cache-utils"

interface GalleryCategory {
  name: string
  imageCount: number
  sampleImage: string
  allImages: string[]
  sources: string[]
}

export default function GalleryListPage() {
  const router = useRouter()
  const [galleryCategories, setGalleryCategories] = useState<GalleryCategory[]>([])
  const [filteredCategories, setFilteredCategories] = useState<GalleryCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  
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
    loadGalleryCategories()
  }, [])

  // Filter categories based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCategories(galleryCategories)
    } else {
      const filtered = galleryCategories.filter(category => 
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredCategories(filtered)
    }
  }, [searchQuery, galleryCategories])

  const loadGalleryCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Check cache first
      const cacheKey = 'gallery-categories'
      const cachedData = ClientCache.get(cacheKey)
      if (cachedData) {
        setGalleryCategories(Array.isArray(cachedData) ? cachedData : [])
        return
      }
      
      // Fetch both admin galleries and photographer galleries
      const [adminImagesRes, adminCategoriesRes, photographerGalleriesRes] = await Promise.all([
        fetch('/api/gallery/images'),
        fetch('/api/gallery/categories'),
        fetch('/api/photographer-galleries')
      ])
      
      const adminImagesData = await adminImagesRes.json()
      const adminCategoriesData = await adminCategoriesRes.json()
      const photographerGalleriesData = await photographerGalleriesRes.json()
      
      // Group all galleries by name to avoid duplicates
      const allGalleryData: { [key: string]: { images: string[], sources: string[] } } = {}
      
      // Add admin categories
      if (adminCategoriesData.categories && adminImagesData.images) {
        adminCategoriesData.categories.forEach((cat: any) => {
          const categoryImages = adminImagesData.images.filter((img: any) => img.category === cat.name)
          if (categoryImages.length > 0) {
            if (!allGalleryData[cat.name]) {
              allGalleryData[cat.name] = { images: [], sources: [] }
            }
            allGalleryData[cat.name].images.push(...categoryImages.map((img: any) => img.imageUrl))
            allGalleryData[cat.name].sources.push('Admin')
          }
        })
      }
      
      // Add photographer galleries (remove the showOnHome filter)
      if (photographerGalleriesData.success && photographerGalleriesData.galleries) {
        photographerGalleriesData.galleries
          .filter((gallery: any) => gallery.status === 'approved') // Only filter by approved status
          .forEach((gallery: any) => {
            if (gallery.images && gallery.images.length > 0) {
              if (!allGalleryData[gallery.name]) {
                allGalleryData[gallery.name] = { images: [], sources: [] }
              }
              allGalleryData[gallery.name].images.push(...gallery.images)
              allGalleryData[gallery.name].sources.push(gallery.photographerName || 'Photographer')
            }
          })
      }
      
      // Convert to array format for display
      const groupedGalleries = Object.entries(allGalleryData).map(([name, data]) => ({
        name,
        imageCount: data.images.length,
        sampleImage: data.images[0] || '/placeholder.svg?height=200&width=200',
        allImages: data.images,
        sources: [...new Set(data.sources)] // Remove duplicate sources
      }))
      
      setGalleryCategories(groupedGalleries)
      setFilteredCategories(groupedGalleries)
      
      // Cache the data for 5 minutes
      ClientCache.set(cacheKey, groupedGalleries, 5 * 60 * 1000)
      
    } catch (error: any) {
      console.error('Error loading gallery categories:', error)
      setError(error.message || 'Failed to load gallery categories')
      setGalleryCategories([]) // Ensure it's always an array
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Filtering is handled by the useEffect above
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading galleries...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Galleries Unavailable</h2>
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => router.push('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gallery Collections</h1>
                <p className="text-gray-600 mt-1">Browse our photography collections</p>
              </div>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              {Array.isArray(filteredCategories) ? filteredCategories.length : 0} collections
            </Badge>
          </div>
          
          {/* Search Bar - Only for Gallery Page */}
          <div className="mt-6">
            <form onSubmit={handleSearch} className="max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search galleries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!Array.isArray(filteredCategories) || filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Galleries Available</h2>
            <p className="text-gray-600">Check back later for new gallery collections.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCategories.map((category, index) => (
              <Link
                key={index}
                href={`/gallery/${encodeURIComponent(category.name.toLowerCase().replace(/\s+/g, '-'))}`}
                className="block"
              >
                <Card className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group">
                  <CardContent className="p-0">
                    <div className="relative h-48 overflow-hidden">
                      <NextImage
                        src={category.sampleImage}
                        alt={category.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
                      <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                        {category.imageCount} images
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">{category.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span>{category.sources.join(', ')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}