"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { MapPin, Plus, Clock, CheckCircle, X, AlertCircle, Users, Upload } from "lucide-react"

interface CitySuggestion {
  id: string
  name: string
  state: string
  country: string
  image_url?: string
  photographerId: string
  photographerName: string
  status: 'pending' | 'approved' | 'rejected'
  show_on_home: boolean
  suggestedBy: string
  approvedBy?: string
  adminName?: string
  created_at: string
  approved_at?: string
  created_by: 'admin' | 'photographer'
  created_by_name: string
}

export default function CityRegistration() {
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([])
  const [approvedCities, setApprovedCities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [photographerId, setPhotographerId] = useState<string>('')
  const [photographerName, setPhotographerName] = useState<string>('')
  const [newCityRequest, setNewCityRequest] = useState({
    cityName: '',
    state: '',
    country: 'USA',
    image_url: ''
  })
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    // Get photographer data from localStorage
    const studioData = localStorage.getItem('studio')
    if (studioData) {
      try {
        const parsed = JSON.parse(studioData)
        setPhotographerId(parsed._id)
        setPhotographerName(parsed.name || parsed.photographerName || 'Photographer')
        loadSuggestions(parsed._id)
      } catch (error) {
        console.error('Error parsing studio data:', error)
      }
    }
    
    // Load approved cities
    loadApprovedCities()
  }, [])

  const loadSuggestions = async (photographerId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/requests?type=city&t=${Date.now()}`)
      const data = await response.json()
      
      if (data.success && data.requests) {
        // Filter suggestions by this photographer
        const mySuggestions = data.requests.filter((suggestion: CitySuggestion) => 
          suggestion.photographerId === photographerId
        )
        setSuggestions(mySuggestions)
      } else {
        setSuggestions([])
      }
    } catch (error) {
      console.error('Error loading suggestions:', error)
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }

  const loadApprovedCities = async () => {
    try {
      // Get all approved cities from requests
      const response = await fetch(`/api/requests?type=city&status=approved&t=${Date.now()}`)
      const data = await response.json()
      
      if (data.success && data.requests) {
        // Transform the data to match the expected format
        const cities = data.requests.map((city: CitySuggestion) => ({
          id: city.id || city._id,
          name: city.name,
          state: city.state,
          country: city.country,
          image_url: city.image_url,
          photographers: Math.floor(Math.random() * 50) + 1 // Random number for now, can be replaced with real data
        }))
        setApprovedCities(cities)
      } else {
        setApprovedCities([])
      }
    } catch (error) {
      console.error('Error loading approved cities:', error)
      // Set empty array as fallback
      setApprovedCities([])
    }
  }

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'city')
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      
      if (data.success) {
        setNewCityRequest(prev => ({ ...prev, image_url: data.data.url }))
      } else {
        alert('Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find(file => file.type.startsWith('image/'))
    
    if (imageFile) {
      handleImageUpload(imageFile)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file)
    }
  }

  const handleSubmitRequest = async () => {
    if (!newCityRequest.cityName.trim() || !newCityRequest.state.trim()) return
    
    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'city',
          name: newCityRequest.cityName.trim(),
          state: newCityRequest.state.trim(),
          country: newCityRequest.country,
          image: newCityRequest.image_url,
          photographerId,
          photographerName,
          created_by: 'photographer',
          created_by_name: photographerName
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSuggestions(prev => [data.request, ...prev])
        setNewCityRequest({ cityName: '', state: '', country: 'USA', image_url: '' })
        setShowRequestModal(false)
        // Refresh approved cities in case this was auto-approved
        loadApprovedCities()
        alert('City request submitted! Admin will review it shortly.')
      } else {
        alert('Failed to submit request. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting request:', error)
      alert('Failed to submit request. Please try again.')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending Review
          </Badge>
        )
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800">
            <X className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return null
    }
  }

  const pendingSuggestions = suggestions.filter(r => r.status === 'pending')
  const approvedSuggestions = suggestions.filter(r => r.status === 'approved')
  const rejectedSuggestions = suggestions.filter(r => r.status === 'rejected')

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">City Coverage</h1>
        <Button onClick={() => setShowRequestModal(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Request New City
        </Button>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading city data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{approvedCities.length}</div>
              <div className="text-sm text-muted-foreground">Active Cities</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{pendingSuggestions.length}</div>
              <div className="text-sm text-muted-foreground">Pending Requests</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{approvedSuggestions.length}</div>
              <div className="text-sm text-muted-foreground">Your Approved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {approvedCities.reduce((sum, city) => sum + (city.photographers || 0), 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Photographers</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Cities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-600" />
            Active Cities
          </CardTitle>
        </CardHeader>
        <CardContent>
          {approvedCities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No active cities yet</p>
              <p className="text-sm">Cities will appear here once admin approves requests</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {approvedCities.map(city => (
                <div key={city.id} className="p-4 border border-green-200 bg-green-50 rounded-lg">
                  {city.image_url && (
                    <div className="w-full h-32 mb-3 rounded-lg overflow-hidden">
                      <img 
                        src={city.image_url} 
                        alt={city.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{city.name}</h3>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {city.state}{city.country && city.country !== city.state ? `, ${city.country}` : ''}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{city.photographers} photographers</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Requests */}
      {pendingSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              Pending City Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingSuggestions.map(suggestion => (
                <div key={suggestion.id} className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{suggestion.name}, {suggestion.state}</h3>
                    {getStatusBadge(suggestion.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Requested by: {suggestion.photographerName}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    Request Date: {new Date(suggestion.created_at).toLocaleDateString()}
                  </div>
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-700">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Awaiting Admin Approval</span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      Your city request is under review. You'll be notified once it's processed.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approved Requests */}
      {approvedSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Your Approved City Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {approvedSuggestions.map(suggestion => (
                <div key={suggestion.id} className="p-4 border border-green-200 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{suggestion.name}, {suggestion.state}</h3>
                    {getStatusBadge(suggestion.status)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <div>Requested: {new Date(suggestion.created_at).toLocaleDateString()}</div>
                    {suggestion.approved_at && (
                      <div>Approved: {new Date(suggestion.approved_at).toLocaleDateString()}</div>
                    )}
                    {suggestion.adminName && (
                      <div>Approved by: {suggestion.adminName}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rejected Requests */}
      {rejectedSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <X className="w-5 h-5 text-red-600" />
              Rejected Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rejectedSuggestions.map(suggestion => (
                <div key={suggestion.id} className="p-4 border border-red-200 bg-red-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{suggestion.name}, {suggestion.state}</h3>
                    {getStatusBadge(suggestion.status)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    <div>Requested: {new Date(suggestion.created_at).toLocaleDateString()}</div>
                    {suggestion.approved_at && (
                      <div>Rejected: {new Date(suggestion.approved_at).toLocaleDateString()}</div>
                    )}
                    {suggestion.adminName && (
                      <div>Rejected by: {suggestion.adminName}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Request New City Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Request New City</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowRequestModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cityName">City Name</Label>
                <Input
                  id="cityName"
                  value={newCityRequest.cityName}
                  onChange={(e) => setNewCityRequest(prev => ({ ...prev, cityName: e.target.value }))}
                  placeholder="e.g., Austin"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  value={newCityRequest.state}
                  onChange={(e) => setNewCityRequest(prev => ({ ...prev, state: e.target.value }))}
                  placeholder="e.g., Texas"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <select
                  id="country"
                  value={newCityRequest.country}
                  onChange={(e) => setNewCityRequest(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="USA">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="UK">United Kingdom</option>
                  <option value="Australia">Australia</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>City Image</Label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                    isDragging
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploading}
                  />
                  
                  {newCityRequest.image_url ? (
                    <div className="space-y-2">
                      <img 
                        src={newCityRequest.image_url} 
                        alt="Preview" 
                        className="w-20 h-20 object-cover rounded-lg mx-auto"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setNewCityRequest(prev => ({ ...prev, image_url: '' }))}
                      >
                        Remove Image
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                      <p className="text-sm text-gray-600">
                        {uploading ? 'Uploading...' : 'Drag & drop an image or click to browse'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-blue-700 mb-1">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Review Process</span>
                </div>
                <p className="text-xs text-blue-600">
                  Your city request will be reviewed by our admin team. If approved, the city will be added to our service areas.
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowRequestModal(false)}>
                  Cancel
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={handleSubmitRequest}
                  disabled={!newCityRequest.cityName.trim() || !newCityRequest.state.trim() || uploading}
                >
                  Submit Request
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}