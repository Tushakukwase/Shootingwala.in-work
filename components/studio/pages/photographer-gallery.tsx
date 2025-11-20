"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { Plus, Camera, Upload, X, Edit, Trash2, CheckCircle } from "lucide-react"

interface GalleryCategory {
  id: string
  name: string
  description?: string
  images: string[]
  photographerId: string
  status: 'pending' | 'approved' | 'rejected'
  showOnHome: boolean
  createdAt: string
  approvedAt?: string
}

export default function PhotographerGallery() {
  const [categories, setCategories] = useState<GalleryCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<GalleryCategory | null>(null)
  const [photographerId, setPhotographerId] = useState<string>('')
  const [photographerName, setPhotographerName] = useState<string>('')
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
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
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    // Get photographer data from localStorage
    const studioData = localStorage.getItem('studio')
    if (studioData) {
      try {
        const parsed = JSON.parse(studioData)
        setPhotographerId(parsed._id)
        setPhotographerName(parsed.name || parsed.photographerName || 'Photographer')
        loadCategories(parsed._id)
      } catch (error) {
        console.error('Error parsing studio data:', error)
      }
    }
  }, [])

  const loadCategories = async (photographerId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/photographer-galleries?photographerId=${photographerId}`)
      const data = await response.json()
      
      if (data.success) {
        setCategories(data.galleries)
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (files: FileList, isEdit = false) => {
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
      
      if (isEdit && editingCategory) {
        setEditingCategory(prev => prev ? {
          ...prev,
          images: [...prev.images, ...uploadedImages]
        } : null)
      } else {
        setNewCategory(prev => ({
          ...prev,
          images: [...prev.images, ...uploadedImages]
        }))
      }
    } catch (error) {
      console.error('Error uploading images:', error)
      alert('Failed to upload images')
    } finally {
      setUploading(false)
    }
  }

  const handleAddCategory = async () => {
    if (!newCategory.name.trim() || newCategory.images.length === 0) return
    
    try {
      const response = await fetch('/api/photographer-galleries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategory.name.trim(),
          description: newCategory.description.trim(),
          images: newCategory.images,
          photographerId,
          photographerName
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setCategories(prev => [data.gallery, ...prev])
        
        // Add new category to available categories if it's custom
        if (showCustomName && newCategory.name.trim() && !availableCategories.includes(newCategory.name.trim())) {
          setAvailableCategories(prev => [...prev, newCategory.name.trim()])
        }
        
        setNewCategory({ name: '', description: '', images: [] })
        setShowCustomName(false)
        setShowAddModal(false)
        alert('Gallery category created successfully!')
      }
    } catch (error) {
      console.error('Error adding category:', error)
      alert('Failed to add category')
    }
  }

  const handleEditCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) return
    
    try {
      const response = await fetch('/api/photographer-galleries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingCategory.id,
          name: editingCategory.name.trim(),
          description: editingCategory.description?.trim() || '',
          images: editingCategory.images
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setCategories(prev => 
          prev.map(cat => cat.id === editingCategory.id ? data.gallery : cat)
        )
        setEditingCategory(null)
        setShowEditModal(false)
        alert('Gallery updated successfully!')
      }
    } catch (error) {
      console.error('Error updating category:', error)
      alert('Failed to update category')
    }
  }

  const requestHomepageDisplay = async (categoryId: string) => {
    try {
      const response = await fetch('/api/photographer-galleries/homepage-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          galleryId: categoryId,
          photographerId,
          photographerName
        })
      })
      
      const data = await response.json()
      if (data.success) {
        // Refresh the categories list to show updated status
        if (photographerId) {
          loadCategories(photographerId)
        }
        alert('Homepage feature request sent to admin for approval!')
      } else {
        alert(data.error || 'Failed to send request')
      }
    } catch (error) {
      console.error('Error requesting homepage display:', error)
      alert('Failed to send request')
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this gallery category?')) return
    
    try {
      const response = await fetch(`/api/photographer-galleries?id=${categoryId}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      if (data.success) {
        setCategories(prev => prev.filter(cat => cat.id !== categoryId))
        alert('Gallery category deleted successfully!')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Failed to delete category')
    }
  }

  const removeImage = (imageUrl: string, isEdit = false) => {
    if (isEdit && editingCategory) {
      setEditingCategory(prev => prev ? {
        ...prev,
        images: prev.images.filter(img => img !== imageUrl)
      } : null)
    } else {
      setNewCategory(prev => ({
        ...prev,
        images: prev.images.filter(img => img !== imageUrl)
      }))
    }
  }



  const homepageCategories = categories.filter(c => c.showOnHome)

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">My Gallery</h1>
        <Button onClick={() => setShowAddModal(true)} className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Add Gallery Category
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{categories.length}</div>
            <div className="text-sm text-muted-foreground">Total Categories</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {categories.reduce((sum, cat) => sum + cat.images.length, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Images</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{homepageCategories.length}</div>
            <div className="text-sm text-muted-foreground">Featured on Homepage</div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading gallery...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* All Gallery Categories */}
          {categories.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-blue-600" />
                  My Gallery Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map(category => (
                    <div key={category.id} className="border border-gray-200 bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{category.name}</h3>
                        {category.status === 'draft' && (
                          <Badge className="bg-gray-100 text-gray-800">
                            Draft
                          </Badge>
                        )}
                        {category.status === 'pending' && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            Pending Approval
                          </Badge>
                        )}
                        {category.status === 'approved' && category.showOnHome && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            On Homepage
                          </Badge>
                        )}
                        {category.status === 'rejected' && (
                          <Badge className="bg-red-100 text-red-800">
                            Rejected
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {category.images.slice(0, 3).map((image, idx) => (
                          <img key={idx} src={image} alt="" className="w-full h-16 object-cover rounded" />
                        ))}
                        {category.images.length > 3 && (
                          <div className="w-full h-16 bg-gray-200 rounded flex items-center justify-center text-sm">
                            +{category.images.length - 3}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2 flex-wrap">
                        <Button size="sm" variant="outline" onClick={() => {
                          setEditingCategory(category)
                          setShowEditModal(true)
                        }}>
                          <Edit className="w-3 h-3 mr-1" />Edit
                        </Button>
                        
                        {category.status === 'draft' ? (
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => requestHomepageDisplay(category.id)}>
                            Request Homepage Feature
                          </Button>
                        ) : category.status === 'pending' ? (
                          <Button size="sm" variant="outline" disabled className="bg-yellow-100 text-yellow-800">
                            Request Pending...
                          </Button>
                        ) : category.status === 'approved' && category.showOnHome ? (
                          <Button size="sm" variant="outline" disabled className="bg-green-100 text-green-800">
                            Featured on Homepage ✓
                          </Button>
                        ) : category.status === 'rejected' ? (
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => requestHomepageDisplay(category.id)}>
                            Request Again
                          </Button>
                        ) : (
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => requestHomepageDisplay(category.id)}>
                            Request Homepage Feature
                          </Button>
                        )}
                        
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteCategory(category.id)}>
                          <Trash2 className="w-3 h-3 mr-1" />Delete
                        </Button>
                        

                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-12">
              <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Gallery Categories Yet</h3>
              <p className="text-muted-foreground mb-4">Create your first gallery category to showcase your work</p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Gallery Category
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Add Gallery Category</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Category Name</Label>
                {!showCustomName ? (
                  <div className="space-y-2">
                    <select
                      value={newCategory.name}
                      onChange={(e) => {
                        if (e.target.value === 'custom') {
                          setShowCustomName(true)
                          setNewCategory(prev => ({ ...prev, name: '' }))
                        } else {
                          setNewCategory(prev => ({ ...prev, name: e.target.value }))
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
                      value={newCategory.name}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter custom category name"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowCustomName(false)
                        setNewCategory(prev => ({ ...prev, name: '' }))
                      }}
                    >
                      Back to Selection
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={newCategory.description}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your gallery category"
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
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {uploading ? 'Uploading...' : 'Click to upload images or drag and drop'}
                    </p>
                  </label>
                </div>
              </div>

              {newCategory.images.length > 0 && (
                <div className="space-y-2">
                  <Label>Uploaded Images ({newCategory.images.length})</Label>
                  <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                    {newCategory.images.map((image, idx) => (
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
                  onClick={handleAddCategory} 
                  className="flex-1"
                  disabled={!newCategory.name.trim() || newCategory.images.length === 0 || uploading}
                >
                  Create Gallery Category
                </Button>
                <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditModal && editingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Edit Gallery Category</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowEditModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Category Name</Label>
                <Input
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory(prev => prev ? { ...prev, name: e.target.value } : null)}
                  placeholder="e.g., Wedding Photography, Portraits, Events"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory(prev => prev ? { ...prev, description: e.target.value } : null)}
                  placeholder="Describe your gallery category"
                />
              </div>

              <div className="space-y-2">
                <Label>Add More Images</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => e.target.files && handleImageUpload(e.target.files, true)}
                    className="hidden"
                    id="edit-image-upload"
                  />
                  <label htmlFor="edit-image-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {uploading ? 'Uploading...' : 'Click to upload more images'}
                    </p>
                  </label>
                </div>
              </div>

              {editingCategory.images.length > 0 && (
                <div className="space-y-2">
                  <Label>Current Images ({editingCategory.images.length})</Label>
                  <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                    {editingCategory.images.map((image, idx) => (
                      <div key={idx} className="relative">
                        <img src={image} alt="" className="w-full h-20 object-cover rounded" />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-1 right-1 w-6 h-6 p-0"
                          onClick={() => removeImage(image, true)}
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
                  onClick={handleEditCategory} 
                  className="flex-1"
                  disabled={!editingCategory.name.trim() || uploading}
                >
                  Update Gallery Category
                </Button>
                <Button variant="outline" onClick={() => setShowEditModal(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}