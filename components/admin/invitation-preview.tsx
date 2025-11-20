import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function InvitationPreview({
  imageUrl,
  eventTitle,
  eventDate,
  eventLocation,
  description,
}: {
  imageUrl: string | null
  eventTitle: string
  eventDate: string
  eventLocation: string
  description: string
}) {
  return (
    <Card className="border border-border/60 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="space-y-1">
        <CardTitle className="text-balance">Invitation Preview</CardTitle>
        <CardDescription className="text-pretty">
          Live preview of your digital invitation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl overflow-hidden ring-1 ring-border/60 bg-gradient-to-br from-secondary to-background shadow-sm">
          {/* Invitation background */}
          <div className="aspect-[4/3] w-full bg-muted relative max-h-64">
            <img
              src={imageUrl || "/placeholder.svg?height=640&width=360&query=invitation%20background"}
              alt={imageUrl ? "Invitation background" : "Placeholder"}
              className="h-full w-full object-cover"
            />
            
            {/* Invitation overlay content */}
            <div className="absolute inset-0 bg-black/20 flex flex-col justify-center items-center text-center p-4">
              <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 space-y-2 max-w-xs">
                <h3 className="text-base font-bold text-gray-900">
                  {eventTitle || "Event Title"}
                </h3>
                
                {eventDate && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-700">Date & Time</p>
                    <p className="text-xs text-gray-600">{eventDate}</p>
                  </div>
                )}
                
                {eventLocation && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-700">Location</p>
                    <p className="text-xs text-gray-600 line-clamp-1">{eventLocation}</p>
                  </div>
                )}
                
                {description && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{description}</p>
                  </div>
                )}
                
                <div className="pt-1">
                  <div className="inline-flex items-center gap-2 text-xs text-gray-500">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Digital Invitation
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}