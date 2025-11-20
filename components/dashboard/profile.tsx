"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/AuthContext"
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Edit, 
  Save, 
  Camera, 
  Plus,
  ShoppingCart,
  Calendar as CalendarIcon,
  Wallet,
  Crown,
  Key,
  Shield
} from "lucide-react"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"

export function ProfileSection() {
  const { user, login } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    address: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      pincode: "",
      country: ""
    },
    preferences: {
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: true
    }
  })
  
  const [loading, setLoading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [pendingAvatar, setPendingAvatar] = useState<File | null>(null)

  const [stats] = useState({
    totalOrders: 12,
    activeEvents: 3,
    walletBalance: "₹2,450",
    membershipStatus: "Premium"
  })

  useEffect(() => {
    if (user) {
      fetchProfileData(user.id)
    }
  }, [user])

  const fetchProfileData = async (userId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/profile?userId=${userId}`)
      const data = await response.json()
      
      if (data.success && data.user) {
        setProfileData({
          name: data.user.fullName || "",
          email: data.user.email || "",
          phone: data.user.phone || "",
          gender: data.user.gender || "",
          address: {
            line1: data.user.address?.line1 || "",
            line2: data.user.address?.line2 || "",
            city: data.user.address?.city || "",
            state: data.user.address?.state || "",
            pincode: data.user.address?.pincode || "",
            country: data.user.address?.country || ""
          },
          preferences: {
            emailNotifications: data.user.preferences?.emailNotifications ?? true,
            smsNotifications: data.user.preferences?.smsNotifications ?? true,
            pushNotifications: data.user.preferences?.pushNotifications ?? false
          }
        })
        
        // Set avatar URL if it exists in the user data
        if (data.user.avatarUrl) {
          setAvatarUrl(data.user.avatarUrl)
        }
      } else {
        // Fallback to default data if no profile data exists
        setProfileData({
          name: user?.fullName || "",
          email: user?.email || "",
          phone: user?.phone || "",
          gender: "",
          address: {
            line1: "",
            line2: "",
            city: "",
            state: "",
            pincode: "",
            country: ""
          },
          preferences: {
            emailNotifications: true,
            smsNotifications: true,
            pushNotifications: true
          }
        })
      }
    } catch (error) {
      console.error('Error fetching profile data:', error)
      // Fallback to default data
      setProfileData({
        name: user?.fullName || "",
        email: user?.email || "",
        phone: user?.phone || "",
        gender: "",
        address: {
          line1: "",
          line2: "",
          city: "",
          state: "",
          pincode: "",
          country: ""
        },
        preferences: {
          emailNotifications: true,
          smsNotifications: true,
          pushNotifications: true
        }
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as object),
          [child]: value
        }
      }))
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handlePreferenceChange = (field: string, value: string | boolean) => {
    setProfileData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value
      }
    }))
  }

  const toggleNotification = (type: string) => {
    setProfileData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [`${type}Notifications`]: !prev.preferences[`${type}Notifications` as keyof typeof prev.preferences]
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    
    try {
      setLoading(true)
      
      // Upload avatar if there's a pending one
      let avatarUrlToUpdate = avatarUrl
      if (pendingAvatar) {
        // In a real app, you would upload the file to storage and get a URL
        // For now, we'll simulate this by creating a data URL
        const reader = new FileReader()
        reader.onloadend = async () => {
          const dataUrl = reader.result as string
          
          // Update profile data with the new avatar
          const response = await fetch('/api/profile', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user.id,
              profileData: {
                ...profileData,
                avatarUrl: dataUrl // Store the data URL in the database
              }
            }),
          })
          
          const data = await response.json()
          
          if (data.success) {
            // Update the auth context with new data
            login({
              ...user,
              fullName: profileData.name,
              email: profileData.email,
              phone: profileData.phone
            })
            
            // Update local avatar URL
            setAvatarUrl(dataUrl)
            setAvatarPreview(null) // Clear preview since we're using the saved URL
            setPendingAvatar(null) // Clear pending avatar
            
            setIsEditing(false)
          } else {
            console.error('Failed to update profile:', data.error)
          }
          setLoading(false)
        }
        reader.readAsDataURL(pendingAvatar)
        return // Exit here since we're handling the rest in the onloadend callback
      }
      
      // If no pending avatar, just update the profile data
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          profileData
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Update the auth context with new data
        login({
          ...user,
          fullName: profileData.name,
          email: profileData.email,
          phone: profileData.phone
        })
        
        setIsEditing(false)
      } else {
        console.error('Failed to update profile:', data.error)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    
    try {
      setLoading(true)
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          profileData
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setIsEditing(false)
      } else {
        console.error('Failed to update address:', data.error)
      }
    } catch (error) {
      console.error('Error updating address:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Store the file for later upload
      setPendingAvatar(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">Personal Information</CardTitle>
            <div>
              {isEditing ? (
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)} disabled={loading}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" form="profile-form" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <Button type="button" size="sm" onClick={() => setIsEditing(true)} disabled={loading}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Profile Photo */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    {avatarPreview ? (
                      <AvatarImage src={avatarPreview} alt={profileData.name} />
                    ) : avatarUrl ? (
                      <AvatarImage src={avatarUrl} alt={profileData.name} />
                    ) : (
                      <AvatarImage src="/placeholder.svg?height=100&width=100" alt={profileData.name} />
                    )}
                    <AvatarFallback className="bg-yellow-100 text-black text-2xl">
                      {profileData.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button 
                      type="button"
                      variant="outline" 
                      size="icon"
                      className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0 border-2 border-white shadow-sm"
                      disabled={loading}
                      onClick={() => document.getElementById('avatar-upload')?.click()}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                    disabled={loading || !isEditing}
                  />
                </div>
                {isEditing && (
                  <p className="text-xs text-gray-500 mt-2 text-center">Click to change photo</p>
                )}
              </div>

              {/* Profile Details */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      name="name"
                      value={profileData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      disabled={loading}
                    />
                  ) : (
                    <div className="flex items-center gap-2 min-h-10">
                      <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium">{profileData.name || "Not provided"}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profileData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      disabled={loading}
                    />
                  ) : (
                    <div className="flex items-center gap-2 min-h-10">
                      <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium">{profileData.email || "Not provided"}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                      disabled={loading}
                    />
                  ) : (
                    <div className="flex items-center gap-2 min-h-10">
                      <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium">{profileData.phone || "Not provided"}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  {isEditing ? (
                    <Input
                      id="gender"
                      name="gender"
                      value={profileData.gender}
                      onChange={handleInputChange}
                      placeholder="Enter your gender"
                      disabled={loading}
                    />
                  ) : (
                    <div className="flex items-center gap-2 min-h-10">
                      <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium">{profileData.gender || "Not provided"}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Address Section */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-semibold">Address Information</CardTitle>
            {!isEditing && (
              !profileData.address.line1 && !profileData.address.line2 && 
              !profileData.address.city && !profileData.address.state && 
              !profileData.address.pincode && !profileData.address.country ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsEditing(true)}
                  disabled={loading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Address
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsEditing(true)}
                  disabled={loading}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Address
                </Button>
              )
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!profileData.address.line1 && !profileData.address.line2 && 
           !profileData.address.city && !profileData.address.state && 
           !profileData.address.pincode && !profileData.address.country && 
           !isEditing ? (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No address information added yet</p>
              <p className="text-sm text-gray-400 mt-1">Add your address to receive orders and notifications</p>
            </div>
          ) : (
            <form onSubmit={handleAddressSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address.line1">Address Line 1</Label>
                  {isEditing ? (
                    <Input
                      id="address.line1"
                      name="address.line1"
                      value={profileData.address.line1}
                      onChange={handleInputChange}
                      placeholder="Enter address line 1"
                      disabled={loading}
                    />
                  ) : (
                    <div className="flex items-center gap-2 min-h-10">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span>{profileData.address.line1 || "Not provided"}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address.line2">Address Line 2</Label>
                  {isEditing ? (
                    <Input
                      id="address.line2"
                      name="address.line2"
                      value={profileData.address.line2}
                      onChange={handleInputChange}
                      placeholder="Enter address line 2"
                      disabled={loading}
                    />
                  ) : (
                    <div className="flex items-center gap-2 min-h-10">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span>{profileData.address.line2 || "Not provided"}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address.city">City</Label>
                  {isEditing ? (
                    <Input
                      id="address.city"
                      name="address.city"
                      value={profileData.address.city}
                      onChange={handleInputChange}
                      placeholder="Enter city"
                      disabled={loading}
                    />
                  ) : (
                    <div className="flex items-center gap-2 min-h-10">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span>{profileData.address.city || "Not provided"}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address.state">State</Label>
                  {isEditing ? (
                    <Input
                      id="address.state"
                      name="address.state"
                      value={profileData.address.state}
                      onChange={handleInputChange}
                      placeholder="Enter state"
                      disabled={loading}
                    />
                  ) : (
                    <div className="flex items-center gap-2 min-h-10">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span>{profileData.address.state || "Not provided"}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address.pincode">Pincode</Label>
                  {isEditing ? (
                    <Input
                      id="address.pincode"
                      name="address.pincode"
                      value={profileData.address.pincode}
                      onChange={handleInputChange}
                      placeholder="Enter pincode"
                      disabled={loading}
                    />
                  ) : (
                    <div className="flex items-center gap-2 min-h-10">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span>{profileData.address.pincode || "Not provided"}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address.country">Country</Label>
                  {isEditing ? (
                    <Input
                      id="address.country"
                      name="address.country"
                      value={profileData.address.country}
                      onChange={handleInputChange}
                      placeholder="Enter country"
                      disabled={loading}
                    />
                  ) : (
                    <div className="flex items-center gap-2 min-h-10">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span>{profileData.address.country || "Not provided"}</span>
                    </div>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end gap-2 pt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Address
                      </>
                    )}
                  </Button>
                </div>
              )}
            </form>
          )}
        </CardContent>
      </Card>

      {/* Activity Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">All time orders</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeEvents}</div>
            <p className="text-xs text-muted-foreground">Upcoming events</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.walletBalance}</div>
            <p className="text-xs text-muted-foreground">Available balance</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membership</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.membershipStatus}</div>
            <p className="text-xs text-muted-foreground">Current plan</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
