"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { Search, Tag, Clock, CheckCircle, X, User, Calendar, Eye, Trash2, Upload, Plus, Image as ImageIcon, Edit } from "lucide-react"

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

export default function CategorySuggestionsManager() {
  const [suggestions, setSuggestions] = useState<CategorySuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedSuggestion, setSelectedSuggestion] = useState<CategorySuggestion | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategorySuggestion | null>(null)
  const [adminId] = useState('admin-1') // In real app, get from auth
  const [adminName] = useState('Admin User') // In real app, get from auth
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    image_url: '',
    show_on_home: true
  })
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadSuggestions()
  }, [])

  const loadSuggestions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/requests?type=category')
      const data = await response.json()
      
      if (data.success && data.requests) {
        // Normalize the data to ensure proper id field
        const normalizedSuggestions = data.requests.map((suggestion: any) => ({
          ...suggestion,
          id: suggestion.id || `temp-${Date.now()}-${Math.random()}`
        }))
        setSuggestions(normalizedSuggestions)
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

  const handleApprove = async (suggestionId: string, showOnHome: boolean = true) => {
    try {
      const response = await fetch('/api/requests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: suggestionId,
          action: 'approve',
          adminId,
          adminName,
          show_on_home: showOnHome
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSuggestions(prev => 
          prev.map(suggestion => 
            suggestion.id === suggestionId 
              ? { ...suggestion, status: 'approved', approvedBy: adminId, adminName, approved_at: new Date().toISOString(), show_on_home: showOnHome }
              : suggestion
          )
        )
        alert('Category suggestion approved successfully!')
      }
    } catch (error) {
      console.error('Error approving suggestion:', error)
      alert('Failed to approve suggestion')
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
          created_by: 'admin',
          created_by_name: adminName,
          show_on_home: newCategory.show_on_home
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSuggestions(prev => [data.request, ...prev])
        setNewCategory({ name: '', description: '', image_url: '', show_on_home: true })
        setShowAddModal(false)
        alert('Category added successfully!')
        loadSuggestions() // Refresh the list
      }
    } catch (error) {
      console.error('Error adding category:', error)
      alert('Failed to add category')
    }
  }

  const handleEditCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim() || !editingCategory.description.trim()) return
    
    try {
      const response = await fetch('/api/requests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingCategory.id,
          name: editingCategory.name.trim(),
          description: editingCategory.description.trim(),
          image_url: editingCategory.image_url,
          show_on_home: editingCategory.show_on_home
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSuggestions(prev => 
          prev.map(suggestion => 
            suggestion.id === editingCategory.id ? data.request : suggestion
          )
        )
        setEditingCategory(null)
        setShowEditModal(false)
        alert('Category updated successfully!')
      }
    } catch (error) {
      console.error('Error updating category:', error)
      alert('Failed to update category')
    }
  }

  const toggleShowOnHome = async (suggestionId: string, currentValue: boolean) => {
    try {
      const response = await fetch('/api/requests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: suggestionId,
          show_on_home: !currentValue
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSuggestions(prev => 
          prev.map(suggestion => 
            suggestion.id === suggestionId 
              ? { ...suggestion, show_on_home: !currentValue }
              : suggestion
          )
        )
      }
    } catch (error) {
      console.error('Error updating show on home:', error)
    }
  }

  const handleReject = async (suggestionId: string) => {
    try {
      const response = await fetch('/api/requests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: suggestionId,
          action: 'reject',
          adminId,
          adminName
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSuggestions(prev => 
          prev.map(suggestion => 
            suggestion.id === suggestionId 
              ? { ...suggestion, status: 'rejected', approvedBy: adminId, adminName, approved_at: new Date().toISOString() }
              : suggestion
          )
        )
        alert('Category suggestion rejected.')
      }
    } catch (error) {
      console.error('Error rejecting suggestion:', error)
      alert('Failed to reject suggestion')
    }
  }

  const handleDelete = async (suggestionId: string) => {
    if (!confirm('Are you sure you want to delete this suggestion?')) return
    
    try {
      const response = await fetch(`/api/requests?id=${suggestionId}`, {
        method: 'DELETE',
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSuggestions(prev => prev.filter(suggestion => suggestion.id !== suggestionId))
        alert('Suggestion deleted successfully!')
      }
    } catch (error) {
      console.error('Error deleting suggestion:', error)
      alert('Failed to delete suggestion')
    }
  }

  const filteredSuggestions = (suggestions || []).filter(suggestion => {
    const matchesSearch = suggestion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         suggestion.photographerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         suggestion.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || suggestion.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><X className="w-3 h-3 mr-1" />Rejected</Badge>
      default:
        return null
    }
  }

  const stats = {
    total: (suggestions || []).length,
    pending: (suggestions || []).filter(s => s.status === 'pending').length,
    approved: (suggestions || []).filter(s => s.status === 'approved').length,
    rejected: (suggestions || []).filter(s => s.status === 'rejected').length
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Category Suggestions</h1>
        <div className="flex items-center gap-4">
          <Badge variant="outline">{stats.total} Total</Badge>
          <Badge className="bg-yellow-100 text-yellow-800">{stats.pending} Pending</Badge>
          <Button onClick={() => setShowAddModal(true)} className="bg-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Suggestions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">Pending Review</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-muted-foreground">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-sm text-muted-foreground">Rejected</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-input rounded-md bg-background text-sm"
        >
          <option value="all">All Suggestions</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search suggestions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Suggestions List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading suggestions...</p>
        </div>
      ) : filteredSuggestions.length === 0 ? (
        <div className="text-center py-8">
          <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No suggestions found</h3>
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'No category suggestions have been submitted yet'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {filteredSuggestions.map((suggestion, index) => (
            <Card key={suggestion.id || `suggestion-${index}`} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col h-full">
                  {/* Image Thumbnail */}
                  <div className="w-full h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 mb-3">
                    {suggestion.image_url ? (
                      <img 
                        src={suggestion.image_url} 
                        alt={suggestion.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-sm truncate">{suggestion.name}</h3>
                      {getStatusBadge(suggestion.status)}
                    </div>
                    
                    <p className="text-muted-foreground text-xs mb-2 line-clamp-2">{suggestion.description}</p>
                    
                    <div className="text-xs mb-3">
                      <div className="flex items-center gap-1 mb-1">
                        <User className="w-3 h-3 text-muted-foreground" />
                        <span className="truncate">
                          {suggestion.created_by === 'admin' 
                            ? 'Admin' 
                            : suggestion.created_by_name
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span>{new Date(suggestion.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {suggestion.status === 'approved' && (
                      <div className="mt-auto pt-2 border-t border-gray-100">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={suggestion.show_on_home}
                              onChange={() => toggleShowOnHome(suggestion.id, suggestion.show_on_home)}
                              className="sr-only"
                            />
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                              suggestion.show_on_home 
                                ? 'bg-green-500 border-green-500' 
                                : 'border-gray-300 hover:border-green-400'
                            }`}>
                              {suggestion.show_on_home && (
                                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </div>
                          <span className="text-xs font-medium text-gray-700">Show on Home</span>
                        </label>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedSuggestion(suggestion)
                        setShowDetailsModal(true)
                      }}
                      className="h-7 px-2 text-xs flex-1"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingCategory(suggestion)
                        setShowEditModal(true)
                      }}
                      className="h-7 px-2 text-xs flex-1"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    
                    {suggestion.status === 'pending' && suggestion.created_by === 'photographer' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(suggestion.id)}
                          className="h-7 px-2 text-xs bg-green-600 hover:bg-green-700 flex-1"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(suggestion.id)}
                          className="h-7 px-2 text-xs flex-1"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(suggestion.id)}
                      className="h-7 px-2 text-xs flex-1"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedSuggestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Category Suggestion Details</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowDetailsModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedSuggestion.status)}
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Category Name</Label>
                  <p className="font-medium text-lg">{selectedSuggestion.name}</p>
                </div>
                
                <div>
                  <Label className="text-sm text-muted-foreground">Description</Label>
                  <p className="font-medium">{selectedSuggestion.description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      {selectedSuggestion.created_by === 'admin' ? 'Created By' : 'Requested By'}
                    </Label>
                    <p className="font-medium">
                      {selectedSuggestion.created_by === 'admin' 
                        ? 'Admin' 
                        : `Photographer (${selectedSuggestion.created_by_name})`
                      }
                    </p>
                    <p className="text-sm text-muted-foreground">ID: {selectedSuggestion.photographerId}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      {selectedSuggestion.created_by === 'admin' ? 'Creation Date' : 'Submission Date'}
                    </Label>
                    <p className="font-medium">{new Date(selectedSuggestion.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                
                {selectedSuggestion.approved_at && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        {selectedSuggestion.status === 'approved' ? 'Approved By' : 'Rejected By'}
                      </Label>
                      <p className="font-medium">{selectedSuggestion.adminName}</p>
                      <p className="text-sm text-muted-foreground">ID: {selectedSuggestion.approvedBy}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        {selectedSuggestion.status === 'approved' ? 'Approval Date' : 'Rejection Date'}
                      </Label>
                      <p className="font-medium">{new Date(selectedSuggestion.approved_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </div>

              {selectedSuggestion.status === 'pending' && selectedSuggestion.created_by === 'photographer' && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={() => {
                      handleApprove(selectedSuggestion.id)
                      setShowDetailsModal(false)
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Suggestion
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleReject(selectedSuggestion.id)
                      setShowDetailsModal(false)
                    }}
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject Suggestion
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Add New Category</CardTitle>
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
                  placeholder="e.g., Wedding Photography"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="categoryDescription">Description</Label>
                <textarea
                  id="categoryDescription"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this category..."
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground resize-none"
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

              {/* Show on Home Page Checkbox */}
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={newCategory.show_on_home}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, show_on_home: e.target.checked }))}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      newCategory.show_on_home 
                        ? 'bg-green-500 border-green-500' 
                        : 'border-gray-300 hover:border-green-400'
                    }`}>
                      {newCategory.show_on_home && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Show on Home Page</span>
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleAddCategory} 
                  className="flex-1"
                  disabled={!newCategory.name.trim() || !newCategory.description.trim() || uploading}
                >
                  Add Category
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
          <Card className="w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Edit Category</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowEditModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editCategoryName">Category Name</Label>
                <Input
                  id="editCategoryName"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory(prev => prev ? { ...prev, name: e.target.value } : null)}
                  placeholder="e.g., Wedding Photography"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editCategoryDescription">Description</Label>
                <textarea
                  id="editCategoryDescription"
                  value={editingCategory.description}
                  onChange={(e) => setEditingCategory(prev => prev ? { ...prev, description: e.target.value } : null)}
                  placeholder="Brief description of this category..."
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground resize-none"
                  rows={3}
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Category Image</Label>
                <div className="relative border-2 border-dashed rounded-lg p-4 text-center border-gray-300 hover:border-gray-400">
                  {editingCategory.image_url ? (
                    <div className="space-y-2">
                      <img 
                        src={editingCategory.image_url} 
                        alt="Preview" 
                        className="w-20 h-20 object-cover rounded-lg mx-auto"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingCategory(prev => prev ? { ...prev, image_url: '' } : null)}
                      >
                        Remove Image
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                      <p className="text-sm text-gray-600">No image uploaded</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Show on Home Page Checkbox */}
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={editingCategory.show_on_home}
                      onChange={(e) => setEditingCategory(prev => prev ? { ...prev, show_on_home: e.target.checked } : null)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      editingCategory.show_on_home 
                        ? 'bg-green-500 border-green-500' 
                        : 'border-gray-300 hover:border-green-400'
                    }`}>
                      {editingCategory.show_on_home && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Show on Home Page</span>
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleEditCategory} 
                  className="flex-1"
                  disabled={!editingCategory.name.trim() || !editingCategory.description.trim()}
                >
                  Update Category
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