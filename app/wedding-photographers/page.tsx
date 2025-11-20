"use client"

import NextImage from "next/image"
import { Star, MapPin, Award, Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState, useEffect, Suspense, useRef } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { PhotographerCard } from "@/components/photographer/photographer-card"

interface City {
  _id?: string;
  id?: string;
  name: string;
  image?: string;
  photographerCount?: number;
}

interface Photographer {
  _id?: string;
  id?: string;
  name: string;
  location: string;
  rating: number;
  totalReviews?: number;
  price?: string;
  tags?: string[];
  categories?: string[];
  studioBannerImage?: string;
  bannerImage?: string;
  image?: string;
  studioName?: string;
  startingPrice?: number;
  isVerified?: boolean;
  experience?: number;
}

function WeddingPhotographersContent() {
  const searchParams = useSearchParams();
  const cityParam = searchParams.get("city");
  const categoryParam = searchParams.get("category");
  const cityContainerRef = useRef<HTMLDivElement>(null);

  console.log('URL Parameters - city:', cityParam, 'category:', categoryParam);

  const [selectedCity, setSelectedCity] = useState(cityParam || "")
  const [currentPage, setCurrentPage] = useState(1)
  const [cities, setCities] = useState<City[]>([]);
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Fetch all admin-approved cities and photographers
  useEffect(() => {
    console.log('Fetching cities and photographers');
    
    // Fetch homepage items API which properly filters cities
    fetch('/api/homepage-items')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          // Only show cities that are approved and marked to show on home page
          const approvedCities = data.data.cities || [];
          setCities(approvedCities);
        } else {
          // Fallback to cities API if homepage-items fails
          fetch('/api/cities')
            .then(res => res.json())
            .then(citiesData => {
              // Only show cities with show_on_home = true
              const homeCities = (citiesData.cities || []).filter((city: any) => city.show_on_home === true);
              setCities(homeCities);
            })
            .catch(error => {
              console.error('Error fetching cities:', error);
              setCities([]);
            });
        }
      })
      .catch((error) => {
        console.error('Error fetching homepage items:', error);
        // Fallback to cities API if homepage-items fails
        fetch('/api/cities')
          .then(res => res.json())
          .then(citiesData => {
            // Only show cities with show_on_home = true
            const homeCities = (citiesData.cities || []).filter((city: any) => city.show_on_home === true);
            setCities(homeCities);
          })
          .catch(error => {
            console.error('Error fetching cities:', error);
            setCities([]);
          });
      });
    
    // Fetch photographers with pagination and filters
    const fetchPhotographers = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        
        // Add filters if they exist
        if (categoryParam) {
          params.append('category', categoryParam);
        }
        
        // Add pagination
        params.append('page', '1');
        params.append('limit', '50'); // Limit to 50 photographers initially
        
        // Only fetch photographers for the selected city/category
        const response = await fetch(`/api/photographers?${params}`);
        const data = await response.json();
        
        if (data.success) {
          setPhotographers(data.photographers || []);
        } else {
          setPhotographers([]);
        }
      } catch (error) {
        console.error('Error fetching photographers:', error);
        setPhotographers([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPhotographers();
  }, [categoryParam]);

  // Update photographers when category changes
  useEffect(() => {
    if (categoryParam) {
      // Fetch photographers for the selected category
      const fetchCategoryPhotographers = async () => {
        try {
          setLoading(true);
          const params = new URLSearchParams();
          params.append('category', categoryParam);
          params.append('page', '1');
          params.append('limit', '50');
          
          const response = await fetch(`/api/photographers?${params}`);
          const data = await response.json();
          
          if (data.success) {
            setPhotographers(data.photographers || []);
          } else {
            setPhotographers([]);
          }
        } catch (error) {
          console.error('Error fetching photographers for category:', error);
          setPhotographers([]);
        } finally {
          setLoading(false);
        }
      };
      
      fetchCategoryPhotographers();
    }
  }, [categoryParam]);

  // Log cities state changes
  useEffect(() => {
    console.log('Cities state updated:', cities);
  }, [cities]);

  // Log selected city state changes
  useEffect(() => {
    console.log('Selected city state updated:', selectedCity);
  }, [selectedCity]);

  // Handle city selection with URL update and fetch photographers for that city
  const handleCitySelect = async (cityName: string) => {
    console.log('Selecting city:', cityName);
    console.log('Current cities in state:', cities.map(c => c.name));
    setSelectedCity(cityName);
    
    // Update URL without page reload
    const url = new URL(window.location.href);
    url.searchParams.set('city', cityName);
    window.history.pushState({}, '', url.toString());
    
    // Fetch photographers for the selected city
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('city', cityName);
      params.append('page', '1');
      params.append('limit', '50');
      
      // Also apply category filter if present
      if (categoryParam) {
        params.append('category', categoryParam);
      }
      
      const response = await fetch(`/api/photographers?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setPhotographers(data.photographers || []);
      } else {
        setPhotographers([]);
      }
    } catch (error) {
      console.error('Error fetching photographers for city:', error);
      setPhotographers([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle clearing filters
  const handleClearFilters = async () => {
    setSelectedCity("");
    const url = new URL(window.location.href);
    url.searchParams.delete('city');
    url.searchParams.delete('category');
    window.history.pushState({}, '', url.toString());
    
    // Fetch all photographers
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', '1');
      params.append('limit', '50');
      
      const response = await fetch(`/api/photographers?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setPhotographers(data.photographers || []);
      } else {
        setPhotographers([]);
      }
    } catch (error) {
      console.error('Error fetching all photographers:', error);
      setPhotographers([]);
    } finally {
      setLoading(false);
    }
  };

  // Scroll functions for city selection
  const scrollLeft = () => {
    console.log('Scrolling left');
    if (cityContainerRef.current) {
      cityContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    console.log('Scrolling right');
    if (cityContainerRef.current) {
      cityContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  // Filter photographers based on selected city and category
  const filteredPhotographers = photographers.filter(photographer => {
    // Filter by city if selected
    const cityMatch = selectedCity 
      ? (photographer.location && photographer.location.toLowerCase() === selectedCity.toLowerCase())
      : true;
    
    // Filter by category if selected
    const categoryMatch = categoryParam
      ? (photographer.categories && 
         Array.isArray(photographer.categories) && 
         photographer.categories.some((cat: string) => 
           cat.toLowerCase() === categoryParam.toLowerCase()))
      : true;
    
    return cityMatch && categoryMatch;
  });

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
        {/* City Selection Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">Search Your Cities</h2>
          
          {/* Scrollable City Selection */}
          <div className="relative group">
            {/* Left Scroll Button */}
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity duration-300 hover:bg-white"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-6 h-6 text-gray-800" />
            </button>
            
            {/* Right Scroll Button */}
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity duration-300 hover:bg-white"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-6 h-6 text-gray-800" />
            </button>
            
            {/* City List */}
            <div 
              ref={cityContainerRef}
              className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide px-10"
              style={{ cursor: 'grab' }}
            >
              {cities.map((city, index) => (
                <button
                  key={`city-${city._id || city.id || city.name || index}`}
                  onClick={() => handleCitySelect(city.name)}
                  className={`flex-shrink-0 flex flex-col items-center p-5 rounded-2xl transition-all duration-300 hover:shadow-xl min-w-[120px] ${
                    selectedCity === city.name
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105"
                      : "bg-white text-gray-700 shadow-md hover:shadow-lg"
                  }`}
                >
                  {city.image ? (
                    <div className="relative w-16 h-16 mb-3">
                      <NextImage
                        src={city.image}
                        alt={city.name}
                        fill
                        className="object-cover rounded-full border-2 border-white"
                      />
                      {selectedCity === city.name && (
                        <div className="absolute inset-0 rounded-full border-2 border-yellow-400"></div>
                      )}
                    </div>
                  ) : (
                    <div className={`w-16 h-16 rounded-full mb-3 flex items-center justify-center text-xl font-bold ${
                      selectedCity === city.name 
                        ? "bg-white/20 text-white" 
                        : "bg-gray-200 text-gray-700"
                    }`}>
                      {city.name.charAt(0)}
                    </div>
                  )}
                  <span className="text-sm font-semibold text-center">{city.name}</span>
                  {city.photographerCount !== undefined && (
                    <span className="text-xs text-gray-500 mt-1">{city.photographerCount} photographer{city.photographerCount !== 1 ? 's' : ''}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Selected City Header */}
        {selectedCity && (
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Photographers in <span className="text-blue-600">{selectedCity}</span>
                </h1>
                <p className="text-gray-600 mt-2">
                  {filteredPhotographers.length} photographer{filteredPhotographers.length !== 1 ? 's' : ''} available in {selectedCity}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                Clear Selection
              </Button>
            </div>
          </div>
        )}

        {/* Photographer Listings Grid */}
        <div className="mb-12">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading photographers...</span>
            </div>
          ) : filteredPhotographers.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPhotographers.map((photographer, index) => (
                  <PhotographerCard 
                    key={photographer._id || photographer.id || `photographer-${index}`}
                    photographer={{
                      _id: (photographer._id || photographer.id) as string,
                      name: photographer.name,
                      studioName: photographer.studioName || photographer.name,
                      studioBannerImage: photographer.studioBannerImage || photographer.bannerImage || photographer.image,
                      location: photographer.location || 'Location not specified',
                      rating: photographer.rating || 0,
                      totalReviews: photographer.totalReviews || 0,
                      startingPrice: photographer.startingPrice || (photographer.price ? parseInt(photographer.price) : undefined),
                      isVerified: photographer.isVerified || false,
                      specializations: photographer.categories || photographer.tags || [],
                      experience: photographer.experience || 0
                    }} 
                  />
                ))}
              </div>
            </>
          ) : selectedCity && filteredPhotographers.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-white rounded-2xl shadow-sm border p-12 max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📸</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Photographers Found</h3>
                <p className="text-gray-500">
                  We couldn't find any photographers in {selectedCity}. Try selecting another city.
                </p>
              </div>
            </div>
          ) : categoryParam && filteredPhotographers.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-white rounded-2xl shadow-sm border p-12 max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📸</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Photographers Found</h3>
                <p className="text-gray-500">
                  We couldn't find any photographers for the category "{categoryParam}". Try selecting another category.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-white rounded-2xl shadow-sm border p-12 max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏙️</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a City or Category</h3>
                <p className="text-gray-500">
                  Choose a city from the list above or a category from the homepage to see photographers.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Latest Reviews</h2>

          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="flex space-x-6 p-6 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <NextImage
                      src={review.avatar || "/placeholder.svg"}
                      alt={review.name}
                      width={64}
                      height={64}
                      className="rounded-full"
                    />
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">{review.name}</h4>
                      <div className="flex items-center space-x-3 mt-1">
                        <div className="flex items-center">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={`star-${review.id}-${i}`} className="w-5 h-5 text-yellow-400 fill-current" />
                          ))}
                        </div>
                        <span className="text-gray-500 text-sm flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {review.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  <h5 className="font-medium text-gray-900 text-lg mb-2">{review.title}</h5>
                  <p className="text-gray-600">{review.preview}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-50 bg-transparent px-8 py-3">
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