import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { useState, useEffect } from "react"

export function RecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Try to get from localStorage or API
    const stored = localStorage.getItem('recentlyViewed')
    if (stored) {
      setRecentlyViewed(JSON.parse(stored))
    }
    setLoading(false)
  }, [])
  return (
    <section aria-labelledby="recently" className="space-y-4">
      <h2 id="recently" className="text-xl font-bold text-black">
        👁️ Recently viewed
      </h2>
      
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {recentlyViewed.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No recently viewed photographers
          </div>
        ) : recentlyViewed.map((p) => (
          <Card 
            key={p.id} 
            className="overflow-hidden border-2 border-yellow-200 hover:border-yellow-400 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
          >
            <div className="relative h-28 w-full bg-yellow-50">
              <Image
                src={`/placeholder.svg?height=112&width=224&query=portrait+photographer`}
                alt={`${p.name} preview`}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/10 hover:bg-black/0 transition-colors" />
            </div>
            
            <CardContent className="p-3">
              <p className="text-sm font-bold text-black">{p.name}</p>
              <p className="text-xs text-gray-600 font-medium">📍 {p.city}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}