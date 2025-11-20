"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit2, Trash2 } from "lucide-react"

const portfolioImages = [
  { id: 1, title: "Wedding Ceremony", category: "Wedding" },
  { id: 2, title: "Sunset Portrait", category: "Portrait" },
  { id: 3, title: "Corporate Headshots", category: "Corporate" },
  { id: 4, title: "Product Photography", category: "Product" },
  { id: 5, title: "Event Coverage", category: "Event" },
  { id: 6, title: "Nature Photography", category: "Nature" },
]

export default function Portfolio() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Portfolio</h1>
        <Button className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus size={18} />
          Add New Photo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolioImages.map((image) => (
          <Card key={image.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">📷</div>
                <p className="text-sm text-muted-foreground">{image.title}</p>
              </div>
            </div>
            <CardContent className="p-4">
              <p className="font-semibold text-foreground mb-2">{image.title}</p>
              <p className="text-sm text-muted-foreground mb-4">{image.category}</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 flex items-center justify-center gap-1 bg-transparent"
                >
                  <Edit2 size={16} />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 flex items-center justify-center gap-1 text-destructive bg-transparent"
                >
                  <Trash2 size={16} />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}