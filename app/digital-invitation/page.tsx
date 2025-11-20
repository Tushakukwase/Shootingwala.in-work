"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import NextImage from "next/image"
import Link from "next/link"
import { Search, Mail, Calendar } from "lucide-react"
import ClientCache from "@/lib/cache-utils"

interface Invitation {
  id: string
  title: string
  description: string
  coverImage: string
  photographer: string
  date: string
  templateType: string
}

export default function DigitalInvitationPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchInvitations()
  }, [])

  const fetchInvitations = async () => {
    try {
      // Check cache first
      const cacheKey = 'digital-invitations'
      const cachedData = ClientCache.get(cacheKey)
      if (cachedData) {
        setInvitations(cachedData)
        setLoading(false)
        return
      }
      
      const response = await fetch('/api/digital-invitation')
      const data = await response.json()
      if (data.success) {
        setInvitations(data.invitations)
        // Cache the data for 5 minutes
        ClientCache.set(cacheKey, data.invitations, 5 * 60 * 1000)
      } else {
        setError(data.error || 'Failed to load digital invitations')
      }
    } catch (error: any) {
      console.error('Failed to fetch digital invitations:', error)
      setError(error.message || 'Failed to connect to the database. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const filteredInvitations = invitations.filter(invitation => 
    invitation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invitation.photographer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invitation.templateType.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading digital invitations...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Digital Invitations Unavailable</h2>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">Digital Invitations</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our collection of digital wedding invitations
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <Card className="mb-8 shadow-lg">
          <CardContent className="p-6">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search invitations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Invitations Grid */}
        {filteredInvitations.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No digital invitations found</h3>
            <p className="text-gray-500">Try adjusting your search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredInvitations.map((invitation) => (
              <Card key={invitation.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="relative h-48 overflow-hidden">
                  <NextImage
                    src={invitation.coverImage || "/placeholder.svg?height=200&width=300"}
                    alt={invitation.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute top-4 right-4 bg-white/90 text-gray-900 px-2 py-1 rounded-full text-sm font-medium">
                    {invitation.templateType}
                  </div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-lg font-bold">{invitation.title}</h3>
                    <p className="text-sm">{invitation.photographer}</p>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(invitation.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Link href={`/digital-invitation/${invitation.id}`}>
                    <Button className="w-full">
                      View Invitation
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