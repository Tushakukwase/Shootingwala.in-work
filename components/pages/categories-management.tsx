"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { Plus, Clock, CheckCircle, X, AlertCircle, Upload } from "lucide-react"

interface CategorySuggestion {
  id: string
  name: string
  description: string
  image_url?: string
  photographerId: string
  photographerName: string
  status: 'pending' | 'approved' | 'rejected'
  show_on_home: boolean
  suggestedBy: string
  approvedBy?: string
  adminName?: string
  created_at: string
  approved_at?: string
  created_by: 'admin' | 'photographer'
  created_by_name: string
}

export default function CategoriesManagement() {
  const [suggestions, setSuggestions] = useState<CategorySuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [photographerId, setPhotographerId] = useState<string>('')
  const [photographerName, setPhotographerName] = useState<string>('')
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    image_url: ''
  })
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    // Get photographer data from localStorage
    const studioData = localStorage.getItem('studio')
    if (studioData) {
      try {
        const parsed = JSON.parse(studioData)
        setPhotographerId(parsed._id)
        setPhotographerName(parsed.name || parsed.photographerName || 'Photographer')
        loadSuggestions(parsed._id)
      } catch (error) {
        console.error('Error parsing studio data:', error)
      }
    }
  }, [])

  const loadSuggestions = async (photographerId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/requests?type=category&t=${Date.now()}`)
      const data = await response.json()
      
      if (data.success && data.requests) {
        // Filter suggestions by this photographer
        const mySuggestions = data.requests.filter((suggestion: CategorySuggestion) => 
          suggestion.photographerId === photographerId
        )
        setSuggestions(mySuggestions)
      } else {
        setSuggestions([])
      }
    } catch (error) {
      console.error('Error loading suggestions:', error)
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'category')
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      
      if (data.success) {
        setNewCategory(prev => ({ ...prev, image_url: data.data.url }))
      } else {
        alert('Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find(file => file.type.startsWith('image/'))
    
    if (imageFile) {
      handleImageUpload(imageFile)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file)
    }
  }

  const handleAddCategory = async () => {
    if (!newCategory.name.trim() || !newCategory.description.trim()) return
    
    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'category',
          name: newCategory.name.trim(),
          description: newCategory.description.trim(),
          image: newCategory.image_url,
          photographerId,
          photographerName,
          created_by: 'photographer',
          created_by_name: photographerName
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSuggestions(prev => [data.request, ...prev])
        setNewCategory({ name: '', description: '', image_url: '' })
        setShowAddModal(false)
        alert('Category suggestion submitted! Admin will review it shortly.')
      } else {
        alert('Failed to submit suggestion. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting suggestion:', error)
      alert('Failed to submit suggestion. Please try again.')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending Review
          </Badge>
        )
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800">
            <X className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return null
    }
  }

  const approvedSuggestions = suggestions.filter(c => c.status === 'approved')
  const pendingSuggestions = suggestions.filter(c => c.status === 'pending')
  const rejectedSuggestions = suggestions.filter(c => c.status === 'rejected')

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Popular Search Categories</h1>
        <Button onClick={() => setShowAddModal(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Suggest Category
        </Button>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading suggestions...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{suggestions.length}</div>
              <div className="text-sm text-muted-foreground">Total Suggestions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{approvedSuggestions.length}</div>
              <div className="text-sm text-muted-foreground">Approved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{pendingSuggestions.length}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{rejectedSuggestions.length}</div>
              <div className="text-sm text-muted-foreground">Rejected</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Approved Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Approved Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {approvedSuggestions.map(suggestion => (
              <div key={suggestion.id} className="p-4 border border-green-200 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{suggestion.name}</h3>
                  {getStatusBadge(suggestion.status)}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{suggestion.description}</p>
                <div className="text-xs text-muted-foreground">
                  <div>Suggested: {new Date(suggestion.created_at).toLocaleDateString()}</div>
                  {suggestion.approved_at && (
                    <div>Approved: {new Date(suggestion.approved_at).toLocaleDateString()}</div>
                  )}
                  {suggestion.adminName && (
                    <div>Approved by: {suggestion.adminName}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {approvedSuggestions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No approved suggestions yet.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Categories */}
      {pendingSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingSuggestions.map(suggestion => (
                <div key={suggestion.id} className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{suggestion.name}</h3>
                    {getStatusBadge(suggestion.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{suggestion.description}</p>
                  <div className="text-xs text-muted-foreground">
                    Suggested: {new Date(suggestion.created_at).toLocaleDateString()}
                  </div>
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-700">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Awaiting Admin Approval</span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      Your category suggestion is under review. You'll be notified once it's approved.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rejected Categories */}
      {rejectedSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <X className="w-5 h-5 text-red-600" />
              Rejected Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rejectedSuggestions.map(suggestion => (
                <div key={suggestion.id} className="p-4 border border-red-200 bg-red-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{suggestion.name}</h3>
                    {getStatusBadge(suggestion.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{suggestion.description}</p>
                  <div className="text-xs text-muted-foreground mt-2">
                    <div>Suggested: {new Date(suggestion.created_at).toLocaleDateString()}</div>
                    {suggestion.approved_at && (
                      <div>Rejected: {new Date(suggestion.approved_at).toLocaleDateString()}</div>
                    )}
                    {suggestion.adminName && (
                      <div>Rejected by: {suggestion.adminName}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Suggest New Category</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="categoryName">Category Name</Label>
                <Input
                  id="categoryName"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Drone Photography"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryDescription">Description</Label>
                <textarea
                  id="categoryDescription"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this photography category..."
                  className="w-full px-3 py-2 border border-input rounded-md bg-background resize-none"
                  rows={3}
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Category Image</Label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                    isDragging
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploading}
                  />
                  
                  {newCategory.image_url ? (
                    <div className="space-y-2">
                      <img 
                        src={newCategory.image_url} 
                        alt="Preview" 
                        className="w-20 h-20 object-cover rounded-lg mx-auto"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setNewCategory(prev => ({ ...prev, image_url: '' }))}
                      >
                        Remove Image
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                      <p className="text-sm text-gray-600">
                        {uploading ? 'Uploading...' : 'Drag & drop an image or click to browse'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-blue-700 mb-1">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Review Process</span>
                </div>
                <p className="text-xs text-blue-600">
                  Your suggestion will be reviewed by our admin team. If approved, it will appear in the search categories for all users.
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={handleAddCategory}
                  disabled={!newCategory.name.trim() || !newCategory.description.trim() || uploading}
                >
                  Submit Suggestion
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}