"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, User, Calendar, Eye, EyeOff, CheckCircle, X, Trash2, Image as ImageIcon, Edit } from "lucide-react"

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
  onRefresh?: () => void
}

export default function GalleryDetailView({ categoryName, galleries: initialGalleries, onBack, onRefresh }: GalleryDetailViewProps) {
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null)
  const [editingGallery, setEditingGallery] = useState<Gallery | null>(null)
  const [galleries, setGalleries] = useState<Gallery[]>(initialGalleries)
  const [totalCount, setTotalCount] = useState(initialGalleries.length)
  const [pendingCount, setPendingCount] = useState(initialGalleries.filter(g => g.status === 'pending').length)
  const [approvedCount, setApprovedCount] = useState(initialGalleries.filter(g => g.status === 'approved').length)
  const [rejectedCount, setRejectedCount] = useState(initialGalleries.filter(g => g.status === 'rejected').length)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Update galleries and counts when initialGalleries prop changes
  useEffect(() => {
    setGalleries(initialGalleries)
    setTotalCount(initialGalleries.length)
    setPendingCount(initialGalleries.filter(g => g.status === 'pending').length)
    setApprovedCount(initialGalleries.filter(g => g.status === 'approved').length)
    setRejectedCount(initialGalleries.filter(g => g.status === 'rejected').length)
  }, [initialGalleries])

  // Update counts when galleries state changes
  useEffect(() => {
    setTotalCount(galleries.length)
    setPendingCount(galleries.filter(g => g.status === 'pending').length)
    setApprovedCount(galleries.filter(g => g.status === 'approved').length)
    setRejectedCount(galleries.filter(g => g.status === 'rejected').length)
  }, [galleries])

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
        alert('Gallery approved successfully!')
        // Update local state
        setGalleries(prevGalleries => 
          prevGalleries.map(gallery => 
            gallery.id === galleryId ? { ...gallery, status: 'approved' } : gallery
          )
        )
        // Call refresh callback if provided
        if (onRefresh) {
          onRefresh()
        }
      } else {
        const errorData = await response.json()
        alert(`Failed to approve gallery: ${errorData.error || 'Unknown error'}`)
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
        // Update local state
        setGalleries(prevGalleries => 
          prevGalleries.map(gallery => 
            gallery.id === galleryId ? { ...gallery, status: 'rejected' } : gallery
          )
        )
        // Call refresh callback if provided
        if (onRefresh) {
          onRefresh()
        }
      } else {
        const errorData = await response.json()
        alert(`Failed to reject gallery: ${errorData.error || 'Unknown error'}`)
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
        // Update local state
        setGalleries(prevGalleries => 
          prevGalleries.map(gallery => 
            gallery.id === galleryId ? { ...gallery, showOnHome: !currentStatus } : gallery
          )
        )
        // Call refresh callback if provided
        if (onRefresh) {
          onRefresh()
        }
      } else {
        const errorData = await response.json()
        alert(`Failed to update homepage status: ${errorData.error || 'Unknown error'}`)
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
        // Update local state
        setGalleries(prevGalleries => 
          prevGalleries.filter(gallery => gallery.id !== galleryId)
        )
        // Call refresh callback if provided
        if (onRefresh) {
          onRefresh()
        }
      } else {
        const errorData = await response.json()
        alert(`Failed to delete gallery: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting gallery:', error)
      alert('Failed to delete gallery')
    } finally {
      setActionLoading(null)
    }
  }

  const handleEdit = async (updatedGallery: Gallery) => {
    try {
      setActionLoading(updatedGallery.id)
      
      const response = await fetch('/api/photographer-galleries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: updatedGallery.id,
          name: updatedGallery.name,
          description: updatedGallery.description
        })
      })
      
      if (response.ok) {
        alert('Gallery updated successfully!')
        // Update local state
        setGalleries(prevGalleries => 
          prevGalleries.map(gallery => 
            gallery.id === updatedGallery.id ? updatedGallery : gallery
          )
        )
        setEditingGallery(null)
        // Call refresh callback if provided
        if (onRefresh) {
          onRefresh()
        }
      } else {
        const errorData = await response.json()
        alert(`Failed to update gallery: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error updating gallery:', error)
      alert('Failed to update gallery')
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
      
      {/* Count Boxes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <div className="bg-white rounded-lg p-4 text-center shadow-sm border">
          <div className="text-3xl font-bold text-black mb-1">{totalCount}</div>
          <div className="text-sm text-gray-600">Total Galleries</div>
        </div>
        <div className="bg-white rounded-lg p-4 text-center shadow-sm border">
          <div className="text-3xl font-bold text-orange-500 mb-1">{pendingCount}</div>
          <div className="text-sm text-gray-600">Pending Review</div>
        </div>
        <div className="bg-white rounded-lg p-4 text-center shadow-sm border">
          <div className="text-3xl font-bold text-green-600 mb-1">{approvedCount}</div>
          <div className="text-sm text-gray-600">Approved</div>
        </div>
        <div className="bg-white rounded-lg p-4 text-center shadow-sm border">
          <div className="text-3xl font-bold text-red-600 mb-1">{rejectedCount}</div>
          <div className="text-sm text-gray-600">Rejected</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {galleries.map((gallery) => (
          <div 
            key={gallery.id} 
            className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex flex-col h-full"
          >
            <div className="flex flex-col h-full">
              {/* Gallery Preview */}
              <div className="mb-3">
                {gallery.images.length > 0 ? (
                  <img
                    src={gallery.images[0]}
                    alt={gallery.name}
                    className="w-full h-32 object-cover rounded"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-gray-500 text-sm">No Image</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                  {gallery.images.length} images
                </div>
              </div>
              
              <div className="flex-1 space-y-2">
                <h4 className="font-semibold text-sm truncate">{gallery.name}</h4>
                
                <div className="flex justify-center">
                  {getStatusBadge(gallery.status)}
                </div>
                
                <div className="text-xs text-gray-500 text-center">
                  {new Date(gallery.createdAt).toLocaleDateString()}
                </div>
                
                <div className="text-xs text-gray-500 text-center truncate">
                  By {gallery.photographerName}
                  {gallery.created_by === 'admin' && (
                    <Badge variant="outline" className="ml-1 text-xs">Admin</Badge>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-1 flex-wrap mt-4">
                {/* View Details Button */}
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs px-2 py-1 flex-1"
                  onClick={() => setSelectedGallery(gallery)}
                  title="View All Images"
                >
                  <Eye className="w-3 h-3" />
                </Button>

                {/* Edit Button */}
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs px-2 py-1 flex-1"
                  onClick={() => setEditingGallery(gallery)}
                  title="Edit Gallery"
                >
                  <Edit className="w-3 h-3" />
                </Button>

                {/* Status Control Buttons */}
                {gallery.status === 'pending' && gallery.created_by === 'photographer' && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(gallery.id)}
                      disabled={actionLoading === gallery.id}
                      className="bg-green-600 hover:bg-green-700 text-xs px-2 py-1 flex-1"
                      title="Approve Gallery"
                    >
                      {actionLoading === gallery.id ? (
                        <div className="animate-spin rounded-full h-2 w-2 border-b-2 border-white"></div>
                      ) : (
                        <CheckCircle className="w-3 h-3" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(gallery.id)}
                      disabled={actionLoading === gallery.id}
                      className="text-xs px-2 py-1 flex-1"
                      title="Reject Gallery"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </>
                )}

                {gallery.status === 'rejected' && gallery.created_by === 'photographer' && (
                  <Button
                    size="sm"
                    onClick={() => handleApprove(gallery.id)}
                    disabled={actionLoading === gallery.id}
                    className="bg-green-600 hover:bg-green-700 text-xs px-2 py-1 flex-1"
                    title="Re-approve Gallery"
                  >
                    <CheckCircle className="w-3 h-3" />
                  </Button>
                )}

                {gallery.status === 'approved' && gallery.created_by === 'photographer' && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleReject(gallery.id)}
                    disabled={actionLoading === gallery.id}
                    className="text-xs px-2 py-1 flex-1"
                    title="Reject Gallery"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}

                {/* Homepage Toggle Button (only for approved galleries) */}
                {gallery.status === 'approved' && (
                  <Button
                    size="sm"
                    onClick={() => toggleHomepage(gallery.id, gallery.showOnHome)}
                    disabled={actionLoading === gallery.id}
                    className={`text-xs px-2 py-1 flex-1 ${
                      gallery.showOnHome 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-gray-600 hover:bg-gray-700'
                    }`}
                    title={gallery.showOnHome ? "Hide from Homepage" : "Show on Homepage"}
                  >
                    {gallery.showOnHome ? (
                      <EyeOff className="w-3 h-3" />
                    ) : (
                      <Eye className="w-3 h-3" />
                    )}
                  </Button>
                )}
                
                {/* Delete Button */}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(gallery.id)}
                  disabled={actionLoading === gallery.id}
                  className="text-xs px-2 py-1 flex-1"
                  title="Delete Gallery"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
      
      {/* Edit Gallery Modal */}
      {editingGallery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Edit Gallery</h3>
              <Button variant="ghost" onClick={() => setEditingGallery(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Gallery Name</label>
                <input
                  type="text"
                  value={editingGallery.name}
                  onChange={(e) => setEditingGallery(prev => prev ? {...prev, name: e.target.value} : null)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  placeholder="Enter gallery name"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={editingGallery.description || ''}
                  onChange={(e) => setEditingGallery(prev => prev ? {...prev, description: e.target.value} : null)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  placeholder="Enter gallery description"
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => handleEdit(editingGallery)}
                  className="flex-1"
                  disabled={!editingGallery.name.trim() || actionLoading === editingGallery.id}
                >
                  {actionLoading === editingGallery.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    'Update Gallery'
                  )}
                </Button>
                <Button variant="outline" onClick={() => setEditingGallery(null)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}