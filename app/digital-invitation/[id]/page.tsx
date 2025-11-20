"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import NextImage from "next/image"
import { ArrowLeft, Calendar, User, Mail } from "lucide-react"

interface InvitationDetail {
  id: string
  title: string
  description: string
  coverImage: string
  photographer: string
  date: string
  templateType: string
  brideName: string
  groomName: string
  eventDate: string
  eventLocation: string
}

export default function DigitalInvitationDetailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const invitationId = searchParams.get('id')
  
  const [invitation, setInvitation] = useState<InvitationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (invitationId) {
      fetchInvitationDetail()
    }
  }, [invitationId])

  const fetchInvitationDetail = async () => {
    try {
      setLoading(true)
      // In a real implementation, you would fetch the invitation details from your API
      // For now, we'll use mock data
      
      // Simulate API call
      setTimeout(() => {
        const mockInvitation: InvitationDetail = {
          id: invitationId || "1",
          title: "Elegant Wedding Invitation",
          description: "A beautiful digital invitation for our special day.",
          coverImage: "/placeholder.svg?height=400&width=600",
          photographer: "Jane Doe Designs",
          date: new Date().toISOString(),
          templateType: "Classic",
          brideName: "Sarah Johnson",
          groomName: "Michael Brown",
          eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          eventLocation: "Grand Ballroom, City Hotel"
        }
        setInvitation(mockInvitation)
        setLoading(false)
      }, 500)
    } catch (error: any) {
      console.error('Failed to fetch invitation details:', error)
      setError(error.message || 'Failed to load invitation details')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading invitation details...</p>
        </div>
      </div>
    )
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Invitation Unavailable</h2>
            <p className="text-gray-600 mb-6">{error || 'Invitation not found'}</p>
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
              <h1 className="text-2xl font-bold text-gray-900">{invitation.title}</h1>
              <p className="text-gray-600">{invitation.photographer}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Invitation Details */}
        <Card className="mb-8 shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="relative h-96 rounded-lg overflow-hidden">
                  <NextImage
                    src={invitation.coverImage}
                    alt={invitation.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Invitation Details</h2>
                  <p className="text-gray-600">{invitation.description}</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="w-5 h-5" />
                    <span><strong>Bride:</strong> {invitation.brideName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="w-5 h-5" />
                    <span><strong>Groom:</strong> {invitation.groomName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-5 h-5" />
                    <span><strong>Date:</strong> {new Date(invitation.eventDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-5 h-5" />
                    <span><strong>Location:</strong> {invitation.eventLocation}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-5 h-5" />
                    <span><strong>Template:</strong> {invitation.templateType}</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3">
                  <Button className="w-full">
                    View Full Invitation
                  </Button>
                  <Button variant="outline" className="w-full">
                    Download Invitation
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Event Information */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ceremony</h3>
                <p className="text-gray-600">The wedding ceremony will begin at 4:00 PM at the Grand Ballroom.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Reception</h3>
                <p className="text-gray-600">Following the ceremony, we invite you to join us for dinner and dancing at 6:00 PM.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Dress Code</h3>
                <p className="text-gray-600">Formal attire requested.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">RSVP</h3>
                <p className="text-gray-600">Please respond by June 1st, 2024.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}