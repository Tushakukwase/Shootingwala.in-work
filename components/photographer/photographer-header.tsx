"use client"

import { motion } from "framer-motion"
import { MapPin, Star, Heart, Share2, CheckCircle, Camera, Award, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"

interface PhotographerHeaderProps {
  photographer: {
    name: string
    studioName?: string
    profilePhoto: string
    studioBannerImage?: string
    isVerified: boolean
    location: string
    tagline: string
    averageRating: number
    totalReviews: number
    stats: {
      totalBookings: number
      yearsActive: number
      happyClients: number
    }
  }
  isLiked: boolean
  setIsLiked: (liked: boolean) => void
}

export default function PhotographerHeader({ photographer, isLiked, setIsLiked }: PhotographerHeaderProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${photographer.name} - Professional Photographer`,
          text: photographer.tagline,
          url: window.location.href,
        })                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard with proper check
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(window.location.href)
          alert('Link copied to clipboard!')
        } else {
          // Fallback for older browsers or non-secure contexts
          const textArea = document.createElement('textarea')
          textArea.value = window.location.href
          textArea.style.position = 'fixed'
          textArea.style.left = '-999999px'
          textArea.style.top = '-999999px'
          document.body.appendChild(textArea)
          textArea.focus()
          textArea.select()
          document.execCommand('copy')
          textArea.remove()
          alert('Link copied to clipboard!')
        }
      } catch (error) {
        console.error('Error copying to clipboard:', error)
        alert('Failed to copy link. Please copy the URL manually.')
      }
    }
  }

  return (
    <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
      {/* Studio Banner Background */}
      {photographer.studioBannerImage && (
        <div className="absolute inset-0">
          <Image
            src={photographer.studioBannerImage}
            alt={`${photographer.name} studio`}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
      )}

      {/* Background Pattern (fallback) */}
      {!photographer.studioBannerImage && (
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          ></div>
        </div>
      )}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
          {/* Profile Photo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="relative w-32 h-32 lg:w-40 lg:h-40">
              {photographer.profilePhoto && photographer.profilePhoto.trim() !== '' ? (
                <Image
                  src={photographer.profilePhoto}
                  alt={photographer.name}
                  fill
                  className="rounded-full object-cover border-4 border-white/20"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-4 border-white/20 flex items-center justify-center">
                  <span className="text-white text-4xl lg:text-5xl font-bold">
                    {(photographer.studioName || photographer.name).charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {photographer.isVerified && (
                <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-2">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
          </motion.div>

          {/* Main Info */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex-1"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl lg:text-4xl font-bold">
                    {photographer.studioName && photographer.studioName.trim() !== '' 
                      ? photographer.studioName
                      : photographer.name && photographer.name.trim() !== ''
                        ? photographer.name
                        : 'Professional Photographer'
                    }
                  </h1>
                  {photographer.isVerified && (
                    <Badge className="bg-blue-500 hover:bg-blue-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 text-gray-300 mb-3">
                  <MapPin className="w-4 h-4" />
                  <span>{photographer.location}</span>
                </div>

                {/* Rating */}
                {photographer.averageRating > 0 && (
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${i < Math.floor(photographer.averageRating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-400'
                              }`}
                          />
                        ))}
                      </div>
                      <span className="text-lg font-semibold">{photographer.averageRating}</span>
                      <span className="text-gray-300">({photographer.totalReviews} reviews)</span>
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 max-w-md">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Camera className="w-5 h-5 text-blue-400 mr-1" />
                      <span className="text-2xl font-bold">{photographer.stats.totalBookings}+</span>
                    </div>
                    <p className="text-sm text-gray-300">Bookings</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Award className="w-5 h-5 text-yellow-400 mr-1" />
                      <span className="text-2xl font-bold">{photographer.stats.yearsActive}</span>
                    </div>
                    <p className="text-sm text-gray-300">Years Active</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Users className="w-5 h-5 text-green-400 mr-1" />
                      <span className="text-2xl font-bold">{photographer.stats.happyClients}+</span>
                    </div>
                    <p className="text-sm text-gray-300">Happy Clients</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsLiked(!isLiked)}
                  className="bg-transparent border border-white/30 text-white hover:bg-white/20 hover:border-white/50 hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current text-red-400' : ''}`} />
                  {isLiked ? 'Liked' : 'Like'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="bg-transparent border border-white/30 text-white hover:bg-white/20 hover:border-white/50 hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}