"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from "react"
import { Plus, FileText, Trash2, CheckCircle, X, User, Calendar, Eye, Upload, Edit } from "lucide-react"

interface Story {
  id: string
  title: string
  content: string
  coverImage: string
  location: string
  date: string
  photographerId: string
  photographerName: string
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  showOnHome: boolean
  createdAt: string
  approved_by?: string
  approved_by_name?: string
  approved_at?: string
  request_date?: string
  created_by?: string
  created_by_name?: string
}

export default function EnhancedStoriesManager() {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)
  const [editingStory, setEditingStory] = useState<Story | null>(null)
  const [uploading, setUploading] = useState(false)
  const [newStory, setNewStory] = useState({
    title: '',
    content: '',
    coverImage: '',
    location: '',
    date: ''
  })
  const [availableStoryCategories, setAvailableStoryCategories] = useState<string[]>([
    'Wedding Stories',
    'Engagement Stories',
    'Pre-Wedding Stories',
    'Anniversary Stories',
    'Birthday Stories',
    'Corporate Events',
    'Fashion Shoots',
    'Family Portraits'
  ])
  const [showCustomStoryName, setShowCustomStoryName] = useState(false)

  useEffect(() => {
    loadStories()
    markStoriesAsViewed()
  }, [])

  const markStoriesAsViewed = async () => {
    try {
      await fetch('/api/photographer-stories/mark-viewed', { method: 'POST' })
    } catch (error) {
      console.error('Error marking stories as viewed:', error)
    }
  }

  const loadStories = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/photographer-stories')
      const data = await response.json()
      
      if (data.success) {
        setStories(data.stories)
      }
    } catch (error) {
      console.error('Error loading stories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'story')
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      if (data.success) {
        setNewStory(prev => ({ ...prev, coverImage: data.data.url }))
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

  const handleAddStory = async () => {
    if (!newStory.title.trim() || !newStory.content.trim()) return
    
    try {
      const response = await fetch('/api/photographer-stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newStory,
          photographerId: 'admin',
          photographerName: 'Admin'
        })
      })
      
      const data = await response.json()
      if (data.success) {
        loadStories()
        
        // Add new category to available categories if it's custom
        if (showCustomStoryName && newStory.title.trim() && !availableStoryCategories.includes(newStory.title.trim())) {
          setAvailableStoryCategories(prev => [...prev, newStory.title.trim()])
        }
        
        setNewStory({ title: '', content: '', coverImage: '', location: '', date: '' })
        setShowCustomStoryName(false)
        setShowAddModal(false)
        alert('Story created successfully!')
      }
    } catch (error) {
      console.error('Error adding story:', error)
      alert('Failed to add story')
    }
  }

  const handleEditStory = async () => {
    if (!editingStory || !editingStory.title.trim()) return
    
    try {
      const response = await fetch('/api/photographer-stories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingStory.id,
          title: editingStory.title,
          content: editingStory.content,
          coverImage: editingStory.coverImage,
          location: editingStory.location,
          date: editingStory.date
        })
      })
      
      const data = await response.json()
      if (data.success) {
        loadStories()
        setEditingStory(null)
        setShowEditModal(false)
        alert('Story updated successfully!')
      }
    } catch (error) {
      console.error('Error updating story:', error)
      alert('Failed to update story')
    }
  }

  const handleApprove = async (storyId: string) => {
    try {
      setActionLoading(storyId)
      
      const response = await fetch('/api/photographer-stories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: storyId,
          status: 'approved',
          approved_by: 'admin',
          approved_by_name: 'Admin',
          showOnHome: false // Don't automatically show on homepage
        })
      })
      
      const data = await response.json()
      if (data.success) {
        loadStories()
        alert('Story approved! Use "Show on Homepage" button to display it on homepage.')
      }
    } catch (error) {
      console.error('Error approving story:', error)
      alert('Failed to approve story')
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleHomepage = async (storyId: string, currentStatus: boolean) => {
    try {
      setActionLoading(storyId)
      
      const response = await fetch('/api/photographer-stories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: storyId,
          showOnHome: !currentStatus
        })
      })
      
      const data = await response.json()
      if (data.success) {
        loadStories()
        alert(currentStatus ? 'Story removed from homepage!' : 'Story added to homepage!')
      }
    } catch (error) {
      console.error('Error toggling homepage status:', error)
      alert('Failed to update homepage status')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (storyId: string) => {
    try {
      setActionLoading(storyId)
      
      const response = await fetch('/api/photographer-stories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: storyId,
          status: 'rejected',
          approved_by: 'admin',
          approved_by_name: 'Admin',
          showOnHome: false
        })
      })
      
      const data = await response.json()
      if (data.success) {
        loadStories()
        alert('Story rejected')
      }
    } catch (error) {
      console.error('Error rejecting story:', error)
      alert('Failed to reject story')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (storyId: string) => {
    if (!confirm('Are you sure you want to permanently delete this story? This action cannot be undone.')) return
    
    try {
      setActionLoading(storyId)
      
      const response = await fetch(`/api/photographer-stories?id=${storyId}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      if (data.success) {
        loadStories()
        alert('Story deleted successfully')
      }
    } catch (error) {
      console.error('Error deleting story:', error)
      alert('Failed to delete story')
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

  const filteredStories = stories.filter(story => {
    // Only show admin-created stories and photographer stories that have requested homepage (pending/approved/rejected)
    const isAdminStory = story.created_by === 'admin' || story.photographerId === 'admin'
    const isPhotographerRequestedStory = story.status !== 'draft' && (story.created_by === 'photographer' || (story.photographerId && story.photographerId !== 'admin'))
    
    // Don't show photographer draft stories in admin panel
    if (!isAdminStory && !isPhotographerRequestedStory) return false
    
    if (filter === 'pending') return story.status === 'pending'
    if (filter === 'approved') return story.status === 'approved'
    if (filter === 'rejected') return story.status === 'rejected'
    if (filter === 'draft') return story.status === 'draft' && isAdminStory // Only admin drafts
    if (filter === 'admin') return isAdminStory
    if (filter === 'photographer') return isPhotographerRequestedStory
    return isAdminStory || isPhotographerRequestedStory
  })

  // Only count stories that should be visible to admin
  const visibleStories = stories.filter(story => {
    const isAdminStory = story.created_by === 'admin' || story.photographerId === 'admin'
    const isPhotographerRequestedStory = story.status !== 'draft' && (story.created_by === 'photographer' || (story.photographerId && story.photographerId !== 'admin'))
    return isAdminStory || isPhotographerRequestedStory
  })
  
  const pendingCount = visibleStories.filter(s => s.status === 'pending').length
  const totalCount = visibleStories.length

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-600" />
            Real Stories Management
          </CardTitle>
          <Button onClick={() => setShowAddModal(true)} className="bg-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Add Story
          </Button>
        </div>
        
        {/* Count Boxes */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-white rounded-lg p-4 text-center shadow-sm border">
            <div className="text-3xl font-bold text-black mb-1">{totalCount}</div>
            <div className="text-sm text-gray-600">Total Suggestions</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm border">
            <div className="text-3xl font-bold text-orange-500 mb-1">{pendingCount}</div>
            <div className="text-sm text-gray-600">Pending Review</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm border">
            <div className="text-3xl font-bold text-green-600 mb-1">{visibleStories.filter(s => s.status === 'approved').length}</div>
            <div className="text-sm text-gray-600">Approved</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm border">
            <div className="text-3xl font-bold text-red-600 mb-1">{visibleStories.filter(s => s.status === 'rejected').length}</div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-1 bg-muted p-1 rounded-lg mt-4">
          {[
            { key: 'all', label: `All (${totalCount})` },
            { key: 'pending', label: `Pending (${pendingCount})` },
            { key: 'approved', label: `Approved (${visibleStories.filter(s => s.status === 'approved').length})` },
            { key: 'rejected', label: `Rejected (${visibleStories.filter(s => s.status === 'rejected').length})` }
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
            <p className="text-muted-foreground">Loading stories...</p>
          </div>
        ) : filteredStories.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Stories Found</h3>
            <p className="text-muted-foreground">
              {filter === 'pending' 
                ? "No stories are pending approval."
                : filter === 'approved'
                ? "No stories have been approved yet."
                : filter === 'rejected'
                ? "No stories have been rejected."
                : "No stories have been created yet."
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredStories.map((story) => (
              <div 
                key={story.id} 
                className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex flex-col h-full"
              >
                <div className="flex flex-col h-full">
                  {/* Story Cover Image */}
                  <div className="mb-3">
                    {story.coverImage ? (
                      <img src={story.coverImage} alt={story.title} className="w-full h-32 object-cover rounded" />
                    ) : (
                      <div className="w-full h-32 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-gray-500 text-sm">No Image</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <h4 className="font-semibold text-sm truncate">{story.title}</h4>
                    
                    <div className="flex justify-center">
                      {getStatusBadge(story.status)}
                    </div>
                    
                    <div className="text-xs text-gray-500 text-center">
                      {new Date(story.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-1 flex-wrap mt-4">
                    {/* View Details Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs px-2 py-1 flex-1"
                      onClick={() => {
                        setSelectedStory(story)
                        setShowDetailModal(true)
                      }}
                      title="View Details"
                    >
                      <Eye className="w-3 h-3" />
                    </Button>

                    {/* Approval/Rejection Buttons */}
                    {story.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-xs px-2 py-1 flex-1"
                          onClick={() => handleApprove(story.id)}
                          disabled={actionLoading === story.id}
                          title="Approve Story"
                        >
                          {actionLoading === story.id ? (
                            <div className="animate-spin rounded-full h-2 w-2 border-b-2 border-white"></div>
                          ) : (
                            <CheckCircle className="w-3 h-3" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="text-xs px-2 py-1 flex-1"
                          onClick={() => handleReject(story.id)}
                          disabled={actionLoading === story.id}
                          title="Reject Story"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </>
                    )}

                    {/* Status Change Buttons (for approved/rejected) */}
                    {story.status === 'approved' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="text-xs px-2 py-1 flex-1"
                        onClick={() => handleReject(story.id)}
                        disabled={actionLoading === story.id}
                        title="Reject Story"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}

                    {story.status === 'rejected' && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-xs px-2 py-1 flex-1"
                        onClick={() => handleApprove(story.id)}
                        disabled={actionLoading === story.id}
                        title="Approve Story"
                      >
                        <CheckCircle className="w-3 h-3" />
                      </Button>
                    )}

                    {/* Homepage Toggle Button (only for approved stories) */}
                    {story.status === 'approved' && (
                      <Button
                        size="sm"
                        className={story.showOnHome ? "bg-blue-600 hover:bg-blue-700 text-xs px-2 py-1 flex-1" : "bg-gray-600 hover:bg-gray-700 text-xs px-2 py-1 flex-1"}
                        onClick={() => handleToggleHomepage(story.id, story.showOnHome)}
                        disabled={actionLoading === story.id}
                        title={story.showOnHome ? "Remove from Homepage" : "Show on Homepage"}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                    )}
                    
                    {/* Edit Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs px-2 py-1 flex-1"
                      onClick={() => {
                        setEditingStory(story)
                        setShowEditModal(true)
                      }}
                      disabled={actionLoading === story.id}
                      title="Edit Story"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    
                    {/* Delete Button (Admin only) */}
                    <Button
                      size="sm"
                      variant="destructive"
                      className="text-xs px-2 py-1 flex-1"
                      onClick={() => handleDelete(story.id)}
                      disabled={actionLoading === story.id}
                      title="Delete Story"
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

    {/* Add Story Modal */}
    {showAddModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Add New Story</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Story Title</Label>
              {!showCustomStoryName ? (
                <div className="space-y-2">
                  <select
                    value={newStory.title}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setShowCustomStoryName(true)
                        setNewStory(prev => ({ ...prev, title: '' }))
                      } else {
                        setNewStory(prev => ({ ...prev, title: e.target.value }))
                      }
                    }}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="">Select a story category</option>
                    {availableStoryCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                    <option value="custom">+ Add Custom Story Title</option>
                  </select>
                </div>
              ) : (
                <div className="space-y-2">
                  <Input
                    value={newStory.title}
                    onChange={(e) => setNewStory(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter custom story title"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowCustomStoryName(false)
                      setNewStory(prev => ({ ...prev, title: '' }))
                    }}
                  >
                    Back to Selection
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Story Content</Label>
              <Textarea
                value={newStory.content}
                onChange={(e) => setNewStory(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Tell the story..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={newStory.location}
                  onChange={(e) => setNewStory(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Event location"
                />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={newStory.date}
                  onChange={(e) => setNewStory(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cover Image</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                  className="hidden"
                  id="story-upload"
                />
                <label htmlFor="story-upload" className="cursor-pointer">
                  {newStory.coverImage ? (
                    <img src={newStory.coverImage} alt="Cover" className="w-32 h-32 object-cover rounded mx-auto" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        {uploading ? 'Uploading...' : 'Click to upload cover image'}
                      </p>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleAddStory} 
                className="flex-1"
                disabled={!newStory.title.trim() || !newStory.content.trim() || uploading}
              >
                Create Story
              </Button>
              <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )}

    {/* Edit Story Modal */}
    {showEditModal && editingStory && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Edit Story</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowEditModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Story Title</Label>
              <Input
                value={editingStory.title}
                onChange={(e) => setEditingStory(prev => prev ? { ...prev, title: e.target.value } : null)}
                placeholder="Enter story title"
              />
            </div>

            <div className="space-y-2">
              <Label>Story Content</Label>
              <Textarea
                value={editingStory.content}
                onChange={(e) => setEditingStory(prev => prev ? { ...prev, content: e.target.value } : null)}
                placeholder="Tell the story..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={editingStory.location}
                  onChange={(e) => setEditingStory(prev => prev ? { ...prev, location: e.target.value } : null)}
                  placeholder="Event location"
                />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={editingStory.date}
                  onChange={(e) => setEditingStory(prev => prev ? { ...prev, date: e.target.value } : null)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cover Image</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                {editingStory.coverImage ? (
                  <img src={editingStory.coverImage} alt="Cover" className="w-32 h-32 object-cover rounded mx-auto" />
                ) : (
                  <div className="text-gray-500">No cover image</div>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleEditStory} 
                className="flex-1"
                disabled={!editingStory.title.trim() || !editingStory.content.trim()}
              >
                Update Story
              </Button>
              <Button variant="outline" onClick={() => setShowEditModal(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )}

    {/* Story Detail Modal */}
    {showDetailModal && selectedStory && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-3xl max-h-[85vh] overflow-y-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Story Details - Review Request
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowDetailModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Photographer/Studio Information */}
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2 text-sm">
                <User className="w-4 h-4" />
                Photographer/Studio Information
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium text-blue-800">Studio Name:</span>
                  <p className="text-blue-700">{selectedStory.created_by_name || selectedStory.photographerName || 'Unknown Studio'}</p>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Photographer ID:</span>
                  <p className="text-blue-700 font-mono text-xs">{selectedStory.photographerId}</p>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Request Date:</span>
                  <p className="text-blue-700">{selectedStory.request_date ? new Date(selectedStory.request_date).toLocaleDateString() : new Date(selectedStory.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Current Status:</span>
                  <div className="mt-1">{getStatusBadge(selectedStory.status)}</div>
                </div>
              </div>
            </div>

            {/* Story Content Preview */}
            <div className="bg-gray-50 p-3 rounded-lg border">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4" />
                Story Content Preview
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cover Image */}
                {selectedStory.coverImage && (
                  <div>
                    <span className="font-medium text-gray-700 block mb-2 text-sm">Cover Image:</span>
                    <img 
                      src={selectedStory.coverImage} 
                      alt={selectedStory.title}
                      className="w-full h-32 object-cover rounded border"
                    />
                  </div>
                )}

                {/* Story Details */}
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-700 text-sm">Title:</span>
                    <p className="text-gray-900 font-semibold">{selectedStory.title}</p>
                  </div>
                  
                  {selectedStory.location && (
                    <div>
                      <span className="font-medium text-gray-700 text-sm">Location:</span>
                      <p className="text-gray-900 text-sm">📍 {selectedStory.location}</p>
                    </div>
                  )}
                  
                  {selectedStory.date && (
                    <div>
                      <span className="font-medium text-gray-700 text-sm">Event Date:</span>
                      <p className="text-gray-900 text-sm">📅 {new Date(selectedStory.date).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-3">
                <span className="font-medium text-gray-700 text-sm">Story Content:</span>
                <div className="bg-white p-2 rounded border mt-1 max-h-32 overflow-y-auto">
                  <p className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap">{selectedStory.content}</p>
                </div>
              </div>
            </div>

            {/* Approval History */}
            {(selectedStory.approved_by || selectedStory.status !== 'pending') && (
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4" />
                  Approval History
                </h3>
                <div className="text-sm space-y-2">
                  {selectedStory.approved_by && (
                    <div>
                      <span className="font-medium text-yellow-800">Reviewed by:</span>
                      <p className="text-yellow-700">{selectedStory.approved_by_name || selectedStory.approved_by}</p>
                    </div>
                  )}
                  {selectedStory.approved_at && (
                    <div>
                      <span className="font-medium text-yellow-800">Review Date:</span>
                      <p className="text-yellow-700">{new Date(selectedStory.approved_at).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-3 border-t">
              {selectedStory.status === 'pending' && (
                <>
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white flex-1"
                    onClick={() => {
                      handleApprove(selectedStory.id)
                      setShowDetailModal(false)
                    }}
                    disabled={actionLoading === selectedStory.id}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Story
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      handleReject(selectedStory.id)
                      setShowDetailModal(false)
                    }}
                    disabled={actionLoading === selectedStory.id}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject Story
                  </Button>
                </>
              )}
              
              {selectedStory.status === 'approved' && (
                <>
                  <Button
                    className={selectedStory.showOnHome ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-600 hover:bg-gray-700"}
                    onClick={() => {
                      handleToggleHomepage(selectedStory.id, selectedStory.showOnHome)
                      setShowDetailModal(false)
                    }}
                    disabled={actionLoading === selectedStory.id}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {selectedStory.showOnHome ? 'Remove from Homepage' : 'Show on Homepage'}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleReject(selectedStory.id)
                      setShowDetailModal(false)
                    }}
                    disabled={actionLoading === selectedStory.id}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject Story
                  </Button>
                </>
              )}
              
              {selectedStory.status === 'rejected' && (
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white flex-1"
                  onClick={() => {
                    handleApprove(selectedStory.id)
                    setShowDetailModal(false)
                  }}
                  disabled={actionLoading === selectedStory.id}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Story
                </Button>
              )}
              
              <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )}
    </>
  )
}