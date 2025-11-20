"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle } from "lucide-react"
import CommentModal from "@/components/gallery/comment-modal"

interface LikeCommentButtonsProps {
  imageId: string
  userId?: string
  userName?: string
  onCommentClick?: () => void
  className?: string
}

export default function LikeCommentButtons({ 
  imageId, 
  userId = "anonymous",
  userName = "Anonymous",
  onCommentClick,
  className = ""
}: LikeCommentButtonsProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [commentCount, setCommentCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false)

  useEffect(() => {
    fetchEngagementData()
  }, [imageId])

  const fetchEngagementData = async () => {
    try {
      setLoading(true)
      
      // Fetch likes for this image
      const likesResponse = await fetch(`/api/likes?contentId=${imageId}&contentType=image`)
      
      // Check if the response is ok
      if (!likesResponse.ok) {
        // Handle 431 Request Header Fields Too Large specifically
        if (likesResponse.status === 431) {
          console.warn('Request header too large, using default values');
          setLikeCount(0);
          setIsLiked(false);
          // Continue to fetch comments
        } else {
          throw new Error(`Failed to fetch likes: ${likesResponse.status} ${likesResponse.statusText}`);
        }
      } else {
        const likesData = await likesResponse.json()
        
        if (likesData.success) {
          setLikeCount(likesData.count)
          // Check if current user has liked this image
          const userLike = likesData.likes.find((like: any) => like.userId === userId)
          setIsLiked(!!userLike)
        }
      }
      
      // Fetch comments for this image
      const commentsResponse = await fetch(`/api/comments?contentId=${imageId}&contentType=image`)
      
      // Check if the response is ok
      if (!commentsResponse.ok) {
        // Handle 431 Request Header Fields Too Large specifically
        if (commentsResponse.status === 431) {
          console.warn('Request header too large, using default values');
          setCommentCount(0);
        } else {
          throw new Error(`Failed to fetch comments: ${commentsResponse.status} ${commentsResponse.statusText}`);
        }
      } else {
        const commentsData = await commentsResponse.json()
        
        if (commentsData.success) {
          setCommentCount(commentsData.count)
        }
      }
    } catch (error: any) {
      console.error('Error fetching engagement data:', error)
      // Set default values in case of error
      setLikeCount(0)
      setCommentCount(0)
      setIsLiked(false)
      // Show a user-friendly error message
      // In a real app, you might want to show this to the user
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    if (!userId) return
    
    try {
      if (isLiked) {
        // Unlike
        const response = await fetch(`/api/likes?contentId=${imageId}&userId=${userId}`, {
          method: 'DELETE'
        })
        
        // Check if the response is ok
        if (!response.ok) {
          // Handle 431 Request Header Fields Too Large specifically
          if (response.status === 431) {
            console.warn('Request header too large, unable to unlike');
            // Optionally show user-friendly message
            return;
          } else {
            throw new Error(`Failed to unlike: ${response.status} ${response.statusText}`);
          }
        }
        
        const data = await response.json()
        
        if (data.success) {
          setIsLiked(false)
          setLikeCount(prev => prev - 1)
        }
      } else {
        // Like
        const response = await fetch('/api/likes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contentId: imageId,
            contentType: 'image',
            userId
          })
        })
        
        // Check if the response is ok
        if (!response.ok) {
          // Handle 431 Request Header Fields Too Large specifically
          if (response.status === 431) {
            console.warn('Request header too large, unable to like');
            // Optionally show user-friendly message
            return;
          } else {
            throw new Error(`Failed to like: ${response.status} ${response.statusText}`);
          }
        }
        
        const data = await response.json()
        
        if (data.success) {
          setIsLiked(true)
          setLikeCount(prev => prev + 1)
        }
      }
    } catch (error: any) {
      console.error('Error toggling like:', error)
      // Optionally show an error message to the user
      // In a real app, you might want to show a toast notification
    }
  }

  const handleCommentClick = () => {
    setIsCommentModalOpen(true)
  }

  const handleCommentAdded = () => {
    // Refresh comment count
    fetchEngagementData()
  }

  if (loading) {
    return (
      <div className={`flex flex-col gap-1 ${className}`}>
        <div className="flex flex-col items-center">
          <Button variant="outline" size="sm" disabled className="bg-transparent border-0">
            <Heart className="w-7 h-7 text-gray-500" />
          </Button>
          <span className="text-xs text-gray-700 mt-0.5">...</span>
        </div>
        <div className="flex flex-col items-center">
          <Button variant="outline" size="sm" disabled className="bg-transparent border-0">
            <MessageCircle className="w-7 h-7 text-gray-500" />
          </Button>
          <span className="text-xs text-gray-700 mt-0.5">...</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={`flex flex-col gap-1 ${className}`}>
        <div className="flex flex-col items-center">
          <Button 
            variant={isLiked ? "default" : "outline"} 
            size="sm" 
            onClick={handleLike}
            className={isLiked ? "bg-red-500 hover:bg-red-600 border-0" : "bg-transparent border-0 hover:bg-gray-100/50"}
          >
            <Heart className={`w-7 h-7 ${isLiked ? "fill-current" : ""}`} />
          </Button>
          <span className="text-xs text-gray-700 mt-0.5">{likeCount}</span>
        </div>
        <div className="flex flex-col items-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCommentClick}
            className="bg-transparent border-0 hover:bg-gray-100/50"
          >
            <MessageCircle className="w-7 h-7" />
          </Button>
          <span className="text-xs text-gray-700 mt-0.5">{commentCount}</span>
        </div>
      </div>

      <CommentModal
        imageId={imageId}
        userId={userId}
        userName={userName}
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        onCommentAdded={handleCommentAdded}
      />
    </>
  )
}