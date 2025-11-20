"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from "react"
import { Plus, Image, FileText, Trash2, CheckCircle, X, User, Calendar, Eye, Upload } from "lucide-react"

interface ContentItem {
  id: string
  title: string
  description: string
  image_url: string | null
  type: 'gallery' | 'story'
  created_by: 'admin' | 'photographer'
  created_by_name: string
  created_by_id: string
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  approved_by?: string
  approved_by_id?: string
  request_date?: string
  approved_at?: string
  is_notified: boolean
  showOnHome: boolean
  createdAt: string
  images?: string[]
  content?: string
  location?: string
  date?: string
}

export default function UnifiedContentManager() {
  const [content, setContent] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [newContent, setNewContent] = useState({
    title: '',
    description: '',
    image_url: '',
    type: 'gallery' as 'gallery' | 'story',
    content: '',
    location: '',
    date: ''
  })

  useEffect(() => {
    loadContent()
    // Mark content as viewed when component loads
    markContentAsViewed()
  }, [])

  const markContentAsViewed = async () => {
    try {
      await fetch('/api/content/mark-viewed', { method: 'POST' })
    } catch (error) {
      console.error('Error marking content as viewed:', error)
    }
  }

  const loadContent = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/content')
      const data = await response.json()
      
      if (data.success) {
        setContent(data.content)
      }
    } catch (error) {
      console.error('Error loading content:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', newContent.type)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      if (data.success) {
        setNewContent(prev => ({ ...prev, image_url: data.data.url }))
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

  const handleAddContent = async () => {
    if (!newContent.title.trim()) return
    
    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newContent,
          created_by: 'admin',
          created_by_name: 'Admin',
          created_by_id: 'admin',
          images: newContent.image_url ? [newContent.image_url] : []
        })
      })
      
      const data = await response.json()
      if (data.success) {
        loadContent()
        setNewContent({ title: '', description: '', image_url: '', type: 'gallery', content: '', location: '', date: '' })
        setShowAddModal(false)
        alert(`${newContent.type} created successfully!`)
      }
    } catch (error) {
      console.error('Error adding content:', error)
      alert('Failed to add content')
    }
  }

  const handleApprove = async (contentId: string) => {
    try {
      setActionLoading(contentId)
      
      const response = await fetch('/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: contentId,
          status: 'approved',
          approved_by: 'admin',
          approved_by_id: 'admin',
          showOnHome: true
        })
      })
      
      const data = await response.json()
      if (data.success) {
        loadContent()
        alert('Content approved and added to homepage!')
      }
    } catch (error) {
      console.error('Error approving content:', error)
      alert('Failed to approve content')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (contentId: string) => {
    try {
      setActionLoading(contentId)
      
      const response = await fetch('/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: contentId,
          status: 'rejected',
          approved_by: 'admin',
          approved_by_id: 'admin',
          showOnHome: false
        })
      })
      
      const data = await response.json()
      if (data.success) {
        loadContent()
        alert('Content rejected')
      }
    } catch (error) {
      console.error('Error rejecting content:', error)
      alert('Failed to reject content')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (contentId: string) => {
    if (!confirm('Are you sure you want to permanently delete this content? This action cannot be undone.')) return
    
    try {
      setActionLoading(contentId)
      
      const response = await fetch(`/api/content?id=${contentId}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      if (data.success) {
        loadContent()
        alert('Content deleted successfully')
      }
    } catch (error) {
      console.error('Error deleting content:', error)
      alert('Failed to delete content')
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

  const getTypeBadge = (type: string) => {
    return type === 'gallery' ? 
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        <Image className="w-3 h-3 mr-1" />
        Gallery
      </Badge> : 
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        <FileText className="w-3 h-3 mr-1" />
        Story
      </Badge>
  }

  const filteredContent = content.filter(item => {
    if (filter === 'pending') return item.status === 'pending'
    if (filter === 'approved') return item.status === 'approved'
    if (filter === 'rejected') return item.status === 'rejected'
    if (filter === 'draft') return item.status === 'draft'
    if (filter === 'gallery') return item.type === 'gallery'
    if (filter === 'story') return item.type === 'story'
    if (filter === 'admin') return item.created_by === 'admin'
    if (filter === 'photographer') return item.created_by === 'photographer'
    return true
  })

  const pendingCount = content.filter(item => item.status === 'pending').length
  const totalCount = content.length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Image className="w-5 h-5 text-blue-600" />
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            Gallery & Stories
            {pendingCount > 0 && (
              <Badge variant="destructive">{pendingCount}</Badge>
            )}
          </CardTitle>
          <Button onClick={() => setShowAddModal(true)} className="bg-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Add New
          </Button>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-1 bg-muted p-1 rounded-lg">
          {[
            { key: 'all', label: `All (${totalCount})` },
            { key: 'pending', label: `Pending (${pendingCount})` },
            { key: 'approved', label: `Approved (${content.filter(i => i.status === 'approved').length})` },
            { key: 'gallery', label: `Gallery (${content.filter(i => i.type === 'gallery').length})` },
            { key: 'story', label: `Stories (${content.filter(i => i.type === 'story').length})` },
            { key: 'admin', label: `Admin (${content.filter(i => i.created_by === 'admin').length})` },
            { key: 'photographer', label: `Photographer (${content.filter(i => i.created_by === 'photographer').length})` }
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
            <p className="text-muted-foreground">Loading content...</p>
          </div>
        ) : filteredContent.length === 0 ? (
          <div className="text-center py-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Image className="w-12 h-12 text-muted-foreground" />
              <FileText className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Content Found</h3>
            <p className="text-muted-foreground">
              {filter === 'pending' 
                ? "No content is pending approval."
                : filter === 'approved'
                ? "No content has been approved yet."
                : "No content has been created yet."
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredContent.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Content Preview */}
                    {item.image_url && (
                      <img src={item.image_url} alt={item.title} className="w-20 h-20 object-cover rounded" />
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{item.title}</h4>
                        {getTypeBadge(item.type)}
                        {getStatusBadge(item.status)}
                        {item.showOnHome && (
                          <Badge className="bg-blue-100 text-blue-800">
                            <Eye className="w-3 h-3 mr-1" />
                            On Homepage
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>Created by: {item.created_by_name} ({item.created_by})</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Created: {new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      {item.request_date && (
                        <div className="text-sm text-gray-500 mb-1">
                          <strong>Requested:</strong> {new Date(item.request_date).toLocaleDateString()}
                        </div>
                      )}
                      
                      {item.approved_by && (
                        <div className="text-sm text-gray-500 mb-1">
                          <strong>Approved by:</strong> {item.approved_by} on {new Date(item.approved_at!).toLocaleDateString()}
                        </div>
                      )}
                      
                      {item.type === 'story' && item.location && (
                        <div className="text-sm text-gray-500 mb-1">
                          <strong>Location:</strong> {item.location}
                        </div>
                      )}
                      
                      {item.type === 'story' && item.date && (
                        <div className="text-sm text-gray-500">
                          <strong>Event Date:</strong> {item.date}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    {item.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApprove(item.id)}
                          disabled={actionLoading === item.id}
                        >
                          {actionLoading === item.id ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Approve
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(item.id)}
                          disabled={actionLoading === item.id}
                        >
                          <X className="w-3 h-3 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(item.id)}
                      disabled={actionLoading === item.id}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Add Content Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Add New Content</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Content Type</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="gallery"
                      checked={newContent.type === 'gallery'}
                      onChange={(e) => setNewContent(prev => ({ ...prev, type: e.target.value as 'gallery' | 'story' }))}
                    />
                    <Image className="w-4 h-4" />
                    Gallery
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="story"
                      checked={newContent.type === 'story'}
                      onChange={(e) => setNewContent(prev => ({ ...prev, type: e.target.value as 'gallery' | 'story' }))}
                    />
                    <FileText className="w-4 h-4" />
                    Story
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={newContent.title}
                  onChange={(e) => setNewContent(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={`Enter ${newContent.type} title`}
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newContent.description}
                  onChange={(e) => setNewContent(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={`Enter ${newContent.type} description`}
                  rows={3}
                />
              </div>

              {newContent.type === 'story' && (
                <>
                  <div className="space-y-2">
                    <Label>Story Content</Label>
                    <Textarea
                      value={newContent.content}
                      onChange={(e) => setNewContent(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Tell the story..."
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        value={newContent.location}
                        onChange={(e) => setNewContent(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Event location"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={newContent.date}
                        onChange={(e) => setNewContent(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label>Upload Image</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    {newContent.image_url ? (
                      <img src={newContent.image_url} alt="Preview" className="w-32 h-32 object-cover rounded mx-auto" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          {uploading ? 'Uploading...' : 'Click to upload image or drag and drop'}
                        </p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleAddContent} 
                  className="flex-1"
                  disabled={!newContent.title.trim() || uploading}
                >
                  Create {newContent.type}
                </Button>
                <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Card>
  )
}