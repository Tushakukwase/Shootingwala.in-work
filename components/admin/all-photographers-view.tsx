"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState, useEffect } from "react"
import { 
  Search, 
  Eye, 
  Settings, 
  Mail, 
  Phone, 
  MapPin, 
  Camera, 
  Star, 
  Calendar, 
  DollarSign, 
  User, 
  Plus, 
  Building2, 
  Lock, 
  EyeOff, 
  CheckCircle, 
  X, 
  Clock,
  MoreHorizontal,
  Edit,
  Trash2,
  Ban,
  Check
} from "lucide-react"
import EditPhotographerForm from "./edit-photographer-form"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import PhotographerProfile from "@/components/photographer/photographer-profile"
import PhotographerManagementDashboard from "./photographer-management-dashboard"

interface Photographer {
  id: string
  name: string
  studioName: string
  email: string
  phone: string
  location: string
  specialization: string[]
  experience: number
  rating: number
  totalBookings: number
  totalEarnings: number
  joinDate: string
  lastActive: string
  status: 'active' | 'inactive' | 'suspended'
  verified: boolean
  avatar?: string
}

interface PendingPhotographer {
  id: string
  fullName: string
  email: string
  mobile: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  username: string
}

// No mock data - all data comes from API

export default function AllPhotographersView() {
  const [photographers, setPhotographers] = useState<Photographer[]>([])
  const [pendingCount, setPendingCount] = useState(0)
  const [approvedCount, setApprovedCount] = useState(0)
  const [rejectedCount, setRejectedCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [selectedPhotographer, setSelectedPhotographer] = useState<Photographer | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [photographerDetails, setPhotographerDetails] = useState<any>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
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
  const [pendingPhotographers, setPendingPhotographers] = useState<PendingPhotographer[]>([])
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedPendingPhotographer, setSelectedPendingPhotographer] = useState<PendingPhotographer | null>(null)
  const [showPendingDetails, setShowPendingDetails] = useState(false)
  const [showManageDropdown, setShowManageDropdown] = useState<string | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{action: string, photographerId: string} | null>(null)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingPhotographer, setEditingPhotographer] = useState<Photographer | null>(null)
  const [showManagementDashboard, setShowManagementDashboard] = useState(false)
  const [selectedPhotographerId, setSelectedPhotographerId] = useState<string | null>(null)

  useEffect(() => {
    fetchPhotographers()
    fetchPendingCounts()
  }, [])

  const fetchPhotographers = async () => {
    try {
      const response = await fetch('/api/photographers')
      const data = await response.json()
      
      const transformedPhotographers = (data.photographers || []).map((p: any) => ({
        id: p._id,
        name: p.name,
        studioName: p.studioName || p.name,
        email: p.email,
        phone: p.phone,
        location: p.location,
        specialization: p.specialization ? [p.specialization] : ['Photography'],
        experience: p.experience || 0,
        rating: p.rating || 0,
        totalBookings: p.totalBookings || 0,
        totalEarnings: p.totalEarnings || 0,
        joinDate: p.createdAt,
        lastActive: p.lastActive || p.createdAt,
        status: p.approved ? 'active' : 'inactive',
        verified: p.verified || false,
        avatar: p.image || undefined
      }))
      setPhotographers(transformedPhotographers)
    } catch (error) {
      console.error('Error fetching photographers:', error)
      setPhotographers([])
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingCounts = async () => {
    try {
      const response = await fetch('/api/photographer-approvals')
      const data = await response.json()
      
      if (data.success) {
        setPendingPhotographers(data.photographers)
        const pending = data.photographers.filter((p: any) => p.status === 'pending').length
        const approved = data.photographers.filter((p: any) => p.status === 'approved').length
        const rejected = data.photographers.filter((p: any) => p.status === 'rejected').length
        
        setPendingCount(pending)
        setApprovedCount(approved)
        setRejectedCount(rejected)
      }
    } catch (error) {
      console.error('Error fetching pending counts:', error)
    }
  }

  const filteredPhotographers = photographers.filter(photographer => {
    const matchesSearch = photographer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         photographer.studioName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         photographer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         photographer.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         photographer.specialization.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesFilter = filter === 'all' || photographer.status === filter || 
                         (filter === 'verified' && photographer.verified) ||
                         (filter === 'unverified' && !photographer.verified)
    
    return matchesSearch && matchesFilter
  })

  const stats = {
    total: photographers.length,
    active: photographers.filter(p => p.status === 'active').length,
    inactive: photographers.filter(p => p.status === 'inactive').length,
    verified: photographers.filter(p => p.verified).length,
    pending: pendingCount,
    approved: approvedCount,
    rejected: rejectedCount,
    totalBookings: photographers.reduce((sum, p) => sum + p.totalBookings, 0),
    totalEarnings: photographers.reduce((sum, p) => sum + p.totalEarnings, 0),
    avgRating: photographers.reduce((sum, p) => sum + p.rating, 0) / photographers.length
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'inactive':
        return <Badge className="bg-yellow-100 text-yellow-800">Inactive</Badge>
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>
      default:
        return null
    }
  }

  const fetchPhotographerDetails = async (photographerId: string) => {
    try {
      setDetailsLoading(true)
      console.log('Fetching details for photographer ID:', photographerId)
      
      // Fetch data with individual error handling
      const fetchWithErrorHandling = async (url: string) => {
        try {
          const response = await fetch(url)
          if (!response.ok) {
            console.warn(`Failed to fetch ${url}:`, response.status, response.statusText)
            return { success: false, data: null }
          }
          const data = await response.json()
          return { success: true, data }
        } catch (error) {
          console.warn(`Error fetching ${url}:`, error)
          return { success: false, data: null }
        }
      }
      
      // Fetch all data with individual error handling
      const [
        profileResult,
        galleriesResult,
        storiesResult,
        packagesResult
      ] = await Promise.all([
        fetchWithErrorHandling(`/api/photographer/${photographerId}`),
        fetchWithErrorHandling(`/api/photographer-galleries?photographerId=${photographerId}`),
        fetchWithErrorHandling(`/api/photographer-stories?photographerId=${photographerId}`),
        photographerId ? fetchWithErrorHandling(`/api/photographer-packages?photographerId=${photographerId}`) : Promise.resolve({ success: false, data: null })
      ])
      
      const completeData = {
        profile: profileResult.success && profileResult.data?.success ? profileResult.data.photographer : null,
        galleries: galleriesResult.success && galleriesResult.data?.success ? galleriesResult.data.galleries : [],
        stories: storiesResult.success && storiesResult.data?.success ? storiesResult.data.stories : [],
        packages: packagesResult.success && packagesResult.data?.success ? packagesResult.data.packages : []
      }
      
      console.log('Fetched photographer details:', completeData)
      setPhotographerDetails(completeData)
    } catch (error) {
      console.error('Error fetching photographer details:', error)
      // Set empty data on error
      setPhotographerDetails({
        profile: null,
        galleries: [],
        stories: [],
        packages: []
      })
    } finally {
      setDetailsLoading(false)
    }
  }

  const openPhotographerDashboard = async (photographer: Photographer) => {
    setSelectedPhotographer(photographer)
    await fetchPhotographerDetails(photographer.id)
    setShowDetails(true)
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

  const handleCreatePhotographer = async (e: React.FormEvent) => {
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
        // Refresh photographers list
        fetch('/api/photographers')
          .then(res => res.json())
          .then(data => {
            const transformedPhotographers = (data.photographers || []).map((p: any) => ({
              id: p._id,
              name: p.name,
              studioName: p.studioName || p.name,
              email: p.email,
              phone: p.phone,
              location: p.location,
              specialization: p.specialization ? [p.specialization] : ['Photography'],
              experience: p.experience || 0,
              rating: p.rating || 0,
              totalBookings: p.totalBookings || 0,
              totalEarnings: p.totalEarnings || 0,
              joinDate: p.createdAt,
              lastActive: p.lastActive || p.createdAt,
              status: p.approved ? 'active' : 'inactive',
              verified: p.verified || false,
              avatar: p.image || undefined
            }))
            setPhotographers(transformedPhotographers)
          })
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
        // Refresh data after approval
        fetchPendingCounts()
        if (action === 'approve') {
          fetchPhotographers()
        }
        setSuccess(`Photographer ${action === 'approve' ? 'approved' : 'rejected'} successfully!`)
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setErrors({ general: data.error || 'Failed to update photographer status' })
      }
    } catch (error) {
      console.error('Error updating photographer:', error)
      setErrors({ general: 'Failed to update photographer status' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleBlockUnblock = async (photographerId: string, currentStatus: string) => {
    try {
      const action = currentStatus === 'active' ? 'block' : 'unblock'
      
      const response = await fetch('/api/admin/photographers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: photographerId, action })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSuccess(data.message)
        // Refresh the photographers list
        fetchPhotographers()
      } else {
        setErrors({ general: data.error || 'Failed to update photographer status' })
      }
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Error updating photographer status:', error)
      setErrors({ general: 'Failed to update photographer status' })
    }
  }

  const handleDelete = async (photographerId: string) => {
    try {
      const response = await fetch(`/api/admin/photographers?id=${photographerId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSuccess(data.message)
        // Refresh the photographers list
        fetchPhotographers()
      } else {
        setErrors({ general: data.error || 'Failed to delete photographer' })
      }
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Error deleting photographer:', error)
      setErrors({ general: 'Failed to delete photographer' })
    }
  }

  const handleEdit = async (photographerId: string) => {
    const photographer = photographers.find(p => p.id === photographerId)
    if (photographer) {
      setEditingPhotographer(photographer)
      setShowEditForm(true)
    }
  }

  const handleManage = (photographerId: string) => {
    setSelectedPhotographerId(photographerId)
    setShowManagementDashboard(true)
  }

  const getApprovalStatusBadge = (status: string) => {
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

  const confirmActionHandler = () => {
    if (!confirmAction) return
    
    switch (confirmAction.action) {
      case 'block':
        handleBlockUnblock(confirmAction.photographerId, 'active')
        break
      case 'unblock':
        handleBlockUnblock(confirmAction.photographerId, 'suspended')
        break
      case 'delete':
        handleDelete(confirmAction.photographerId)
        break
      case 'edit':
        handleEdit(confirmAction.photographerId)
        break
    }
    
    setShowConfirmDialog(false)
    setConfirmAction(null)
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Photographers Management</h1>
          <p className="text-muted-foreground">Manage photographer accounts, approvals, and create new ones</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline">{stats.total} Total</Badge>
          <Badge className="bg-green-100 text-green-800">{stats.active} Active</Badge>
          {stats.pending > 0 && (
            <Badge className="bg-red-100 text-red-800">
              {stats.pending} Pending
            </Badge>
          )}
          <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add New Photographer
          </Button>
        </div>
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

            <form onSubmit={handleCreatePhotographer} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-muted-foreground">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.inactive}</div>
            <div className="text-sm text-muted-foreground">Inactive</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.verified}</div>
            <div className="text-sm text-muted-foreground">Verified</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-muted-foreground">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-sm text-muted-foreground">Rejected</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Filter Tabs - Modern Design */}
        <div className="flex flex-wrap gap-1 bg-muted p-1 rounded-lg">
          {[
            { key: 'all', label: 'All Photographers' },
            { key: 'active', label: 'Active' },
            { key: 'inactive', label: 'Inactive' },
            { key: 'suspended', label: 'Suspended' },
            { key: 'verified', label: 'Verified' },
            { key: 'unverified', label: 'Unverified' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Search */}
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

      {/* Pending Approvals Section */}
      {pendingPhotographers.filter(p => p.status === 'pending').length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Pending Approvals ({pendingPhotographers.filter(p => p.status === 'pending').length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingPhotographers
                .filter(p => p.status === 'pending')
                .map((photographer) => (
                  <div key={photographer.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div>
                        <h4 className="font-medium">{photographer.fullName}</h4>
                        <p className="text-sm text-gray-600">{photographer.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedPendingPhotographer(photographer)
                          setShowPendingDetails(true)
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleApproval(photographer.id, 'approve')}
                        disabled={actionLoading === photographer.id}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        {actionLoading === photographer.id ? 'Processing...' : 'Approve'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleApproval(photographer.id, 'reject')}
                        disabled={actionLoading === photographer.id}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Photographers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Photographers</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredPhotographers.map((photographer) => (
                <div 
                  key={photographer.id} 
                  className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                >
                  <div className="flex flex-col h-full">
                    {/* Profile Photo */}
                    <div className="flex justify-center mb-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={photographer.avatar} />
                        <AvatarFallback className="text-lg">
                          {(photographer.name || 'Unknown')?.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    
                    {/* Photographer Info */}
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="font-semibold text-center truncate">{photographer.name}</h3>
                        <p className="text-sm text-gray-600 text-center truncate">{photographer.studioName}</p>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span className="truncate">{photographer.email}</span>
                        </div>
                        <div className="flex justify-center">
                          {getStatusBadge(photographer.status)}
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                          onClick={() => openPhotographerDashboard(photographer)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleManage(photographer.id)}
                        >
                          <Settings className="w-4 h-4 mr-1" />
                          Manage
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredPhotographers.length === 0 && (
                <div className="text-center py-12 col-span-full">
                  <p className="text-gray-500">No photographers found</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Photographer Dashboard Modal (Right-side overlay) */}
      {showDetails && selectedPhotographer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex z-50">
          <div className="ml-auto w-full max-w-4xl h-full overflow-y-auto bg-white">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {photographerDetails?.profile?.studioName || photographerDetails?.profile?.name || selectedPhotographer.name}
                </h2>
                <Button variant="ghost" onClick={() => setShowDetails(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              {detailsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading photographer details...</span>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Photographer Profile Preview */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-4">Photographer Profile Preview</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center gap-4 mb-4">
                          <Avatar className="w-16 h-16">
                            <AvatarImage src={photographerDetails?.profile?.profilePhoto || selectedPhotographer.avatar} />
                            <AvatarFallback>
                              {(photographerDetails?.profile?.name || selectedPhotographer.name || 'Unknown')?.split(' ').map((n: string) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-bold text-lg">
                              {photographerDetails?.profile?.studioName || photographerDetails?.profile?.name || selectedPhotographer.name}
                            </h4>
                            <p className="text-gray-600">{photographerDetails?.profile?.location || selectedPhotographer.location}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span>{photographerDetails?.profile?.averageRating || selectedPhotographer.rating} ({selectedPhotographer.totalBookings} bookings)</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <span>{photographerDetails?.profile?.contact?.email || selectedPhotographer.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span>{photographerDetails?.profile?.contact?.phone || selectedPhotographer.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span>{photographerDetails?.profile?.location || selectedPhotographer.location}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Bio</h4>
                        <p className="text-sm text-gray-600">
                          {photographerDetails?.profile?.bio || 'No bio available'}
                        </p>
                        
                        <div className="mt-4">
                          <h4 className="font-semibold mb-2">Specializations</h4>
                          <div className="flex flex-wrap gap-2">
                            {(photographerDetails?.profile?.specializations || selectedPhotographer.specialization || []).map((spec: string, index: number) => (
                              <Badge key={index} variant="outline">{spec}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Portfolio Preview */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-4">Portfolio Preview</h3>
                    {photographerDetails?.galleries?.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {photographerDetails.galleries.slice(0, 6).map((gallery: any, index: number) => (
                          <div key={index} className="border rounded-lg overflow-hidden">
                            <div className="h-32 bg-gray-200 relative">
                              {gallery.images?.[0] ? (
                                <img 
                                  src={gallery.images[0]} 
                                  alt={gallery.name} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Camera className="w-8 h-8 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="p-2">
                              <p className="text-sm font-medium truncate">{gallery.name}</p>
                              <p className="text-xs text-gray-500">{gallery.images?.length || 0} images</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No galleries available</p>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t">
                    <Button 
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      onClick={() => {
                        // Open the photographer's profile within the admin panel
                        setShowDetails(true)
                      }}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Open Dashboard
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        // In a real implementation, this would open a chat popup
                        alert("In a real implementation, this would open a chat popup")
                      }}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {confirmAction?.action === 'block' && (
              <p>Are you sure you want to block this photographer? They will no longer be able to access their account.</p>
            )}
            {confirmAction?.action === 'unblock' && (
              <p>Are you sure you want to unblock this photographer? They will regain access to their account.</p>
            )}
            {confirmAction?.action === 'delete' && (
              <p className="text-red-600 font-medium">Are you sure you want to delete this photographer? This action cannot be undone.</p>
            )}
            {confirmAction?.action === 'edit' && (
              <p>Are you sure you want to edit this photographer's details?</p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmActionHandler}>
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Photographer Form */}
      {showEditForm && editingPhotographer && (
        <EditPhotographerForm
          photographer={{
            id: editingPhotographer.id,
            name: editingPhotographer.name,
            studioName: editingPhotographer.studioName,
            email: editingPhotographer.email,
            phone: editingPhotographer.phone,
            location: editingPhotographer.location,
            bio: '',
            experience: editingPhotographer.experience,
            specialization: editingPhotographer.specialization
          }}
          onClose={() => setShowEditForm(false)}
          onSave={(updatedPhotographer) => {
            // Update the photographer in the list
            setPhotographers(prev => prev.map(p => 
              p.id === updatedPhotographer.id ? 
              {...p, 
                name: updatedPhotographer.name,
                studioName: updatedPhotographer.studioName,
                email: updatedPhotographer.email,
                phone: updatedPhotographer.phone,
                location: updatedPhotographer.location,
                experience: updatedPhotographer.experience
              } : p
            ))
            setShowEditForm(false)
          }}
        />
      )}

      {/* Pending Photographer Details Modal */}
      {showPendingDetails && selectedPendingPhotographer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">
                Pending Photographer Application - {selectedPendingPhotographer.fullName}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowPendingDetails(false)}>
                ×
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-lg">Personal Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Full Name:</span>
                      <span>{selectedPendingPhotographer.fullName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Email:</span>
                      <span>{selectedPendingPhotographer.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Mobile:</span>
                      <span>{selectedPendingPhotographer.mobile}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Username:</span>
                      <span>{selectedPendingPhotographer.username}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-lg">Application Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Applied:</span>
                      <span>{new Date(selectedPendingPhotographer.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Status:</span>
                      {getApprovalStatusBadge(selectedPendingPhotographer.status)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3 text-lg">Quick Actions</h4>
                <div className="flex gap-3">
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white flex-1"
                    onClick={() => {
                      handleApproval(selectedPendingPhotographer.id, 'approve')
                      setShowPendingDetails(false)
                    }}
                    disabled={actionLoading === selectedPendingPhotographer.id}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {actionLoading === selectedPendingPhotographer.id ? 'Processing...' : 'Approve Application'}
                  </Button>
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50 flex-1"
                    onClick={() => {
                      handleApproval(selectedPendingPhotographer.id, 'reject')
                      setShowPendingDetails(false)
                    }}
                    disabled={actionLoading === selectedPendingPhotographer.id}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject Application
                  </Button>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setShowPendingDetails(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Photographer Management Dashboard Modal */}
      {showManagementDashboard && selectedPhotographerId && (
        <PhotographerManagementDashboard 
          photographerId={selectedPhotographerId}
          onClose={() => setShowManagementDashboard(false)}
        />
      )}

      {/* Photographer Profile Modal (Right-side overlay) */}
      {showDetails && selectedPhotographer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex z-50">
          <div className="ml-auto w-full max-w-6xl h-full overflow-y-auto bg-white">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  Photographer Profile: {photographerDetails?.profile?.studioName || photographerDetails?.profile?.name || selectedPhotographer.name}
                </h2>
                <Button variant="ghost" onClick={() => setShowDetails(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              {detailsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading photographer profile...</span>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Photographer Profile Component */}
                  {photographerDetails?.profile ? (
                    <PhotographerProfile 
                      photographerId={selectedPhotographer.id} 
                      isAdminView={true} 
                    />
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No profile data available for this photographer</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}