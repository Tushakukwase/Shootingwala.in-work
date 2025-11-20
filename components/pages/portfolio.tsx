"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { Upload, Plus, Edit, Trash2, Eye, CheckCircle, AlertCircle, Camera, Award, MapPin, Calendar, Star, X } from "lucide-react"

interface PortfolioItem {
  id: string
  title: string
  description: string
  category: string
  image: string
  photographerId: string
  approved: boolean
  createdAt: string
  views: number
  likes: number
}

export default function Portfolio() {
  const [activeTab, setActiveTab] = useState("portfolio")
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null)
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    category: '',
    image: ''
  })
  const [studioInfo, setStudioInfo] = useState({
    studioName: "",
    photographerName: "",
    experience: "",
    specialization: "",
    equipment: "",
    style: "",
    location: "",
    bio: "",
    kycStatus: "verified" // Auto-verified for all photographers
  })

  useEffect(() => {
    // Load studio data from localStorage
    const studioData = localStorage.getItem('studio')
    if (studioData) {
      try {
        const parsed = JSON.parse(studioData)
        setStudioInfo(prev => ({
          ...prev,
          studioName: parsed.studioName || "",
          photographerName: parsed.name || parsed.photographerName || "",
          location: parsed.location || "",
          kycStatus: parsed.kycStatus || "verified"
        }))
        
        // Load portfolio items
        loadPortfolioItems(parsed._id)
      } catch (error) {
        console.error('Error parsing studio data:', error)
      }
    }
  }, [])

  const loadPortfolioItems = async (photographerId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/portfolio?photographerId=${photographerId}`)
      const data = await response.json()
      
      if (data.success) {
        setPortfolioItems(data.data)
      }
    } catch (error) {
      console.error('Error loading portfolio items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = async () => {
    try {
      const studioData = localStorage.getItem('studio')
      if (!studioData) return
      
      const parsed = JSON.parse(studioData)
      
      const response = await fetch('/api/portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newItem,
          photographerId: parsed._id
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setPortfolioItems(prev => [...prev, data.data])
        setNewItem({ title: '', description: '', category: '', image: '' })
        setShowAddModal(false)
        alert('Portfolio item added successfully! Waiting for admin approval.')
      }
    } catch (error) {
      console.error('Error adding portfolio item:', error)
      alert('Failed to add portfolio item')
    }
  }

  const handleEditItem = async () => {
    if (!editingItem) return
    
    try {
      const response = await fetch('/api/portfolio', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingItem),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setPortfolioItems(prev => 
          prev.map(item => item.id === editingItem.id ? data.data : item)
        )
        setEditingItem(null)
        alert('Portfolio item updated successfully!')
      }
    } catch (error) {
      console.error('Error updating portfolio item:', error)
      alert('Failed to update portfolio item')
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this portfolio item?')) return
    
    try {
      const response = await fetch(`/api/portfolio?id=${id}`, {
        method: 'DELETE',
      })
      
      const data = await response.json()
      
      if (data.success) {
        setPortfolioItems(prev => prev.filter(item => item.id !== id))
        alert('Portfolio item deleted successfully!')
      }
    } catch (error) {
      console.error('Error deleting portfolio item:', error)
      alert('Failed to delete portfolio item')
    }
  }

  const handleStudioInfoChange = (field: string, value: string) => {
    setStudioInfo(prev => ({ ...prev, [field]: value }))
  }

  const saveStudioInfo = () => {
    // Save to localStorage and API
    const studioData = localStorage.getItem('studio')
    if (studioData) {
      try {
        const parsed = JSON.parse(studioData)
        const updated = { ...parsed, ...studioInfo }
        localStorage.setItem('studio', JSON.stringify(updated))
        // TODO: Save to API
        alert('Studio information saved successfully!')
      } catch (error) {
        console.error('Error saving studio data:', error)
      }
    }
  }

  const getKycStatusBadge = () => {
    switch (studioInfo.kycStatus) {
      case "verified":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified Photographer
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            KYC Rejected
          </Badge>
        )
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            KYC Pending
          </Badge>
        )
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Portfolio & Studio Info</h1>
          <div className="flex items-center gap-2 mt-2">
            {getKycStatusBadge()}
          </div>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Item
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("portfolio")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "portfolio"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Portfolio
        </button>
        <button
          onClick={() => setActiveTab("studio-info")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "studio-info"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Studio Information
        </button>
        <button
          onClick={() => setActiveTab("verification")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "verification"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Verification Status
        </button>
      </div>

      {/* Portfolio Tab */}
      {activeTab === "portfolio" && (
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading portfolio...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolioItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative aspect-video">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2">
                        {item.approved ? (
                          <Badge className="bg-green-100 text-green-800">Approved</Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                        )}
                      </div>
                      <div className="absolute top-2 right-2 flex gap-2">
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          className="h-8 w-8 p-0"
                          onClick={() => setEditingItem(item)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-foreground">{item.title}</h3>
                        <Badge variant="outline">{item.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{item.views} views</span>
                        <span>{item.likes} likes</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {portfolioItems.length === 0 && (
                <div className="text-center py-8">
                  <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No portfolio items yet</h3>
                  <p className="text-muted-foreground mb-4">Start building your portfolio by adding your first item</p>
                  <Button onClick={() => setShowAddModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Item
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Add Portfolio Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Add Portfolio Item</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newItem.title}
                  onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={newItem.description}
                  onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter description"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground resize-none"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={newItem.category}
                  onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                >
                  <option value="">Select category</option>
                  <option value="Wedding">Wedding</option>
                  <option value="Portrait">Portrait</option>
                  <option value="Event">Event</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Nature">Nature</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  value={newItem.image}
                  onChange={(e) => setNewItem(prev => ({ ...prev, image: e.target.value }))}
                  placeholder="Enter image URL"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddItem} className="flex-1">
                  Add Item
                </Button>
                <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Portfolio Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Edit Portfolio Item</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setEditingItem(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editingItem.title}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, title: e.target.value } : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <textarea
                  id="edit-description"
                  value={editingItem.description}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, description: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground resize-none"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <select
                  id="edit-category"
                  value={editingItem.category}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, category: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                >
                  <option value="Wedding">Wedding</option>
                  <option value="Portrait">Portrait</option>
                  <option value="Event">Event</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Nature">Nature</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-image">Image URL</Label>
                <Input
                  id="edit-image"
                  value={editingItem.image}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, image: e.target.value } : null)}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleEditItem} className="flex-1">
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditingItem(null)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Studio Information Tab */}
      {activeTab === "studio-info" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Studio Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="studioName">Studio Name</Label>
                  <Input
                    id="studioName"
                    value={studioInfo.studioName}
                    onChange={(e) => handleStudioInfoChange("studioName", e.target.value)}
                    placeholder="Your Studio Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="photographerName">Photographer Name</Label>
                  <Input
                    id="photographerName"
                    value={studioInfo.photographerName}
                    onChange={(e) => handleStudioInfoChange("photographerName", e.target.value)}
                    placeholder="Your Full Name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    value={studioInfo.experience}
                    onChange={(e) => handleStudioInfoChange("experience", e.target.value)}
                    placeholder="e.g., 5 years"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={studioInfo.location}
                    onChange={(e) => handleStudioInfoChange("location", e.target.value)}
                    placeholder="City, State"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  value={studioInfo.specialization}
                  onChange={(e) => handleStudioInfoChange("specialization", e.target.value)}
                  placeholder="Wedding, Portrait, Event, Commercial, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="equipment">Equipment & Gear</Label>
                <textarea
                  id="equipment"
                  value={studioInfo.equipment}
                  onChange={(e) => handleStudioInfoChange("equipment", e.target.value)}
                  placeholder="List your cameras, lenses, lighting equipment, etc."
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground resize-none"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="style">Photography Style</Label>
                <Input
                  id="style"
                  value={studioInfo.style}
                  onChange={(e) => handleStudioInfoChange("style", e.target.value)}
                  placeholder="Candid, Traditional, Artistic, Documentary, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Professional Bio</Label>
                <textarea
                  id="bio"
                  value={studioInfo.bio}
                  onChange={(e) => handleStudioInfoChange("bio", e.target.value)}
                  placeholder="Tell clients about yourself, your passion, and your approach to photography..."
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground resize-none"
                  rows={4}
                />
              </div>

              <Button onClick={saveStudioInfo} className="w-full">
                Save Studio Information
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Verification Status Tab */}
      {activeTab === "verification" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Verification Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-green-700 mb-2">Account Verified!</h3>
                <p className="text-muted-foreground mb-4">
                  Your photographer account is automatically verified. Clients can trust your professional services.
                </p>
                <div className="flex items-center justify-center gap-2">
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified Photographer
                  </Badge>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Verification Benefits</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Trusted badge displayed on your profile</li>
                  <li>• Higher visibility in search results</li>
                  <li>• Increased client confidence</li>
                  <li>• Access to premium features</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}