"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"

interface PhotographerProfile {
  _id: string
  name: string
  email: string
  phone: string
  location: string
  description: string
  experience: number
  startingPrice: number
  categories: string[]
  image?: string
}

export default function EditProfile() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    startingPrice: "",
    bio: "",
    experience: "",
    categories: "",
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [photographerId, setPhotographerId] = useState("")

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError("")
      
      // Get studio data from localStorage
      const studioData = localStorage.getItem('studio')
      if (!studioData) {
        setError("No studio session found. Please login again.")
        return
      }
      
      const studio = JSON.parse(studioData)
      const email = studio.email
      
      if (!email) {
        setError("No email found in session. Please login again.")
        return
      }
      
      // Fetch photographer profile by email
      const response = await fetch(`/api/photographer/profile?email=${encodeURIComponent(email)}`)
      const data = await response.json()
      
      if (data.success && data.photographer) {
        const photographer = data.photographer
        setPhotographerId(photographer._id)
        setFormData({
          name: photographer.name || "",
          email: photographer.email || "",
          phone: photographer.phone || "",
          location: photographer.location || "",
          startingPrice: photographer.startingPrice?.toString() || "200",
          bio: photographer.description || "",
          experience: photographer.experience?.toString() || "0",
          categories: Array.isArray(photographer.categories) 
            ? photographer.categories.join(", ") 
            : (photographer.categories || "Wedding Photography"),
        })
      } else {
        setError(data.error || "Failed to load profile")
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setError("Failed to load profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    
    // Clear messages when user starts typing
    if (error) setError("")
    if (success) setSuccess("")
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError("")
      setSuccess("")
      
      if (!photographerId) {
        setError("No photographer ID found. Please refresh and try again.")
        return
      }
      
      // Validate required fields
      if (!formData.name.trim()) {
        setError("Name is required")
        return
      }
      
      if (!formData.email.trim()) {
        setError("Email is required")
        return
      }
      
      // Prepare update data
      const updateData = {
        id: photographerId,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        location: formData.location.trim(),
        description: formData.bio.trim(),
        experience: parseInt(formData.experience) || 0,
        startingPrice: parseInt(formData.startingPrice) || 200,
        categories: formData.categories.split(",").map(cat => cat.trim()).filter(cat => cat.length > 0)
      }
      
      const response = await fetch('/api/photographer/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSuccess("Profile updated successfully!")
        
        // Update localStorage studio data
        const studioData = localStorage.getItem('studio')
        if (studioData) {
          const studio = JSON.parse(studioData)
          studio.name = formData.name
          studio.email = formData.email
          studio.mobile = formData.phone
          studio.location = formData.location
          localStorage.setItem('studio', JSON.stringify(studio))
        }
      } else {
        setError(data.error || "Failed to update profile")
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      setError("Failed to save profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Edit Profile</h1>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Loading profile...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Edit Profile</h1>
      
      {error && (
        <Alert className="border-destructive/50 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="border-green-500/50 text-green-700 bg-green-50">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Name *</label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                className="bg-input border-border text-foreground"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email *</label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="bg-input border-border text-foreground"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Phone</label>
              <Input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
                className="bg-input border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Location</label>
              <Input
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="City, State"
                className="bg-input border-border text-foreground"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Starting Price ($)</label>
              <Input
                name="startingPrice"
                type="number"
                value={formData.startingPrice}
                onChange={handleChange}
                placeholder="200"
                min="0"
                className="bg-input border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Experience (years)</label>
              <Input
                name="experience"
                type="number"
                value={formData.experience}
                onChange={handleChange}
                placeholder="5"
                min="0"
                className="bg-input border-border text-foreground"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Categories</label>
            <Input
              name="categories"
              value={formData.categories}
              onChange={handleChange}
              placeholder="Wedding Photography, Portrait Photography, Event Photography"
              className="bg-input border-border text-foreground"
            />
            <p className="text-xs text-muted-foreground">Separate multiple categories with commas</p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              placeholder="Tell clients about yourself, your style, and your experience..."
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
          
          <Button 
            onClick={handleSave}
            disabled={saving || !formData.name.trim() || !formData.email.trim()}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-base"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving Changes...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}