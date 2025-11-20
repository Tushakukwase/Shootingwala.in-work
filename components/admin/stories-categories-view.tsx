"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, FileText, User, Calendar, Eye } from "lucide-react"

interface Story {
  id: string
  title: string
  content: string
  coverImage: string
  location?: string
  date: string
  photographerId?: string
  photographerName?: string
  uploaderName?: string
  status: 'pending' | 'approved' | 'rejected'
  show_on_home: boolean
  createdAt: string
  approved_at?: string
  created_by: 'admin' | 'photographer'
  created_by_name: string
  type: 'admin_story' | 'photographer_story'
}

interface GroupedStory {
  categoryName: string
  stories: Story[]
  sampleImage: string
  creators: string[]
}

interface StoriesCategoriesViewProps {
  onCategoryClick: (categoryName: string, stories: Story[]) => void
  onBack?: () => void
}

export default function StoriesCategoriesView({ onCategoryClick, onBack }: StoriesCategoriesViewProps) {
  const [groupedStories, setGroupedStories] = useState<GroupedStory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStories()
  }, [])

  const loadStories = async () => {
    try {
      setLoading(true)
      
      // Load both admin stories and photographer stories
      const [adminStoriesRes, photographerStoriesRes] = await Promise.all([
        fetch('/api/stories'),
        fetch('/api/photographer-stories')
      ])
      
      const adminData = await adminStoriesRes.json()
      const photographerData = await photographerStoriesRes.json()
      
      const allStories: Story[] = []
      
      // Add admin stories
      if (adminData.success && adminData.stories) {
        const adminStories = adminData.stories.map((story: any) => ({
          id: story._id,
          title: story.title,
          content: story.content,
          coverImage: story.imageUrl,
          date: story.date,
          status: 'approved' as const,
          show_on_home: true,
          createdAt: story.createdAt || new Date().toISOString(),
          created_by: 'admin' as const,
          created_by_name: 'Admin',
          type: 'admin_story' as const
        }))
        allStories.push(...adminStories)
      }
      
      // Add photographer stories
      if (photographerData.success && photographerData.stories) {
        const photoStories = photographerData.stories.map((story: any) => ({
          id: story.id,
          title: story.title,
          content: story.content,
          coverImage: story.coverImage,
          location: story.location,
          date: story.date,
          photographerId: story.photographerId,
          photographerName: story.photographerName,
          status: story.status,
          show_on_home: story.showOnHome,
          createdAt: story.createdAt,
          created_by: 'photographer' as const,
          created_by_name: story.photographerName || 'Photographer',
          type: 'photographer_story' as const
        }))
        allStories.push(...photoStories)
      }
      
      // Group stories by type/category
      const grouped = groupStoriesByCategory(allStories)
      setGroupedStories(grouped)
      
    } catch (error) {
      console.error('Error loading stories:', error)
    } finally {
      setLoading(false)
    }
  }

  const groupStoriesByCategory = (stories: Story[]): GroupedStory[] => {
    const groups: { [key: string]: Story[] } = {
      'Wedding Stories': [],
      'Admin Stories': [],
      'Photographer Stories': []
    }
    
    stories.forEach(story => {
      if (story.created_by === 'admin') {
        groups['Admin Stories'].push(story)
      } else {
        groups['Photographer Stories'].push(story)
      }
      // Also add to wedding stories if it's wedding related
      if (story.title.toLowerCase().includes('wedding') || story.content.toLowerCase().includes('wedding')) {
        groups['Wedding Stories'].push(story)
      }
    })
    
    return Object.entries(groups)
      .filter(([_, stories]) => stories.length > 0)
      .map(([categoryName, stories]) => {
        const creators = [...new Set(stories.map(s => s.created_by_name))]
        
        return {
          categoryName,
          stories,
          sampleImage: stories[0]?.coverImage || '/placeholder.svg?height=200&width=200',
          creators
        }
      })
      .sort((a, b) => b.stories.length - a.stories.length) // Sort by story count
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading stories...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {onBack && (
        <Button variant="outline" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Stories Manager
        </Button>
      )}
      
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Story Categories</h2>
        <Badge variant="outline">{groupedStories.length} Categories</Badge>
      </div>

      {groupedStories.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Stories Found</h3>
          <p className="text-gray-500">Create your first story to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groupedStories.map((group) => (
            <Card 
              key={group.categoryName} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => onCategoryClick(group.categoryName, group.stories)}
            >
              <div className="relative h-48 bg-gray-100">
                <img
                  src={group.sampleImage}
                  alt={group.categoryName}
                  className="w-full h-full object-cover rounded-t-lg"
                />
                <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                  {group.stories.length} stories
                </div>
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2">{group.categoryName}</h3>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>{group.stories.length} story{group.stories.length > 1 ? 's' : ''}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>
                      {group.creators.length === 1 
                        ? group.creators[0]
                        : `${group.creators.length} creators`
                      }
                    </span>
                  </div>
                </div>
                
                <Button className="w-full mt-3" variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  View Stories
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}