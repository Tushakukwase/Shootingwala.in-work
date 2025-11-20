"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, CheckCircle, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import NextImage from "next/image"

export default function PhotographerRegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    categories: "",
    image: null as string | null,
    description: "",
    experience: 0,
    startingPrice: 200
  })

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, image: event.target?.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Name and email are required')
      return
    }

    setLoading(true)

    try {
      const photographerData = {
        ...formData,
        categories: formData.categories.split(',').map(cat => cat.trim()).filter(cat => cat),
        tags: formData.categories.split(',').map(cat => cat.trim()).filter(cat => cat),
        createdBy: 'self',
        status: 'pending', // Set status as pending for admin approval
        approved: false,
        registrationDate: new Date().toISOString()
      }

      const response = await fetch('/api/photographers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(photographerData)
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/dashboard')
        }, 3000)
      } else {
        setError(data.error || 'Failed to register. Please try again.')
      }
    } catch (error) {
      setError('Failed to register. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Registration Successful!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for registering! Your profile has been submitted for admin approval. 
              You'll be notified once your profile is approved and visible to clients.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to dashboard in a few seconds...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
            <CardTitle className="text-2xl text-center">
              📸 Register as a Photographer
            </CardTitle>
            <p className="text-center text-yellow-100 mt-2">
              Join our platform and connect with clients looking for professional photography services
            </p>
          </CardHeader>
          
          <CardContent className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Image */}
              <div>
                <Label className="text-sm font-semibold text-gray-900 mb-3">
                  Profile Image
                </Label>
                <div className="relative mt-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-yellow-400 hover:bg-yellow-50 transition-colors"
                  >
                    {formData.image ? (
                      <div className="relative w-full h-full">
                        <NextImage
                          src={formData.image}
                          alt="Profile preview"
                          fill
                          className="object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <span className="text-white font-medium">Change Image</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-gray-600 font-medium">Click to upload profile image</p>
                        <p className="text-gray-400 text-sm">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-900">
                    Full Name <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                    className="mt-1"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-900">
                    Email Address <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Phone */}
                <div>
                  <Label htmlFor="phone" className="text-sm font-semibold text-gray-900">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter your phone number"
                    className="mt-1"
                  />
                </div>

                {/* Location */}
                <div>
                  <Label htmlFor="location" className="text-sm font-semibold text-gray-900">
                    Location/City
                  </Label>
                  <Input
                    id="location"
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Enter your city"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Experience */}
                <div>
                  <Label htmlFor="experience" className="text-sm font-semibold text-gray-900">
                    Years of Experience
                  </Label>
                  <Input
                    id="experience"
                    type="number"
                    min="0"
                    value={formData.experience}
                    onChange={(e) => setFormData(prev => ({ ...prev, experience: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>

                {/* Starting Price */}
                <div>
                  <Label htmlFor="startingPrice" className="text-sm font-semibold text-gray-900">
                    Starting Price ($)
                  </Label>
                  <Input
                    id="startingPrice"
                    type="number"
                    min="0"
                    value={formData.startingPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, startingPrice: parseInt(e.target.value) || 200 }))}
                    placeholder="200"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Categories */}
              <div>
                <Label htmlFor="categories" className="text-sm font-semibold text-gray-900">
                  Photography Specialties
                </Label>
                <Input
                  id="categories"
                  type="text"
                  value={formData.categories}
                  onChange={(e) => setFormData(prev => ({ ...prev, categories: e.target.value }))}
                  placeholder="e.g. Wedding, Portrait, Event (comma separated)"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter your photography specialties separated by commas
                </p>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-sm font-semibold text-gray-900">
                  About You
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Tell clients about your photography style, experience, and what makes you unique..."
                  rows={4}
                  className="mt-1 resize-none"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3 text-lg"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                    Submitting Registration...
                  </>
                ) : (
                  "Register as Photographer"
                )}
              </Button>

              <div className="text-center text-sm text-gray-600">
                <p>
                  By registering, you agree that your profile will be reviewed by our admin team 
                  before being made visible to clients.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}