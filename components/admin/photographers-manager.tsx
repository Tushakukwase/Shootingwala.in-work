"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import NextImage from "next/image"
import { Upload, X, Edit3, Trash2, Search, Plus, Users, CheckCircle } from "lucide-react"

interface Photographer {
  _id: string
  name: string
  email: string
  phone: string
  location: string
  categories: string[]
  image: string
  description: string
  experience: number
  rating: number
  isVerified: boolean
  isApproved: boolean
  createdBy: 'admin' | 'self'
  startingPrice: number
  tags: string[]
  createdAt: string
}

export default function PhotographersManager() {
  const [photographers, setPhotographers] = useState<Photographer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending'>('all')
  
  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    categories: "",
    image: null as string | null,
    description: "",
    experience: 0,
    startingPrice: 200
  })
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchPhotographers()
  }, [])

  const fetchPhotographers = async () => {
    try {
      const response = await fetch('/api/photographers')
      const data = await response.json()
      setPhotographers(data.photographers || [])
      setLoading(false)
    } catch (error) {
      // Silently handle error
      setLoading(false)
    }
  }

  const handleFileUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setFormData(prev => ({ ...prev, image: e.target?.result as string }))
    }
    reader.readAsDataURL(file)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      alert('Name and email are required')
      return
    }

    try {
      const photographerData = {
        ...formData,
        categories: formData.categories.split(',').map(cat => cat.trim()).filter(cat => cat),
        tags: formData.categories.split(',').map(cat => cat.trim()).filter(cat => cat),
        isVerified: false,
        createdBy: 'admin'
      }

      const response = await fetch('/api/photographers', {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editId ? { ...photographerData, id: editId } : photographerData)
      })

      if (response.ok) {
        await fetchPhotographers()
        resetForm()
        alert(editId ? 'Photographer updated successfully' : 'Photographer added successfully')
      } else {
        throw new Error('Failed to save photographer')
      }
    } catch (error) {
      alert('Failed to save photographer')
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      location: "",
      categories: "",
      image: null,
      description: "",
      experience: 0,
      startingPrice: 200
    })
    setShowAddForm(false)
    setEditId(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const startEdit = (photographer: Photographer) => {
    setFormData({
      name: photographer.name,
      email: photographer.email,
      phone: photographer.phone,
      location: photographer.location,
      categories: photographer.categories.join(', '),
      image: photographer.image,
      description: photographer.description,
      experience: photographer.experience,
      startingPrice: photographer.startingPrice || 200
    })
    setEditId(photographer._id)
    setShowAddForm(true)
  }

  const handleApprove = async (photographerId: string) => {
    try {
      const response = await fetch(`/api/photographers/${photographerId}/approve`, {
        method: 'PUT'
      })
      
      if (response.ok) {
        await fetchPhotographers()
        // Show success message
        const successDiv = document.createElement('div')
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50'
        successDiv.textContent = '✓ Photographer approved! Now visible on Home Page and Dashboard.'
        document.body.appendChild(successDiv)
        setTimeout(() => document.body.removeChild(successDiv), 3000)
      } else {
        throw new Error('Failed to approve photographer')
      }
    } catch (error) {
      alert('Failed to approve photographer')
    }
  }

  const handleReject = async (photographerId: string) => {
    if (confirm('Are you sure you want to revoke approval for this photographer? They will no longer appear on the Home Page and Dashboard.')) {
      try {
        const response = await fetch(`/api/photographers/${photographerId}/approve`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          await fetchPhotographers()
          // Show warning message
          const warningDiv = document.createElement('div')
          warningDiv.className = 'fixed top-4 right-4 bg-orange-500 text-white px-6 py-3 rounded-lg shadow-lg z-50'
          warningDiv.textContent = '⚠ Photographer approval revoked. No longer visible to users.'
          document.body.appendChild(warningDiv)
          setTimeout(() => document.body.removeChild(warningDiv), 3000)
        } else {
          throw new Error('Failed to reject photographer')
        }
      } catch (error) {
        alert('Failed to reject photographer')
      }
    }
  }

  const deletePhotographer = async (id: string) => {
    if (confirm('Are you sure you want to delete this photographer?')) {
      try {
        const response = await fetch('/api/photographers', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        })

        if (response.ok) {
          await fetchPhotographers()
          alert('Photographer deleted successfully')
        } else {
          throw new Error('Failed to delete photographer')
        }
      } catch (error) {
        alert('Failed to delete photographer')
      }
    }
  }

  const filteredPhotographers = photographers.filter(photographer => {
    const matchesSearch = photographer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      photographer.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      photographer.categories.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'approved' && photographer.isApproved) ||
      (statusFilter === 'pending' && !photographer.isApproved)
    
    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
            <Users className="w-6 h-6 text-green-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Photographers Management
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Manage photographer profiles, verify accounts, and organize your photography network
          </p>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                {editId ? 'Edit Photographer' : 'Add New Photographer'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter photographer's full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Enter location/city"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="categories">Categories (comma separated)</Label>
                    <Input
                      id="categories"
                      value={formData.categories}
                      onChange={(e) => setFormData(prev => ({ ...prev, categories: e.target.value }))}
                      placeholder="Wedding, Portrait, Event"
                    />
                  </div>
                  <div>
                    <Label htmlFor="experience">Experience (years)</Label>
                    <Input
                      id="experience"
                      type="number"
                      value={formData.experience}
                      onChange={(e) => setFormData(prev => ({ ...prev, experience: parseInt(e.target.value) || 0 }))}
                      placeholder="Years of experience"
                    />
                  </div>
                  <div>
                    <Label htmlFor="startingPrice">Starting Price ($)</Label>
                    <Input
                      id="startingPrice"
                      type="number"
                      min="0"
                      value={formData.startingPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, startingPrice: parseInt(e.target.value) || 200 }))}
                      placeholder="Starting price"
                    />
                  </div>
                  <div>
                    <Label>Profile Image</Label>
                    <div className="flex items-center gap-4">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Image
                      </Button>
                      {formData.image && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden">
                          <NextImage
                            src={formData.image}
                            alt="Preview"
                            width={64}
                            height={64}
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description about the photographer"
                  rows={3}
                />
              </div>

              <div className="flex gap-4">
                <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                  {editId ? 'Update Photographer' : 'Add Photographer'}
                </Button>
                <Button onClick={resetForm} variant="outline">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600">
                {photographers.filter(p => p.isApproved).length}
              </div>
              <div className="text-sm text-green-700 font-medium">Approved Photographers</div>
              <div className="text-xs text-green-600 mt-1">Visible to users</div>
            </CardContent>
          </Card>
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-orange-600">
                {photographers.filter(p => !p.isApproved).length}
              </div>
              <div className="text-sm text-orange-700 font-medium">Pending Approval</div>
              <div className="text-xs text-orange-600 mt-1">Awaiting review</div>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600">
                {photographers.length}
              </div>
              <div className="text-sm text-blue-700 font-medium">Total Photographers</div>
              <div className="text-xs text-blue-600 mt-1">All registered</div>
            </CardContent>
          </Card>
        </div>

        {/* Photographers List */}
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Photographers ({filteredPhotographers.length})
              </CardTitle>
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  <Button
                    variant={statusFilter === 'all' ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('all')}
                    className={statusFilter === 'all' ? 'bg-white/30 text-white' : 'border-white/30 text-white hover:bg-white/20'}
                  >
                    All ({photographers.length})
                  </Button>
                  <Button
                    variant={statusFilter === 'approved' ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('approved')}
                    className={statusFilter === 'approved' ? 'bg-white/30 text-white' : 'border-white/30 text-white hover:bg-white/20'}
                  >
                    Approved ({photographers.filter(p => p.isApproved).length})
                  </Button>
                  <Button
                    variant={statusFilter === 'pending' ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('pending')}
                    className={statusFilter === 'pending' ? 'bg-white/30 text-white' : 'border-white/30 text-white hover:bg-white/20'}
                  >
                    Pending ({photographers.filter(p => !p.isApproved).length})
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search photographers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-9 bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30"
                  />
                </div>
                <Button
                  onClick={() => setShowAddForm(true)}
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/20"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading photographers...</p>
              </div>
            ) : filteredPhotographers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No photographers found</p>
                <p className="text-gray-400">Add your first photographer to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPhotographers.map((photographer) => (
                  <Card key={photographer._id} className="group hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                            {photographer.image ? (
                              <NextImage
                                src={photographer.image}
                                alt={photographer.name}
                                width={64}
                                height={64}
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Users className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                          {photographer.isVerified && (
                            <CheckCircle className="absolute -top-1 -right-1 w-5 h-5 text-green-500 bg-white rounded-full" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">{photographer.name}</h3>
                            <Badge 
                              variant={photographer.createdBy === 'admin' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {photographer.createdBy === 'admin' ? 'Admin' : 'Self-Reg'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">{photographer.location}</p>
                          <p className="text-sm text-gray-500">{photographer.experience} years exp</p>
                          <div className="flex items-center gap-1 mt-2">
                            <Badge 
                              variant={photographer.isApproved ? 'default' : 'destructive'}
                              className={`text-xs ${photographer.isApproved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                            >
                              {photographer.isApproved ? '✓ Approved' : '⏳ Pending Approval'}
                            </Badge>
                            {photographer.rating > 0 && (
                              <Badge variant="outline" className="text-xs">
                                ⭐ {photographer.rating.toFixed(1)}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            {photographer.categories.slice(0, 2).map((category, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {category}
                              </Badge>
                            ))}
                            {photographer.categories.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{photographer.categories.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          {!photographer.isApproved && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApprove(photographer._id)}
                              className="text-green-600 border-green-200 hover:bg-green-50"
                            >
                              ✓ Approve
                            </Button>
                          )}
                          {photographer.isApproved && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReject(photographer._id)}
                              className="text-orange-600 border-orange-200 hover:bg-orange-50"
                            >
                              ✗ Revoke
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEdit(photographer)}
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          >
                            <Edit3 className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deletePhotographer(photographer._id)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {photographer.description && (
                        <p className="text-sm text-gray-600 mt-3 line-clamp-2">{photographer.description}</p>
                      )}
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