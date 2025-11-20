"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import NextImage from "next/image"
import { Search, Users, Eye, Mail, Phone, MapPin, Camera, Calendar, Filter, Edit, Trash2, Ban, CheckCircle, XCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

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

interface Pagination {
  currentPage: number
  totalPages: number
  totalUsers: number
  hasNext: boolean
  hasPrev: boolean
}

export default function AllUsersManager() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({ fullName: '', email: '', phone: '' })
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    hasNext: false,
    hasPrev: false
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchAllUsers()
  }, [pagination.currentPage, searchTerm, filterType, filterStatus])

  const fetchAllUsers = async () => {
    try {
      setLoading(true)
      
      // Fetch regular users with pagination
      const usersResponse = await fetch(`/api/admin/users?page=${pagination.currentPage}&limit=10&search=${searchTerm}&userType=${filterType}&status=${filterStatus}`)
      const usersData = await usersResponse.json()
      
      if (usersData.success) {
        // Normalize user data
        const normalizedUsers = usersData.users.map((user: any) => ({
          _id: user._id,
          name: user.fullName || user.name || 'Unknown',
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          userType: user.role === 'admin' ? 'admin' : user.role === 'photographer' ? 'photographer' : 'client',
          status: user.status || (user.isVerified ? 'active' : 'pending'),
          createdAt: user.createdAt || new Date().toISOString(),
          lastLogin: user.lastLogin,
          image: user.image
        }))
        
        setUsers(normalizedUsers)
        setPagination(usersData.pagination)
      }
      
      // For now, we'll keep the existing logic for photographers
      // In a real implementation, you might want to combine both APIs
      
    } catch (error) {
      // Silently handle error
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({
      ...prev,
      currentPage: newPage
    }))
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId })
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Success",
          description: "User deleted successfully",
        })
        fetchAllUsers() // Refresh the list
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete user",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      })
    }
  }

  const handleBlockUser = async (userId: string) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, action: 'block' })
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Success",
          description: "User blocked successfully",
        })
        fetchAllUsers() // Refresh the list
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to block user",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to block user",
        variant: "destructive",
      })
    }
  }

  const handleUnblockUser = async (userId: string) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, action: 'unblock' })
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Success",
          description: "User unblocked successfully",
        })
        fetchAllUsers() // Refresh the list
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to unblock user",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unblock user",
        variant: "destructive",
      })
    }
  }

  const handleEditUser = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: editingUser?._id, 
          action: 'update',
          userData: editForm
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Success",
          description: "User updated successfully",
        })
        setEditingUser(null)
        fetchAllUsers() // Refresh the list
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update user",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      })
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
                  <p className="text-2xl font-bold text-indigo-600">{pagination.totalUsers}</p>
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
                All Users ({pagination.totalUsers})
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
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">User</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Phone</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Registration Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                                {user.image ? (
                                  <NextImage
                                    src={user.image}
                                    alt={user.name}
                                    width={40}
                                    height={40}
                                    className="object-cover w-full h-full"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Users className="w-5 h-5 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{user.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{user.email}</td>
                          <td className="py-3 px-4 text-gray-600">{user.phone || 'N/A'}</td>
                          <td className="py-3 px-4 text-gray-600">{formatDate(user.createdAt)}</td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className={getUserTypeColor(user.userType)}>
                              {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className={getUserStatusColor(user.status)}>
                              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedUser(user)}
                                className="flex items-center gap-1"
                              >
                                <Eye className="w-4 h-4" />
                                <span className="hidden md:inline">View</span>
                              </Button>
                              
                              <Dialog open={editingUser?._id === user._id} onOpenChange={(open) => !open && setEditingUser(null)}>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setEditingUser(user)
                                      setEditForm({
                                        fullName: user.fullName || user.name || '',
                                        email: user.email || '',
                                        phone: user.phone || ''
                                      })
                                    }}
                                    className="flex items-center gap-1"
                                  >
                                    <Edit className="w-4 h-4" />
                                    <span className="hidden md:inline">Edit</span>
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit User</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor="fullName">Full Name</Label>
                                      <Input
                                        id="fullName"
                                        value={editForm.fullName}
                                        onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="email">Email</Label>
                                      <Input
                                        id="email"
                                        type="email"
                                        value={editForm.email}
                                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="phone">Phone</Label>
                                      <Input
                                        id="phone"
                                        value={editForm.phone}
                                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                                      />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                      <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
                                      <Button onClick={handleEditUser}>Save Changes</Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              
                              {user.status === 'blocked' ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUnblockUser(user._id)}
                                  className="flex items-center gap-1 text-green-600 hover:text-green-700"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  <span className="hidden md:inline">Unblock</span>
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleBlockUser(user._id)}
                                  className="flex items-center gap-1 text-red-600 hover:text-red-700"
                                >
                                  <Ban className="w-4 h-4" />
                                  <span className="hidden md:inline">Block</span>
                                </Button>
                              )}
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteUser(user._id)}
                                className="flex items-center gap-1 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="hidden md:inline">Delete</span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-600">
                    Showing {(pagination.currentPage - 1) * 10 + 1} to {Math.min(pagination.currentPage * 10, pagination.totalUsers)} of {pagination.totalUsers} users
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPrev}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        // Calculate page numbers to show
                        let startPage = Math.max(1, pagination.currentPage - 2)
                        let endPage = Math.min(pagination.totalPages, startPage + 4)
                        
                        if (endPage - startPage < 4) {
                          startPage = Math.max(1, endPage - 4)
                        }
                        
                        const page = startPage + i
                        if (page > endPage) return null
                        
                        return (
                          <Button
                            key={page}
                            variant={page === pagination.currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </Button>
                        )
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasNext}
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}