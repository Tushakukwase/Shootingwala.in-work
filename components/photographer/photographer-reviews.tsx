"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Star, MessageSquare, User, Mail, Calendar, LogIn } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"
import ClientCache from "@/lib/cache-utils"

interface Review {
  id: string
  userName: string
  userAvatar: string
  rating: number
  comment: string
  date: string
  eventType: string
  clientEmail?: string // Add clientEmail to track the reviewer
}

interface PhotographerReviewsProps {
  reviews: Review[]
  averageRating: number
  totalReviews: number
  photographerId: string
}

export default function PhotographerReviews({ 
  reviews: initialReviews, 
  averageRating, 
  totalReviews, 
  photographerId 
}: PhotographerReviewsProps) {
  const { isAuthenticated, user } = useAuth()
  const [reviews, setReviews] = useState(initialReviews)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewData, setReviewData] = useState({
    clientName: isAuthenticated && user ? (user.fullName || '') : '',
    clientEmail: isAuthenticated && user ? (user.email || '') : '',
    rating: 0,
    comment: '',
    eventType: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [userReview, setUserReview] = useState<Review | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // If user is authenticated, pre-fill their name and email
  React.useEffect(() => {
    if (isAuthenticated && user) {
      setReviewData(prev => ({
        ...prev,
        clientName: user.fullName || '',
        clientEmail: user.email || ''
      }))
      
      // Check if user has already submitted a review
      const existingReview = reviews.find(review => review.clientEmail === user.email)
      
      if (existingReview) {
        setUserReview(existingReview)
        // Pre-fill form with existing review data for editing
        setReviewData({
          clientName: user.fullName || '',
          clientEmail: user.email || '',
          rating: existingReview.rating,
          comment: existingReview.comment,
          eventType: existingReview.eventType
        })
      }
    }
  }, [isAuthenticated, user, reviews])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const renderStars = (rating: number, interactive = false, onStarClick?: (index: number) => void) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 cursor-pointer ${
          i < rating 
            ? 'text-yellow-400 fill-current' 
            : interactive 
              ? 'text-gray-300 hover:text-yellow-400' 
              : 'text-gray-300'
        }`}
        onClick={() => interactive && onStarClick && onStarClick(i + 1)}
      />
    ))
  }

  const handleStarClick = (rating: number) => {
    setReviewData(prev => ({ ...prev, rating }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setReviewData(prev => ({ ...prev, [name]: value }))
  }

  const handleEventTypeChange = (value: string) => {
    setReviewData(prev => ({ ...prev, eventType: value }))
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!reviewData.clientName || !reviewData.clientEmail || reviewData.rating === 0 || !reviewData.comment || !reviewData.eventType) {
      alert('Please fill in all fields')
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(reviewData.clientEmail)) {
      alert('Please enter a valid email address')
      return
    }

    setSubmitting(true)
    try {
      let response;
      
      if (userReview && isEditing) {
        // Update existing review
        response = await fetch('/api/reviews', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            clientEmail: reviewData.clientEmail,
            photographerId,
            rating: reviewData.rating,
            comment: reviewData.comment,
            eventType: reviewData.eventType
          })
        })
      } else {
        // Submit new review
        response = await fetch('/api/reviews', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            photographerId,
            clientName: reviewData.clientName,
            clientEmail: reviewData.clientEmail,
            rating: reviewData.rating,
            comment: reviewData.comment,
            bookingId: `booking_${Date.now()}`, // Generate a mock booking ID
            eventType: reviewData.eventType
          })
        })
      }

      const result = await response.json()
      if (result.success) {
        setSubmitted(true)
        // Reset form
        setReviewData({
          clientName: isAuthenticated && user ? (user.fullName || '') : '',
          clientEmail: isAuthenticated && user ? (user.email || '') : '',
          rating: 0,
          comment: '',
          eventType: ''
        })
        setIsEditing(false)
        setUserReview(null)
        
        // Instead of reloading the page, update the reviews state directly
        // Invalidate the cache for this photographer
        ClientCache.clear(`photographer-${photographerId}`)
        
        // Show success message and close form
        setShowReviewForm(false)
        
        // In a real app, you would fetch updated reviews from the server
        // But for now, we'll just show a success message
        alert('Review submitted successfully!')
      } else {
        alert(result.error || 'Failed to submit review. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Failed to submit review. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0]
    reviews.forEach(review => {
      distribution[review.rating - 1]++
    })
    return distribution.reverse() // 5 stars first
  }

  const ratingDistribution = getRatingDistribution()

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <MessageSquare className="w-6 h-6 text-primary" />
            Reviews & Ratings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Rating Summary */}
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <span className="text-4xl font-bold">{averageRating}</span>
                <div className="flex">
                  {renderStars(Math.floor(averageRating))}
                </div>
              </div>
              <p className="text-gray-600">Based on {totalReviews} reviews</p>
            </div>

            {/* Rating Distribution */}
            <div className="flex-1 space-y-2">
              {ratingDistribution.map((count, index) => {
                const stars = 5 - index
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
                return (
                  <div key={stars} className="flex items-center gap-2 text-sm">
                    <span className="w-8">{stars}★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-gray-600">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0"
              >
                <div className="flex gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={review.userAvatar} alt={review.userName} />
                    <AvatarFallback>
                      {review.userName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-semibold">{review.userName}</h4>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {renderStars(review.rating)}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {review.eventType}
                          </Badge>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(review.date)}
                      </span>
                    </div>

                    <p className="text-gray-700 leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Load More Reviews */}
          {totalReviews > reviews.length && (
            <div className="text-center pt-4">
              <Button variant="outline">
                Load More Reviews ({totalReviews - reviews.length} remaining)
              </Button>
            </div>
          )}

          {/* Write Review Form or Login Prompt */}
          {!showReviewForm ? (
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-gray-600 mb-3">
                {userReview 
                  ? 'You have already submitted a review for this photographer.' 
                  : 'Worked with this photographer? Share your experience!'}
              </p>
              {isAuthenticated ? (
                userReview ? (
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button variant="outline" onClick={() => {
                      setShowReviewForm(true)
                      setIsEditing(true)
                    }}>
                      Update Your Review
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" onClick={() => setShowReviewForm(true)}>
                    Write a Review
                  </Button>
                )
              ) : (
                <Link href="/login">
                  <Button variant="outline">
                    <LogIn className="w-4 h-4 mr-2" />
                    Login to Write a Review
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="bg-gray-50 rounded-lg p-4"
            >
              {submitted ? (
                <div className="text-center py-4">
                  <div className="text-green-600 font-semibold">
                    {isEditing ? 'Review updated successfully!' : 'Thank you for your review!'}
                  </div>
                  <p className="text-gray-600">Your review has been submitted successfully.</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg">
                      {isEditing ? 'Update Your Review' : 'Write a Review'}
                    </h3>
                    {isEditing && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setIsEditing(false)
                          setUserReview(null)
                          setReviewData({
                            clientName: isAuthenticated && user ? (user.fullName || '') : '',
                            clientEmail: isAuthenticated && user ? (user.email || '') : '',
                            rating: 0,
                            comment: '',
                            eventType: ''
                          })
                        }}
                      >
                        Write New Review
                      </Button>
                    )}
                  </div>
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    {!isAuthenticated && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="clientName">Your Name</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                              id="clientName"
                              name="clientName"
                              value={reviewData.clientName}
                              onChange={handleInputChange}
                              className="pl-10"
                              placeholder="Enter your name"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="clientEmail">Your Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                              id="clientEmail"
                              name="clientEmail"
                              type="email"
                              value={reviewData.clientEmail}
                              onChange={handleInputChange}
                              className="pl-10"
                              placeholder="Enter your email"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <Label>Event Type</Label>
                      <Select value={reviewData.eventType} onValueChange={handleEventTypeChange} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Wedding">Wedding</SelectItem>
                          <SelectItem value="Portrait">Portrait</SelectItem>
                          <SelectItem value="Event">Event</SelectItem>
                          <SelectItem value="Corporate">Corporate</SelectItem>
                          <SelectItem value="Fashion">Fashion</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Rating</Label>
                      <div className="flex items-center gap-1">
                        {renderStars(reviewData.rating, true, handleStarClick)}
                        <span className="ml-2 text-sm text-gray-600">
                          {reviewData.rating > 0 ? `${reviewData.rating} star${reviewData.rating !== 1 ? 's' : ''}` : 'Select rating'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="comment">Your Review</Label>
                      <Textarea
                        id="comment"
                        name="comment"
                        value={reviewData.comment}
                        onChange={handleInputChange}
                        placeholder="Share your experience with this photographer..."
                        rows={4}
                        required
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" disabled={submitting}>
                        {submitting ? 'Submitting...' : 'Submit Review'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowReviewForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}