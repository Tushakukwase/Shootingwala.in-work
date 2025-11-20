"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

const reviews = [
  {
    id: 1,
    client: "Sarah Johnson",
    rating: 5,
    feedback: "Absolutely amazing! The photos are stunning and captured every moment perfectly.",
    event: "Wedding",
  },
  {
    id: 2,
    client: "Michael Chen",
    rating: 4,
    feedback: "Great work on the corporate event. Very professional and timely delivery.",
    event: "Corporate Event",
  },
  {
    id: 3,
    client: "Emma Davis",
    rating: 5,
    feedback: "Best portrait session ever! Highly recommend to anyone looking for quality photography.",
    event: "Portrait Session",
  },
  {
    id: 4,
    client: "James Wilson",
    rating: 5,
    feedback: "Excellent product photography. Really helped showcase our products beautifully.",
    event: "Product Photography",
  },
]

export default function RecentReviews() {
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Recent Reviews</h1>
      
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
    </div>
  )
}