"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { Search, FileText, Clock, CheckCircle, X, User, Calendar, Eye, Trash2, Image as ImageIcon, MapPin, Plus, Upload, Edit, Grid, List } from "lucide-react"
import StoriesCategoriesView from "./stories-categories-view"

interface StoryItem {
  id: string
  title: string
  content: string
  coverImage: string
  location?: string
  date: string
  photographerId?: string
  photographerName?: string
  uploaderName?: string
  status: 'pending' | 'approved' | 'rejected'
  show_on_home: boolean
  createdAt: string
  approved_at?: string
  created_by: 'admin' | 'photographer'
  created_by_name: string
  type: 'admin_story' | 'photographer_story'
}

export default function StoriesManager() {
  const [stories, setStories] = useState<StoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedStory, setSelectedStory] = useState<StoryItem | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newStory, setNewStory] = useState({
    title: '',
    content: '',
    coverImage: '',
    location: '',
    date: '',
    show_on_home: true
  })
  const [uploading, setUploading] = useState(false)
  const [adminId] = useState('admin-1')
  const [adminName] = useState('Admin User')
  const [viewMode, setViewMode] = useState<'list' | 'categories'>('list')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedStories, setSelectedStories] = useState<StoryItem[]>([])

  useEffect(() => {
    loadStories()
  }, [])

  const loadStories = async () => {
    try {
      setLoading(true)

      // Load admin stories
      const adminResponse = await fetch('/api/stories')
      const adminData = await adminResponse.json()

      // Load photographer homepage requests
      const notificationsResponse = await fetch('/api/notifications')
      const notificationsData = await notificationsResponse.json()

      const allStories: StoryItem[] = []

      // Add admin stories
      if (adminData.stories) {
        const adminStories = adminData.stories.map((story: any) => ({
          id: story._id,
          title: story.title,
          content: story.content,
          coverImage: story.imageUrl,
          date: story.date,
          status: 'approved',
          show_on_home: true,
          createdAt: story.createdAt || new Date().toISOString(),
          created_by: 'admin',
          created_by_name: 'Admin',
          type: 'admin_story'
        }))
        allStories.push(...adminStories)
      }

      // Add photographer homepage requests
      if (notificationsData.success && notificationsData.notifications && Array.isArray(notificationsData.notifications)) {
        const storyRequests = notificationsData.notifications.filter((n: any) =>
          n.type === 'story_homepage_request' && n.actionRequired
        )

        for (const request of storyRequests) {
          // Fetch story details
          const storyResponse = await fetch(`/api/photographer-stories?id=${request.relatedId}`)
          const storyData = await storyResponse.json()

          if (storyData.success && storyData.stories.length > 0) {
            const story = storyData.stories[0]
            allStories.push({
              id: story.id,
              title: story.title,
              content: story.content,
              coverImage: story.coverImage,
              location: story.location,
              date: story.date,
              photographerId: story.photographerId,
              photographerName: story.photographerName,
              status: 'pending',
              show_on_home: false,
              createdAt: story.createdAt,
              created_by: 'photographer',
              created_by_name: story.photographerName,
              type: 'photographer_story'
            })
          }
        }
      }

      setStories(allStories)
    } catch (error) {
      console.error('Error loading stories:', error)
    } finally {
      setLoading(false)
    }
  }
  const handleApprove = async (storyId: string, showOnHome: boolean = true) => {
    try {
      const story = stories.find(s => s.id === storyId)
      if (!story) return

      if (story.type === 'photographer_story') {
        // Handle photographer story approval
        const response = await fetch('/api/photographer-stories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: storyId,
            showOnHome: showOnHome,
            status: 'published'
          })
        })

        if (response.ok) {
          // Mark notification as resolved
          const notificationsResponse = await fetch('/api/notifications')
          const notificationsData = await notificationsResponse.json()

          if (notificationsData.success) {
            const request = notificationsData.notifications.find((n: any) =>
              n.type === 'story_homepage_request' && n.relatedId === storyId
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
              await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'story_approved',
                  title: 'Story Approved!',
                  message: `Your story "${story.title}" has been approved and is now featured on the homepage!`,
                  userId: story.photographerId,
                  relatedId: storyId,
                  actionRequired: false
                })
              })
            }
          }
        }
      }

      setStories(prev =>
        prev.map(story =>
          story.id === storyId
            ? { ...story, status: 'approved', show_on_home: showOnHome, approved_at: new Date().toISOString() }
            : story
        )
      )
      alert('Story approved successfully!')
    } catch (error) {
      console.error('Error approving story:', error)
      alert('Failed to approve story')
    }
  }

  const handleReject = async (storyId: string) => {
    try {
      const story = stories.find(s => s.id === storyId)
      if (!story) return

      if (story.type === 'photographer_story') {
        // Mark notification as resolved
        const notificationsResponse = await fetch('/api/notifications')
        const notificationsData = await notificationsResponse.json()

        if (notificationsData.success) {
          const request = notificationsData.notifications.find((n: any) =>
            n.type === 'story_homepage_request' && n.relatedId === storyId
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
            await fetch('/api/notifications', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'story_rejected',
                title: 'Story Request Rejected',
                message: `Your homepage request for story "${story.title}" has been rejected. You can make improvements and request again.`,
                userId: story.photographerId,
                relatedId: storyId,
                actionRequired: false
              })
            })
          }
        }
      }

      setStories(prev =>
        prev.map(story =>
          story.id === storyId
            ? { ...story, status: 'rejected', approved_at: new Date().toISOString() }
            : story
        )
      )
      alert('Story rejected.')
    } catch (error) {
      console.error('Error rejecting story:', error)
      alert('Failed to reject story')
    }
  }

  const toggleShowOnHome = async (storyId: string, currentValue: boolean) => {
    try {
      const story = stories.find(s => s.id === storyId)
      if (!story) return

      if (story.type === 'photographer_story') {
        const response = await fetch('/api/photographer-stories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: storyId,
            showOnHome: !currentValue
          })
        })

        if (!response.ok) return
      }

      setStories(prev =>
        prev.map(story =>
          story.id === storyId
            ? { ...story, show_on_home: !currentValue }
            : story
        )
      )
    } catch (error) {
      console.error('Error updating show on home:', error)
    }
  }

  const handleDelete = async (storyId: string) => {
    if (!confirm('Are you sure you want to delete this story?')) return

    try {
      const story = stories.find(s => s.id === storyId)
      if (!story) return

      if (story.type === 'photographer_story') {
        const response = await fetch(`/api/photographer-stories?id=${storyId}`, {
          method: 'DELETE'
        })

        if (!response.ok) return
      } else {
        // Handle admin story deletion if needed
        const response = await fetch(`/api/stories/${storyId}`, {
          method: 'DELETE'
        })

        if (!response.ok) return
      }

      setStories(prev => prev.filter(story => story.id !== storyId))
      alert('Story deleted successfully!')
    } catch (error) {
      console.error('Error deleting story:', error)
      alert('Failed to delete story')
    }
  }

  const filteredStories = stories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.created_by_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (story.location && story.location.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === 'all' || story.status === statusFilter

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
    if (!newStory.title.trim() || !newStory.content.trim()) {
      alert('Please fill title and content')
      return
    }
    
    try {
      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newStory.title.trim(),
          content: newStory.content.trim(),
          imageUrl: newStory.coverImage,
          date: newStory.date || new Date().toLocaleDateString(),
          published: true
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setNewStory({ title: '', content: '', coverImage: '', location: '', date: '', show_on_home: true })
        setShowAddModal(false)
        loadStories()
        alert('Story added successfully!')
      }
    } catch (error) {
      console.error('Error adding story:', error)
      alert('Failed to add story')
    }
  }

  const stats = {
    total: stories.length,
    pending: stories.filter(s => s.status === 'pending').length,
    approved: stories.filter(s => s.status === 'approved').length,
    rejected: stories.filter(s => s.status === 'rejected').length
  }

  // Handle different view modes
  if (viewMode === 'categories') {
    return (
      <div className="p-8">
        <StoriesCategoriesView
          onCategoryClick={(categoryName, stories) => {
            setSelectedCategory(categoryName)
            setSelectedStories(stories)
            setViewMode('list')
          }}
          onBack={() => setViewMode('list')}
        />
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Stories Manager</h1>
        <div className="flex items-center gap-4">
          <Badge variant="outline">{stats.total} Total</Badge>
          <Badge className="bg-yellow-100 text-yellow-800">{stats.pending} Pending</Badge>
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
          <Button 
            onClick={() => setShowAddModal(true)}
            className="bg-primary text-primary-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Story
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Requests</div>
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
          <option value="all">All Requests</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>
      {/* Stories List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading requests...</p>
        </div>
      ) : filteredStories.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No requests found</h3>
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'No story requests have been submitted yet'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredStories.map(story => (
            <Card key={story.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Cover Image */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {story.coverImage ? (
                      <img
                        src={story.coverImage}
                        alt={story.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{story.title}</h3>
                      {getStatusBadge(story.status)}
                      {story.status === 'approved' && (
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={story.show_on_home}
                                onChange={() => toggleShowOnHome(story.id, story.show_on_home)}
                                className="sr-only"
                              />
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${story.show_on_home
                                ? 'bg-green-500 border-green-500'
                                : 'border-gray-300 hover:border-green-400'
                                }`}>
                                {story.show_on_home && (
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                            </div>
                            <span className="text-sm font-medium text-gray-700">Show on Home Page</span>
                          </label>
                        </div>
                      )}
                    </div>
                    <p className="text-muted-foreground mb-3 line-clamp-2">{story.content}</p>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {story.created_by === 'admin'
                            ? 'Created By: Admin'
                            : `Requested By: Photographer (${story.created_by_name})`
                          }
                        </span>
                      </div>
                      {story.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>Location: {story.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>Date: {new Date(story.createdAt).toLocaleDateString()}</span>
                      </div>
                      {story.approved_at && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-muted-foreground" />
                          <span>
                            {story.status === 'approved' ? 'Approved' : 'Rejected'}: {new Date(story.approved_at).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedStory(story)
                        setShowDetailsModal(true)
                      }}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>

                    {story.status === 'pending' && story.created_by === 'photographer' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(story.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(story.id)}
                        >
                          <X className="w-3 h-3 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}

                    {story.status === 'rejected' && story.created_by === 'photographer' && (
                      <Button
                        size="sm"
                        onClick={() => handleApprove(story.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Re-approve
                      </Button>
                    )}

                    {story.status === 'approved' && story.created_by === 'photographer' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(story.id)}
                      >
                        <X className="w-3 h-3 mr-1" />
                        Reject
                      </Button>
                    )}

                    {story.status === 'approved' && (
                      <Button
                        size="sm"
                        onClick={() => toggleShowOnHome(story.id, story.show_on_home)}
                        className={story.show_on_home ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-600 hover:bg-gray-700"}
                        title={story.show_on_home ? "Remove from Homepage" : "Show on Homepage"}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        {story.show_on_home ? "Hide" : "Show"}
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(story.id)}
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
      {showDetailsModal && selectedStory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Story Details: {selectedStory.title}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowDetailsModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedStory.status)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Story Title</Label>
                  <p className="font-medium text-lg">{selectedStory.title}</p>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Created By</Label>
                  <p className="font-medium">{selectedStory.created_by_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedStory.created_by === 'admin' ? 'Admin' : 'Photographer'}
                  </p>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Location</Label>
                  <p className="font-medium">{selectedStory.location || 'Not specified'}</p>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Date</Label>
                  <p className="font-medium">{selectedStory.date || 'Not specified'}</p>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Created Date</Label>
                  <p className="font-medium">{new Date(selectedStory.createdAt).toLocaleDateString()}</p>
                </div>

                {selectedStory.approved_at && (
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      {selectedStory.status === 'approved' ? 'Approved Date' : 'Rejected Date'}
                    </Label>
                    <p className="font-medium">{new Date(selectedStory.approved_at).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              {selectedStory.coverImage && (
                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">Cover Image</Label>
                  <img
                    src={selectedStory.coverImage}
                    alt={selectedStory.title}
                    className="w-full max-w-md h-48 object-cover rounded-lg"
                  />
                </div>
              )}

              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Story Content</Label>
                <div className="bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto">
                  <p className="text-sm leading-relaxed">{selectedStory.content}</p>
                </div>
              </div>

              {selectedStory.status === 'pending' && selectedStory.created_by === 'photographer' && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={() => {
                      handleApprove(selectedStory.id)
                      setShowDetailsModal(false)
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Request
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleReject(selectedStory.id)
                      setShowDetailsModal(false)
                    }}
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject Request
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
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
                <Input
                  value={newStory.title}
                  onChange={(e) => setNewStory(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Beautiful Garden Wedding"
                />
              </div>

              <div className="space-y-2">
                <Label>Story Content</Label>
                <textarea
                  value={newStory.content}
                  onChange={(e) => setNewStory(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Tell the beautiful story..."
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
                    id="story-cover-upload"
                  />
                  <label htmlFor="story-cover-upload" className="cursor-pointer">
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

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="storyShowOnHome"
                  checked={newStory.show_on_home}
                  onChange={(e) => setNewStory(prev => ({ ...prev, show_on_home: e.target.checked }))}
                />
                <Label htmlFor="storyShowOnHome">Show on Home Page</Label>
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
    </div>
  )
}