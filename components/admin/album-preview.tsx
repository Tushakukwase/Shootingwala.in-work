import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AlbumPreview({
  imageUrl,
  title,
  description,
}: {
  imageUrl: string | null
  title: string
  description: string
}) {
  return (
    <Card className="border border-border/60 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="space-y-1">
        <CardTitle className="text-balance">Album Preview</CardTitle>
        <CardDescription className="text-pretty">
          Live preview of your digital album.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl overflow-hidden ring-1 ring-border/60 bg-gradient-to-br from-secondary to-background shadow-sm">
          {/* Album cover */}
          <div className="aspect-[4/3] w-full bg-muted max-h-64">
            <img
              src={imageUrl || "/placeholder.svg?height=400&width=400&query=album%20cover"}
              alt={imageUrl ? "Album cover" : "Placeholder"}
              className="h-full w-full object-cover"
            />
          </div>
          
          {/* Album details */}
          <div className="p-4 space-y-2">
            <h3 className="text-lg font-semibold tracking-tight">
              {title || "Album Title"}
            </h3>
            <p className="text-sm text-muted-foreground text-pretty leading-relaxed line-clamp-3">
              {description || "Add a description to tell viewers about this digital album. This preview updates in real time as you edit."}
            </p>
            <div className="pt-1">
              <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Digital Album
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}