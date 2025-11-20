"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, User, Mail, Phone, MapPin, Building2, Lock, Eye, EyeOff, Search, Edit, Trash2 } from "lucide-react"

interface Photographer {
  _id: string
  name: string
  email: string
  phone: string
  location: string
  studioName: string
  status: 'active' | 'inactive' | 'pending'
  isApproved: boolean
  createdAt: string
}

export default function PhotographersManager() {
  const [photographers, setPhotographers] = useState<Photographer[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    studioName: '',
    password: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchPhotographers()
  }, [])

  const fetchPhotographers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/photographers')
      const data = await response.json()
      
      if (data.success) {
        setPhotographers(data.photographers || [])
      }
    } catch (error) {
      console.error('Error fetching photographers:', error)
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Photographer name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required"
    }

    if (!formData.studioName.trim()) {
      newErrors.studioName = "Studio name is required"
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      const response = await fetch('/api/admin/create-photographer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          location: formData.location,
          studioName: formData.studioName,
          password: formData.password,
          isApproved: true,
          status: 'active',
          createdBy: 'admin'
        })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Photographer created successfully!')
        setFormData({
          name: '',
          email: '',
          phone: '',
          location: '',
          studioName: '',
          password: ''
        })
        setShowAddForm(false)
        fetchPhotographers()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setErrors({ general: data.error || 'Failed to create photographer' })
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const filteredPhotographers = photographers.filter(photographer =>
    photographer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    photographer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    photographer.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (photographer: Photographer) => {
    if (!photographer.isApproved) {
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>
    }
    if (photographer.status === 'active') {
      return <Badge className="bg-green-100 text-green-800">Active</Badge>
    }
    return <Badge variant="outline" className="bg-gray-100 text-gray-800">Inactive</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Photographers Management</h2>
          <p className="text-muted-foreground">Manage photographer accounts and create new ones</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add New Photographer
        </Button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Add Photographer Form */}
      {showAddForm && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Add New Photographer
            </CardTitle>
          </CardHeader>
          <CardContent>
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Photographer Name */}
              <div>
                <label className="block text-sm font-medium mb-2">Photographer Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter photographer name"
                    className="pl-10"
                  />
                </div>
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="photographer@example.com"
                    className="pl-10"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+91 9876543210"
                    className="pl-10"
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="City, State"
                    className="pl-10"
                  />
                </div>
                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
              </div>

              {/* Studio Name */}
              <div>
                <label className="block text-sm font-medium mb-2">Studio Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    name="studioName"
                    value={formData.studioName}
                    onChange={handleInputChange}
                    placeholder="Studio Name"
                    className="pl-10"
                  />
                </div>
                {errors.studioName && <p className="text-red-500 text-sm mt-1">{errors.studioName}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Create password"
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              {/* Form Actions */}
              <div className="md:col-span-2 flex gap-4 pt-4">
                <Button type="submit" className="flex-1">
                  Create Photographer Account
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowAddForm(false)
                    setFormData({
                      name: '',
                      email: '',
                      phone: '',
                      location: '',
                      studioName: '',
                      password: ''
                    })
                    setErrors({})
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search photographers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="outline">{filteredPhotographers.length} photographers</Badge>
      </div>

      {/* Photographers List */}
      <Card>
        <CardHeader>
          <CardTitle>All Photographers</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading photographers...</p>
            </div>
          ) : filteredPhotographers.length === 0 ? (
            <div className="text-center py-8">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Photographers Found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'No photographers match your search.' : 'No photographers have been added yet.'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Photographer
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPhotographers.map((photographer) => (
                <div key={photographer._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{photographer.name}</h3>
                        {getStatusBadge(photographer)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>{photographer.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span>{photographer.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{photographer.location}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                        <Building2 className="w-4 h-4" />
                        <span>{photographer.studioName}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}