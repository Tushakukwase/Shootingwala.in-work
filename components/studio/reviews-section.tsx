import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"

export function ReviewsSection() {
  const reviews = [
    {
      id: 1,
      client: "Emma Wilson",
      rating: 5,
      text: "Sarah captured our wedding day beautifully! Every photo was perfect and she was so professional throughout.",
      date: "2 weeks ago",
    },
    {
      id: 2,
      client: "Michael Chen",
      rating: 5,
      text: "Outstanding work on our corporate event. The photos really captured the energy and professionalism of our team.",
      date: "1 month ago",
    },
    {
      id: 3,
      client: "Jessica Brown",
      rating: 4,
      text: "Great portrait session! Sarah was very creative with poses and the final images look amazing.",
      date: "6 weeks ago",
    },
  ]

  return (
    <Card className="bg-white">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle>Recent Reviews</CardTitle>
          <Button variant="outline" size="sm">View All Reviews</Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="pb-4 border-b border-border last:border-0 last:pb-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-foreground">{review.client}</p>
                <p className="text-xs text-muted-foreground">{review.date}</p>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{review.text}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}