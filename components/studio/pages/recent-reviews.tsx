"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"
import { useState, useEffect } from "react"

export default function RecentReviews() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      // This would fetch real reviews from your API
      // For now showing empty state until real reviews are implemented
      setReviews([])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching reviews:', error)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Recent Reviews</h1>
      </div>
      
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-foreground">{review.client}</p>
                    <p className="text-sm text-muted-foreground">{review.event}</p>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} size={16} className="fill-accent text-accent" />
                    ))}
                  </div>
                </div>
                <p className="text-foreground text-sm leading-relaxed">{review.feedback}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No reviews yet</p>
            <p className="text-sm text-muted-foreground mt-2">Client reviews will appear here after they submit feedback</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}