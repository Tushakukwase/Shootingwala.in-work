"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Image as ImageIcon, User, Calendar, Eye } from "lucide-react"

interface Gallery {
  id: string
  name: string
  description?: string
  images: string[]
  photographerId: string
  photographerName: string
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  showOnHome: boolean
  createdAt: string
  created_by?: string
}

interface GroupedGallery {
  categoryName: string
  galleries: Gallery[]
  totalImages: number
  sampleImage: string
  creators: string[]
}

interface GalleryCategoriesViewProps {
  onCategoryClick: (categoryName: string, galleries: Gallery[]) => void
  onBack?: () => void
}

export default function GalleryCategoriesView({ onCategoryClick, onBack }: GalleryCategoriesViewProps) {
  const [groupedGalleries, setGroupedGalleries] = useState<GroupedGallery[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGalleries()
  }, [])

  const loadGalleries = async () => {
    try {
      setLoading(true)
      
      // Load both admin galleries and photographer galleries
      const [adminGalleriesRes, photographerGalleriesRes] = await Promise.all([
        fetch('/api/galleries'),
        fetch('/api/photographer-galleries')
      ])
      
      const adminData = await adminGalleriesRes.json()
      const photographerData = await photographerGalleriesRes.json()
      
      const allGalleries: Gallery[] = []
      
      // Add admin galleries
      if (adminData.success && adminData.galleries) {
        const adminGalleries = adminData.galleries.map((gallery: any) => ({
          id: gallery._id,
          name: gallery.title || gallery.category || 'Untitled',
          description: gallery.description,
          images: gallery.images || [],
          photographerId: 'admin',
          photographerName: 'Admin',
          status: 'approved' as const,
          showOnHome: true,
          createdAt: gallery.createdAt,
          created_by: 'admin'
        }))
        allGalleries.push(...adminGalleries)
      }
      
      // Add photographer galleries
      if (photographerData.success && photographerData.galleries) {
        const photoGalleries = photographerData.galleries.map((gallery: any) => ({
          id: gallery.id,
          name: gallery.name,
          description: gallery.description,
          images: gallery.images || [],
          photographerId: gallery.photographerId,
          photographerName: gallery.photographerName || 'Photographer',
          status: gallery.status,
          showOnHome: gallery.showOnHome,
          createdAt: gallery.createdAt,
          created_by: 'photographer'
        }))
        allGalleries.push(...photoGalleries)
      }
      
      // Group galleries by category name
      const grouped = groupGalleriesByCategory(allGalleries)
      setGroupedGalleries(grouped)
      
    } catch (error) {
      console.error('Error loading galleries:', error)
    } finally {
      setLoading(false)
    }
  }

  const groupGalleriesByCategory = (galleries: Gallery[]): GroupedGallery[] => {
    const groups: { [key: string]: Gallery[] } = {}
    
    galleries.forEach(gallery => {
      const categoryName = gallery.name
      if (!groups[categoryName]) {
        groups[categoryName] = []
      }
      groups[categoryName].push(gallery)
    })
    
    return Object.entries(groups).map(([categoryName, galleries]) => {
      const allImages = galleries.flatMap(g => g.images)
      const creators = [...new Set(galleries.map(g => g.photographerName))]
      
      return {
        categoryName,
        galleries,
        totalImages: allImages.length,
        sampleImage: allImages[0] || '/placeholder.svg?height=200&width=200',
        creators
      }
    }).sort((a, b) => b.totalImages - a.totalImages) // Sort by image count
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 text-xs">Approved</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 text-xs">Pending</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 text-xs">Rejected</Badge>
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800 text-xs">Draft</Badge>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading galleries...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {onBack && (
        <Button variant="outline" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Gallery Manager
        </Button>
      )}
      
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gallery Categories</h2>
        <Badge variant="outline">{groupedGalleries.length} Categories</Badge>
      </div>

      {groupedGalleries.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Galleries Found</h3>
          <p className="text-gray-500">Create your first gallery to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groupedGalleries.map((group) => (
            <Card 
              key={group.categoryName} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => onCategoryClick(group.categoryName, group.galleries)}
            >
              <div className="relative h-48 bg-gray-100">
                <img
                  src={group.sampleImage}
                  alt={group.categoryName}
                  className="w-full h-full object-cover rounded-t-lg"
                />
                <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                  {group.totalImages} images
                </div>
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2">{group.categoryName}</h3>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    <span>{group.galleries.length} collection{group.galleries.length > 1 ? 's' : ''}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>
                      {group.creators.length === 1 
                        ? group.creators[0]
                        : `${group.creators.length} creators`
                      }
                    </span>
                  </div>
                </div>
                
                <div className="mt-3 flex flex-wrap gap-1">
                  {group.galleries.slice(0, 3).map((gallery) => (
                    <div key={gallery.id} className="flex items-center gap-1">
                      {getStatusBadge(gallery.status)}
                    </div>
                  ))}
                  {group.galleries.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{group.galleries.length - 3} more
                    </Badge>
                  )}
                </div>
                
                <Button className="w-full mt-3" variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  View Category
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}