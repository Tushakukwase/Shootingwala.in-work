"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { CheckCircle, X, Clock, User, Mail, Phone, Search, Calendar } from "lucide-react"

interface PendingPhotographer {
  id: string
  fullName: string
  email: string
  mobile: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  username: string
}

export default function PhotographerApprovals() {
  const [photographers, setPhotographers] = useState<PendingPhotographer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedPhotographer, setSelectedPhotographer] = useState<PendingPhotographer | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    fetchPendingPhotographers()
  }, [])

  const fetchPendingPhotographers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/photographer-approvals')
      const data = await response.json()
      
      if (data.success) {
        setPhotographers(data.photographers)
      }
    } catch (error) {
      console.error('Error fetching pending photographers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproval = async (photographerId: string, action: 'approve' | 'reject') => {
    try {
      setActionLoading(photographerId)
      const response = await fetch('/api/photographer-approvals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: photographerId,
          action,
          adminId: 'admin',
          adminName: 'Admin User'
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Update local state
        setPhotographers(prev => 
          prev.map(photographer => 
            photographer.id === photographerId 
              ? { ...photographer, status: action === 'approve' ? 'approved' : 'rejected' }
              : photographer
          )
        )
        alert(`Photographer ${action === 'approve' ? 'approved' : 'rejected'} successfully!`)
      } else {
        alert(data.error || 'Failed to update photographer status')
      }
    } catch (error) {
      console.error('Error updating photographer:', error)
      alert('Failed to update photographer status')
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><X className="w-3 h-3 mr-1" />Rejected</Badge>
      default:
        return null
    }
  }

  const filteredPhotographers = photographers.filter(photographer =>
    photographer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    photographer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    photographer.mobile.includes(searchTerm)
  )

  const pendingCount = photographers.filter(p => p.status === 'pending').length
  const approvedCount = photographers.filter(p => p.status === 'approved').length
  const rejectedCount = photographers.filter(p => p.status === 'rejected').length

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Photographer Approvals</h1>
        <div className="flex items-center gap-4">
          <Badge variant="outline">{photographers.length} Total</Badge>
          <Badge className="bg-yellow-100 text-yellow-800">{pendingCount} Pending</Badge>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <div className="text-sm text-muted-foreground">Pending Approval</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
            <div className="text-sm text-muted-foreground">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
            <div className="text-sm text-muted-foreground">Rejected</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search photographers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Photographers List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading photographers...</p>
        </div>
      ) : filteredPhotographers.length === 0 ? (
        <div className="text-center py-8">
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No photographers found</h3>
          <p className="text-muted-foreground">
            {searchTerm ? 'Try adjusting your search criteria' : 'No photographer registrations yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPhotographers.map(photographer => (
            <Card key={photographer.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{photographer.fullName}</h3>
                      {getStatusBadge(photographer.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{photographer.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{photographer.mobile}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>Registered: {new Date(photographer.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedPhotographer(photographer)
                        setShowDetailsModal(true)
                      }}
                    >
                      View Details
                    </Button>
                    
                    {photographer.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApproval(photographer.id, 'approve')}
                          disabled={actionLoading === photographer.id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleApproval(photographer.id, 'reject')}
                          disabled={actionLoading === photographer.id}
                        >
                          <X className="w-3 h-3 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedPhotographer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Photographer Details</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowDetailsModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedPhotographer.status)}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Full Name</label>
                  <p className="font-medium text-lg">{selectedPhotographer.fullName}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Email Address</label>
                    <p className="font-medium">{selectedPhotographer.email}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-muted-foreground">Mobile Number</label>
                    <p className="font-medium">{selectedPhotographer.mobile}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Username</label>
                    <p className="font-medium">{selectedPhotographer.username}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-muted-foreground">Registration Date</label>
                    <p className="font-medium">{new Date(selectedPhotographer.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {selectedPhotographer.status === 'pending' && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={() => {
                      handleApproval(selectedPhotographer.id, 'approve')
                      setShowDetailsModal(false)
                    }}
                    disabled={actionLoading === selectedPhotographer.id}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Photographer
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleApproval(selectedPhotographer.id, 'reject')
                      setShowDetailsModal(false)
                    }}
                    disabled={actionLoading === selectedPhotographer.id}
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject Photographer
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}