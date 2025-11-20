"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import NextImage from "next/image"
import { ArrowLeft, Calendar, MapPin, Heart, Share2, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface Story {
  _id: string
  title: string
  content: string
  imageUrl: string
  date: string
  location?: string
  photographer?: string
  photographerId?: string
  category?: string
  tags?: string[]
}

export default function StoryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [story, setStory] = useState<Story | null>(null)
  const [relatedStories, setRelatedStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchStory(params.id as string)
      fetchRelatedStories()
    }
  }, [params.id])

  const fetchStory = async (id: string) => {
    try {
      const response = await fetch(`/api/stories/${id}`)
      const data = await response.json()
      
      if (response.ok && data.success) {
        setStory(data.story)
      } else {
        setError(data.error || 'Story not found')
      }
    } catch (error: any) {
      console.error('Failed to load story:', error)
      setError(error.message || 'Failed to connect to the database. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedStories = async () => {
    try {
      const response = await fetch('/api/stories')
      const data = await response.json()
      
      if (response.ok && data.success && data.stories) {
        // Filter out the current story and take only the first 4
        const otherStories = data.stories
          .filter((s: Story) => s._id !== params.id)
          .slice(0, 4)
        setRelatedStories(otherStories)
      }
    } catch (error) {
      console.error('Failed to load related stories:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: story?.title,
          text: story?.content?.substring(0, 100) + '...',
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Story link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading story...</p>
        </div>
      </div>
    )
  }

  if (error || !story) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Story Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'The story you are looking for is not available.'}</p>
            <Button onClick={() => router.push('/stories')} variant="outline">
              Browse All Stories
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-rose-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => router.push('/stories')}
              className="flex items-center gap-2 bg-white/50"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Stories
            </Button>
            <Button
              variant="outline"
              onClick={handleShare}
              className="flex items-center gap-2 bg-white/50"
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>
        </div>
      </header>

      {/* Story Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <article className="space-y-8">
          {/* Hero Image */}
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl">
            <NextImage
              src={story.imageUrl || "/placeholder.svg"}
              alt={story.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                {story.title}
              </h1>
              <div className="flex items-center gap-6 text-white/90">
                {story.date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span>{formatDate(story.date)}</span>
                  </div>
                )}
                {story.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span>{story.location}</span>
                  </div>
                )}
                {story.photographer && (
                  <div className="flex items-center gap-2">
                    <span>
                      by{' '}
                      {story.photographerId ? (
                        <button
                          onClick={() => router.push(`/photographer/${story.photographerId}`)}
                          className="underline hover:text-rose-200 transition-colors"
                        >
                          {story.photographer}
                        </button>
                      ) : (
                        story.photographer
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Story Content */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8 md:p-12">
              <div className="prose prose-lg max-w-none">
                <div 
                  className="text-gray-700 leading-relaxed text-justify"
                  style={{ 
                    fontSize: '1.125rem',
                    lineHeight: '1.8',
                    textAlign: 'justify'
                  }}
                >
                  {story.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-6">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {story.tags && story.tags.length > 0 && (
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {story.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Related Stories */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">More Stories</h3>
              {relatedStories.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {relatedStories.map((relatedStory) => (
                    <div 
                      key={relatedStory._id}
                      className="cursor-pointer group"
                      onClick={() => router.push(`/stories/${relatedStory._id}`)}
                    >
                      <div className="aspect-square rounded-lg overflow-hidden mb-3 relative">
                        <NextImage
                          src={relatedStory.imageUrl || "/placeholder.svg"}
                          alt={relatedStory.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <h4 className="font-medium text-gray-900 line-clamp-2 group-hover:text-rose-600 transition-colors">
                        {relatedStory.title}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(relatedStory.date)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Heart className="w-12 h-12 text-rose-300 mx-auto mb-4" />
                    <p className="text-gray-600">More beautiful stories coming soon...</p>
                  </div>
                </div>
              )}
              
              {/* More Stories Button */}
              <div className="text-center mt-6">
                <Button
                  variant="outline"
                  onClick={() => router.push('/stories')}
                  className="bg-rose-500 text-white hover:bg-rose-600 border-rose-500 font-semibold px-6 py-2 rounded-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                >
                  View All Stories →
                </Button>
              </div>
            </CardContent>
          </Card>
        </article>
      </main>
    </div>
  )
}