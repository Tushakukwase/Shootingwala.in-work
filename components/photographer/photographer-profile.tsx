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

interface PhotographerData {
  id: string
  name: string
  profilePhoto: string
  isVerified: boolean
  location: string
  tagline: string
  bio: string
  experience: number
  specializations: string[]
  awards: string[]
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
}

interface PhotographerProfileProps {
  photographerId: string
}

export default function PhotographerProfile({ photographerId }: PhotographerProfileProps) {
  const [photographer, setPhotographer] = useState<PhotographerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [showBookingForm, setShowBookingForm] = useState(false)

  useEffect(() => {
    fetchPhotographerData()
  }, [photographerId])

  const fetchPhotographerData = async () => {
    try {
      setLoading(true)
      // For now, using mock data. Replace with actual API call
      const mockData: PhotographerData = {
        id: photographerId,
        name: "Arjun Sharma",
        profilePhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
        isVerified: true,
        location: "Mumbai, Maharashtra",
        tagline: "Capturing memories with creativity and passion",
        bio: "Professional wedding and portrait photographer with over 8 years of experience. I specialize in candid photography that tells your unique story. My approach combines traditional techniques with modern creativity to deliver timeless memories.",
        experience: 8,
        specializations: ["Wedding Photography", "Pre-wedding Shoots", "Portrait Photography", "Event Photography", "Product Photography"],
        awards: ["Best Wedding Photographer 2023", "Excellence in Portrait Photography", "Creative Photography Award"],
        portfolio: [
          {
            id: "1",
            type: "photo",
            url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop",
            thumbnail: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop",
            eventType: "Wedding",
            location: "Goa",
            title: "Beach Wedding Ceremony"
          },
          {
            id: "2",
            type: "photo",
            url: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&h=600&fit=crop",
            thumbnail: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&h=300&fit=crop",
            eventType: "Pre-wedding",
            location: "Udaipur",
            title: "Royal Pre-wedding Shoot"
          },
          {
            id: "3",
            type: "photo",
            url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&h=600&fit=crop",
            thumbnail: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&h=300&fit=crop",
            eventType: "Portrait",
            location: "Delhi",
            title: "Professional Portrait Session"
          },
          {
            id: "4",
            type: "video",
            url: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
            thumbnail: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=300&fit=crop",
            eventType: "Wedding",
            location: "Jaipur",
            title: "Wedding Highlights Reel"
          },
          {
            id: "5",
            type: "photo",
            url: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=800&h=600&fit=crop",
            thumbnail: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=400&h=300&fit=crop",
            eventType: "Event",
            location: "Bangalore",
            title: "Corporate Event Coverage"
          },
          {
            id: "6",
            type: "photo",
            url: "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=800&h=600&fit=crop",
            thumbnail: "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=400&h=300&fit=crop",
            eventType: "Product",
            location: "Mumbai",
            title: "Product Photography Session"
          }
        ],
        packages: [
          {
            id: "basic",
            name: "Basic Package",
            price: 25000,
            duration: "4 hours",
            deliverables: ["150 edited photos", "Online gallery", "Basic retouching"],
            features: ["4 hours coverage", "150+ edited photos", "Online gallery access", "Basic color correction", "48-hour delivery"]
          },
          {
            id: "standard",
            name: "Standard Package",
            price: 45000,
            duration: "8 hours",
            deliverables: ["300 edited photos", "Cinematic video", "Premium editing"],
            features: ["8 hours coverage", "300+ edited photos", "2-3 minute highlight video", "Premium editing", "Online gallery", "24-hour delivery"],
            isPopular: true
          },
          {
            id: "premium",
            name: "Premium Package",
            price: 75000,
            duration: "Full day",
            deliverables: ["500+ edited photos", "Cinematic video", "Same day editing", "Photo album"],
            features: ["12+ hours coverage", "500+ edited photos", "5-7 minute cinematic video", "Same day preview", "Premium photo album", "Drone shots", "Multiple locations"]
          }
        ],
        reviews: [
          {
            id: "1",
            userName: "Priya & Rohit",
            userAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
            rating: 5,
            comment: "Arjun captured our wedding beautifully! His candid shots are amazing and he made us feel so comfortable. Highly recommended!",
            date: "2024-01-15",
            eventType: "Wedding"
          },
          {
            id: "2",
            userName: "Sneha Patel",
            userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
            rating: 5,
            comment: "Professional and creative! Our pre-wedding shoot was absolutely perfect. The photos exceeded our expectations.",
            date: "2024-01-10",
            eventType: "Pre-wedding"
          },
          {
            id: "3",
            userName: "Rajesh Kumar",
            userAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
            rating: 4,
            comment: "Great work on our corporate event. Very professional and delivered on time. Will book again!",
            date: "2024-01-05",
            eventType: "Corporate Event"
          }
        ],
        averageRating: 4.9,
        totalReviews: 58,
        availability: [
          { date: "2024-02-15", isAvailable: true },
          { date: "2024-02-16", isAvailable: false },
          { date: "2024-02-17", isAvailable: true },
          { date: "2024-02-18", isAvailable: true },
          { date: "2024-02-19", isAvailable: false },
          { date: "2024-02-20", isAvailable: true }
        ],
        contact: {
          phone: "+91 98765 43210",
          email: "arjun.sharma@example.com",
          instagram: "@arjunphotography",
          facebook: "arjunphotographyofficial",
          website: "www.arjunphotography.com"
        },
        stats: {
          totalBookings: 150,
          yearsActive: 8,
          happyClients: 145
        }
      }
      
      setPhotographer(mockData)
    } catch (error) {
      console.error("Error fetching photographer data:", error)
    } finally {
      setLoading(false)
    }
  }

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
          <Link href="/">
            <Button>Go back home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to photographers
          </Link>
        </div>
      </div>

      {/* Header Section */}
      <PhotographerHeader photographer={photographer} isLiked={isLiked} setIsLiked={setIsLiked} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <PhotographerAbout photographer={photographer} />
            <PhotographerPortfolio portfolio={photographer.portfolio} />
            <PhotographerReviews 
              reviews={photographer.reviews} 
              averageRating={photographer.averageRating}
              totalReviews={photographer.totalReviews}
            />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <PhotographerPackages packages={photographer.packages} />
            <PhotographerAvailability availability={photographer.availability} />
            <PhotographerContact contact={photographer.contact} />
          </div>
        </div>

        {/* Similar Photographers */}
        <div className="mt-16">
          <SimilarPhotographers currentPhotographerId={photographer.id} />
        </div>
      </div>

      {/* Sticky Book Button */}
      <StickyBookButton photographer={photographer} />
    </div>
  )
}