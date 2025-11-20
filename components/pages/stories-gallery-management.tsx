"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { Plus, Image, FileText, Clock, CheckCircle, X, Eye, Edit, Trash2 } from "lucide-react"

interface Story {
  id: string
  title: string
  content: string
  coverImage: string
  gallery: string[]
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  showOnHome: boolean
  createdAt: string
  adminFeedback?: string
}

interface GalleryItem {
  id: string
  title: string
  category: string
  images: string[]
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  createdAt: string
  adminFeedback?: string
}

export default function StoriesGalleryManagement() {
  const [stories, setStories] = useState<Story[]>([])
  const [galleries, setGalleries] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'stories' | 'galleries'>('stories')
  const [showAddStoryModal, setShowAddStoryModal] = useState(false)
  const [showAddGalleryModal, setShowAddGalleryModal] = useState(false)
  const [newStory, setNewStory] = useState({
    title: '',
    content: '',
    coverImage: '',
    gallery: [] as string[]
  })
  const [newGallery, setNewGallery] = useState({
    title: '',
    category: '',
    images: [] as string[]
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [storiesRes, galleriesRes] = await Promise.all([
        fetch('/api/stories'),
        fetch('/api/galleries')
      ])
      
      const storiesData = await storiesRes.json()
      const galleriesData = await galleriesRes.json()
      
      if (storiesData.success) {
        // Transform API data to match component interface
        const transformedStories = storiesData.stories.map((story: any) => ({
          id: story._id,
          title: story.title,
          content: story.content,
          coverImage: story.imageUrl,
          gallery: [],
          status: story.status || 'approved',
          showOnHome: story.showOnHome || false,
          createdAt: story.date || story.createdAt
        }))
        setStories(transformedStories)
      }
      
      if (galleriesData.success && galleriesData.galleries) {
        // Transform API data to match component interface
        const transformedGalleries = galleriesData.galleries.map((gallery: any) => ({
          id: gallery._id || gallery.id,
          title: gallery.title || 'Untitled Gallery',
          category: gallery.category || 'General',
          images: gallery.images || [],
          status: gallery.status || 'approved',
          createdAt: gallery.createdAt || new Date().toISOString()
        }))
        setGalleries(transformedGalleries)
      } else {
        // Set empty array if no galleries data
        setGalleries([])
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddStory = async () => {
    if (!newStory.title.trim() || !newStory.content.trim()) return
    
    try {
      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newStory.title,
          content: newStory.content,
          imageUrl: newStory.coverImage || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop',
          status: 'approved'
        })
      })
      
      const data = await response.json()
      if (data.success) {
        loadData() // Refresh data
        setNewStory({ title: '', content: '', coverImage: '', gallery: [] })
        setShowAddStoryModal(false)
        alert('Story added successfully!')
      }
    } catch (error) {
      console.error('Error adding story:', error)
      alert('Failed to add story')
    }
  }

  const handleAddGallery = async () => {
    if (!newGallery.title.trim() || !newGallery.category.trim()) return
    
    try {
      const response = await fetch('/api/galleries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newGallery.title,
          category: newGallery.category,
          images: newGallery.images,
          status: 'approved'
        })
      })
      
      const data = await response.json()
      if (data.success) {
        loadData() // Refresh data
        setNewGallery({ title: '', category: '', images: [] })
        setShowAddGalleryModal(false)
        alert('Gallery added successfully!')
      }
    } catch (error) {
      console.error('Error adding gallery:', error)
      alert('Failed to add gallery')
    }
  }



  const handleDeleteGallery = async (galleryId: string) => {
    if (!confirm('Are you sure you want to delete this gallery?')) return
    
    try {
      const response = await fetch(`/api/galleries?id=${galleryId}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      if (data.success) {
        loadData() // Refresh data
        alert('Gallery deleted successfully!')
      }
    } catch (error) {
      console.error('Error deleting gallery:', error)
      alert('Failed to delete gallery')
    }
  }



  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><X className="w-3 h-3 mr-1" />Rejected</Badge>
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>
      default:
        return null
    }
  }

  const handleApproveStory = async (storyId: string) => {
    try {
      const response = await fetch('/api/stories', {
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
        loadData()
        alert('Story approved! Use "Show on Homepage" button to display it on homepage.')
      }
    } catch (error) {
      console.error('Error approving story:', error)
      alert('Failed to approve story')
    }
  }

  const handleRejectStory = async (storyId: string) => {
    try {
      const response = await fetch('/api/stories', {
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
        loadData()
        alert('Story rejected')
      }
    } catch (error) {
      console.error('Error rejecting story:', error)
      alert('Failed to reject story')
    }
  }

  const handleToggleStoryHomepage = async (storyId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/stories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: storyId,
          showOnHome: !currentStatus
        })
      })
      
      const data = await response.json()
      if (data.success) {
        loadData()
        alert(currentStatus ? 'Story removed from homepage!' : 'Story added to homepage!')
      }
    } catch (error) {
      console.error('Error toggling homepage status:', error)
      alert('Failed to update homepage status')
    }
  }

  const handleDeleteStory = async (storyId: string) => {
    if (!confirm('Are you sure you want to permanently delete this story? This action cannot be undone.')) return
    
    try {
      const response = await fetch(`/api/stories/${storyId}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      if (data.success) {
        loadData()
        alert('Story deleted successfully')
      }
    } catch (error) {
      console.error('Error deleting story:', error)
      alert('Failed to delete story')
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Stories & Gallery</h1>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowAddStoryModal(true)}
            variant="outline"
          >
            <FileText className="w-4 h-4 mr-2" />
            Add Story
          </Button>
          <Button 
            onClick={() => setShowAddGalleryModal(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Image className="w-4 h-4 mr-2" />
            Add Gallery
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('stories')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'stories'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Wedding Stories
        </button>
        <button
          onClick={() => setActiveTab('galleries')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'galleries'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Gallery Collections
        </button>
      </div>

      {/* Stories Tab */}
      {activeTab === 'stories' && (
        <div className="space-y-4">
          {stories.map(story => (
            <Card key={story.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <img
                    src={story.coverImage}
                    alt={story.title}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{story.title}</h3>
                      <div className="flex gap-2">
                        {getStatusBadge(story.status)}
                        {story.showOnHome ? (
                          <Badge className="bg-green-100 text-green-800">
                            <Eye className="w-3 h-3 mr-1" />
                            On Homepage
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-600">
                            Not on Homepage
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm line-clamp-2">{story.content}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Created: {new Date(story.createdAt).toLocaleDateString()}</span>
                    </div>
                    {story.adminFeedback && (
                      <div className="p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                        <strong>Admin Feedback:</strong> {story.adminFeedback}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {/* Status Control Buttons */}
                    {story.status === 'pending' && (
                      <>
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApproveStory(story.id)}
                          title="Approve Story"
                        >
                          <CheckCircle className="w-3 h-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleRejectStory(story.id)}
                          title="Reject Story"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </>
                    )}

                    {story.status === 'approved' && (
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleRejectStory(story.id)}
                        title="Reject Story"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}

                    {story.status === 'rejected' && (
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleApproveStory(story.id)}
                        title="Approve Story"
                      >
                        <CheckCircle className="w-3 h-3" />
                      </Button>
                    )}

                    {/* Homepage Toggle Button (only for approved stories) */}
                    {story.status === 'approved' && (
                      <Button 
                        size="sm" 
                        className={story.showOnHome ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-600 hover:bg-gray-700"}
                        onClick={() => handleToggleStoryHomepage(story.id, story.showOnHome)}
                        title={story.showOnHome ? "Remove from Homepage" : "Show on Homepage"}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                    )}

                    {/* Edit Button */}
                    <Button size="sm" variant="outline" title="Edit Story">
                      <Edit className="w-3 h-3" />
                    </Button>

                    {/* Delete Button (Admin only) */}
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDeleteStory(story.id)}
                      title="Delete Story"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Gallery Tab */}
      {activeTab === 'galleries' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleries && galleries.length > 0 ? galleries.map(item => (
            <Card key={item.id} className="overflow-hidden">
              <div className="aspect-video bg-muted flex items-center justify-center">
                {item.images && item.images.length > 0 ? (
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image className="w-12 h-12 text-muted-foreground" />
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{item.title}</h3>
                  {getStatusBadge(item.status)}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{item.category}</p>
                <div className="text-xs text-muted-foreground mb-3">
                  {item.images ? item.images.length : 0} images • {item.createdAt}
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" className="flex-1"><Eye className="w-3 h-3" /></Button>
                  <Button size="sm" variant="outline" className="flex-1"><Edit className="w-3 h-3" /></Button>
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="col-span-full text-center py-12">
              <Image className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Galleries Yet</h3>
              <p className="text-muted-foreground mb-4">Create your first gallery to get started</p>
              <Button onClick={() => setShowAddGalleryModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Gallery
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}