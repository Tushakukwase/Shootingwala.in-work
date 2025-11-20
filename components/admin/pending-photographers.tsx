"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import NextImage from "next/image"
import { Check, X, Eye, Clock, User, Mail, Phone, MapPin, Camera, Star } from "lucide-react"

interface PendingPhotographer {
  _id: string
  name: string
  email: string
  phone: string
  location: string
  categories: string[]
  image: string | null
  description: string
  experience: number
  startingPrice: number
  status: string
  registrationDate: string
  createdAt: string
}

export default function PendingPhotographers() {
  const [photographers, setPhotographers] = useState<PendingPhotographer[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPhotographer, setSelectedPhotographer] = useState<PendingPhotographer | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchPendingPhotographers()
  }, [])

  const fetchPendingPhotographers = async () => {
    try {
      const response = await fetch('/api/photographers?approved=false')
      const data = await response.json()
      const pendingPhotographers = data.photographers.filter((p: any) => 
        p.status === 'pending' || (!p.isApproved && p.createdBy === 'self')
      )
      setPhotographers(pendingPhotographers)
      setLoading(false)
    } catch (error) {
      // Silently handle error
      setLoading(false)
    }
  }

  const approvePhotographer = async (id: string) => {
    setActionLoading(id)
    try {
      const response = await fetch(`/api/photographers/${id}/approve`, {
        method: 'PUT'
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        // Remove from pending list
        setPhotographers(prev => prev.filter(p => p._id !== id))
        setSelectedPhotographer(null)
        alert('Photographer approved successfully!')
      } else {
        throw new Error(data.error || 'Failed to approve photographer')
      }
    } catch (error) {
      console.error('Error approving photographer:', error)
      alert('Failed to approve photographer: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setActionLoading(null)
    }
  }

  const rejectPhotographer = async (id: string) => {
    if (!confirm('Are you sure you want to reject this photographer registration? This action cannot be undone.')) {
      return
    }

    setActionLoading(id)
    try {
      const response = await fetch(`/api/photographers/${id}/approve`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        // Remove from pending list
        setPhotographers(prev => prev.filter(p => p._id !== id))
        setSelectedPhotographer(null)
        alert('Photographer registration rejected')
      } else {
        throw new Error(data.error || 'Failed to reject photographer')
      }
    } catch (error) {
      console.error('Error rejecting photographer:', error)
      alert('Failed to reject photographer: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (selectedPhotographer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setSelectedPhotographer(null)}
              className="flex items-center gap-2"
            >
              ← Back to List
            </Button>
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              <Clock className="w-3 h-3 mr-1" />
              Pending Approval
            </Badge>
          </div>

          {/* Photographer Profile */}
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <CardTitle className="text-2xl">Photographer Profile Review</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-8">
                {/* Profile Image */}
                <div className="space-y-4">
                  <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    {selectedPhotographer.image ? (
                      <NextImage
                        src={selectedPhotographer.image}
                        alt={selectedPhotographer.name}
                        width={300}
                        height={300}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-20 h-20 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button
                      onClick={() => approvePhotographer(selectedPhotographer._id)}
                      disabled={actionLoading === selectedPhotographer._id}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      {actionLoading === selectedPhotographer._id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Approving...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Approve Photographer
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => rejectPhotographer(selectedPhotographer._id)}
                      disabled={actionLoading === selectedPhotographer._id}
                      variant="outline"
                      className="w-full text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject Registration
                    </Button>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedPhotographer.name}</h2>
                    <p className="text-gray-600">Registered on {formatDate(selectedPhotographer.registrationDate || selectedPhotographer.createdAt)}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium">{selectedPhotographer.email}</p>
                        </div>
                      </div>
                      
                      {selectedPhotographer.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="font-medium">{selectedPhotographer.phone}</p>
                          </div>
                        </div>
                      )}
                      
                      {selectedPhotographer.location && (
                        <div className="flex items-center gap-3">
                          <MapPin className="w-5 h-5 text-red-600" />
                          <div>
                            <p className="text-sm text-gray-500">Location</p>
                            <p className="font-medium">{selectedPhotographer.location}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Camera className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="text-sm text-gray-500">Experience</p>
                          <p className="font-medium">{selectedPhotographer.experience} years</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Star className="w-5 h-5 text-yellow-600" />
                        <div>
                          <p className="text-sm text-gray-500">Starting Price</p>
                          <p className="font-medium">${selectedPhotographer.startingPrice}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Categories */}
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Photography Specialties</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedPhotographer.categories.map((category, index) => (
                        <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  {selectedPhotographer.description && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">About</p>
                      <p className="text-gray-700 leading-relaxed">{selectedPhotographer.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
            <Clock className="w-6 h-6 text-orange-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Pending Photographer Approvals
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Review and approve photographer registrations to make them visible to clients
          </p>
        </div>

        {/* Pending Count */}
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Pending Registrations</h3>
                  <p className="text-gray-600">{photographers.length} photographer{photographers.length !== 1 ? 's' : ''} waiting for approval</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-lg px-4 py-2">
                {photographers.length}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Photographers List */}
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Pending Photographers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading pending photographers...</p>
              </div>
            ) : photographers.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No pending approvals</p>
                <p className="text-gray-400">All photographer registrations have been processed</p>
              </div>
            ) : (
              <div className="space-y-4">
                {photographers.map((photographer) => (
                  <Card key={photographer._id} className="border border-gray-200 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                            {photographer.image ? (
                              <NextImage
                                src={photographer.image}
                                alt={photographer.name}
                                width={64}
                                height={64}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <User className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{photographer.name}</h3>
                            <p className="text-gray-600">{photographer.email}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              {photographer.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {photographer.location}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Camera className="w-3 h-3" />
                                {photographer.experience} years exp.
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(photographer.registrationDate || photographer.createdAt)}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {photographer.categories.slice(0, 3).map((category, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {category}
                                </Badge>
                              ))}
                              {photographer.categories.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{photographer.categories.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedPhotographer(photographer)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            Review
                          </Button>
                          <Button
                            onClick={() => approvePhotographer(photographer._id)}
                            disabled={actionLoading === photographer._id}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            {actionLoading === photographer._id ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            onClick={() => rejectPhotographer(photographer._id)}
                            disabled={actionLoading === photographer._id}
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}