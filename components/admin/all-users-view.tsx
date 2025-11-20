"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState } from "react"
import { Search, Eye, Mail, Phone, MapPin, Calendar, Heart, Star, User, Settings } from "lucide-react"

interface UserProfile {
  id: string
  fullName: string
  email: string
  phone: string
  location?: string
  joinDate: string
  lastActive: string
  totalBookings: number
  favoritePhotographers: number
  totalSpent: number
  averageRating: number
  status: 'active' | 'inactive' | 'suspended'
  verified: boolean
  avatar?: string
  preferences?: {
    categories: string[]
    priceRange: string
    location: string
  }
}

const mockUsers: UserProfile[] = [
  {
    id: '1',
    fullName: 'Emily Johnson',
    email: 'emily@example.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    joinDate: '2023-08-15',
    lastActive: '2024-11-20',
    totalBookings: 8,
    favoritePhotographers: 3,
    totalSpent: 4200,
    averageRating: 4.8,
    status: 'active',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    preferences: {
      categories: ['Wedding Photography', 'Portrait Photography'],
      priceRange: 'medium',
      location: 'New York, NY'
    }
  },
  {
    id: '2',
    fullName: 'Michael Chen',
    email: 'michael@example.com',
    phone: '+1 (555) 987-6543',
    location: 'Los Angeles, CA',
    joinDate: '2024-01-20',
    lastActive: '2024-11-19',
    totalBookings: 3,
    favoritePhotographers: 2,
    totalSpent: 1800,
    averageRating: 4.5,
    status: 'active',
    verified: true,
    preferences: {
      categories: ['Event Photography', 'Corporate Photography'],
      priceRange: 'high',
      location: 'Los Angeles, CA'
    }
  },
  {
    id: '3',
    fullName: 'Sarah Williams',
    email: 'sarah@example.com',
    phone: '+1 (555) 456-7890',
    location: 'Chicago, IL',
    joinDate: '2023-12-05',
    lastActive: '2024-11-18',
    totalBookings: 12,
    favoritePhotographers: 5,
    totalSpent: 6800,
    averageRating: 4.9,
    status: 'active',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    preferences: {
      categories: ['Wedding Photography', 'Family Photography'],
      priceRange: 'medium',
      location: 'Chicago, IL'
    }
  },
  {
    id: '4',
    fullName: 'David Rodriguez',
    email: 'david@example.com',
    phone: '+1 (555) 321-0987',
    joinDate: '2024-06-10',
    lastActive: '2024-10-15',
    totalBookings: 1,
    favoritePhotographers: 1,
    totalSpent: 350,
    averageRating: 4.0,
    status: 'inactive',
    verified: false,
    preferences: {
      categories: ['Portrait Photography'],
      priceRange: 'low',
      location: 'Miami, FL'
    }
  }
]

export default function AllUsersView() {
  const [users, setUsers] = useState(mockUsers)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.location && user.location.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesFilter = filter === 'all' || user.status === filter || 
                         (filter === 'verified' && user.verified) ||
                         (filter === 'unverified' && !user.verified)
    
    return matchesSearch && matchesFilter
  })

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length,
    verified: users.filter(u => u.verified).length,
    totalBookings: users.reduce((sum, u) => sum + u.totalBookings, 0),
    totalSpent: users.reduce((sum, u) => sum + u.totalSpent, 0),
    avgRating: users.reduce((sum, u) => sum + u.averageRating, 0) / users.length
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

  const openUserDashboard = (userId: string) => {
    // This would open the user's dashboard view for admin
    alert(`Opening user dashboard for ID: ${userId}`)
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">All Users</h1>
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
            <div className="text-sm text-muted-foreground">Total Users</div>
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
            <div className="text-2xl font-bold text-green-600">${(stats.totalSpent || 0).toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Spent</div>
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
          <option value="all">All Users</option>
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
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map(user => (
          <Card key={user.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{(user.fullName || 'Unknown')?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{user.fullName}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(user.status)}
                    {user.verified && (
                      <Badge className="bg-blue-100 text-blue-800 text-xs">Verified</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {user.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-muted-foreground" />
                    <span>{user.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  <span>{user.totalBookings || 0} bookings</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-3 h-3 text-red-500" />
                  <span>{user.favoritePhotographers} favorite photographers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-3 h-3 text-yellow-500" />
                  <span>{user.averageRating} average rating given</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium text-center">
                  Total Spent: ${(user.totalSpent || 0).toLocaleString()}
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="text-xs text-muted-foreground">
                  Joined: {user.joinDate} • Last active: {user.lastActive}
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setSelectedUser(user)
                    setShowDetails(true)
                  }}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View Details
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => openUserDashboard(user.id)}
                >
                  <Settings className="w-3 h-3 mr-1" />
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* User Details Modal */}
      {showDetails && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={selectedUser.avatar} />
                    <AvatarFallback>{(selectedUser.fullName || 'Unknown')?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  {selectedUser.fullName}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowDetails(false)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedUser.status)}
                {selectedUser.verified && (
                  <Badge className="bg-blue-100 text-blue-800">Verified</Badge>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedUser.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedUser.phone}</span>
                    </div>
                    {selectedUser.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedUser.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Activity Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedUser.totalBookings || 0} total bookings</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span>{selectedUser.favoritePhotographers} favorite photographers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>{selectedUser.averageRating} average rating given</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 text-green-600">$</span>
                      <span>${(selectedUser.totalSpent || 0).toLocaleString()} total spent</span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedUser.preferences && (
                <div>
                  <h4 className="font-semibold mb-2">Preferences</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium">Preferred Categories:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedUser.preferences.categories.map((category, index) => (
                          <Badge key={index} variant="outline" className="text-xs">{category}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Price Range:</span> {selectedUser.preferences.priceRange}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Preferred Location:</span> {selectedUser.preferences.location}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-2">Account Information</h4>
                <div className="text-sm space-y-1">
                  <p>Joined: {selectedUser.joinDate}</p>
                  <p>Last Active: {selectedUser.lastActive}</p>
                  <p>User ID: {selectedUser.id}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  className="flex-1"
                  onClick={() => openUserDashboard(selectedUser.id)}
                >
                  <User className="w-4 h-4 mr-2" />
                  View Dashboard
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