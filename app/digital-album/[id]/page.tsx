"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import NextImage from "next/image"
import { ArrowLeft, Calendar, User, Image as ImageIcon } from "lucide-react"

interface AlbumDetail {
  id: string
  title: string
  description: string
  coverImage: string
  photographer: string
  date: string
  images: string[]
}

export default function DigitalAlbumDetailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const albumId = searchParams.get('id')
  
  const [album, setAlbum] = useState<AlbumDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (albumId) {
      fetchAlbumDetail()
    }
  }, [albumId])

  const fetchAlbumDetail = async () => {
    try {
      setLoading(true)
      // In a real implementation, you would fetch the album details from your API
      // For now, we'll use mock data
      
      // Simulate API call
      setTimeout(() => {
        const mockAlbum: AlbumDetail = {
          id: albumId || "1",
          title: "Wedding Highlights",
          description: "A beautiful collection of wedding moments captured throughout the special day.",
          coverImage: "/placeholder.svg?height=400&width=600",
          photographer: "John Smith Photography",
          date: new Date().toISOString(),
          images: Array(12).fill(null).map((_, i) => `/placeholder.svg?height=300&width=300&text=Image${i+1}`)
        }
        setAlbum(mockAlbum)
        setLoading(false)
      }, 500)
    } catch (error: any) {
      console.error('Failed to fetch album details:', error)
      setError(error.message || 'Failed to load album details')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading album details...</p>
        </div>
      </div>
    )
  }

  if (error || !album) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Album Unavailable</h2>
            <p className="text-gray-600 mb-6">{error || 'Album not found'}</p>
            <Button onClick={() => router.back()} variant="outline">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{album.title}</h1>
              <p className="text-gray-600">{album.photographer}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Album Details */}
        <Card className="mb-8 shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="relative h-96 rounded-lg overflow-hidden">
                  <NextImage
                    src={album.coverImage}
                    alt={album.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Album Details</h2>
                  <p className="text-gray-600">{album.description}</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="w-5 h-5" />
                    <span>{album.photographer}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-5 h-5" />
                    <span>{new Date(album.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <ImageIcon className="w-5 h-5" />
                    <span>{album.images.length} photos</span>
                  </div>
                </div>
                
                <Button className="w-full">
                  Download Album
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Album Images */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Photos</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {album.images.map((image, index) => (
              <div key={index} className="relative h-32 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                <NextImage
                  src={image}
                  alt={`Album image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}