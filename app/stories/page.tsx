"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import NextImage from "next/image"
import Link from "next/link"
import { Search, Calendar, MapPin, User, Heart, BookOpen } from "lucide-react"
import ClientCache from "@/lib/cache-utils"

interface Story {
  _id: string
  title: string
  content: string
  imageUrl?: string
  date: string
  location?: string
  photographer?: string
  category: string
  tags: string[]
}

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  
  // Scroll position preservation
  const scrollPositions = useRef<Record<string, number>>({
    window: 0
  });

  // Save scroll positions before component unmounts
  useEffect(() => {
    const saveScrollPositions = () => {
      scrollPositions.current = {
        window: window.scrollY
      };
    };

    // Save positions when navigating away
    window.addEventListener('beforeunload', saveScrollPositions);
    
    return () => {
      window.removeEventListener('beforeunload', saveScrollPositions);
    };
  }, []);

  // Restore scroll positions after component mounts
  useEffect(() => {
    // Restore scroll positions
    if (scrollPositions.current.window > 0) {
      window.scrollTo(0, scrollPositions.current.window);
    }
  }, []);

  useEffect(() => {
    fetchStories()
  }, [])

  const fetchStories = async () => {
    try {
      // Check cache first
      const cacheKey = 'stories'
      const cachedData = ClientCache.get(cacheKey)
      if (cachedData) {
        setStories(cachedData)
        setLoading(false)
        return
      }
      
      const response = await fetch('/api/stories')
      const data = await response.json()
      if (data.success) {
        setStories(data.stories)
        // Cache the data for 5 minutes
        ClientCache.set(cacheKey, data.stories, 5 * 60 * 1000)
      } else {
        setError(data.error || 'Failed to load stories')
      }
    } catch (error: any) {
      console.error('Failed to fetch stories:', error)
      setError(error.message || 'Failed to connect to the database. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const filteredStories = stories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (story.photographer && story.photographer.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === "All" || story.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const categories = ["All", ...Array.from(new Set(stories.map(story => story.category)))]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="text-gray-600">Loading beautiful stories...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Stories Unavailable</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-full shadow-lg">
              <BookOpen className="w-6 h-6" />
              <h1 className="text-3xl font-bold">Wedding Stories</h1>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover beautiful love stories and get inspired for your special day
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-8 shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search stories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={selectedCategory === category ? 
                      "bg-gradient-to-r from-pink-500 to-purple-500 text-white" : 
                      "hover:bg-pink-50"
                    }
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stories Grid */}
        {filteredStories.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No stories found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredStories.map((story) => (
              <Card key={story._id} className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
                <div className="relative h-64 overflow-hidden">
                  <NextImage
                    src={story.imageUrl || "/placeholder.svg?height=300&width=400"}
                    alt={story.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Badge className="absolute top-4 left-4 bg-white/90 text-gray-800 hover:bg-white">
                    {story.category}
                  </Badge>
                </div>
                
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-pink-600 transition-colors line-clamp-2">
                    {story.title}
                  </h3>
                  
                  <p className="text-gray-600 line-clamp-3 text-justify">
                    {story.content}
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(story.date).toLocaleDateString()}</span>
                      </div>
                      {story.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">{story.location}</span>
                        </div>
                      )}
                    </div>
                    
                    {story.photographer && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <User className="w-4 h-4" />
                        <span>by {story.photographer}</span>
                      </div>
                    )}
                    
                    {story.tags && story.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {story.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs bg-pink-50 text-pink-700 border-pink-200">
                            {tag}
                          </Badge>
                        ))}
                        {story.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600">
                            +{story.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <Link href={`/stories/${story._id}`}>
                    <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white">
                      Read Full Story
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}