"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState, useEffect } from "react"
import { Search, Eye, Settings, Mail, Phone, MapPin, Camera, Star, Calendar, DollarSign, User } from "lucide-react"

interface Photographer {
  id: string
  name: string
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

const mockPhotographers: Photographer[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    specialization: ['Wedding Photography', 'Portrait Photography'],
    experience: 8,
    rating: 4.9,
    totalBookings: 156,
    totalEarnings: 45600,
    joinDate: '2023-01-15',
    lastActive: '2024-11-20',
    status: 'active',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
  },
  {
    id: '2',
    name: 'Sarah Wilson',
    email: 'sarah@example.com',
    phone: '+1 (555) 987-6543',
    location: 'Los Angeles, CA',
    specialization: ['Event Photography', 'Commercial Photography'],
    experience: 5,
    rating: 4.7,
    totalBookings: 89,
    totalEarnings: 28900,
    joinDate: '2023-06-20',
    lastActive: '2024-11-19',
    status: 'active',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
  },
  {
    id: '3',
    name: 'Mike Rodriguez',
    email: 'mike@example.com',
    phone: '+1 (555) 456-7890',
    location: 'Chicago, IL',
    specialization: ['Wedding Photography', 'Drone Photography'],
    experience: 12,
    rating: 4.8,
    totalBookings: 203,
    totalEarnings: 67800,
    joinDate: '2022-03-10',
    lastActive: '2024-11-18',
    status: 'active',
    verified: true
  },
  {
    id: '4',
    name: 'Lisa Anderson',
    email: 'lisa@example.com',
    phone: '+1 (555) 321-0987',
    location: 'Miami, FL',
    specialization: ['Portrait Photography', 'Fashion Photography'],
    experience: 3,
    rating: 4.6,
    totalBookings: 45,
    totalEarnings: 12300,
    joinDate: '2024-01-05',
    lastActive: '2024-11-15',
    status: 'inactive',
    verified: false
  }
]

export default function AllPhotographersView() {
  const [photographers, setPhotographers] = useState<Photographer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [selectedPhotographer, setSelectedPhotographer] = useState<Photographer | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    fetch('/api/photographers')
      .then(res => res.json())
      .then(data => {
        const transformedPhotographers = (data.photographers || []).map((p: any) => ({
          id: p._id,
          name: p.name,
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
        setLoading(false)
      })
      .catch(() => {
        setPhotographers([])
        setLoading(false)
      })
  }, [])

  const filteredPhotographers = photographers.filter(photographer => {
    const matchesSearch = photographer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const openPhotographerDashboard = (photographerId: string) => {
    // This would open the photographer's dashboard view for admin
    alert(`Opening photographer dashboard for ID: ${photographerId}`)
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">All Photographers</h1>
        <div className="flex items-center gap-4">
          <Badge variant="outline">{stats.total} Total</Badge>
          <Badge className="bg-green-100 text-green-800">{stats.active} Active</Badge>
        </div>
      </div>

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
            <div className="text-2xl font-bold text-purple-600">{stats.totalBookings}</div>
            <div className="text-sm text-muted-foreground">Total Bookings</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">${stats.totalEarnings.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Earnings</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.avgRating.toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">Avg Rating</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border border-input rounded-md bg-background text-sm"
        >
          <option value="all">All Photographers</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
          <option value="verified">Verified</option>
          <option value="unverified">Unverified</option>
        </select>
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

      {/* Photographers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPhotographers.map(photographer => (
          <Card key={photographer.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={photographer.avatar} />
                  <AvatarFallback>{photographer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{photographer.name}</h3>
                  <p className="text-sm text-muted-foreground">{photographer.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(photographer.status)}
                    {photographer.verified && (
                      <Badge className="bg-blue-100 text-blue-800 text-xs">Verified</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-muted-foreground" />
                  <span>{photographer.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Camera className="w-3 h-3 text-muted-foreground" />
                  <span>{photographer.experience} years experience</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-3 h-3 text-yellow-500" />
                  <span>{photographer.rating} ({photographer.totalBookings} bookings)</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-3 h-3 text-green-600" />
                  <span>${photographer.totalEarnings.toLocaleString()} earned</span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="text-xs text-muted-foreground">
                  Specializations: {photographer.specialization.join(', ')}
                </div>
                <div className="text-xs text-muted-foreground">
                  Joined: {photographer.joinDate} • Last active: {photographer.lastActive}
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setSelectedPhotographer(photographer)
                    setShowDetails(true)
                  }}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View Details
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => openPhotographerDashboard(photographer.id)}
                >
                  <Settings className="w-3 h-3 mr-1" />
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Photographer Details Modal */}
      {showDetails && selectedPhotographer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={selectedPhotographer.avatar} />
                    <AvatarFallback>{selectedPhotographer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  {selectedPhotographer.name}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowDetails(false)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedPhotographer.status)}
                {selectedPhotographer.verified && (
                  <Badge className="bg-blue-100 text-blue-800">Verified</Badge>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedPhotographer.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedPhotographer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedPhotographer.location}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Professional Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedPhotographer.experience} years experience</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>{selectedPhotographer.rating} rating</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedPhotographer.totalBookings} total bookings</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span>${selectedPhotographer.totalEarnings.toLocaleString()} total earnings</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Specializations</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedPhotographer.specialization.map((spec, index) => (
                    <Badge key={index} variant="outline">{spec}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Account Information</h4>
                <div className="text-sm space-y-1">
                  <p>Joined: {selectedPhotographer.joinDate}</p>
                  <p>Last Active: {selectedPhotographer.lastActive}</p>
                  <p>Account ID: {selectedPhotographer.id}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  className="flex-1"
                  onClick={() => openPhotographerDashboard(selectedPhotographer.id)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Open Dashboard
                </Button>
                <Button variant="outline" className="flex-1">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}