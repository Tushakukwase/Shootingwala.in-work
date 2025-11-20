"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Image as ImageIcon, User, X } from "lucide-react"
import NextImage from "next/image"

interface GalleryData {
  name: string
  images: string[]
  sources: string[]
  totalImages: number
}

export default function GalleryPage() {
  const params = useParams()
  const router = useRouter()
  const [galleryData, setGalleryData] = useState<GalleryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number>(0)

  useEffect(() => {
    if (params.category) {
      loadGalleryData(params.category as string)
    }
  }, [params.category])

  const loadGalleryData = async (categorySlug: string) => {
    try {
      setLoading(true)
      
      // Convert slug back to category name
      const categoryName = categorySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      
      // Fetch both admin galleries and photographer galleries
      const [adminImagesRes, adminCategoriesRes, photographerGalleriesRes] = await Promise.all([
        fetch('/api/gallery/images'),
        fetch('/api/gallery/categories'),
        fetch('/api/photographer-galleries')
      ])
      
      const adminImagesData = await adminImagesRes.json()
      const adminCategoriesData = await adminCategoriesRes.json()
      const photographerGalleriesData = await photographerGalleriesRes.json()
      
      const allImages: string[] = []
      const sources: string[] = []
      
      // Get admin images for this category
      if (adminImagesData.images && adminCategoriesData.categories) {
        const matchingCategory = adminCategoriesData.categories.find((cat: any) => 
          cat.name.toLowerCase() === categoryName.toLowerCase()
        )
        
        if (matchingCategory) {
          const categoryImages = adminImagesData.images
            .filter((img: any) => img.category === matchingCategory.name)
            .map((img: any) => img.imageUrl)
          
          allImages.push(...categoryImages)
          if (categoryImages.length > 0) {
            sources.push('Admin')
          }
        }
      }
      
      // Get photographer galleries for this category
      if (photographerGalleriesData.success && photographerGalleriesData.galleries) {
        const matchingGalleries = photographerGalleriesData.galleries.filter((gallery: any) => 
          gallery.name.toLowerCase() === categoryName.toLowerCase() && 
          gallery.status === 'approved' && 
          gallery.showOnHome
        )
        
        matchingGalleries.forEach((gallery: any) => {
          if (gallery.images && gallery.images.length > 0) {
            allImages.push(...gallery.images)
            sources.push(gallery.photographerName || 'Photographer')
          }
        })
      }
      
      setGalleryData({
        name: categoryName,
        images: allImages,
        sources: [...new Set(sources)],
        totalImages: allImages.length
      })
      
    } catch (error) {
      console.error('Error loading gallery data:', error)
    } finally {
      setLoading(false)
    }
  }

  const openImageModal = (image: string, index: number) => {
    setSelectedImage(image)
    setSelectedIndex(index)
  }

  const closeImageModal = () => {
    setSelectedImage(null)
    setSelectedIndex(0)
  }

  const navigateImage = (direction: 'prev' | 'next') => {
    if (!galleryData) return
    
    let newIndex = selectedIndex
    if (direction === 'prev') {
      newIndex = selectedIndex > 0 ? selectedIndex - 1 : galleryData.images.length - 1
    } else {
      newIndex = selectedIndex < galleryData.images.length - 1 ? selectedIndex + 1 : 0
    }
    
    setSelectedIndex(newIndex)
    setSelectedImage(galleryData.images[newIndex])
  }

  const handleKeyPress = (e: KeyboardEvent) => {
    if (selectedImage) {
      if (e.key === 'ArrowLeft') navigateImage('prev')
      if (e.key === 'ArrowRight') navigateImage('next')
      if (e.key === 'Escape') closeImageModal()
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [selectedImage, selectedIndex])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading gallery...</p>
        </div>
      </div>
    )
  }

  if (!galleryData || galleryData.images.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Gallery Not Found</h2>
          <p className="text-gray-600 mb-6">The requested gallery could not be found or has no images.</p>
          <Button onClick={() => router.push('/')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
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
                <h1 className="text-3xl font-bold text-gray-900">{galleryData.name}</h1>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    {galleryData.totalImages} images
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {galleryData.sources.join(', ')}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {galleryData.images.map((image, index) => (
            <Card 
              key={index} 
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"
              onClick={() => openImageModal(image, index)}
            >
              <CardContent className="p-0">
                <div className="relative aspect-square">
                  <NextImage
                    src={image}
                    alt={`${galleryData.name} ${index + 1}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white bg-opacity-90 rounded-full p-2">
                        <ImageIcon className="w-5 h-5 text-gray-700" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={closeImageModal}
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white hover:bg-black hover:bg-opacity-70"
            >
              <X className="w-5 h-5" />
            </Button>
            
            {/* Navigation Buttons */}
            {galleryData.images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateImage('prev')}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white hover:bg-black hover:bg-opacity-70"
                >
                  ←
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateImage('next')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white hover:bg-black hover:bg-opacity-70"
                >
                  →
                </Button>
              </>
            )}
            
            {/* Image */}
            <div className="relative max-h-[80vh] max-w-full">
              <NextImage
                src={selectedImage}
                alt={`${galleryData.name} ${selectedIndex + 1}`}
                width={800}
                height={600}
                className="object-contain max-h-[80vh] w-auto"
                priority
              />
            </div>
            
            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
              {selectedIndex + 1} of {galleryData.images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}