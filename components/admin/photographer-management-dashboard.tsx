"use client"

import { useState, useEffect } from "react"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  Plus,
  Filter,
  Calendar,
  MapPin,
  Camera,
  Star,
  Users,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Mail,
  Phone,
  Upload,
  FileText,
  Video,
  CalendarDays,
  BookOpen,
  TrendingUp,
  AlertTriangle,
  Shield,
  Settings,
  Ban,
  Check,
  X
} from "lucide-react"

interface PhotographerData {
  id: string
  name: string
  studioName: string
  email: string
  phone: string
  location: string
  bio: string
  experience: number
  specialization: string[]
  status: 'active' | 'inactive' | 'blocked'
  verified: boolean
  profileCompletion: number
  loginAccess: boolean
  avatar?: string
  coverPhoto?: string
  kyc?: {
    aadhaar: string
    pan: string
    status: 'pending' | 'approved' | 'rejected'
  }
  services: {
    name: string
    enabled: boolean
  }[]
  packages: {
    id: string
    name: string
    price: number
    description: string
  }[]
  availability: {
    date: string
    status: 'available' | 'blocked'
  }[]
  bookings: {
    total: number
    accepted: number
    pending: number
    completed: number
    cancelled: number
  }
  ratings: {
    average: number
    total: number
    reviews: {
      id: string
      user: string
      rating: number
      comment: string
      date: string
      hidden: boolean
    }[]
  }
  earnings: {
    total: number
    commission: number
    pendingPayout: number
    paymentHistory: {
      id: string
      amount: number
      date: string
      status: 'pending' | 'paid' | 'rejected'
    }[]
  }
  performance: {
    monthlyBookings: {
      month: string
      bookings: number
    }[]
    conversionRate: number
    topCategories: string[]
    cityPerformance: {
      city: string
      bookings: number
    }[]
  }
  compliance: {
    gstCertificate?: string
    equipment: string[]
    verificationStatus: 'pending' | 'approved' | 'rejected'
  }
  support: {
    complaints: number
    disputes: number
    warnings: number
  }
  featured: boolean
  homepageSpotlight: boolean
}

export default function PhotographerManagementDashboard({ 
  photographerId, 
  onClose 
}: { 
  photographerId: string
  onClose: () => void
}) {
  const [photographer, setPhotographer] = useState<PhotographerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("account")

  // Mock data for demonstration
  useEffect(() => {
    // In a real implementation, this would fetch data from an API
    const mockData: PhotographerData = {
      id: photographerId,
      name: "Rajesh Kumar",
      studioName: "RK Photography",
      email: "rajesh@example.com",
      phone: "+91 9876543210",
      location: "Mumbai, Maharashtra",
      bio: "Professional wedding photographer with 8 years of experience. Specializing in capturing beautiful moments that last a lifetime.",
      experience: 8,
      specialization: ["Wedding", "Portrait", "Event"],
      status: "active",
      verified: true,
      profileCompletion: 85,
      loginAccess: true,
      avatar: "/placeholder-user.jpg",
      coverPhoto: "/placeholder-cover.jpg",
      kyc: {
        aadhaar: "XXXX-XXXX-1234",
        pan: "ABCDE1234F",
        status: "approved"
      },
      services: [
        { name: "Wedding Photography", enabled: true },
        { name: "Pre-Wedding Shoot", enabled: true },
        { name: "Birthday Party", enabled: true },
        { name: "Corporate Event", enabled: false },
        { name: "Maternity Shoot", enabled: true }
      ],
      packages: [
        { id: "1", name: "Basic Wedding Package", price: 45000, description: "8 hours of coverage with 2 photographers" },
        { id: "2", name: "Premium Wedding Package", price: 75000, description: "Full day coverage with 3 photographers and drone shots" },
        { id: "3", name: "Portrait Session", price: 15000, description: "2 hours outdoor portrait session" }
      ],
      availability: [
        { date: "2023-09-15", status: "available" },
        { date: "2023-09-16", status: "blocked" },
        { date: "2023-09-17", status: "available" }
      ],
      bookings: {
        total: 125,
        accepted: 110,
        pending: 5,
        completed: 100,
        cancelled: 10
      },
      ratings: {
        average: 4.8,
        total: 120,
        reviews: [
          { id: "1", user: "Arjun Kapoor", rating: 5, comment: "Amazing work! Captured every moment beautifully.", date: "2023-08-20", hidden: false },
          { id: "2", user: "Meera Shah", rating: 5, comment: "Professional and talented photographer.", date: "2023-08-15", hidden: false },
          { id: "3", user: "Karan Verma", rating: 4, comment: "Good service but a bit delayed in delivery.", date: "2023-08-10", hidden: true }
        ]
      },
      earnings: {
        total: 1250000,
        commission: 125000,
        pendingPayout: 75000,
        paymentHistory: [
          { id: "1", amount: 50000, date: "2023-08-15", status: "paid" },
          { id: "2", amount: 75000, date: "2023-07-20", status: "paid" },
          { id: "3", amount: 45000, date: "2023-09-05", status: "pending" }
        ]
      },
      performance: {
        monthlyBookings: [
          { month: "Jan", bookings: 8 },
          { month: "Feb", bookings: 10 },
          { month: "Mar", bookings: 12 },
          { month: "Apr", bookings: 9 },
          { month: "May", bookings: 15 },
          { month: "Jun", bookings: 18 }
        ],
        conversionRate: 75,
        topCategories: ["Wedding", "Pre-Wedding", "Portrait"],
        cityPerformance: [
          { city: "Mumbai", bookings: 65 },
          { city: "Pune", bookings: 30 },
          { city: "Delhi", bookings: 20 },
          { city: "Bangalore", bookings: 10 }
        ]
      },
      compliance: {
        gstCertificate: "GSTIN1234567890",
        equipment: ["Canon EOS R5", "Sony A7R IV", "DJI Mavic 3"],
        verificationStatus: "approved"
      },
      support: {
        complaints: 2,
        disputes: 1,
        warnings: 0
      },
      featured: true,
      homepageSpotlight: true
    }

    setTimeout(() => {
      setPhotographer(mockData)
      setLoading(false)
    }, 1000)
  }, [photographerId])

  const handleStatusChange = (newStatus: 'active' | 'inactive' | 'blocked') => {
    if (photographer) {
      setPhotographer({ ...photographer, status: newStatus })
      // In a real implementation, this would call an API to update the status
    }
  }

  const handleLoginAccessChange = (enabled: boolean) => {
    if (photographer) {
      setPhotographer({ ...photographer, loginAccess: enabled })
      // In a real implementation, this would call an API to update the login access
    }
  }

  const handleFeatureChange = (featured: boolean) => {
    if (photographer) {
      setPhotographer({ ...photographer, featured })
      // In a real implementation, this would call an API to update the featured status
    }
  }

  const handleHomepageSpotlightChange = (spotlight: boolean) => {
    if (photographer) {
      setPhotographer({ ...photographer, homepageSpotlight: spotlight })
      // In a real implementation, this would call an API to update the spotlight status
    }
  }

  const handleHideReview = (reviewId: string) => {
    if (photographer) {
      const updatedReviews = photographer.ratings.reviews.map(review => 
        review.id === reviewId ? { ...review, hidden: true } : review
      )
      setPhotographer({
        ...photographer,
        ratings: {
          ...photographer.ratings,
          reviews: updatedReviews
        }
      })
      // In a real implementation, this would call an API to hide the review
    }
  }

  const handleApprovePayout = (payoutId: string) => {
    if (photographer) {
      const updatedPayments = photographer.earnings.paymentHistory.map(payment => {
        if (payment.id === payoutId) {
          return { 
            ...payment, 
            status: 'paid' as 'paid'
          }
        }
        return payment
      })
      setPhotographer({
        ...photographer,
        earnings: {
          ...photographer.earnings,
          paymentHistory: updatedPayments
        }
      })
      // In a real implementation, this would call an API to approve the payout
    }
  }

  const handleRejectPayout = (payoutId: string) => {
    if (photographer) {
      const updatedPayments = photographer.earnings.paymentHistory.map(payment => {
        if (payment.id === payoutId) {
          return { 
            ...payment, 
            status: 'rejected' as 'rejected'
          }
        }
        return payment
      })
      setPhotographer({
        ...photographer,
        earnings: {
          ...photographer.earnings,
          paymentHistory: updatedPayments
        }
      })
      // In a real implementation, this would call an API to reject the payout
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading photographer details...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!photographer) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
          <div className="text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Photographer Not Found</h3>
            <p className="text-gray-600 mb-4">Could not load details for this photographer.</p>
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex z-50">
      <div className="ml-auto w-full max-w-6xl h-full overflow-y-auto bg-white">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Manage Photographer</h2>
              <p className="text-muted-foreground">{photographer.name} ({photographer.studioName})</p>
            </div>
            <Button variant="ghost" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Photographer Header */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={photographer.avatar} />
                    <AvatarFallback className="text-2xl">
                      {photographer.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-xl font-bold">{photographer.name}</h3>
                      <p className="text-muted-foreground">{photographer.studioName}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-medium">{photographer.ratings.average}</span>
                          <span className="text-muted-foreground">({photographer.ratings.total} reviews)</span>
                        </div>
                        <Badge 
                          className={
                            photographer.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : photographer.status === 'inactive' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-red-100 text-red-800'
                          }
                        >
                          {photographer.status.charAt(0).toUpperCase() + photographer.status.slice(1)}
                        </Badge>
                        {photographer.verified && (
                          <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Profile Completion:</span>
                        <Badge variant="outline">{photographer.profileCompletion}%</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="border rounded-lg p-3">
                      <div className="text-2xl font-bold">{photographer.bookings.total}</div>
                      <div className="text-sm text-muted-foreground">Total Bookings</div>
                    </div>
                    <div className="border rounded-lg p-3">
                      <div className="text-2xl font-bold">₹{(photographer.earnings.total / 1000).toFixed(0)}K</div>
                      <div className="text-sm text-muted-foreground">Total Earnings</div>
                    </div>
                    <div className="border rounded-lg p-3">
                      <div className="text-2xl font-bold">{photographer.experience}</div>
                      <div className="text-sm text-muted-foreground">Years Experience</div>
                    </div>
                    <div className="border rounded-lg p-3">
                      <div className="text-2xl font-bold">{photographer.specialization.length}</div>
                      <div className="text-sm text-muted-foreground">Specializations</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-11">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="availability">Availability</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="earnings">Earnings</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="verification">Verification</TabsTrigger>
              <TabsTrigger value="support">Support</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>

            {/* Account Management Tab */}
            <TabsContent value="account" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Photographer Account Management</CardTitle>
                  <CardDescription>Manage photographer's account details and access</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" value={photographer.name} readOnly />
                    </div>
                    <div>
                      <Label htmlFor="studioName">Studio Name</Label>
                      <Input id="studioName" value={photographer.studioName} readOnly />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={photographer.email} readOnly />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" value={photographer.phone} readOnly />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input id="location" value={photographer.location} readOnly />
                    </div>
                    <div>
                      <Label htmlFor="experience">Experience (years)</Label>
                      <Input id="experience" type="number" value={photographer.experience} readOnly />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="bio">Biography</Label>
                    <Textarea id="bio" value={photographer.bio} readOnly rows={4} />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label>KYC Verification</Label>
                      <div className="space-y-2 mt-2">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <span>Aadhaar Card</span>
                          <Badge 
                            className={
                              photographer.kyc?.status === 'approved' 
                                ? 'bg-green-100 text-green-800' 
                                : photographer.kyc?.status === 'pending' 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : 'bg-red-100 text-red-800'
                            }
                          >
                            {photographer.kyc?.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <span>PAN Card</span>
                          <Badge 
                            className={
                              photographer.kyc?.status === 'approved' 
                                ? 'bg-green-100 text-green-800' 
                                : photographer.kyc?.status === 'pending' 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : 'bg-red-100 text-red-800'
                            }
                          >
                            {photographer.kyc?.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label>Account Status</Label>
                      <div className="space-y-4 mt-2">
                        <div className="flex items-center justify-between">
                          <span>Status</span>
                          <Select 
                            value={photographer.status} 
                            onValueChange={(value: 'active' | 'inactive' | 'blocked') => handleStatusChange(value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                              <SelectItem value="blocked">Blocked</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span>Login Access</span>
                          <Switch 
                            checked={photographer.loginAccess} 
                            onCheckedChange={handleLoginAccessChange} 
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span>Profile Completion</span>
                          <Badge variant="outline">{photographer.profileCompletion}%</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Portfolio Management Tab */}
            <TabsContent value="portfolio" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Management</CardTitle>
                  <CardDescription>Manage photographer's portfolio and media</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Portfolio Photos</h3>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Photos
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[1, 2, 3, 4, 5, 6].map((item) => (
                        <div key={item} className="border rounded-lg overflow-hidden">
                          <div className="h-32 bg-gray-200 relative">
                            <img 
                              src="/placeholder-image.jpg" 
                              alt={`Portfolio ${item}`} 
                              className="w-full h-full object-cover"
                            />
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              className="absolute top-2 right-2 h-6 w-6 p-0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Albums</h3>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Album
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {['Wedding Collection', 'Portrait Series', 'Corporate Events'].map((album, index) => (
                        <div key={index} className="border rounded-lg p-4 flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{album}</h4>
                            <p className="text-sm text-muted-foreground">12 photos</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Video Samples</h3>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Video
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[1, 2].map((item) => (
                        <div key={item} className="border rounded-lg overflow-hidden">
                          <div className="h-32 bg-gray-200 relative flex items-center justify-center">
                            <Video className="w-8 h-8 text-gray-400" />
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              className="absolute top-2 right-2 h-6 w-6 p-0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="p-2">
                            <p className="text-sm font-medium">Sample Video {item}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Cover Photo</h3>
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img 
                            src={photographer.coverPhoto} 
                            alt="Cover" 
                            className="w-32 h-20 object-cover rounded"
                          />
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            className="absolute top-1 right-1 h-6 w-6 p-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        <div>
                          <Button size="sm">
                            <Upload className="w-4 h-4 mr-2" />
                            Change Cover
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Featured Profile</h3>
                      <p className="text-sm text-muted-foreground">Display this photographer in featured sections</p>
                    </div>
                    <Switch 
                      checked={photographer.featured} 
                      onCheckedChange={handleFeatureChange} 
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Services Management Tab */}
            <TabsContent value="services" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Service Management</CardTitle>
                  <CardDescription>Manage services, packages, and pricing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Services Offered</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {photographer.services.map((service, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <span>{service.name}</span>
                          <Switch checked={service.enabled} />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Packages & Pricing</h3>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Package
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {photographer.packages.map((pkg) => (
                        <div key={pkg.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{pkg.name}</h4>
                              <p className="text-sm text-muted-foreground">{pkg.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">₹{pkg.price.toLocaleString()}</span>
                              <Button size="sm" variant="outline">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">City Availability</h3>
                    <div className="flex flex-wrap gap-2">
                      {['Mumbai', 'Pune', 'Delhi', 'Bangalore'].map((city, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          {city}
                          <X className="w-3 h-3 cursor-pointer" />
                        </Badge>
                      ))}
                      <Button size="sm" variant="outline">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="travelCharges">Travel Charges</Label>
                      <Input id="travelCharges" type="number" placeholder="Enter travel charges" />
                    </div>
                    <div>
                      <Label htmlFor="extraFees">Extra Fees</Label>
                      <Input id="extraFees" type="number" placeholder="Enter extra fees" />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="discounts">Discounts / Offers</Label>
                    <Textarea id="discounts" placeholder="Enter current discounts or offers" rows={3} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Availability & Calendar Tab */}
            <TabsContent value="availability" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Availability & Calendar</CardTitle>
                  <CardDescription>Manage photographer's availability and schedule</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Availability Schedule</h3>
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">September 2023</h4>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Previous</Button>
                          <Button variant="outline" size="sm">Next</Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                          <div key={day} className="text-center text-sm font-medium p-2">{day}</div>
                        ))}
                        {Array.from({ length: 30 }, (_, i) => i + 1).map((date) => (
                          <div 
                            key={date} 
                            className={`text-center p-2 rounded cursor-pointer ${
                              date === 15 ? 'bg-green-100 text-green-800' : 
                              date === 16 ? 'bg-red-100 text-red-800' : 
                              'hover:bg-gray-100'
                            }`}
                          >
                            {date}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Block Dates</h3>
                    <div className="space-y-3">
                      {photographer.availability.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <span className="font-medium">{item.date}</span>
                            <Badge 
                              className={
                                item.status === 'available' 
                                  ? 'bg-green-100 text-green-800 ml-2' 
                                  : 'bg-red-100 text-red-800 ml-2'
                              }
                            >
                              {item.status}
                            </Badge>
                          </div>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                      ))}
                      <Button className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Blocked Date
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Leave Requests</h3>
                    <div className="text-center py-8 border rounded-lg">
                      <CalendarDays className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-muted-foreground">No pending leave requests</p>
                      <Button className="mt-4">
                        <Plus className="w-4 h-4 mr-2" />
                        Request Leave
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Booking Management Tab */}
            <TabsContent value="bookings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Management</CardTitle>
                  <CardDescription>Manage photographer's bookings and assignments</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="border rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-blue-600">{photographer.bookings.total}</div>
                      <div className="text-sm text-muted-foreground">Total</div>
                    </div>
                    <div className="border rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-green-600">{photographer.bookings.accepted}</div>
                      <div className="text-sm text-muted-foreground">Accepted</div>
                    </div>
                    <div className="border rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-yellow-600">{photographer.bookings.pending}</div>
                      <div className="text-sm text-muted-foreground">Pending</div>
                    </div>
                    <div className="border rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-purple-600">{photographer.bookings.completed}</div>
                      <div className="text-sm text-muted-foreground">Completed</div>
                    </div>
                    <div className="border rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-red-600">{photographer.bookings.cancelled}</div>
                      <div className="text-sm text-muted-foreground">Cancelled</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Booking Calendar</h3>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Month</Button>
                        <Button variant="outline" size="sm">Week</Button>
                        <Button variant="outline" size="sm">Day</Button>
                      </div>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                          <div key={day} className="text-center text-sm font-medium p-2">{day}</div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: 30 }, (_, i) => i + 1).map((date) => (
                          <div 
                            key={date} 
                            className={`text-center p-2 rounded cursor-pointer relative ${
                              [5, 12, 19, 26].includes(date) ? 'bg-blue-100' : 'hover:bg-gray-100'
                            }`}
                          >
                            {date}
                            {[5, 12, 19, 26].includes(date) && (
                              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Reassign Photographer</h3>
                      <Button variant="outline">
                        <User className="w-4 h-4 mr-2" />
                        Reassign
                      </Button>
                    </div>
                    <div className="border rounded-lg p-4">
                      <p className="text-muted-foreground">Select another photographer to reassign bookings to this photographer's clients.</p>
                      <div className="mt-4 flex gap-2">
                        <Input placeholder="Search photographer..." />
                        <Button>Search</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Ratings & Reviews Tab */}
            <TabsContent value="reviews" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ratings & Reviews</CardTitle>
                  <CardDescription>Manage photographer's ratings and reviews</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-yellow-600">{photographer.ratings.average}</div>
                      <div className="flex justify-center mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`w-5 h-5 ${
                              star <= photographer.ratings.average 
                                ? 'text-yellow-500 fill-yellow-500' 
                                : 'text-gray-300'
                            }`} 
                          />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">Average Rating</p>
                    </div>
                    <div className="border rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-blue-600">{photographer.ratings.total}</div>
                      <p className="text-sm text-muted-foreground mt-2">Total Reviews</p>
                    </div>
                    <div className="border rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-green-600">4.8</div>
                      <p className="text-sm text-muted-foreground mt-2">Response Rate</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Reviews</h3>
                    <div className="space-y-4">
                      {photographer.ratings.reviews.map((review) => (
                        <div key={review.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{review.user}</h4>
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star 
                                      key={star} 
                                      className={`w-4 h-4 ${
                                        star <= review.rating 
                                          ? 'text-yellow-500 fill-yellow-500' 
                                          : 'text-gray-300'
                                      }`} 
                                    />
                                  ))}
                                </div>
                                {review.hidden && (
                                  <Badge variant="outline">Hidden</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{review.date}</p>
                              <p className="mt-2">{review.comment}</p>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleHideReview(review.id)}>
                                  {review.hidden ? 'Unhide Review' : 'Hide Review'}
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <AlertTriangle className="w-4 h-4 mr-2" />
                                  Report Abuse
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Review
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Complaints or Disputes</h3>
                    <div className="border rounded-lg p-4">
                      <p className="text-muted-foreground">No active complaints or disputes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Earnings & Payouts Tab */}
            <TabsContent value="earnings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Earnings & Payouts</CardTitle>
                  <CardDescription>Manage photographer's financials and payouts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600">₹{(photographer.earnings.total / 1000).toFixed(0)}K</div>
                      <p className="text-sm text-muted-foreground mt-1">Total Earnings</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600">₹{(photographer.earnings.commission / 1000).toFixed(0)}K</div>
                      <p className="text-sm text-muted-foreground mt-1">Commission</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="text-2xl font-bold text-yellow-600">₹{(photographer.earnings.pendingPayout / 1000).toFixed(0)}K</div>
                      <p className="text-sm text-muted-foreground mt-1">Pending Payout</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Payout Requests</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {photographer.earnings.paymentHistory.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell>{payment.date}</TableCell>
                            <TableCell>₹{payment.amount.toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge 
                                className={
                                  payment.status === 'paid' 
                                    ? 'bg-green-100 text-green-800' 
                                    : payment.status === 'pending' 
                                      ? 'bg-yellow-100 text-yellow-800' 
                                      : 'bg-red-100 text-red-800'
                                }
                              >
                                {payment.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {payment.status === 'pending' && (
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="h-8"
                                    onClick={() => handleApprovePayout(payment.id)}
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="h-8"
                                    onClick={() => handleRejectPayout(payment.id)}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Payment History</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {photographer.earnings.paymentHistory.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell>{payment.date}</TableCell>
                            <TableCell>₹{payment.amount.toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge 
                                className={
                                  payment.status === 'paid' 
                                    ? 'bg-green-100 text-green-800' 
                                    : payment.status === 'pending' 
                                      ? 'bg-yellow-100 text-yellow-800' 
                                      : 'bg-red-100 text-red-800'
                                }
                              >
                                {payment.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Performance Insights Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Insights</CardTitle>
                  <CardDescription>View photographer's performance analytics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Monthly Booking Performance</h3>
                      <div className="border rounded-lg p-4 h-64 flex items-center justify-center">
                        <div className="text-center">
                          <TrendingUp className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                          <p className="text-muted-foreground">Chart visualization would appear here</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Conversion Rate</h3>
                      <div className="border rounded-lg p-4 h-64 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-blue-600">{photographer.performance.conversionRate}%</div>
                          <p className="text-muted-foreground mt-2">Booking Conversion Rate</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Top Categories</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {photographer.performance.topCategories.map((category, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{category}</span>
                            <Badge variant="outline">#{index + 1}</Badge>
                          </div>
                          <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full" 
                              style={{ width: `${100 - index * 20}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">City-wise Performance</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>City</TableHead>
                          <TableHead>Bookings</TableHead>
                          <TableHead>Performance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {photographer.performance.cityPerformance.map((city, index) => (
                          <TableRow key={index}>
                            <TableCell>{city.city}</TableCell>
                            <TableCell>{city.bookings}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-green-500 rounded-full" 
                                    style={{ width: `${(city.bookings / 100) * 100}%` }}
                                  ></div>
                                </div>
                                <span>{Math.round((city.bookings / 100) * 100)}%</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Growth/Decline Trends</h3>
                    <div className="border rounded-lg p-4">
                      <p className="text-muted-foreground">Performance trend analysis would appear here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Verification & Compliance Tab */}
            <TabsContent value="verification" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Verification & Compliance</CardTitle>
                  <CardDescription>Manage photographer's verification and compliance status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Identity Documents</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">Aadhaar Card</h4>
                          <Badge 
                            className={
                              photographer.kyc?.status === 'approved' 
                                ? 'bg-green-100 text-green-800' 
                                : photographer.kyc?.status === 'pending' 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : 'bg-red-100 text-red-800'
                            }
                          >
                            {photographer.kyc?.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{photographer.kyc?.aadhaar}</p>
                        <Button size="sm" variant="outline">
                          <FileText className="w-4 h-4 mr-2" />
                          View Document
                        </Button>
                      </div>
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">PAN Card</h4>
                          <Badge 
                            className={
                              photographer.kyc?.status === 'approved' 
                                ? 'bg-green-100 text-green-800' 
                                : photographer.kyc?.status === 'pending' 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : 'bg-red-100 text-red-800'
                            }
                          >
                            {photographer.kyc?.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{photographer.kyc?.pan}</p>
                        <Button size="sm" variant="outline">
                          <FileText className="w-4 h-4 mr-2" />
                          View Document
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Business Certificate</h3>
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">GST Certificate</h4>
                        <Badge className="bg-green-100 text-green-800">Approved</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{photographer.compliance.gstCertificate}</p>
                      <Button size="sm" variant="outline">
                        <FileText className="w-4 h-4 mr-2" />
                        View Certificate
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Equipment Details</h3>
                    <div className="border rounded-lg p-4">
                      <div className="flex flex-wrap gap-2">
                        {photographer.compliance.equipment.map((item, index) => (
                          <Badge key={index} variant="outline">{item}</Badge>
                        ))}
                      </div>
                      <Button className="mt-4">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Equipment
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Verification Status</h3>
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span>Status</span>
                        <Select defaultValue="approved">
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Support & Issues Tab */}
            <TabsContent value="support" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Support & Issues</CardTitle>
                  <CardDescription>Handle photographer-related support and issues</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-red-600">{photographer.support.complaints}</div>
                      <p className="text-sm text-muted-foreground mt-1">Complaints</p>
                    </div>
                    <div className="border rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">{photographer.support.disputes}</div>
                      <p className="text-sm text-muted-foreground mt-1">Disputes</p>
                    </div>
                    <div className="border rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-600">{photographer.support.warnings}</div>
                      <p className="text-sm text-muted-foreground mt-1">Warnings</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Complaints from Users</h3>
                    <div className="border rounded-lg p-4">
                      <p className="text-muted-foreground">No active complaints</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Profile Review Alerts</h3>
                    <div className="border rounded-lg p-4">
                      <p className="text-muted-foreground">No pending profile reviews</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Dispute Resolution Notes</h3>
                    <Textarea placeholder="Add notes about dispute resolution..." rows={4} />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Warning Logs</h3>
                    <div className="border rounded-lg p-4">
                      <p className="text-muted-foreground">No warnings issued</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Internal Admin Controls Tab */}
            <TabsContent value="admin" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Internal Admin Controls</CardTitle>
                  <CardDescription>Admin-specific controls for photographer management</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Banner Images</h3>
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img 
                            src={photographer.coverPhoto} 
                            alt="Banner" 
                            className="w-32 h-20 object-cover rounded"
                          />
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            className="absolute top-1 right-1 h-6 w-6 p-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        <div>
                          <Button size="sm">
                            <Upload className="w-4 h-4 mr-2" />
                            Change Banner
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Homepage Spotlight</h3>
                      <p className="text-sm text-muted-foreground">Feature this photographer on the homepage</p>
                    </div>
                    <Switch 
                      checked={photographer.homepageSpotlight} 
                      onCheckedChange={handleHomepageSpotlightChange} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Suspend Photographer</h3>
                      <p className="text-sm text-muted-foreground">Temporarily suspend the photographer's account</p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Ban Photographer Permanently</h3>
                      <p className="text-sm text-muted-foreground">Permanently ban the photographer from the platform</p>
                    </div>
                    <Button variant="destructive">
                      <Ban className="w-4 h-4 mr-2" />
                      Ban
                    </Button>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Edit Biography, Skills, Tags</h3>
                    <div className="border rounded-lg p-4 space-y-4">
                      <div>
                        <Label htmlFor="adminBio">Biography</Label>
                        <Textarea 
                          id="adminBio" 
                          defaultValue={photographer.bio} 
                          rows={4} 
                        />
                      </div>
                      
                      <div>
                        <Label>Skills</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {photographer.specialization.map((skill, index) => (
                            <Badge key={index} variant="outline" className="flex items-center gap-1">
                              {skill}
                              <X className="w-3 h-3 cursor-pointer" />
                            </Badge>
                          ))}
                          <Button size="sm" variant="outline">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <Label>Tags</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {['Professional', 'Experienced', 'Creative'].map((tag, index) => (
                            <Badge key={index} variant="outline" className="flex items-center gap-1">
                              {tag}
                              <X className="w-3 h-3 cursor-pointer" />
                            </Badge>
                          ))}
                          <Button size="sm" variant="outline">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <Button className="self-start">
                        <Check className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}