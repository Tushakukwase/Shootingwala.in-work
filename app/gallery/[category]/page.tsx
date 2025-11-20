"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Image as ImageIcon, 
  User, 
  X,
  Heart,
  MessageCircle
} from "lucide-react"
import NextImage from "next/image"
import Link from "next/link"
import LikeCommentButtons from "@/components/gallery/like-comment-buttons"
import ClientCache from "@/lib/cache-utils"

interface GalleryImageData {
  url: string
  photographerId?: string
  photographerName?: string
  source: 'admin' | 'photographer'
}

interface GalleryData {
  name: string
  images: GalleryImageData[]
  sources: string[]
  totalImages: number
}

interface RelatedGallery {
  id: string
  name: string
  imageCount: number
  sampleImage: string
}

export default function GalleryPage() {
  const params = useParams()
  const router = useRouter()
  const [galleryData, setGalleryData] = useState<GalleryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<GalleryImageData | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number>(0)
  const [relatedGalleries, setRelatedGalleries] = useState<RelatedGallery[]>([])
  
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
    if (params.category) {
      loadGalleryData(params.category as string)
    }
  }, [params.category])

  useEffect(() => {
    loadRelatedGalleries()
  }, [])

  const loadGalleryData = async (categorySlug: string) => {
    try {
      setLoading(true)
      
      // Check cache first
      const cacheKey = `gallery-${categorySlug}`
      const cachedData = ClientCache.get(cacheKey)
      if (cachedData) {
        setGalleryData(cachedData)
        return
      }
      
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
      
      const allImages: GalleryImageData[] = []
      const sources: string[] = []
      
      // Get admin images for this category
      if (adminImagesData.images && adminCategoriesData.categories) {
        const matchingCategory = adminCategoriesData.categories.find((cat: any) => 
          cat.name.toLowerCase() === categoryName.toLowerCase()
        )
        
        if (matchingCategory) {
          const categoryImages = adminImagesData.images
            .filter((img: any) => img.category === matchingCategory.name)
            .map((img: any) => ({
              url: img.imageUrl,
              photographerId: null,
              photographerName: 'Admin',
              source: 'admin' as const
            }))
          
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
            const photographerImages = gallery.images.map((imageUrl: string) => ({
              url: imageUrl,
              photographerId: gallery.photographerId,
              photographerName: gallery.photographerName || 'Photographer',
              source: 'photographer' as const
            }))
            allImages.push(...photographerImages)
            sources.push(gallery.photographerName || 'Photographer')
          }
        })
      }
      
      const galleryResult = {
        name: categoryName,
        images: allImages,
        sources: [...new Set(sources)],
        totalImages: allImages.length
      }
      
      setGalleryData(galleryResult)
      
      // Cache the data for 5 minutes
      ClientCache.set(cacheKey, galleryResult, 5 * 60 * 1000)
      
    } catch (error) {
      console.error('Error loading gallery data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadRelatedGalleries = async () => {
    try {
      // Fetch all gallery categories
      const [adminCategoriesRes, photographerGalleriesRes] = await Promise.all([
        fetch('/api/gallery/categories'),
        fetch('/api/photographer-galleries')
      ])
      
      const adminCategoriesData = await adminCategoriesRes.json()
      const photographerGalleriesData = await photographerGalleriesRes.json()
      
      const allRelatedGalleries: RelatedGallery[] = []
      
      // Get current category name
      const currentCategoryName = params.category 
        ? (params.category as string).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        : ''
      
      // Add admin categories (excluding current category)
      if (adminCategoriesData.categories) {
        adminCategoriesData.categories
          .filter((category: any) => category.name.toLowerCase() !== currentCategoryName.toLowerCase())
          .slice(0, 4)
          .forEach((category: any) => {
            allRelatedGalleries.push({
              id: `admin-${category.name}`,
              name: category.name,
              imageCount: category.imageCount,
              sampleImage: category.sampleImage
            })
          })
      }
      
      // Add photographer galleries (excluding current category)
      if (photographerGalleriesData.success && photographerGalleriesData.galleries) {
        // Get unique gallery names (excluding current category)
        const uniqueGalleryNames = [...new Set(photographerGalleriesData.galleries
          .filter((g: any) => 
            g.status === 'approved' && 
            g.showOnHome && 
            g.name.toLowerCase() !== currentCategoryName.toLowerCase()
          )
          .map((g: any) => g.name))] as string[]
        
        // Add up to 4 unique gallery names
        uniqueGalleryNames.slice(0, 4 - allRelatedGalleries.length).forEach((name: string) => {
          const matchingGalleries = photographerGalleriesData.galleries.filter((g: any) => 
            g.name === name && g.status === 'approved' && g.showOnHome
          )
          
          if (matchingGalleries.length > 0) {
            const totalImages = matchingGalleries.reduce((sum: number, g: any) => sum + (g.images?.length || 0), 0)
            const sampleImage = matchingGalleries[0].images?.[0] || '/placeholder.svg'
            
            allRelatedGalleries.push({
              id: `photographer-${name}`,
              name: name,
              imageCount: totalImages,
              sampleImage: sampleImage
            })
          }
        })
      }
      
      setRelatedGalleries(allRelatedGalleries)
      
    } catch (error) {
      console.error('Error loading related galleries:', error)
    }
  }

  const openImageModal = (image: GalleryImageData, index: number) => {
    setSelectedImage(image)
    setSelectedIndex(index)
  }

  const closeImageModal = () => {
    setSelectedImage(null)
    setSelectedIndex(0)
  }

  const navigateImage = (direction: 'prev' | 'next') => {
    if (!galleryData) return
    
    const newIndex = direction === 'prev' 
      ? (selectedIndex - 1 + galleryData.images.length) % galleryData.images.length
      : (selectedIndex + 1) % galleryData.images.length
      
    setSelectedIndex(newIndex)
    setSelectedImage(galleryData.images[newIndex])
  }

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

  if (!galleryData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Gallery Not Found</h2>
          <p className="text-gray-600 mb-6">The gallery you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push('/gallery')}>
            Browse All Galleries
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => router.push('/gallery')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Galleries
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{galleryData.name}</h1>
                <div className="flex items-center gap-4 mt-1 text-gray-600">
                  <span>{galleryData.totalImages} images</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{galleryData.sources.join(', ')}</span>
                  </div>
                </div>
              </div>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              {galleryData.totalImages} images
            </Badge>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {galleryData.images.map((image, index) => (
            <div 
              key={index} 
              className="break-inside-avoid cursor-pointer group"
              onClick={() => openImageModal(image, index)}
            >
              <Card className="overflow-hidden hover:shadow-xl transition-shadow">
                <CardContent className="p-0 relative">
                  <div className="relative h-64 overflow-hidden">
                    <NextImage
                      src={image.url}
                      alt={`${galleryData.name} - Image ${index + 1}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="capitalize">{image.source}</span>
                      {image.photographerName && (
                        <span className="truncate">{image.photographerName}</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Related Galleries */}
      {relatedGalleries.length > 0 && (
        <section className="py-12 bg-white border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Related Galleries</h2>
              <p className="text-gray-600 mt-2">Explore more photography collections</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedGalleries.map((gallery) => (
                <Link
                  key={gallery.id}
                  href={`/gallery/${encodeURIComponent(gallery.name.toLowerCase().replace(/\s+/g, '-'))}`}
                  className="block"
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardContent className="p-0">
                      <div className="relative h-32 overflow-hidden">
                        <NextImage
                          src={gallery.sampleImage}
                          alt={gallery.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
                        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                          {gallery.imageCount}
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-gray-900 truncate">{gallery.name}</h3>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-6xl max-h-full w-full h-full">
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
            
            <button
              onClick={() => navigateImage('prev')}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-colors"
              aria-label="Previous image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={() => navigateImage('next')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-colors"
              aria-label="Next image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            <div className="relative w-full h-full flex items-center justify-center">
              <NextImage
                src={selectedImage.url}
                alt={`${galleryData.name} - Image ${selectedIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-sm">
              {selectedIndex + 1} of {galleryData.images.length}
            </div>
            
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
              <LikeCommentButtons 
                imageId={selectedImage.url} 
                userId={selectedImage.photographerId || ''}
                userName={selectedImage.photographerName || 'Photographer'}
              />
              {selectedImage.photographerName && (
                <div className="flex items-center gap-2 bg-black bg-opacity-50 text-white px-3 py-2 rounded-full">
                  <User className="w-4 h-4" />
                  <span className="text-sm">{selectedImage.photographerName}</span>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  )
}