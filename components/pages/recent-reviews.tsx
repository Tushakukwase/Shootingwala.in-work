"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState, useEffect } from "react"
import { Star, Search, MessageSquare, ThumbsUp, Calendar, User, X, Send } from "lucide-react"

interface Review {
  id: string
  photographerId: string
  clientName: string
  clientEmail: string
  rating: number
  comment: string
  bookingId?: string
  approved: boolean
  createdAt: string
  response?: string
}

export default function RecentReviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRating, setFilterRating] = useState('all')
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [showResponseModal, setShowResponseModal] = useState(false)
  const [responseText, setResponseText] = useState('')
  const [photographerId, setPhotographerId] = useState<string>('')

  useEffect(() => {
    // Get photographer ID from localStorage
    const studioData = localStorage.getItem('studio')
    if (studioData) {
      try {
        const parsed = JSON.parse(studioData)
        setPhotographerId(parsed._id)
        loadReviews(parsed._id)
      } catch (error) {
        console.error('Error parsing studio data:', error)
      }
    }
  }, [])

  const loadReviews = async (photographerId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/reviews?photographerId=${photographerId}`)
      const data = await response.json()
      
      if (data.success) {
        setReviews(data.data)
      }
    } catch (error) {
      console.error('Error loading reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddResponse = async () => {
    if (!selectedReview || !responseText.trim()) return
    
    try {
      const response = await fetch('/api/reviews', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedReview.id,
          response: responseText
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setReviews(prev => 
          prev.map(review => 
            review.id === selectedReview.id ? { ...review, response: responseText } : review
          )
        )
        setResponseText('')
        setShowResponseModal(false)
        setSelectedReview(null)
        alert('Response added successfully!')
      }
    } catch (error) {
      console.error('Error adding response:', error)
      alert('Failed to add response')
    }
  }

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.comment.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRating = filterRating === 'all' || review.rating.toString() === filterRating
    
    return matchesSearch && matchesRating && review.approved
  })

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  const getAverageRating = () => {
    if (reviews.length === 0) return 0
    const approvedReviews = reviews.filter(r => r.approved)
    if (approvedReviews.length === 0) return 0
    return approvedReviews.reduce((sum, review) => sum + review.rating, 0) / approvedReviews.length
  }

  const getRatingDistribution = () => {
    const approvedReviews = reviews.filter(r => r.approved)
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    approvedReviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++
    })
    return distribution
  }

  const stats = {
    total: reviews.filter(r => r.approved).length,
    average: getAverageRating(),
    distribution: getRatingDistribution(),
    pending: reviews.filter(r => !r.approved).length
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Recent Reviews</h1>
        <div className="flex items-center gap-4">
          <Badge variant="outline">{stats.total} Reviews</Badge>
          <div className="flex items-center gap-1">
            {renderStars(Math.round(stats.average))}
            <span className="ml-2 text-sm font-medium">{stats.average.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Reviews</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{stats.average.toFixed(1)}</p>
                  <div className="flex">{renderStars(Math.round(stats.average))}</div>
                </div>
              </div>
              <Star className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">5-Star Reviews</p>
                <p className="text-2xl font-bold">{stats.distribution[5]}</p>
              </div>
              <ThumbsUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Approval</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = stats.distribution[rating as keyof typeof stats.distribution]
              const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0
              return (
                <div key={rating} className="flex items-center gap-4">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm">{rating}</span>
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  </div>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12">{count}</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <select
          value={filterRating}
          onChange={(e) => setFilterRating(e.target.value)}
          className="px-3 py-2 border border-input rounded-md bg-background text-sm"
        >
          <option value="all">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading reviews...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No reviews found</h3>
          <p className="text-muted-foreground">
            {searchTerm || filterRating !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Reviews from your clients will appear here once they submit them'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map(review => (
            <Card key={review.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarFallback>
                      {review.clientName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{review.clientName}</h4>
                        <div className="flex items-center gap-2">
                          <div className="flex">{renderStars(review.rating)}</div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {!review.response && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedReview(review)
                            setShowResponseModal(true)
                          }}
                        >
                          <MessageSquare className="w-3 h-3 mr-1" />
                          Respond
                        </Button>
                      )}
                    </div>
                    
                    <p className="text-muted-foreground mb-4">{review.comment}</p>
                    
                    {review.response && (
                      <div className="bg-muted p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Your Response</span>
                        </div>
                        <p className="text-sm">{review.response}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Response Modal */}
      {showResponseModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Respond to Review</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowResponseModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs">
                      {selectedReview.clientName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{selectedReview.clientName}</p>
                    <div className="flex">{renderStars(selectedReview.rating)}</div>
                  </div>
                </div>
                <p className="text-sm">{selectedReview.comment}</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="response">Your Response</Label>
                <textarea
                  id="response"
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Thank you for your review..."
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground resize-none"
                  rows={4}
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleAddResponse} className="flex-1">
                  <Send className="w-4 h-4 mr-2" />
                  Send Response
                </Button>
                <Button variant="outline" onClick={() => setShowResponseModal(false)} className="flex-1">
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