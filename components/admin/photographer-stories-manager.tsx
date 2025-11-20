"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { FileText, Trash2, CheckCircle, X, User, Calendar, Eye } from "lucide-react"

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
}

export default function PhotographerStoriesManager() {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    loadStories()
  }, [])

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

  const handleApprove = async (storyId: string) => {
    try {
      setActionLoading(storyId)
      
      const response = await fetch('/api/photographer-stories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: storyId,
          status: 'approved',
          showOnHome: true
        })
      })
      
      const data = await response.json()
      if (data.success) {
        loadStories()
        alert('Story approved and added to homepage!')
      }
    } catch (error) {
      console.error('Error approving story:', error)
      alert('Failed to approve story')
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
    if (filter === 'pending') return story.status === 'pending'
    if (filter === 'approved') return story.status === 'approved'
    if (filter === 'rejected') return story.status === 'rejected'
    if (filter === 'draft') return story.status === 'draft'
    return true
  })

  const pendingCount = stories.filter(s => s.status === 'pending').length
  const approvedCount = stories.filter(s => s.status === 'approved').length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-green-600" />
          Photographer Stories Management
          {pendingCount > 0 && (
            <Badge variant="destructive">{pendingCount} Pending</Badge>
          )}
        </CardTitle>
        
        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All ({stories.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              filter === 'approved'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Approved ({approvedCount})
          </button>
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
                : "No stories have been created yet."
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredStories.map((story) => (
              <div key={story.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Story Cover Image */}
                    {story.coverImage && (
                      <img src={story.coverImage} alt={story.title} className="w-20 h-20 object-cover rounded" />
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{story.title}</h4>
                        {getStatusBadge(story.status)}
                        {story.showOnHome && (
                          <Badge className="bg-blue-100 text-blue-800">
                            <Eye className="w-3 h-3 mr-1" />
                            On Homepage
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{story.content}</p>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{story.photographerName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Created: {new Date(story.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      {story.location && (
                        <div className="text-sm text-gray-500 mb-1">
                          <strong>Location:</strong> {story.location}
                        </div>
                      )}
                      
                      {story.date && (
                        <div className="text-sm text-gray-500 mb-1">
                          <strong>Event Date:</strong> {story.date}
                        </div>
                      )}
                      
                      {story.request_date && (
                        <div className="text-sm text-gray-500 mb-2">
                          <strong>Requested:</strong> {new Date(story.request_date).toLocaleDateString()}
                        </div>
                      )}
                      
                      {story.approved_by && (
                        <div className="text-sm text-gray-500">
                          <strong>Approved by:</strong> {story.approved_by_name} on {new Date(story.approved_at!).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    {story.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApprove(story.id)}
                          disabled={actionLoading === story.id}
                        >
                          {actionLoading === story.id ? (
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
                          onClick={() => handleReject(story.id)}
                          disabled={actionLoading === story.id}
                        >
                          <X className="w-3 h-3 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(story.id)}
                      disabled={actionLoading === story.id}
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
    </Card>
  )
}