"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from "react"
import { Plus, Image, Trash2, CheckCircle, X, User, Calendar, Eye, Upload, Edit, Grid, List, EyeOff } from "lucide-react"
import GalleryCategoriesView from "./gallery-categories-view"
import GalleryDetailView from "./gallery-detail-view"

interface Gallery {
  id: string
  name: string
  images: string[]
  photographerId: string
  photographerName: string
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  showOnHome: boolean
  createdAt: string
  approved_by?: string
  approved_by_name?: string
  approved_at?: string
  request_date?: string
}

export default function GalleryManager() {
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingGallery, setEditingGallery] = useState<Gallery | null>(null)
  const [uploading, setUploading] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'categories' | 'detail'>('list')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedGalleries, setSelectedGalleries] = useState<Gallery[]>([])
  const [showGrouped, setShowGrouped] = useState(false)
  const [newGallery, setNewGallery] = useState({
    name: '',
    description: '',
    image_url: '',
    images: [] as string[]
  })
  const [availableCategories, setAvailableCategories] = useState<string[]>([
    'Wedding Photography',
    'Portrait Photography', 
    'Event Photography',
    'Fashion Photography',
    'Nature Photography',
    'Street Photography',
    'Product Photography',
    'Architecture Photography'
  ])
  const [showCustomName, setShowCustomName] = useState(false)

  useEffect(() => {
    loadGalleries()
    markGalleriesAsViewed()
  }, [])

  const markGalleriesAsViewed = async () => {
    try {
      await fetch('/api/photographer-galleries/mark-viewed', { method: 'POST' })
    } catch (error) {
      console.error('Error marking galleries as viewed:', error)
    }
  }

  const loadGalleries = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/photographer-galleries')
      const data = await response.json()
      
      if (data.success) {
        setGalleries(data.galleries)
      }
    } catch (error) {
      console.error('Error loading galleries:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (files: FileList) => {
    try {
      setUploading(true)
      const uploadedImages: string[] = []
      
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue
        
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', 'gallery')
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        
        const data = await response.json()
        if (data.success) {
          uploadedImages.push(data.data.url)
        }
      }
      
      setNewGallery(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedImages],
        image_url: prev.image_url || uploadedImages[0] || ''
      }))
    } catch (error) {
      console.error('Error uploading images:', error)
      alert('Failed to upload images')
    } finally {
      setUploading(false)
    }
  }

  const handleAddGallery = async () => {
    if (!newGallery.name.trim()) return
    
    try {
      const response = await fetch('/api/photographer-galleries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newGallery.name,
          description: newGallery.description,
          images: newGallery.images,
          photographerId: 'admin',
          photographerName: 'Admin'
        })
      })
      
      const data = await response.json()
      if (data.success) {
        loadGalleries()
        
        // Add new category to available categories if it's custom
        if (showCustomName && newGallery.name.trim() && !availableCategories.includes(newGallery.name.trim())) {
          setAvailableCategories(prev => [...prev, newGallery.name.trim()])
        }
        
        setNewGallery({ name: '', description: '', image_url: '', images: [] })
        setShowCustomName(false)
        setShowAddModal(false)
        alert('Gallery created successfully!')
      }
    } catch (error) {
      console.error('Error adding gallery:', error)
      alert('Failed to add gallery')
    }
  }

  const handleEditGallery = async () => {
    if (!editingGallery || !editingGallery.name.trim()) return
    
    try {
      const response = await fetch('/api/photographer-galleries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingGallery.id,
          name: editingGallery.name,
          description: editingGallery.description || '',
          images: editingGallery.images
        })
      })
      
      const data = await response.json()
      if (data.success) {
        loadGalleries()
        setEditingGallery(null)
        setShowEditModal(false)
        alert('Gallery updated successfully!')
      }
    } catch (error) {
      console.error('Error updating gallery:', error)
      alert('Failed to update gallery')
    }
  }

  const handleApprove = async (galleryId: string) => {
    try {
      setActionLoading(galleryId)
      
      const gallery = galleries.find(g => g.id === galleryId)
      
      const response = await fetch('/api/photographer-galleries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: galleryId,
          status: 'approved',
          approved_by: 'admin',
          approved_by_name: 'Admin',
          showOnHome: false // Don't automatically show on homepage
        })
      })
      
      const data = await response.json()
      if (data.success) {
        // Mark admin notification as resolved
        const notificationsResponse = await fetch('/api/notifications')
        const notificationsData = await notificationsResponse.json()

        if (notificationsData.success) {
          const request = notificationsData.notifications.find((n: any) =>
            n.type === 'gallery_homepage_request' && n.relatedId === galleryId
          )

          if (request) {
            // Mark admin notification as resolved
            await fetch('/api/notifications', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: request.id,
                actionRequired: false,
                read: true
              })
            })

            // Send approval notification to photographer
            if (gallery && gallery.photographerId) {
              await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'gallery_approved',
                  title: 'Gallery Approved!',
                  message: `Your gallery "${gallery.name}" has been approved and is ready to be featured!`,
                  userId: gallery.photographerId,
                  relatedId: galleryId,
                  actionRequired: false
                })
              })
            }
          }
        }
        
        loadGalleries()
        alert('Gallery approved! Use "Show on Homepage" button to display it on homepage.')
      }
    } catch (error) {
      console.error('Error approving gallery:', error)
      alert('Failed to approve gallery')
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleHomepage = async (galleryId: string, currentStatus: boolean) => {
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
      
      const data = await response.json()
      if (data.success) {
        loadGalleries()
        alert(currentStatus ? 'Gallery removed from homepage!' : 'Gallery added to homepage!')
      }
    } catch (error) {
      console.error('Error toggling homepage status:', error)
      alert('Failed to update homepage status')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (galleryId: string) => {
    try {
      setActionLoading(galleryId)
      
      const gallery = galleries.find(g => g.id === galleryId)
      
      const response = await fetch('/api/photographer-galleries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: galleryId,
          status: 'rejected',
          approved_by: 'admin',
          approved_by_name: 'Admin',
          showOnHome: false
        })
      })
      
      const data = await response.json()
      if (data.success) {
        // Mark admin notification as resolved
        const notificationsResponse = await fetch('/api/notifications')
        const notificationsData = await notificationsResponse.json()

        if (notificationsData.success) {
          const request = notificationsData.notifications.find((n: any) =>
            n.type === 'gallery_homepage_request' && n.relatedId === galleryId
          )

          if (request) {
            // Mark admin notification as resolved
            await fetch('/api/notifications', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: request.id,
                actionRequired: false,
                read: true
              })
            })

            // Send rejection notification to photographer
            if (gallery && gallery.photographerId) {
              await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'gallery_rejected',
                  title: 'Gallery Request Rejected',
                  message: `Your homepage request for gallery "${gallery.name}" has been rejected. You can make improvements and request again.`,
                  userId: gallery.photographerId,
                  relatedId: galleryId,
                  actionRequired: false
                })
              })
            }
          }
        }
        
        loadGalleries()
        alert('Gallery rejected')
      }
    } catch (error) {
      console.error('Error rejecting gallery:', error)
      alert('Failed to reject gallery')
    } finally {
      setActionLoading(null)
    }
  }

  const removeImage = (imageUrl: string) => {
    setNewGallery(prev => ({
      ...prev,
      images: prev.images.filter(img => img !== imageUrl),
      image_url: prev.images.filter(img => img !== imageUrl)[0] || ''
    }))
  }

  const handleDelete = async (galleryId: string) => {
    if (!confirm('Are you sure you want to permanently delete this gallery? This action cannot be undone.')) return
    
    try {
      setActionLoading(galleryId)
      
      const response = await fetch(`/api/photographer-galleries?id=${galleryId}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      if (data.success) {
        loadGalleries()
        alert('Gallery deleted successfully')
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
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  const filteredGalleries = galleries.filter(gallery => {
    // Only show admin-created galleries and photographer galleries that have requested homepage (pending/approved/rejected)
    const isAdminGallery = !gallery.photographerId || gallery.photographerId === 'admin'
    const isPhotographerRequestedGallery = gallery.status !== 'draft' && gallery.photographerId && gallery.photographerId !== 'admin'
    
    // Don't show photographer draft galleries in admin panel
    if (!isAdminGallery && !isPhotographerRequestedGallery) return false
    
    if (filter === 'pending') return gallery.status === 'pending'
    if (filter === 'approved') return gallery.status === 'approved'
    if (filter === 'rejected') return gallery.status === 'rejected'
    if (filter === 'draft') return gallery.status === 'draft' && isAdminGallery // Only admin drafts
    if (filter === 'admin') return isAdminGallery
    if (filter === 'photographer') return isPhotographerRequestedGallery
    return isAdminGallery || isPhotographerRequestedGallery
  })

  // Only count galleries that should be visible to admin
  const visibleGalleries = galleries.filter(gallery => {
    const isAdminGallery = !gallery.photographerId || gallery.photographerId === 'admin'
    const isPhotographerRequestedGallery = gallery.status !== 'draft' && gallery.photographerId && gallery.photographerId !== 'admin'
    return isAdminGallery || isPhotographerRequestedGallery
  })
  
  const pendingCount = visibleGalleries.filter(g => g.status === 'pending').length
  const approvedCount = visibleGalleries.filter(g => g.status === 'approved').length
  const totalCount = visibleGalleries.length

  // Handle different view modes
  if (viewMode === 'categories') {
    return (
      <GalleryCategoriesView
        onCategoryClick={(categoryName, galleries) => {
          setSelectedCategory(categoryName)
          setSelectedGalleries(galleries)
          setViewMode('detail')
        }}
        onBack={() => setViewMode('list')}
      />
    )
  }

  if (viewMode === 'detail') {
    return (
      <GalleryDetailView
        categoryName={selectedCategory}
        galleries={selectedGalleries}
        onBack={() => setViewMode('categories')}
      />
    )
  }

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5 text-blue-600" />
            Gallery Management
            {pendingCount > 0 && (
              <Badge variant="destructive">{pendingCount} Pending</Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-muted p-1 rounded-lg">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="px-3 py-1"
              >
                <List className="w-4 h-4 mr-1" />
                List
              </Button>
              <Button
                variant={viewMode === 'categories' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('categories')}
                className="px-3 py-1"
              >
                <Grid className="w-4 h-4 mr-1" />
                Categories
              </Button>
            </div>
            <Button onClick={() => setShowAddModal(true)} className="bg-primary text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Add Gallery
            </Button>
          </div>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-1 bg-muted p-1 rounded-lg">
          {[
            { key: 'all', label: `All (${totalCount})` },
            { key: 'pending', label: `Pending (${pendingCount})` },
            { key: 'approved', label: `Approved (${approvedCount})` },
            { key: 'rejected', label: `Rejected (${visibleGalleries.filter(g => g.status === 'rejected').length})` },
            { key: 'admin', label: `Admin (${visibleGalleries.filter(g => !g.photographerId || g.photographerId === 'admin').length})` },
            { key: 'photographer', label: `Photographer (${visibleGalleries.filter(g => g.status !== 'draft' && g.photographerId && g.photographerId !== 'admin').length})` }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading galleries...</p>
          </div>
        ) : filteredGalleries.length === 0 ? (
          <div className="text-center py-8">
            <Image className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Galleries Found</h3>
            <p className="text-muted-foreground">
              {filter === 'pending' 
                ? "No galleries are pending approval."
                : filter === 'approved'
                ? "No galleries have been approved yet."
                : "No galleries have been created yet."
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredGalleries.map((gallery) => (
              <div key={gallery.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex flex-col h-full">
                  {/* Gallery Preview */}
                  <div className="mb-3">
                    {gallery.images.length > 0 ? (
                      <img src={gallery.images[0]} alt={gallery.name} className="w-full h-32 object-cover rounded" />
                    ) : (
                      <div className="w-full h-32 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-gray-500 text-sm">No Image</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-1 mb-2 flex-wrap">
                      <h4 className="font-semibold text-sm truncate">{gallery.name}</h4>
                      {getStatusBadge(gallery.status)}
                    </div>
                    
                    <div className="mb-2">
                      {gallery.showOnHome ? (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          <Eye className="w-3 h-3 mr-1" />
                          On Homepage
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-600 text-xs">
                          Not on Homepage
                        </Badge>
                      )}
                    </div>
                      
                    <div className="text-xs text-gray-600 mb-2">
                      <div className="flex items-center gap-1 mb-1">
                        <User className="w-3 h-3" />
                        <span className="truncate">{gallery.photographerName || 'Admin'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>{gallery.images.length} images</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-1 flex-wrap mt-auto">
                    {/* Approval/Rejection Buttons */}
                    {gallery.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-xs px-2 py-1"
                          onClick={() => handleApprove(gallery.id)}
                          disabled={actionLoading === gallery.id}
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
                          className="text-xs px-2 py-1"
                          onClick={() => handleReject(gallery.id)}
                          disabled={actionLoading === gallery.id}
                          title="Reject Gallery"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </>
                    )}

                    {/* Status Change Buttons (for approved/rejected) */}
                    {gallery.status === 'approved' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="text-xs px-2 py-1"
                        onClick={() => handleReject(gallery.id)}
                        disabled={actionLoading === gallery.id}
                        title="Reject Gallery"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}

                    {gallery.status === 'rejected' && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-xs px-2 py-1"
                        onClick={() => handleApprove(gallery.id)}
                        disabled={actionLoading === gallery.id}
                        title="Approve Gallery"
                      >
                        <CheckCircle className="w-3 h-3" />
                      </Button>
                    )}

                    {/* Homepage Toggle Button (only for approved galleries) */}
                    {gallery.status === 'approved' && (
                      <Button
                        size="sm"
                        className={gallery.showOnHome ? "bg-blue-600 hover:bg-blue-700 text-xs px-2 py-1" : "bg-gray-600 hover:bg-gray-700 text-xs px-2 py-1"}
                        onClick={() => handleToggleHomepage(gallery.id, gallery.showOnHome)}
                        disabled={actionLoading === gallery.id}
                        title={gallery.showOnHome ? "Remove from Homepage" : "Show on Homepage"}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                    )}
                    
                    {/* Edit Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs px-2 py-1"
                      onClick={() => {
                        setEditingGallery(gallery)
                        setShowEditModal(true)
                      }}
                      disabled={actionLoading === gallery.id}
                      title="Edit Gallery"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    
                    {/* Delete Button (Admin only) */}
                    <Button
                      size="sm"
                      variant="destructive"
                      className="text-xs px-2 py-1"
                      onClick={() => handleDelete(gallery.id)}
                      disabled={actionLoading === gallery.id}
                      title="Delete Gallery"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>

    {/* Add Gallery Modal */}
    {showAddModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Add New Gallery</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Gallery Name</Label>
              {!showCustomName ? (
                <div className="space-y-2">
                  <select
                    value={newGallery.name}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setShowCustomName(true)
                        setNewGallery(prev => ({ ...prev, name: '' }))
                      } else {
                        setNewGallery(prev => ({ ...prev, name: e.target.value }))
                      }
                    }}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="">Select a category</option>
                    {availableCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                    <option value="custom">+ Add Custom Category</option>
                  </select>
                </div>
              ) : (
                <div className="space-y-2">
                  <Input
                    value={newGallery.name}
                    onChange={(e) => setNewGallery(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter custom category name"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowCustomName(false)
                      setNewGallery(prev => ({ ...prev, name: '' }))
                    }}
                  >
                    Back to Selection
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newGallery.description}
                onChange={(e) => setNewGallery(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter gallery description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Upload Images</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                  className="hidden"
                  id="gallery-upload"
                />
                <label htmlFor="gallery-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {uploading ? 'Uploading...' : 'Click to upload images or drag and drop'}
                  </p>
                </label>
              </div>
            </div>

            {newGallery.images.length > 0 && (
              <div className="space-y-2">
                <Label>Uploaded Images ({newGallery.images.length})</Label>
                <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                  {newGallery.images.map((image, idx) => (
                    <div key={idx} className="relative">
                      <img src={image} alt="" className="w-full h-20 object-cover rounded" />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-1 right-1 w-6 h-6 p-0"
                        onClick={() => removeImage(image)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleAddGallery} 
                className="flex-1"
                disabled={!newGallery.name.trim() || uploading}
              >
                Create Gallery
              </Button>
              <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )}

    {/* Edit Gallery Modal */}
    {showEditModal && editingGallery && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Edit Gallery</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowEditModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Gallery Name</Label>
              <Input
                value={editingGallery.name}
                onChange={(e) => setEditingGallery(prev => prev ? { ...prev, name: e.target.value } : null)}
                placeholder="Enter gallery name"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={editingGallery.description || ''}
                onChange={(e) => setEditingGallery(prev => prev ? { ...prev, description: e.target.value } : null)}
                placeholder="Enter gallery description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Current Images ({editingGallery.images.length})</Label>
              <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                {editingGallery.images.map((image, idx) => (
                  <div key={idx} className="relative">
                    <img src={image} alt="" className="w-full h-20 object-cover rounded" />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleEditGallery} 
                className="flex-1"
                disabled={!editingGallery.name.trim()}
              >
                Update Gallery
              </Button>
              <Button variant="outline" onClick={() => setShowEditModal(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )}
    </>
  )
}