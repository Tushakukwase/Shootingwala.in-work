import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"

export function PortfolioSection() {
  const photos = [
    { id: 1, title: "Wedding Day", category: "Wedding" },
    { id: 2, title: "Golden Hour", category: "Portrait" },
    { id: 3, title: "Corporate Gala", category: "Event" },
    { id: 4, title: "Beach Session", category: "Portrait" },
    { id: 5, title: "Sunset Bride", category: "Wedding" },
    { id: 6, title: "Team Photo", category: "Corporate" },
  ]

  return (
    <Card className="bg-white">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle>My Portfolio</CardTitle>
          <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4" />
            Add Photo
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative bg-muted rounded-lg overflow-hidden aspect-square hover:shadow-lg transition-shadow"
            >
              <div className="w-full h-full bg-gradient-to-br from-blue-200 to-blue-300 flex items-center justify-center">
                <span className="text-sm font-medium text-blue-900">{photo.title}</span>
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button className="p-2 bg-white rounded-lg hover:bg-gray-100">
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}