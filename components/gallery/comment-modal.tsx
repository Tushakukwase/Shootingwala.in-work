"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { X, Send, User } from "lucide-react"

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

interface CommentModalProps {
  imageId: string
  userId?: string
  userName?: string
  isOpen: boolean
  onClose: () => void
  onCommentAdded: () => void
}

export default function CommentModal({ 
  imageId, 
  userId = "anonymous", 
  userName = "Anonymous",
  isOpen, 
  onClose,
  onCommentAdded
}: CommentModalProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchComments()
    }
  }, [isOpen, imageId])

  const fetchComments = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/comments?contentId=${imageId}&contentType=image`)
      
      // Check if the response is ok
      if (!response.ok) {
        // Handle 431 Request Header Fields Too Large specifically
        if (response.status === 431) {
          console.warn('Request header too large, using empty comments');
          setComments([]);
          return;
        } else {
          throw new Error(`Failed to fetch comments: ${response.status} ${response.statusText}`);
        }
      }
      
      const data = await response.json()
      
      if (data.success) {
        setComments(data.comments)
      }
    } catch (error: any) {
      console.error('Error fetching comments:', error)
      // Set empty comments array in case of error
      setComments([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newComment.trim() || submitting) return
    
    try {
      setSubmitting(true)
      
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contentId: imageId,
          contentType: 'image',
          userId,
          userName,
          comment: newComment
        })
      })
      
      // Check if the response is ok
      if (!response.ok) {
        // Handle 431 Request Header Fields Too Large specifically
        if (response.status === 431) {
          console.warn('Request header too large, unable to add comment');
          // Optionally show user-friendly message
          return;
        } else {
          throw new Error(`Failed to add comment: ${response.status} ${response.statusText}`);
        }
      }
      
      const data = await response.json()
      
      if (data.success) {
        setNewComment("")
        fetchComments() // Refresh comments
        onCommentAdded() // Notify parent component to update comment count
      }
    } catch (error: any) {
      console.error('Error adding comment:', error)
      // Optionally show an error message to the user
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Comments</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar>
                    <AvatarImage src={comment.userAvatar} alt={comment.userName} />
                    <AvatarFallback>{comment.userName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{comment.userName}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm">{comment.comment}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Comment Form */}
        <div className="p-4 border-t">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 resize-none"
              rows={2}
              disabled={submitting}
            />
            <Button 
              type="submit" 
              size="sm" 
              disabled={!newComment.trim() || submitting}
              className="self-end"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}