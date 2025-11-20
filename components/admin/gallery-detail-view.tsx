"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, User, Calendar, Eye, EyeOff, CheckCircle, X, Trash2, Image as ImageIcon } from "lucide-react"

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

interface GalleryDetailViewProps {
  categoryName: string
  galleries: Gallery[]
  onBack: () => void
}

export default function GalleryDetailView({ categoryName, galleries, onBack }: GalleryDetailViewProps) {
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const handleApprove = async (galleryId: string) => {
    try {
      setActionLoading(galleryId)
      
      const response = await fetch('/api/photographer-galleries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: galleryId,
          status: 'approved',
          approved_by: 'admin',
          approved_by_name: 'Admin'
        })
      })
      
      if (response.ok) {
        // Update local state
        const updatedGalleries = galleries.map(g => 
          g.id === galleryId ? { ...g, status: 'approved' as const } : g
        )
        // You might want to call a parent callback here to update the galleries
        alert('Gallery approved successfully!')
      }
    } catch (error) {
      console.error('Error approving gallery:', error)
      alert('Failed to approve gallery')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (galleryId: string) => {
    try {
      setActionLoading(galleryId)
      
      const response = await fetch('/api/photographer-galleries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: galleryId,
          status: 'rejected',
          approved_by: 'admin',
          approved_by_name: 'Admin'
        })
      })
      
      if (response.ok) {
        alert('Gallery rejected')
      }
    } catch (error) {
      console.error('Error rejecting gallery:', error)
      alert('Failed to reject gallery')
    } finally {
      setActionLoading(null)
    }
  }

  const toggleHomepage = async (galleryId: string, currentStatus: boolean) => {
    try {
      setActionLoading(galleryId)
      
      const response = await fetch('/api/photographer-galleries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: galleryId,
          showOnHome: !currentStatus
        })
      })
      
      if (response.ok) {
        alert(currentStatus ? 'Removed from homepage' : 'Added to homepage')
      }
    } catch (error) {
      console.error('Error toggling homepage:', error)
      alert('Failed to update homepage status')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (galleryId: string) => {
    if (!confirm('Are you sure you want to delete this gallery?')) return
    
    try {
      setActionLoading(galleryId)
      
      const response = await fetch(`/api/photographer-galleries?id=${galleryId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        alert('Gallery deleted successfully')
        // You might want to call a parent callback here to refresh the data
      }
    } catch (error) {
      console.error('Error deleting gallery:', error)
      alert('Failed to delete gallery')
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Eye className="w-3 h-3 mr-1" />Pending</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><X className="w-3 h-3 mr-1" />Rejected</Badge>
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>
      default:
        return null
    }
  }

  const totalImages = galleries.reduce((sum, gallery) => sum + gallery.images.length, 0)
  const creators = [...new Set(galleries.map(g => g.photographerName))]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Categories
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{categoryName}</h2>
            <p className="text-gray-600">
              {galleries.length} collection{galleries.length > 1 ? 's' : ''} • {totalImages} images • {creators.join(', ')}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {galleries.map((gallery) => (
          <Card key={gallery.id} className="overflow-hidden">
            <div className="relative h-48 bg-gray-100">
              {gallery.images.length > 0 ? (
                <img
                  src={gallery.images[0]}
                  alt={gallery.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                {gallery.images.length} images
              </div>
            </div>
            
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold truncate">{gallery.name}</h3>
                {getStatusBadge(gallery.status)}
              </div>
              
              <div className="space-y-2 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="truncate">
                    {gallery.photographerName}
                    {gallery.created_by === 'admin' && (
                      <Badge variant="outline" className="ml-2 text-xs">Admin</Badge>
                    )}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(gallery.createdAt).toLocaleDateString()}</span>
                </div>
                
                {gallery.showOnHome && (
                  <div className="flex items-center gap-2 text-green-600">
                    <Eye className="w-4 h-4" />
                    <span>Shown on Homepage</span>
                  </div>
                )}
              </div>
              
              {gallery.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{gallery.description}</p>
              )}
              
              <div className="flex flex-wrap gap-2">
                {/* Status Control Buttons */}
                {gallery.status === 'pending' && gallery.created_by === 'photographer' && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(gallery.id)}
                      disabled={actionLoading === gallery.id}
                      className="bg-green-600 hover:bg-green-700 text-xs px-2 py-1"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(gallery.id)}
                      disabled={actionLoading === gallery.id}
                      className="text-xs px-2 py-1"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Reject
                    </Button>
                  </>
                )}
                
                {gallery.status === 'rejected' && gallery.created_by === 'photographer' && (
                  <Button
                    size="sm"
                    onClick={() => handleApprove(gallery.id)}
                    disabled={actionLoading === gallery.id}
                    className="bg-green-600 hover:bg-green-700 text-xs px-2 py-1"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Re-approve
                  </Button>
                )}
                
                {gallery.status === 'approved' && gallery.created_by === 'photographer' && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleReject(gallery.id)}
                    disabled={actionLoading === gallery.id}
                    className="text-xs px-2 py-1"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Reject
                  </Button>
                )}
                
                {/* Homepage Toggle Button (only for approved galleries) */}
                {gallery.status === 'approved' && (
                  <Button
                    size="sm"
                    onClick={() => toggleHomepage(gallery.id, gallery.showOnHome)}
                    disabled={actionLoading === gallery.id}
                    className={`text-xs px-2 py-1 ${
                      gallery.showOnHome 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-gray-600 hover:bg-gray-700'
                    }`}
                  >
                    {gallery.showOnHome ? (
                      <>
                        <EyeOff className="w-3 h-3 mr-1" />
                        Hide
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3 mr-1" />
                        Show
                      </>
                    )}
                  </Button>
                )}
                
                {/* Delete Button */}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(gallery.id)}
                  disabled={actionLoading === gallery.id}
                  className="text-xs px-2 py-1"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </Button>
                
                {/* View Images Button */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedGallery(gallery)}
                  className="text-xs px-2 py-1"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View All
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Image Gallery Modal */}
      {selectedGallery && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{selectedGallery.name}</h3>
                <p className="text-sm text-gray-600">by {selectedGallery.photographerName}</p>
              </div>
              <Button variant="ghost" onClick={() => setSelectedGallery(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {selectedGallery.images.map((image, index) => (
                  <div key={index} className="aspect-square bg-gray-100 rounded overflow-hidden">
                    <img
                      src={image}
                      alt={`${selectedGallery.name} ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}