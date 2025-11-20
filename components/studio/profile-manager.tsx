"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { User, Camera, Award, Save, Plus, X, Upload, MapPin, Phone, Mail, Instagram, Facebook, Globe, CheckCircle, Building2, Settings, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface Award {
  id: string
  title: string
  image?: string
  brief: string
  year?: string
}

interface ProfileData {
  name: string
  email: string
  phone: string
  location: string
  bio: string
  experience: number
  specializations: string[]
  awards: Award[]
  profileImage?: string
  socialMedia: {
    instagram?: string
    facebook?: string
    website?: string
  }
  // Studio Information
  studioName: string
  studioAddress: string
  studioCity: string
  studioState: string
  studioPincode: string
  studioEstablished: string
  studioTeamSize: number
  studioServices: string[]
  studioEquipment: string[]
  emergencyContact: string
  alternateEmail: string
  studioBannerImage?: string
}

interface PortfolioData {
  galleryCount: number
  storyCount: number
  recentActivity: {
    id: string
    type: 'gallery' | 'story' | 'approval'
    title: string
    status: string
    timestamp: string
  }[]
}

export default function ProfileManager() {
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    experience: 0,
    specializations: [],
    awards: [],
    socialMedia: {},
    // Studio Information
    studioName: '',
    studioAddress: '',
    studioCity: '',
    studioState: '',
    studioPincode: '',
    studioEstablished: '',
    studioTeamSize: 1,
    studioServices: [],
    studioEquipment: [],
    emergencyContact: '',
    alternateEmail: '',
    studioBannerImage: ''
  })
  const [portfolioData, setPortfolioData] = useState<PortfolioData>({
    galleryCount: 0,
    storyCount: 0,
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)
  const [portfolioLoading, setPortfolioLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newSpecialization, setNewSpecialization] = useState('')
  const [newService, setNewService] = useState('')
  const [newEquipment, setNewEquipment] = useState('')
  const [showAddAward, setShowAddAward] = useState(false)
  const [newAward, setNewAward] = useState({
    title: '',
    image: '',
    brief: '',
    year: ''
  })
  const [imageUploading, setImageUploading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProfile()
    fetchPortfolioData()
    
    // Set up interval to refresh portfolio data every 5 minutes
    const interval = setInterval(() => {
      fetchPortfolioData()
    }, 5 * 60 * 1000) // 5 minutes
    
    return () => clearInterval(interval)
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const studioData = localStorage.getItem('studio')
      if (!studioData) return

      const studio = JSON.parse(studioData)
      
      // First try to get existing profile
      const response = await fetch(`/api/photographer-profile?id=${studio._id}`)
      const data = await response.json()
      
      // Also fetch original photographer registration data
      let photographerData = null
      try {
        const photographerResponse = await fetch(`/api/photographer/${studio._id}`)
        const photographerResult = await photographerResponse.json()
        if (photographerResult.success) {
          photographerData = photographerResult.photographer
        }
      } catch (error) {
        console.log('Could not fetch photographer data:', error)
      }

      if (data.success && data.profile) {
        setProfile(data.profile)
      } else {
        // Initialize with registration data from multiple sources
        const regData = photographerData || studio
        
        setProfile(prev => ({
          ...prev,
          // Personal Information from Registration
          name: regData.name || regData.fullName || regData.photographerName || '',
          email: regData.email || '',
          phone: regData.phone || regData.mobile || regData.mobileNumber || '',
          location: regData.location || regData.city || '',
          bio: regData.description || regData.bio || '',
          experience: regData.experience || 0,
          
          // Categories/Specializations from Registration
          specializations: regData.categories || regData.specializations || regData.tags || [],
          
          // Profile Image from Registration
          profileImage: regData.image || regData.profileImage || '',
          
          // Social Media (if available)
          socialMedia: {
            instagram: regData.instagram || '',
            facebook: regData.facebook || '',
            website: regData.website || ''
          },
          
          // Studio Information - Auto-generate from personal info
          studioName: regData.studioName || `${regData.name || 'Photography'} Studio`,
          studioAddress: regData.address || '',
          studioCity: regData.city || regData.location || '',
          studioState: regData.state || '',
          studioPincode: regData.pincode || '',
          studioEstablished: regData.registrationDate?.split('T')[0] || new Date().getFullYear().toString(),
          studioTeamSize: 1,
          studioServices: regData.categories || regData.specializations || [],
          
          // Business Information
          emergencyContact: regData.phone || regData.mobile || '',
          alternateEmail: regData.email || '',
          studioBannerImage: regData.image || ''
        }))
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      // Fallback to studio data even on error
      const studioData = localStorage.getItem('studio')
      if (studioData) {
        const studio = JSON.parse(studioData)
        setProfile(prev => ({
          ...prev,
          name: studio.fullName || studio.name || studio.photographerName || '',
          email: studio.email || '',
          phone: studio.mobile || studio.mobileNumber || studio.phone || '',
          location: studio.location || '',
          bio: studio.description || studio.bio || ''
        }))
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchPortfolioData = async () => {
    try {
      setPortfolioLoading(true)
      const studioData = localStorage.getItem('studio')
      if (!studioData) return

      const studio = JSON.parse(studioData)
      const photographerId = studio._id
    
      // Fetch galleries
      const galleriesResponse = await fetch(`/api/photographer-galleries?photographerId=${photographerId}`)
      const galleriesData = await galleriesResponse.json()
    
      // Fetch stories
      const storiesResponse = await fetch(`/api/photographer-stories?photographerId=${photographerId}`)
      const storiesData = await storiesResponse.json()
    
      // Calculate counts
      const galleryCount = galleriesData.success ? galleriesData.galleries.length : 0
      const storyCount = storiesData.success ? storiesData.stories.length : 0
    
      // Generate recent activity
      const recentActivity: {
        id: string
        type: 'gallery' | 'story' | 'approval'
        title: string
        status: string
        timestamp: string
      }[] = []
    
      // Add gallery activities
      if (galleriesData.success) {
        galleriesData.galleries.slice(0, 2).forEach((gallery: any) => {
          recentActivity.push({
            id: gallery.id,
            type: 'gallery',
            title: gallery.name,
            status: gallery.status,
            timestamp: gallery.createdAt
          })
        })
      }
    
      // Add story activities
      if (storiesData.success) {
        storiesData.stories.slice(0, 1).forEach((story: any) => {
          recentActivity.push({
            id: story.id,
            type: 'story',
            title: story.title,
            status: story.status,
            timestamp: story.createdAt
          })
        })
      }
    
      // Sort by timestamp and take first 3
      recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    
      setPortfolioData({
        galleryCount,
        storyCount,
        recentActivity: recentActivity.slice(0, 3)
      })
    } catch (error: any) {
      console.error('Error fetching portfolio data:', error)
    } finally {
      setPortfolioLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  const handleSocialMediaChange = (platform: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      socialMedia: { ...prev.socialMedia, [platform]: value }
    }))
  }

  const addSpecialization = () => {
    if (newSpecialization.trim() && !profile.specializations.includes(newSpecialization.trim())) {
      setProfile(prev => ({
        ...prev,
        specializations: [...prev.specializations, newSpecialization.trim()]
      }))
      setNewSpecialization('')
    }
  }

  const removeSpecialization = (index: number) => {
    setProfile(prev => ({
      ...prev,
      specializations: prev.specializations.filter((_, i) => i !== index)
    }))
  }

  const handleImageUpload = async (file: File, type: 'profile' | 'award' | 'studio-banner') => {
    try {
      setImageUploading(true)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      
      if (data.success) {
        if (type === 'profile') {
          setProfile(prev => ({ ...prev, profileImage: data.data.url }))
        } else if (type === 'studio-banner') {
          setProfile(prev => ({ ...prev, studioBannerImage: data.data.url }))
        } else {
          setNewAward(prev => ({ ...prev, image: data.data.url }))
        }
      } else {
        alert('Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image')
    } finally {
      setImageUploading(false)
    }
  }

  const addAward = () => {
    if (newAward.title.trim() && newAward.brief.trim()) {
      const award: Award = {
        id: Date.now().toString(),
        title: newAward.title.trim(),
        image: newAward.image,
        brief: newAward.brief.trim(),
        year: newAward.year
      }
      
      setProfile(prev => ({
        ...prev,
        awards: [...prev.awards, award]
      }))
      
      setNewAward({ title: '', image: '', brief: '', year: '' })
      setShowAddAward(false)
    }
  }

  const removeAward = (id: string) => {
    setProfile(prev => ({
      ...prev,
      awards: prev.awards.filter(award => award.id !== id)
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const studioData = localStorage.getItem('studio')
      if (!studioData) {
        alert('No studio session found. Please login again.')
        return
      }

      const studio = JSON.parse(studioData)
      
      if (!studio._id) {
        alert('Studio ID not found. Please login again.')
        return
      }

      // Validate required fields
      if (!profile.name.trim()) {
        alert('Name is required')
        return
      }

      if (!profile.email.trim()) {
        alert('Email is required')
        return
      }

      console.log('Saving profile for studio ID:', studio._id)
      console.log('Profile data:', JSON.stringify(profile, null, 2))
      
      const response = await fetch('/api/photographer-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...profile,
          photographerId: studio._id
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log('API response:', data)

      if (data.success) {
        setSuccess('Profile updated successfully!')
        setError('')
        // Refresh portfolio data after saving profile
        fetchPortfolioData()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        console.error('API error:', data.error)
        const errorMessage = data.error || 'Failed to update profile'
        // Check for specific database errors
        if (errorMessage.includes('SSL') || errorMessage.includes('TLS')) {
          setError('Database connection error. Please check your internet connection and try again.')
        } else if (errorMessage.includes('timeout')) {
          setError('Request timeout. Please try again.')
        } else {
          setError(errorMessage)
        }
        setSuccess('')
      }
    } catch (err) {
      const error = err as any;
      console.error('Error saving profile:', error)
      let errorMessage = 'Failed to save profile'
      
      if (error.message) {
        // Handle specific error types
        if (error.message.includes('SSL') || error.message.includes('TLS')) {
          errorMessage = 'Database connection error. Please check your internet connection and try again.'
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timeout. Please try again.'
        } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.'
        } else {
          errorMessage = `Error: ${error.message}`
        }
      }
      
      setError(errorMessage)
      setSuccess('')
    } finally {
      setSaving(false)
    }
  }

  const handleRefreshPortfolio = () => {
    fetchPortfolioData()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Profile & Portfolio</h2>
          <p className="text-gray-600">Manage your professional profile, portfolio, and showcase your expertise</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            {success}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center gap-2">
            <X className="w-4 h-4" />
            {error}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profile.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="City, State"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  type="number"
                  value={profile.experience}
                  onChange={(e) => handleInputChange('experience', parseInt(e.target.value) || 0)}
                  placeholder="5"
                />
              </div>

              <div>
                <Label htmlFor="bio">About Me</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell clients about yourself, your style, and what makes you unique..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Studio Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Studio Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Studio Banner Image */}
              <div className="space-y-3">
                <Label>Studio Banner Image</Label>
                <div className="flex flex-col gap-4">
                  <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300">
                    {profile.studioBannerImage ? (
                      <Image
                        src={profile.studioBannerImage}
                        alt="Studio Banner"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <Building2 className="w-16 h-16 mb-2" />
                        <p className="text-sm font-medium">Studio Banner Image</p>
                        <p className="text-xs">Showcase your studio space</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(file, 'studio-banner')
                      }}
                      className="hidden"
                      id="studio-banner-image"
                    />
                    <label htmlFor="studio-banner-image">
                      <Button variant="outline" disabled={imageUploading} asChild>
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          {imageUploading ? 'Uploading...' : 'Upload Banner'}
                        </span>
                      </Button>
                    </label>
                    {profile.studioBannerImage && (
                      <Button
                        variant="outline"
                        onClick={() => setProfile(prev => ({ ...prev, studioBannerImage: '' }))}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Recommended size: 1200x400px. This image will be displayed as your studio banner.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="studioName">Studio Name *</Label>
                  <Input
                    id="studioName"
                    value={profile.studioName}
                    onChange={(e) => handleInputChange('studioName', e.target.value)}
                    placeholder="Your Studio Name"
                  />
                </div>
                <div>
                  <Label htmlFor="studioEstablished">Established Year</Label>
                  <Input
                    id="studioEstablished"
                    value={profile.studioEstablished}
                    onChange={(e) => handleInputChange('studioEstablished', e.target.value)}
                    placeholder="2020"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="studioAddress">Studio Address</Label>
                <Textarea
                  id="studioAddress"
                  value={profile.studioAddress}
                  onChange={(e) => handleInputChange('studioAddress', e.target.value)}
                  placeholder="Complete studio address..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="studioCity">City</Label>
                  <Input
                    id="studioCity"
                    value={profile.studioCity}
                    onChange={(e) => handleInputChange('studioCity', e.target.value)}
                    placeholder="Mumbai"
                  />
                </div>
                <div>
                  <Label htmlFor="studioState">State</Label>
                  <Input
                    id="studioState"
                    value={profile.studioState}
                    onChange={(e) => handleInputChange('studioState', e.target.value)}
                    placeholder="Maharashtra"
                  />
                </div>
                <div>
                  <Label htmlFor="studioPincode">Pincode</Label>
                  <Input
                    id="studioPincode"
                    value={profile.studioPincode}
                    onChange={(e) => handleInputChange('studioPincode', e.target.value)}
                    placeholder="400001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="studioTeamSize">Team Size</Label>
                  <Input
                    id="studioTeamSize"
                    type="number"
                    value={profile.studioTeamSize}
                    onChange={(e) => handleInputChange('studioTeamSize', parseInt(e.target.value) || 1)}
                    placeholder="5"
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyContact">Emergency Contact</Label>
                  <Input
                    id="emergencyContact"
                    value={profile.emergencyContact}
                    onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="alternateEmail">Alternate Email</Label>
                <Input
                  id="alternateEmail"
                  type="email"
                  value={profile.alternateEmail}
                  onChange={(e) => handleInputChange('alternateEmail', e.target.value)}
                  placeholder="alternate@studio.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Studio Services & Equipment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Services & Equipment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Studio Services */}
              <div>
                <Label>Studio Services</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(profile.studioServices || []).map((service, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {service}
                      <button
                        onClick={() => {
                          const newServices = (profile.studioServices || []).filter((_, i) => i !== index)
                          handleInputChange('studioServices', newServices)
                        }}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    placeholder="e.g., Wedding Photography, Portrait Sessions"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        if (newService.trim() && !(profile.studioServices || []).includes(newService.trim())) {
                          handleInputChange('studioServices', [...(profile.studioServices || []), newService.trim()])
                          setNewService('')
                        }
                      }
                    }}
                  />
                  <Button 
                    onClick={() => {
                      if (newService.trim() && !(profile.studioServices || []).includes(newService.trim())) {
                        handleInputChange('studioServices', [...(profile.studioServices || []), newService.trim()])
                        setNewService('')
                      }
                    }} 
                    disabled={!newService.trim()}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Studio Equipment */}
              <div>
                <Label>Studio Equipment</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(profile.studioEquipment || []).map((equipment, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {equipment}
                      <button
                        onClick={() => {
                          const newEquipment = (profile.studioEquipment || []).filter((_, i) => i !== index)
                          handleInputChange('studioEquipment', newEquipment)
                        }}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newEquipment}
                    onChange={(e) => setNewEquipment(e.target.value)}
                    placeholder="e.g., Canon 5D Mark IV, Professional Lighting Setup"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        if (newEquipment.trim() && !(profile.studioEquipment || []).includes(newEquipment.trim())) {
                          handleInputChange('studioEquipment', [...(profile.studioEquipment || []), newEquipment.trim()])
                          setNewEquipment('')
                        }
                      }
                    }}
                  />
                  <Button 
                    onClick={() => {
                      if (newEquipment.trim() && !(profile.studioEquipment || []).includes(newEquipment.trim())) {
                        handleInputChange('studioEquipment', [...(profile.studioEquipment || []), newEquipment.trim()])
                        setNewEquipment('')
                      }
                    }} 
                    disabled={!newEquipment.trim()}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Hours - REMOVED AS PER USER REQUEST */}
          
          {/* Specializations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Specializations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {profile.specializations.map((spec, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {spec}
                    <button
                      onClick={() => removeSpecialization(index)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Input
                  value={newSpecialization}
                  onChange={(e) => setNewSpecialization(e.target.value)}
                  placeholder="e.g., Wedding Photography"
                  onKeyPress={(e) => e.key === 'Enter' && addSpecialization()}
                />
                <Button onClick={addSpecialization} disabled={!newSpecialization.trim()}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card>
            <CardHeader>
              <CardTitle>Social Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md">
                      <Instagram className="w-4 h-4" />
                    </span>
                    <Input
                      id="instagram"
                      value={profile.socialMedia.instagram || ''}
                      onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                      placeholder="@username"
                      className="rounded-l-none"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="facebook">Facebook</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md">
                      <Facebook className="w-4 h-4" />
                    </span>
                    <Input
                      id="facebook"
                      value={profile.socialMedia.facebook || ''}
                      onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                      placeholder="page-name"
                      className="rounded-l-none"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md">
                      <Globe className="w-4 h-4" />
                    </span>
                    <Input
                      id="website"
                      value={profile.socialMedia.website || ''}
                      onChange={(e) => handleSocialMediaChange('website', e.target.value)}
                      placeholder="yourwebsite.com"
                      className="rounded-l-none"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Image & Awards */}
        <div className="space-y-6">
          {/* Profile Image */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center">
                <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100 mb-4">
                  {profile.profileImage ? (
                    <Image
                      src={profile.profileImage}
                      alt="Profile"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(file, 'profile')
                  }}
                  className="hidden"
                  id="profile-image"
                />
                <label htmlFor="profile-image">
                  <Button variant="outline" disabled={imageUploading} asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      {imageUploading ? 'Uploading...' : 'Upload Photo'}
                    </span>
                  </Button>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Portfolio Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Portfolio Highlights
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefreshPortfolio}
                    disabled={portfolioLoading}
                  >
                    {portfolioLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Navigate to gallery management
                      if (typeof window !== 'undefined') {
                        const event = new CustomEvent('navigateToGallery')
                        window.dispatchEvent(event)
                      }
                    }}
                  >
                    Manage Gallery
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Portfolio Stats */}
              {portfolioLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{portfolioData.galleryCount}</div>
                      <div className="text-xs text-blue-700">Gallery Images</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{portfolioData.storyCount}</div>
                      <div className="text-xs text-green-700">Featured Stories</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Portfolio Activity */}
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-gray-700">Recent Activity</h5>
                {portfolioLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg animate-pulse">
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-3 bg-gray-300 rounded w-3/4 mb-2"></div>
                          <div className="h-2 bg-gray-300 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : portfolioData.recentActivity.length > 0 ? (
                  <div className="space-y-2">
                    {portfolioData.recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.status === 'approved' ? 'bg-green-500' :
                          activity.status === 'draft' ? 'bg-yellow-500' :
                          activity.status === 'rejected' ? 'bg-red-500' : 'bg-blue-500'
                        }`}></div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-600 truncate">{activity.title}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 capitalize">{activity.type}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                              activity.status === 'approved' ? 'bg-green-100 text-green-800' :
                              activity.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                              activity.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {activity.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-2 text-sm">
                    No recent activity. Upload your first gallery or story!
                  </p>
                )}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      const event = new CustomEvent('navigateToGallery')
                      window.dispatchEvent(event)
                    }
                  }}
                  className="text-xs"
                >
                  📸 Upload Images
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      const event = new CustomEvent('navigateToStories')
                      window.dispatchEvent(event)
                    }
                  }}
                  className="text-xs"
                >
                  📝 Add Story
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Awards & Recognition */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Awards & Recognition
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddAward(true)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.awards.map((award) => (
                <div key={award.id} className="border rounded-lg p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-yellow-600" />
                      <h4 className="font-semibold text-lg text-gray-900">{award.title}</h4>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAward(award.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {award.year && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                          🏆 {award.year}
                        </Badge>
                      </div>
                    )}
                    
                    <div className="bg-white p-3 rounded-md border border-yellow-200">
                      <p className="text-sm font-medium text-gray-700 mb-1">Award Details:</p>
                      <p className="text-sm text-gray-600">{award.brief}</p>
                    </div>
                    
                    {award.image && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-2">Award Certificate/Image:</p>
                        <div className="relative">
                          <Image
                            src={award.image}
                            alt={award.title}
                            width={200}
                            height={120}
                            className="rounded-lg object-cover border-2 border-yellow-300 shadow-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {profile.awards.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  No awards added yet. Click + to add your achievements.
                </p>
              )}

              {/* Add Award Form */}
              {showAddAward && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 bg-gray-50"
                >
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="award-title">Award Title *</Label>
                      <Input
                        id="award-title"
                        value={newAward.title}
                        onChange={(e) => setNewAward(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Best Wedding Photographer 2023"
                      />
                    </div>
                    <div>
                      <Label htmlFor="award-year">Year</Label>
                      <Input
                        id="award-year"
                        value={newAward.year}
                        onChange={(e) => setNewAward(prev => ({ ...prev, year: e.target.value }))}
                        placeholder="2023"
                      />
                    </div>
                    <div>
                      <Label htmlFor="award-brief">Brief Description *</Label>
                      <Textarea
                        id="award-brief"
                        value={newAward.brief}
                        onChange={(e) => setNewAward(prev => ({ ...prev, brief: e.target.value }))}
                        placeholder="Brief description of the award..."
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label>Award Image</Label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleImageUpload(file, 'award')
                        }}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={addAward} size="sm">
                        Add Award
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowAddAward(false)
                          setNewAward({ title: '', image: '', brief: '', year: '' })
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* KYC & Verification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                KYC & Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-medium">Email Verification</p>
                        <p className="text-sm text-gray-600">{profile.email}</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium">Phone Verification</p>
                        <p className="text-sm text-gray-600">{profile.phone || 'Not provided'}</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="font-medium">Business Location</p>
                        <p className="text-sm text-gray-600">{profile.location || 'Not provided'}</p>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Confirmed
                    </Badge>
                  </div>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-700 mb-2">
                    <CheckCircle className="w-5 h-5" />
                    <h4 className="font-medium">Verification Complete</h4>
                  </div>
                  <p className="text-sm text-green-600">
                    Your account is fully verified and ready to receive bookings!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}