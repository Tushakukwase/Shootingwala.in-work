"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { Plus, FileText, Upload, X, Edit, Trash2, CheckCircle } from "lucide-react"

interface Story {
  id: string
  title: string
  content: string
  coverImage: string
  location: string
  date: string
  photographerId: string
  status: 'pending' | 'approved' | 'rejected'
  showOnHome: boolean
  createdAt: string
  approvedAt?: string
}

export default function PhotographerStories() {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingStory, setEditingStory] = useState<Story | null>(null)
  const [photographerId, setPhotographerId] = useState<string>('')
  const [photographerName, setPhotographerName] = useState<string>('')
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
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    // Get photographer data from localStorage
    const studioData = localStorage.getItem('studio')
    if (studioData) {
      try {
        const parsed = JSON.parse(studioData)
        setPhotographerId(parsed._id)
        setPhotographerName(parsed.name || parsed.photographerName || 'Photographer')
        loadStories(parsed._id)
      } catch (error) {
        console.error('Error parsing studio data:', error)
      }
    }
  }, [])

  const loadStories = async (photographerId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/photographer-stories?photographerId=${photographerId}`)
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

  const handleImageUpload = async (file: File, isEdit = false) => {
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
        if (isEdit && editingStory) {
          setEditingStory(prev => prev ? { ...prev, coverImage: data.data.url } : null)
        } else {
          setNewStory(prev => ({ ...prev, coverImage: data.data.url }))
        }
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
          photographerId,
          photographerName
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setStories(prev => [data.story, ...prev])
        
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
        setStories(prev => 
          prev.map(story => story.id === editingStory.id ? data.story : story)
        )
        setEditingStory(null)
        setShowEditModal(false)
        alert('Story updated successfully!')
      }
    } catch (error) {
      console.error('Error updating story:', error)
      alert('Failed to update story')
    }
  }

  const requestHomepageDisplay = async (storyId: string) => {
    try {
      const response = await fetch('/api/photographer-stories/homepage-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId,
          photographerId,
          photographerName
        })
      })
      
      const data = await response.json()
      if (data.success) {
        // Refresh the stories list to show updated status
        if (photographerId) {
          loadStories(photographerId)
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

  const handleDeleteStory = async (storyId: string) => {
    if (!confirm('Are you sure you want to delete this story?')) return
    
    try {
      const response = await fetch(`/api/photographer-stories?id=${storyId}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      if (data.success) {
        setStories(prev => prev.filter(story => story.id !== storyId))
        alert('Story deleted successfully!')
      }
    } catch (error) {
      console.error('Error deleting story:', error)
      alert('Failed to delete story')
    }
  }



  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Real Wedding Stories</h1>
        <Button onClick={() => setShowAddModal(true)} className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Add New Story
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stories.length}</div>
            <div className="text-sm text-muted-foreground">Total Stories</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stories.length}</div>
            <div className="text-sm text-muted-foreground">Published Stories</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stories.filter(s => s.showOnHome).length}</div>
            <div className="text-sm text-muted-foreground">Featured on Homepage</div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading stories...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* All Stories */}
          {stories.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  My Stories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stories.map(story => (
                    <div key={story.id} className="border border-gray-200 bg-white rounded-lg overflow-hidden shadow-sm">
                      {story.coverImage && (
                        <img src={story.coverImage} alt={story.title} className="w-full h-32 object-cover" />
                      )}
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-sm">{story.title}</h3>
                          {story.status === 'draft' && (
                            <Badge className="bg-gray-100 text-gray-800">
                              Draft
                            </Badge>
                          )}
                          {story.status === 'pending' && (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              Pending Approval
                            </Badge>
                          )}
                          {story.status === 'approved' && story.showOnHome && (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                          {story.status === 'rejected' && (
                            <Badge className="bg-red-100 text-red-800">
                              Rejected
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{story.content}</p>
                        
                        {story.location && (
                          <p className="text-xs text-gray-500 mb-2">📍 {story.location}</p>
                        )}
                        
                        {story.date && (
                          <p className="text-xs text-gray-500 mb-3">📅 {story.date}</p>
                        )}
                        
                        <div className="flex gap-1 flex-wrap">
                          <Button size="sm" variant="outline" onClick={() => {
                            setEditingStory(story)
                            setShowEditModal(true)
                          }}>
                            <Edit className="w-3 h-3 mr-1" />Edit
                          </Button>
                          
                          {story.status === 'draft' ? (
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => requestHomepageDisplay(story.id)}>
                              Request Homepage Feature
                            </Button>
                          ) : story.status === 'pending' ? (
                            <Button size="sm" variant="outline" disabled className="bg-yellow-100 text-yellow-800">
                              Request Pending...
                            </Button>
                          ) : story.status === 'approved' && story.showOnHome ? (
                            <Button size="sm" variant="outline" disabled className="bg-green-100 text-green-800">
                              Featured on Homepage ✓
                            </Button>
                          ) : story.status === 'rejected' ? (
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => requestHomepageDisplay(story.id)}>
                              Request Again
                            </Button>
                          ) : (
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => requestHomepageDisplay(story.id)}>
                              Request Homepage Feature
                            </Button>
                          )}
                          
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteStory(story.id)}>
                            <Trash2 className="w-3 h-3 mr-1" />Delete
                          </Button>
                          

                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Stories Yet</h3>
              <p className="text-muted-foreground mb-4">Share your wedding photography stories with the world</p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Story
              </Button>
            </div>
          )}
        </div>
      )}

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
                <textarea
                  value={newStory.content}
                  onChange={(e) => setNewStory(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Tell the beautiful story of this wedding..."
                  className="w-full px-3 py-2 border border-input rounded-md bg-background resize-none"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={newStory.location}
                    onChange={(e) => setNewStory(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., Botanical Gardens"
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
                    id="cover-upload"
                  />
                  <label htmlFor="cover-upload" className="cursor-pointer">
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
                  placeholder="e.g., Sarah & Mike's Garden Wedding"
                />
              </div>

              <div className="space-y-2">
                <Label>Story Content</Label>
                <textarea
                  value={editingStory.content}
                  onChange={(e) => setEditingStory(prev => prev ? { ...prev, content: e.target.value } : null)}
                  placeholder="Tell the beautiful story of this wedding..."
                  className="w-full px-3 py-2 border border-input rounded-md bg-background resize-none"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={editingStory.location}
                    onChange={(e) => setEditingStory(prev => prev ? { ...prev, location: e.target.value } : null)}
                    placeholder="e.g., Botanical Gardens"
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
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], true)}
                    className="hidden"
                    id="edit-cover-upload"
                  />
                  <label htmlFor="edit-cover-upload" className="cursor-pointer">
                    {editingStory.coverImage ? (
                      <img src={editingStory.coverImage} alt="Cover" className="w-32 h-32 object-cover rounded mx-auto" />
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
                  onClick={handleEditStory} 
                  className="flex-1"
                  disabled={!editingStory.title.trim() || !editingStory.content.trim() || uploading}
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
    </div>
  )
}