"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import NextImage from "next/image"
import { Search, Users, Eye, Mail, Phone, MapPin, Camera, Calendar, Filter } from "lucide-react"

interface User {
  _id: string
  name: string
  fullName?: string
  email: string
  phone?: string
  location?: string
  userType: 'client' | 'photographer' | 'admin'
  status: 'active' | 'pending' | 'blocked' | 'approved' | 'rejected'
  isApproved?: boolean
  image?: string
  categories?: string[]
  experience?: number
  startingPrice?: number
  createdAt: string
  registrationDate?: string
  lastLogin?: string
}

export default function AllUsersManager() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    fetchAllUsers()
  }, [])

  const fetchAllUsers = async () => {
    try {
      setLoading(true)
      
      // Fetch regular users
      const usersResponse = await fetch('/api/auth/users')
      const usersData = await usersResponse.json()
      
      // Fetch photographers
      const photographersResponse = await fetch('/api/photographers')
      const photographersData = await photographersResponse.json()
      
      // Combine and normalize data
      const allUsers: User[] = []
      
      // Add regular users
      if (usersData.users) {
        usersData.users.forEach((user: any) => {
          allUsers.push({
            _id: user._id || user.id,
            name: user.fullName || user.name,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            userType: user.role === 'admin' ? 'admin' : 'client',
            status: user.isVerified ? 'active' : 'pending',
            createdAt: user.createdAt || new Date().toISOString(),
            lastLogin: user.lastLogin
          })
        })
      }
      
      // Add photographers
      if (photographersData.photographers) {
        photographersData.photographers.forEach((photographer: any) => {
          allUsers.push({
            _id: photographer._id || photographer.id,
            name: photographer.name,
            email: photographer.email,
            phone: photographer.phone,
            location: photographer.location,
            userType: 'photographer',
            status: photographer.isApproved ? 'approved' : (photographer.status || 'pending'),
            isApproved: photographer.isApproved,
            image: photographer.image,
            categories: photographer.categories,
            experience: photographer.experience,
            startingPrice: photographer.startingPrice,
            createdAt: photographer.createdAt || new Date().toISOString(),
            registrationDate: photographer.registrationDate
          })
        })
      }
      
      // Sort by creation date (newest first)
      allUsers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      
      setUsers(allUsers)
    } catch (error) {
      // Silently handle error
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone && user.phone.includes(searchTerm))
    
    const matchesType = filterType === "all" || user.userType === filterType
    const matchesStatus = filterStatus === "all" || user.status === filterStatus
    
    return matchesSearch && matchesType && matchesStatus
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getUserStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'approved':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'blocked':
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case 'admin':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'photographer':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'client':
        return 'bg-gray-50 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  if (selectedUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setSelectedUser(null)}
              className="flex items-center gap-2"
            >
              ← Back to Users
            </Button>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getUserTypeColor(selectedUser.userType)}>
                {selectedUser.userType.charAt(0).toUpperCase() + selectedUser.userType.slice(1)}
              </Badge>
              <Badge variant="outline" className={getUserStatusColor(selectedUser.status)}>
                {selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1)}
              </Badge>
            </div>
          </div>

          {/* User Profile */}
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-white">
              <CardTitle className="text-2xl">User Profile Details</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-8">
                {/* Profile Image */}
                <div className="space-y-4">
                  <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    {selectedUser.image ? (
                      <NextImage
                        src={selectedUser.image}
                        alt={selectedUser.name}
                        width={300}
                        height={300}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Users className="w-20 h-20 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile Details */}
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedUser.name}</h2>
                    <p className="text-gray-600">
                      {selectedUser.userType.charAt(0).toUpperCase() + selectedUser.userType.slice(1)} • 
                      Joined {formatDate(selectedUser.registrationDate || selectedUser.createdAt)}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium">{selectedUser.email}</p>
                        </div>
                      </div>
                      
                      {selectedUser.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="font-medium">{selectedUser.phone}</p>
                          </div>
                        </div>
                      )}
                      
                      {selectedUser.location && (
                        <div className="flex items-center gap-3">
                          <MapPin className="w-5 h-5 text-red-600" />
                          <div>
                            <p className="text-sm text-gray-500">Location</p>
                            <p className="font-medium">{selectedUser.location}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="text-sm text-gray-500">Registration Date</p>
                          <p className="font-medium">{formatDate(selectedUser.registrationDate || selectedUser.createdAt)}</p>
                        </div>
                      </div>
                      
                      {selectedUser.userType === 'photographer' && selectedUser.experience !== undefined && (
                        <div className="flex items-center gap-3">
                          <Camera className="w-5 h-5 text-orange-600" />
                          <div>
                            <p className="text-sm text-gray-500">Experience</p>
                            <p className="font-medium">{selectedUser.experience} years</p>
                          </div>
                        </div>
                      )}
                      
                      {selectedUser.startingPrice && (
                        <div className="flex items-center gap-3">
                          <span className="w-5 h-5 text-yellow-600 font-bold">$</span>
                          <div>
                            <p className="text-sm text-gray-500">Starting Price</p>
                            <p className="font-medium">${selectedUser.startingPrice}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Categories for photographers */}
                  {selectedUser.userType === 'photographer' && selectedUser.categories && selectedUser.categories.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Photography Specialties</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.categories.map((category, index) => (
                          <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {category}
                          </Badge>
                        ))}
                      </div>
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
            <Users className="w-6 h-6 text-indigo-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
              All Users Management
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            View and manage all registered users including clients, photographers, and admins
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-indigo-600">{users.length}</p>
                </div>
                <Users className="w-8 h-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Photographers</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {users.filter(u => u.userType === 'photographer').length}
                  </p>
                </div>
                <Camera className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Clients</p>
                  <p className="text-2xl font-bold text-green-600">
                    {users.filter(u => u.userType === 'client').length}
                  </p>
                </div>
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {users.filter(u => u.status === 'pending').length}
                  </p>
                </div>
                <Filter className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search users by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Types</option>
                <option value="client">Clients</option>
                <option value="photographer">Photographers</option>
                <option value="admin">Admins</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="blocked">Blocked</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-white">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                All Users ({filteredUsers.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No users found</p>
                <p className="text-gray-400">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <Card key={user._id} className="border border-gray-200 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                            {user.image ? (
                              <NextImage
                                src={user.image}
                                alt={user.name}
                                width={48}
                                height={48}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Users className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                            <p className="text-gray-600">{user.email}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              {user.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {user.phone}
                                </span>
                              )}
                              {user.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {user.location}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(user.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className={getUserTypeColor(user.userType)}>
                            {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}
                          </Badge>
                          <Badge variant="outline" className={getUserStatusColor(user.status)}>
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedUser(user)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            View Profile
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