"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  MapPin,
  Star,
  Calendar,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Camera,
  Award,
  Clock,
  Users,
  Heart,
  Share2,
  MessageCircle,
  CheckCircle,
  ArrowLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import Image from "next/image"
import PhotographerHeader from "./photographer-header"
import PhotographerAbout from "./photographer-about"
import PhotographerPortfolio from "./photographer-portfolio"
import PhotographerPackages from "./photographer-packages"
import PhotographerReviews from "./photographer-reviews"
import PhotographerAvailability from "./photographer-availability"
import PhotographerContact from "./photographer-contact"
import SimilarPhotographers from "./similar-photographers"
import StickyBookButton from "./sticky-book-button"
import ClientCache from "@/lib/cache-utils"

interface PhotographerData {
  id: string
  name: string
  studioName?: string
  profilePhoto: string
  studioBannerImage?: string
  isVerified: boolean
  location: string
  tagline: string
  bio: string
  experience: number
  specializations: string[]
  awards: (string | {
    id?: string
    title: string
    image?: string
    brief?: string
    year?: string
  })[]
  portfolio: {
    id: string
    type: 'photo' | 'video'
    url: string
    thumbnail: string
    eventType: string
    location: string
    title: string
  }[]
  packages: {
    id: string
    name: string
    price: number
    duration: string
    deliverables: string[]
    features: string[]
    isPopular?: boolean
  }[]
  reviews: {
    id: string
    userName: string
    userAvatar: string
    rating: number
    comment: string
    date: string
    eventType: string
  }[]
  averageRating: number
  totalReviews: number
  availability: {
    date: string
    isAvailable: boolean
  }[]
  contact: {
    phone: string
    email: string
    instagram?: string
    facebook?: string
    website?: string
  }
  stats: {
    totalBookings: number
    yearsActive: number
    happyClients: number
  }
  studioInfo?: {
    studioName: string
    studioAddress: string
    studioCity: string
    studioState: string
    studioEstablished: string
    studioTeamSize: number
    studioServices: string[]
    businessHours: any
  }
}

interface PhotographerProfileProps {
  photographerId: string
  isAdminView?: boolean // Add this prop to control back button visibility
}

export default function PhotographerProfile({ photographerId, isAdminView = false }: PhotographerProfileProps) {
  const [photographer, setPhotographer] = useState<PhotographerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [showBookingForm, setShowBookingForm] = useState(false)

  const fetchPhotographerData = async () => {
    try {
      setLoading(true)
      console.log('Fetching photographer data for ID:', photographerId)

      // Check if we have cached data
      const cacheKey = `photographer-${photographerId}`
      const cachedData = ClientCache.get(cacheKey)
      if (cachedData) {
        console.log('Using cached photographer data')
        setPhotographer(cachedData)
        return
      }

      // Try to fetch from API first
      const response = await fetch(`/api/photographer/${photographerId}`)
      console.log('API response status:', response.status)

      if (!response.ok) {
        console.error('API response not ok:', response.status, response.statusText)
        return
      }

      const data = await response.json()
      console.log('API response data:', data)

      if (data.success && data.photographer) {
        console.log('Setting photographer data:', data.photographer)
        console.log('Photographer name:', data.photographer.name)
        console.log('Photographer bio:', data.photographer.bio)
        console.log('Portfolio items:', data.photographer.portfolio?.length || 0)
        console.log('Packages:', data.photographer.packages?.length || 0)
        
        // Cache the data for 5 minutes
        ClientCache.set(cacheKey, data.photographer, 5 * 60 * 1000)
        setPhotographer(data.photographer)
        return
      } else {
        console.error('API returned error:', data.error)
      }
    } catch (error) {
      console.error("Error fetching photographer data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (photographerId) {
      fetchPhotographerData()
    }
  }, [photographerId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!photographer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Photographer not found</h1>
          <p className="text-gray-600 mb-4">ID: {photographerId}</p>
          <p className="text-sm text-gray-500 mb-4">
            Check browser console for debugging information
          </p>
          {!isAdminView && (
            <Link href="/">
              <Button>Go back home</Button>
            </Link>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={isAdminView ? "bg-gray-50" : "min-h-screen bg-gray-50"}>
      {/* Back Button - Only show if not in admin view */}
      {!isAdminView && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to photographers
            </Link>
          </div>
        </div>
      )}

      {/* Header Section */}
      <PhotographerHeader photographer={{
        name: photographer.name,
        studioName: photographer.studioName || photographer.studioInfo?.studioName,
        profilePhoto: photographer.profilePhoto,
        studioBannerImage: photographer.studioBannerImage,
        isVerified: photographer.isVerified,
        location: photographer.location,
        tagline: photographer.tagline,
        averageRating: photographer.averageRating,
        totalReviews: photographer.totalReviews,
        stats: photographer.stats
      }} isLiked={isLiked} setIsLiked={setIsLiked} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <PhotographerAbout photographer={{
              bio: photographer.bio || '',
              experience: photographer.experience || 0,
              specializations: photographer.specializations || [],
              awards: photographer.awards || [],
              studioInfo: photographer.studioInfo
            }} />
            <PhotographerPortfolio portfolio={photographer.portfolio || []} />
            <PhotographerReviews
              reviews={photographer.reviews}
              averageRating={photographer.averageRating}
              totalReviews={photographer.totalReviews}
              photographerId={photographer.id}
            />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <PhotographerContact contact={photographer.contact || {}} />
            <PhotographerPackages packages={photographer.packages || []} />
            <PhotographerAvailability availability={photographer.availability} />
          </div>
        </div>

        {/* Similar Photographers - Only show if not in admin view */}
        {!isAdminView && (
          <div className="mt-16">
            <SimilarPhotographers currentPhotographerId={photographer.id} />
          </div>
        )}
      </div>

      {/* Sticky Book Button - Only show if not in admin view */}
      {!isAdminView && (
        <StickyBookButton photographer={photographer} />
      )}
    </div>
  )
}