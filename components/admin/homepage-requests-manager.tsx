"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { CheckCircle, X, Image, FileText, Clock, User } from "lucide-react"

interface HomepageRequest {
  id: string
  type: 'gallery_homepage_request' | 'story_homepage_request'
  title: string
  message: string
  relatedId: string
  timestamp: string
  actionRequired: boolean
}

export default function HomepageRequestsManager() {
  const [requests, setRequests] = useState<HomepageRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/homepage-requests')
      const data = await response.json()
      
      if (data.success) {
        setRequests(data.requests)
      }
    } catch (error) {
      console.error('Error loading homepage requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (requestId: string, action: 'approve' | 'reject', type: string, relatedId: string) => {
    try {
      setActionLoading(requestId)
      
      const response = await fetch('/api/admin/homepage-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationId: requestId,
          action,
          type,
          relatedId
        })
      })
      
      const data = await response.json()
      if (data.success) {
        // Remove the request from the list
        setRequests(prev => prev.filter(req => req.id !== requestId))
        alert(`Request ${action}d successfully!`)
      } else {
        alert(`Failed to ${action} request`)
      }
    } catch (error) {
      console.error(`Error ${action}ing request:`, error)
      alert(`Failed to ${action} request`)
    } finally {
      setActionLoading(null)
    }
  }

  const getRequestIcon = (type: string) => {
    return type === 'gallery_homepage_request' ? 
      <Image className="w-5 h-5 text-blue-600" /> : 
      <FileText className="w-5 h-5 text-green-600" />
  }

  const getRequestTypeLabel = (type: string) => {
    return type === 'gallery_homepage_request' ? 'Gallery' : 'Story'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-600" />
          Homepage Feature Requests
          {requests.length > 0 && (
            <Badge variant="destructive">{requests.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Pending Requests</h3>
            <p className="text-muted-foreground">All homepage feature requests have been processed.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      {getRequestIcon(request.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{request.title}</h4>
                        <Badge variant="outline">
                          {getRequestTypeLabel(request.type)}
                        </Badge>
                        <Badge variant="destructive" className="text-xs">
                          Action Required
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{request.message}</p>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-2">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>Photographer: {(request as any).photographerName || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Requested: {request.timestamp}</span>
                        </div>
                      </div>
                      {(request as any).contentTitle && (
                        <div className="text-xs text-gray-500 mb-2">
                          <strong>Content:</strong> {(request as any).contentTitle}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleAction(request.id, 'approve', request.type, request.relatedId)}
                      disabled={actionLoading === request.id}
                    >
                      {actionLoading === request.id ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Approve
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleAction(request.id, 'reject', request.type, request.relatedId)}
                      disabled={actionLoading === request.id}
                    >
                      {actionLoading === request.id ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <X className="w-3 h-3 mr-1" />
                          Reject
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}