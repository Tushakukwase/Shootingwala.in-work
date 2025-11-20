"use client"

import NextImage from "next/image"
import { Star, MapPin, Award, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"

function WeddingPhotographersContent() {
  const searchParams = useSearchParams();
  const cityParam = searchParams.get("city");
  const categoryParam = searchParams.get("category");

  const [selectedCity, setSelectedCity] = useState(cityParam || "")
  const [currentPage, setCurrentPage] = useState(1)
  const [cities, setCities] = useState<{ name: string }[]>([]);
  const [photographers, setPhotographers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/cities').then(res => res.json()),
      fetch('/api/photographers').then(res => res.json())
    ])
    .then(([citiesData, photographersData]) => {
      setCities(citiesData.cities || []);
      setPhotographers(photographersData.photographers || []);
      setLoading(false);
    })
    .catch(() => {
      setLoading(false);
    });
  }, []);

  // Update selectedCity when URL params change
  useEffect(() => {
    if (cityParam) {
      setSelectedCity(cityParam);
    }
  }, [cityParam]);

  // Filter photographers by city or category if present
  let filteredPhotographers = photographers;
  
  // If category parameter is present, filter by category
  if (categoryParam) {
    filteredPhotographers = filteredPhotographers.filter(
      (p) => Array.isArray(p.categories) && p.categories.some((c: string) => 
        c.toLowerCase().includes(categoryParam.toLowerCase())
      )
    );
  }
  
  // If city parameter is present, filter by city
  if (cityParam) {
    filteredPhotographers = filteredPhotographers.filter(
      (p) => p.location && p.location.toLowerCase().includes(cityParam.toLowerCase())
    );
  }
  
  // If no URL parameters but selectedCity is set (from city filter), filter by that
  if (!cityParam && !categoryParam && selectedCity) {
    filteredPhotographers = filteredPhotographers.filter(
      (p) => p.location && p.location.toLowerCase().includes(selectedCity.toLowerCase())
    );
  }

  const reviews = [
    {
      id: 1,
      name: "Anita Sharma",
      date: "2 days ago",
      avatar: "/placeholder.svg?height=40&width=40",
      title: "Amazing wedding photography experience!",
      preview:
        "Rajesh and his team captured our special day perfectly. The photos are stunning and we couldn't be happier with the results...",
      rating: 5,
    },
    {
      id: 2,
      name: "Rohit Gupta",
      date: "1 week ago",
      avatar: "/placeholder.svg?height=40&width=40",
      title: "Professional and creative work",
      preview:
        "Priya's team was incredibly professional throughout our wedding. They captured every emotion and moment beautifully...",
      rating: 5,
    },
    {
      id: 3,
      name: "Sneha Patel",
      date: "2 weeks ago",
      avatar: "/placeholder.svg?height=40&width=40",
      title: "Exceeded our expectations",
      preview:
        "Arjun's creative approach to photography made our wedding album unique. The candid shots are absolutely gorgeous...",
      rating: 4,
    },
    {
      id: 4,
      name: "Karthik Reddy",
      date: "3 weeks ago",
      avatar: "/placeholder.svg?height=40&width=40",
      title: "Worth every penny!",
      preview:
        "Meera's attention to detail is remarkable. She captured the traditional elements of our South Indian wedding perfectly...",
      rating: 5,
    },
  ]

  const totalPages = 5

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* City Filter Scrollbar */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Choose Your City</h2>
          <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide">
            {cities.map((city, index) => (
              <button
                key={city._id || city.name || `city-${index}`}
                onClick={() => setSelectedCity(city.name)}
                className={`flex-shrink-0 flex flex-col items-center p-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                  selectedCity === city.name
                    ? "bg-blue-500 text-white shadow-lg"
                    : "bg-white text-gray-700 shadow-md hover:shadow-lg"
                }`}
              >
                {city.image ? (
                  <img
                    src={city.image}
                    alt={city.name}
                    className="w-12 h-12 object-cover rounded-full mb-2 border border-gray-200"
                  />
                ) : (
                  <span className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-200 mb-2 text-xl font-bold">
                    {city.name.charAt(0)}
                  </span>
                )}
                <span className="text-sm font-medium whitespace-nowrap">{city.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filter Header */}
        {(categoryParam || cityParam) && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900">
                  {categoryParam && `Category: ${categoryParam}`}
                  {categoryParam && cityParam && " & "}
                  {cityParam && `City: ${cityParam}`}
                </h3>
                <p className="text-blue-700 text-sm">
                  Showing {filteredPhotographers.length} photographer{filteredPhotographers.length !== 1 ? 's' : ''} 
                  {categoryParam && ` in ${categoryParam}`}
                  {cityParam && ` from ${cityParam}`}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedCity("");
                  window.history.pushState({}, '', '/wedding-photographers');
                  window.location.reload();
                }}
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}

        {/* Photographer Listings Grid */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {categoryParam ? `${categoryParam} Photographers` : 
               cityParam ? `Photographers in ${cityParam}` : 
               "Wedding Photographers"}
            </h2>
            <p className="text-gray-600">{filteredPhotographers.length} photographers found</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPhotographers.map((photographer, index) => (
              <Card
                key={photographer._id || photographer.id || `photographer-${index}`}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer bg-white"
              >
                <CardContent className="p-0">
                  <div className="relative h-48 bg-gradient-to-br from-yellow-200 to-yellow-400">
                    <NextImage
                      src={photographer.image || "/placeholder.svg"}
                      alt={photographer.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="bg-white/90 text-gray-800">
                        <Award className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">{photographer.name}</h3>

                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm">{photographer.location}</span>
                    </div>

                    <div className="flex items-center mb-3">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="ml-1 font-semibold text-gray-900">{photographer.rating}</span>
                        <span className="ml-1 text-gray-600 text-sm">({photographer.reviews} reviews)</span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <span className="text-xl font-bold text-gray-900">{photographer.price}</span>
                      <span className="text-gray-600 text-sm ml-1">per day</span>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-2">
                      {photographer.tags && photographer.tags.map((tag, index) => (
                        <Badge
                          key={`tag-${photographer._id || photographer.id || index}-${index}`}
                          variant="outline"
                          className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    {photographer.categories && photographer.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {photographer.categories.map((category, index) => (
                          <Badge
                            key={`category-${photographer._id || photographer.id || index}-${index}`}
                            variant="outline"
                            className="text-xs bg-orange-50 text-orange-700 border-orange-200"
                          >
                            {category}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>

            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={currentPage === page ? "bg-blue-500 hover:bg-blue-600" : ""}
                >
                  {page}
                </Button>
              )
            })}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Latest Reviews</h2>

          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="flex space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <NextImage
                      src={review.avatar || "/placeholder.svg"}
                      alt={review.name}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{review.name}</h4>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={`star-${review.id}-${i}`} className="w-4 h-4 text-yellow-400 fill-current" />
                          ))}
                        </div>
                        <span className="text-gray-500 text-sm flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {review.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  <h5 className="font-medium text-gray-900 mb-1">{review.title}</h5>
                  <p className="text-gray-600 text-sm line-clamp-2">{review.preview}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-6">
            <Button variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-50 bg-transparent">
              View All Reviews
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function WeddingPhotographersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading photographers...</p>
        </div>
      </div>
    }>
      <WeddingPhotographersContent />
    </Suspense>
  )
} 