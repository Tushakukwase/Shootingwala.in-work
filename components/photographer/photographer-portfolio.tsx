"use client"

import { useState, useContext, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Play, MapPin, Calendar, ChevronLeft, ChevronRight, Camera, Heart, MessageCircle, Send } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { useAuth } from "@/contexts/AuthContext"
import LoginModal from "@/components/login-modal"

interface PortfolioItem {
  id: string
  type: 'photo' | 'video'
  url: string
  thumbnail: string
  eventType: string
  location: string
  title: string
  likes?: number
  comments?: number
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

interface PhotographerPortfolioProps {
  portfolio: PortfolioItem[]
}

export default function PhotographerPortfolio({ portfolio }: PhotographerPortfolioProps) {
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [filter, setFilter] = useState<string>('All')
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set())
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>(portfolio)
  const [showCommentInput, setShowCommentInput] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [comments, setComments] = useState<Record<string, Comment[]>>({})
  const { user, isAuthenticated } = useAuth()

  // Update portfolio items when the prop changes
  useEffect(() => {
    setPortfolioItems(portfolio)
  }, [portfolio])

  // Fixed categories for portfolio filtering
  const portfolioCategories = ['All', 'Stories', 'Gallery', 'Videos', 'Album']
  
  const filteredPortfolio = filter === 'All'
    ? portfolioItems
    : portfolioItems.filter(item => {
        // Map filter to item type or eventType
        if (filter === 'Stories') {
          // Check if it's from photographer_stories or has 'story' in eventType
          return item.id?.includes('story') || item.eventType?.toLowerCase().includes('story')
        }
        if (filter === 'Gallery') {
          // Check if it's from photographer_galleries or is photo type
          return item.id?.includes('gallery') || item.type === 'photo'
        }
        if (filter === 'Videos') return item.type === 'video'
        if (filter === 'Album') return item.eventType?.toLowerCase().includes('album')
        return false
      })

  const openLightbox = (item: PortfolioItem, index: number) => {
    setSelectedItem(item)
    setCurrentIndex(index)
    setShowCommentInput(false)
    setCommentText('')
  }

  const closeLightbox = () => {
    setSelectedItem(null)
    setShowCommentInput(false)
    setCommentText('')
  }

  const navigatePortfolio = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' 
      ? (currentIndex - 1 + filteredPortfolio.length) % filteredPortfolio.length
      : (currentIndex + 1) % filteredPortfolio.length
    
    setCurrentIndex(newIndex)
    setSelectedItem(filteredPortfolio[newIndex])
    setShowCommentInput(false)
    setCommentText('')
  }

  const updateLikeCount = (itemId: string, increment: number) => {
    setPortfolioItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId 
          ? { ...item, likes: Math.max(0, (item.likes || 0) + increment) } 
          : item
      )
    )
    
    // Also update the selected item if it's the same
    if (selectedItem && selectedItem.id === itemId) {
      setSelectedItem(prevItem => 
        prevItem ? { ...prevItem, likes: Math.max(0, (prevItem.likes || 0) + increment) } : null
      )
    }
  }

  const updateCommentCount = (itemId: string, increment: number) => {
    setPortfolioItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId 
          ? { ...item, comments: Math.max(0, (item.comments || 0) + increment) } 
          : item
      )
    )
    
    // Also update the selected item if it's the same
    if (selectedItem && selectedItem.id === itemId) {
      setSelectedItem(prevItem => 
        prevItem ? { ...prevItem, comments: Math.max(0, (prevItem.comments || 0) + increment) } : null
      )
    }
  }

  const handleLike = async (itemId: string) => {
    if (!isAuthenticated) {
      setShowLoginModal(true)
      return
    }

    try {
      // Check if already liked
      const isLiked = likedItems.has(itemId)
      
      if (isLiked) {
        // Unlike
        const response = await fetch(`/api/likes?contentId=${itemId}&userId=${user?.id}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          setLikedItems(prev => {
            const newSet = new Set(prev)
            newSet.delete(itemId)
            return newSet
          })
          // Decrease like count
          updateLikeCount(itemId, -1)
        }
      } else {
        // Like
        const response = await fetch('/api/likes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contentId: itemId,
            contentType: 'portfolio',
            userId: user?.id
          })
        })
        
        if (response.ok) {
          setLikedItems(prev => new Set(prev).add(itemId))
          // Increase like count
          updateLikeCount(itemId, 1)
        }
      }
    } catch (error) {
      console.error('Error liking item:', error)
    }
  }

  const handleComment = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true)
      return
    }
    
    setShowCommentInput(true)
  }

  const submitComment = async () => {
    if (!isAuthenticated || !selectedItem || !commentText.trim()) return

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contentId: selectedItem.id,
          contentType: 'portfolio',
          userId: user?.id,
          userName: user?.fullName || user?.email || 'Anonymous',
          userAvatar: '',
          comment: commentText.trim()
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Update comment count
        updateCommentCount(selectedItem.id, 1)
        
        // Add comment to local state
        setComments(prev => ({
          ...prev,
          [selectedItem.id]: [
            ...(prev[selectedItem.id] || []),
            data.comment
          ]
        }))
        
        // Reset comment input
        setCommentText('')
        setShowCommentInput(false)
      }
    } catch (error) {
      console.error('Error submitting comment:', error)
    }
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded"></div>
              Portfolio
            </CardTitle>
            
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              {portfolioCategories.map((category) => (
                <Button
                  key={category}
                  variant={filter === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(category)}
                  className="capitalize"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Portfolio Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPortfolio.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg"
                onClick={() => openLightbox(item, index)}
              >
                <Image
                  src={item.thumbnail}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300">
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {item.type === 'video' ? (
                      <Play className="w-12 h-12 text-white" />
                    ) : (
                      <div className="w-12 h-12 border-2 border-white rounded-full flex items-center justify-center">
                        <div className="w-6 h-6 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-white font-medium text-sm mb-1">{item.title}</h3>
                  <div className="flex items-center gap-2 text-white/80 text-xs">
                    <Badge variant="secondary" className="text-xs">
                      {item.eventType}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{item.location}</span>
                    </div>
                  </div>
                </div>

                {/* Video Badge */}
                {item.type === 'video' && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-red-500 hover:bg-red-600">
                      <Play className="w-3 h-3 mr-1" />
                      Video
                    </Badge>
                  </div>
                )}

                {/* Likes and Comments */}
                <div className="absolute top-2 left-2 flex gap-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 px-2 bg-black/50 hover:bg-black/70 text-white border-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleLike(item.id)
                    }}
                  >
                    <Heart className={`w-4 h-4 ${likedItems.has(item.id) ? 'fill-current text-red-500' : ''}`} />
                    <span className="ml-1 text-xs">{item.likes || 0}</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 px-2 bg-black/50 hover:bg-black/70 text-white border-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleComment()
                    }}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="ml-1 text-xs">{item.comments || 0}</span>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredPortfolio.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
                  <Camera className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No Portfolio Items</h3>
                  <p className="text-gray-500">
                    {filter === 'all' 
                      ? 'This photographer hasn\'t uploaded any portfolio items yet.'
                      : `No items found for "${filter}" category.`
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl max-h-full w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute -top-12 right-0 text-white hover:bg-white/10 z-10"
                onClick={closeLightbox}
              >
                <X className="w-6 h-6" />
              </Button>

              {/* Navigation Buttons */}
              {filteredPortfolio.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 z-10"
                    onClick={() => navigatePortfolio('prev')}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 z-10"
                    onClick={() => navigatePortfolio('next')}
                  >
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                </>
              )}

              {/* Media Content */}
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                {selectedItem.type === 'video' ? (
                  <video
                    src={selectedItem.url}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Image
                    src={selectedItem.url}
                    alt={selectedItem.title}
                    fill
                    className="object-contain"
                  />
                )}
              </div>

              {/* Media Info */}
              <div className="mt-4 text-white">
                <h3 className="text-xl font-semibold mb-2">{selectedItem.title}</h3>
                <div className="flex items-center gap-4 text-sm text-white/80">
                  <Badge variant="secondary">{selectedItem.eventType}</Badge>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedItem.location}</span>
                  </div>
                </div>
                
                {/* Likes and Comments in Lightbox */}
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white/20 hover:bg-white/30 text-white"
                    onClick={() => handleLike(selectedItem.id)}
                  >
                    <Heart className={`w-4 h-4 mr-1 ${likedItems.has(selectedItem.id) ? 'fill-current text-red-500' : ''}`} />
                    Like ({selectedItem.likes || 0})
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white/20 hover:bg-white/30 text-white"
                    onClick={handleComment}
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Comment ({selectedItem.comments || 0})
                  </Button>
                </div>
                
                {/* Comment Input */}
                {showCommentInput && (
                  <div className="mt-4 flex gap-2">
                    <Input
                      type="text"
                      placeholder="Add a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="flex-1 bg-white/10 text-white placeholder:text-white/50 border-white/20"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          submitComment()
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={submitComment}
                      disabled={!commentText.trim()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </motion.div>
  )
}