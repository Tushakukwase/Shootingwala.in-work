import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Star, Camera } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface PhotographerCardProps {
  photographer: {
    _id: string
    name: string
    studioName?: string
    studioBannerImage?: string
    location: string
    rating: number
    totalReviews: number
    startingPrice?: number
    isVerified?: boolean
    specializations?: string[]
    experience?: number
    // Add categories property
    categories?: string[]
  }
}

export function PhotographerCard({ photographer }: PhotographerCardProps) {
  // Function to render star ratings
  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 fill-yellow-400 text-yellow-400" />)
    }
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />)
    }
    
    return stars
  }

  // Get categories/tags to display (prioritize categories over specializations)
  const displayCategories = photographer.categories || photographer.specializations || [];

  return (
    <Link 
      href={`/photographer/${photographer._id}`} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block h-full"
    >
      <Card className="overflow-hidden bg-white border-2 border-transparent shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer h-full hover:border-yellow-400 hover:bg-yellow-50">
        {/* Studio Banner Image */}
        <div className="relative h-48 w-full overflow-hidden">
          {photographer.studioBannerImage ? (
            <Image
              src={photographer.studioBannerImage}
              alt={`${photographer.studioName || photographer.name} - Studio Banner`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="bg-gradient-to-br from-orange-100 to-purple-100 w-full h-full flex items-center justify-center">
              <Camera className="w-12 h-12 text-gray-400" />
            </div>
          )}
          
          {/* Rating Badge with Stars - Top Right */}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-sm font-semibold shadow-sm flex items-center">
            <div className="flex mr-1">
              {renderStars(photographer.rating)}
            </div>
            <span className="text-gray-900 ml-1">
              {photographer.rating.toFixed(1)}
            </span>
            {photographer.totalReviews > 0 && (
              <span className="text-gray-600 text-xs ml-1">
                ({photographer.totalReviews})
              </span>
            )}
          </div>
          
          {/* Verified Badge */}
          {photographer.isVerified && (
            <div className="absolute top-3 left-3 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              ✓ Verified
            </div>
          )}
        </div>
        
        {/* Studio Information */}
        <CardContent className="p-4 space-y-3">
          {/* Studio Name & Location */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
              {photographer.studioName || photographer.name}
            </h3>
            <p className="text-sm text-gray-600 flex items-center">
              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="truncate">{photographer.location || 'Location not specified'}</span>
            </p>
          </div>
          
          {/* Categories/Tags */}
          {displayCategories && displayCategories.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {displayCategories
                .slice(0, 4) // Show up to 4 categories
                .map((category: string, index: number) => (
                  <span 
                    key={index}
                    className="inline-block bg-gradient-to-r from-blue-100 to-indigo-100 text-gray-800 text-xs px-2 py-1 rounded-full font-medium"
                  >
                    {category}
                  </span>
                ))
              }
            </div>
          )}
          
          {/* Experience & Pricing */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-3">
              {photographer.experience && photographer.experience > 0 && (
                <span className="text-gray-600">
                  📅 {photographer.experience}+ years
                </span>
              )}
            </div>
            <div className="text-right">
              {/* Only show price if it exists and is greater than 0 */}
              {photographer.startingPrice && photographer.startingPrice > 0 ? (
                <>
                  <span className="text-lg font-bold text-gray-900">
                    ₹{photographer.startingPrice.toLocaleString()}+
                  </span>
                  <p className="text-xs text-gray-500">Starting from</p>
                </>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}