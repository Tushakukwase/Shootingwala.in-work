"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Heart, 
  MessageCircle, 
  User, 
  Calendar, 
  Filter,
  Search
} from "lucide-react"
import { Input } from "@/components/ui/input"

interface Like {
  id: string
  contentId: string
  contentType: string
  userId: string
  userName: string
  createdAt: string
}

interface Comment {
  id: string
  contentId: string
  contentType: string
  userId: string
  userName: string
  userAvatar: string
  comment: string
  createdAt: string
}

type LikeOrComment = (Like | Comment) & { type: 'like' | 'comment' }

interface LikesCommentsViewerProps {
  photographerId: string
}

export default function PhotographerLikesCommentsViewer({ photographerId }: LikesCommentsViewerProps) {
  const [likes, setLikes] = useState<Like[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'likes' | 'comments'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchPhotographerLikesAndComments()
  }, [photographerId])

  const fetchPhotographerLikesAndComments = async () => {
    try {
      setLoading(true)
      
      // Fetch photographer's content first
      const contentResponse = await fetch(`/api/content?photographerId=${photographerId}`)
      const contentData = await contentResponse.json()
      
      if (!contentData.success) {
        throw new Error('Failed to fetch photographer content')
      }
      
      // Get content IDs
      const contentIds = contentData.content.map((item: any) => item.id)
      
      if (contentIds.length === 0) {
        setLikes([])
        setComments([])
        setLoading(false)
        return
      }
      
      // Fetch likes for photographer's content
      const likesPromises = contentIds.map((contentId: string) => 
        fetch(`/api/likes?contentId=${contentId}`).then(res => res.json())
      )
      
      const likesResults = await Promise.all(likesPromises)
      const allLikes = likesResults.flatMap(result => result.success ? result.likes : [])
      
      // Fetch comments for photographer's content
      const commentsPromises = contentIds.map((contentId: string) => 
        fetch(`/api/comments?contentId=${contentId}`).then(res => res.json())
      )
      
      const commentsResults = await Promise.all(commentsPromises)
      const allComments = commentsResults.flatMap(result => result.success ? result.comments : [])
      
      setLikes(allLikes)
      setComments(allComments)
    } catch (error) {
      console.error('Error fetching photographer likes and comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredLikes = likes.filter(like => {
    const matchesSearch = like.userName.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const filteredComments = comments.filter(comment => {
    const matchesSearch = comment.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         comment.comment.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const allItems: LikeOrComment[] = [
    ...filteredLikes.map(like => ({ ...like, type: 'like' as const })),
    ...filteredComments.map(comment => ({ ...comment, type: 'comment' as const }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const filteredItems = allItems.filter(item => {
    if (filter === 'likes') return item.type === 'like'
    if (filter === 'comments') return item.type === 'comment'
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          <MessageCircle className="w-5 h-5 text-blue-500" />
          Engagement Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by user or comment..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Type Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            All ({allItems.length})
          </Button>
          <Button
            variant={filter === 'likes' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('likes')}
            className="flex items-center gap-2"
          >
            <Heart className="w-4 h-4" />
            Likes ({filteredLikes.length})
          </Button>
          <Button
            variant={filter === 'comments' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('comments')}
            className="flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Comments ({filteredComments.length})
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold">Total Likes</h3>
            </div>
            <p className="text-2xl font-bold text-red-600">{likes.length}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold">Total Comments</h3>
            </div>
            <p className="text-2xl font-bold text-blue-600">{comments.length}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-purple-500" />
              <h3 className="font-semibold">Engaged Users</h3>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {new Set([...likes.map(l => l.userId), ...comments.map(c => c.userId)]).size}
            </p>
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No engagement activity yet. Your content will appear here when users interact with it.</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      {item.type === 'like' ? (
                        <Heart className="w-5 h-5 text-red-500" />
                      ) : (
                        <MessageCircle className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{item.userName}</h4>
                      <Badge variant="secondary">
                        {item.type === 'like' ? 'Like' : 'Comment'}
                      </Badge>
                      <Badge variant="outline">
                        {item.contentType}
                      </Badge>
                    </div>
                    
                    {item.type === 'comment' && (
                      <p className="text-gray-700 mb-2">{(item as Comment).comment}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>ID: {item.contentId.substring(0, 8)}...</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}