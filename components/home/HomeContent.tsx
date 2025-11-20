"use client"

import NextImage from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { HomeContentSkeleton } from "./SkeletonLoader"
import { PhotographerCard } from "@/components/photographer/photographer-card"
import ClientCache from "@/lib/cache-utils"


export function HomeContent() {
  const { user, isAuthenticated } = useAuth()
  const [categoriesScroll, setCategoriesScroll] = useState(0)
  const [citiesScroll, setCitiesScroll] = useState(0)
  const [categories, setCategories] = useState<{ name: string; image: string }[]>([])
  const [cities, setCities] = useState<{ name: string; image: string }[]>([])
  const [stories, setStories] = useState<{ _id?: string; title: string; content: string; imageUrl: string; date: string }[]>([])
  const [galleryImages, setGalleryImages] = useState<{ category: string; imageUrl: string; uploaderName: string }[]>([])
  const [galleryCategories, setGalleryCategories] = useState<{ name: string; imageCount: number; sampleImage: string; allImages?: string[]; sources?: string[] }[]>([])
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0)
  const [approvedPhotographers, setApprovedPhotographers] = useState<any[]>([])
  const [userPreferences, setUserPreferences] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const categoriesContainerRef = useRef<HTMLDivElement>(null);
  const citiesContainerRef = useRef<HTMLDivElement>(null);
  const galleryScrollRef = useRef<HTMLDivElement>(null);
  const storiesScrollRef = useRef<HTMLDivElement>(null);
  const storiesIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [categoriesAnimationId, setCategoriesAnimationId] = useState<number | null>(null);
  const [citiesAnimationId, setCitiesAnimationId] = useState<number | null>(null);
  const [galleryAnimationId, setGalleryAnimationId] = useState<number | null>(null);
  const [storiesAnimationId, setStoriesAnimationId] = useState<number | null>(null);
  const [albumData, setAlbumData] = useState<{ imageUrl: string | null; title: string; description: string }>({
    imageUrl: null,
    title: '',
    description: ''
  })
  const [invitationData, setInvitationData] = useState<{ 
    imageUrl: string | null; 
    eventTitle: string; 
    eventDate: string; 
    eventLocation: string; 
    description: string 
  }>({
    imageUrl: null,
    eventTitle: '',
    eventDate: '',
    eventLocation: '',
    description: ''
  })
  const [expandedAlbum, setExpandedAlbum] = useState(false)
  const [expandedInvitation, setExpandedInvitation] = useState(false)
  
  // Add cache for API responses
  const [cache, setCache] = useState<Record<string, any>>({})
  const [cacheTimestamps, setCacheTimestamps] = useState<Record<string, number>>({})
  
  // Scroll position preservation
  const scrollPositions = useRef<Record<string, number>>({
    window: 0,
    categories: 0,
    cities: 0,
    gallery: 0,
    stories: 0
  });

  // Cache timeout (30 seconds for dynamic data, 5 minutes for static data)
  const CACHE_TIMEOUT_DYNAMIC = 30 * 1000
  const CACHE_TIMEOUT_STATIC = 5 * 60 * 1000

  // Save scroll positions before component unmounts
  useEffect(() => {
    const saveScrollPositions = () => {
      scrollPositions.current = {
        window: window.scrollY,
        categories: categoriesContainerRef.current?.scrollLeft || 0,
        cities: citiesContainerRef.current?.scrollLeft || 0,
        gallery: galleryScrollRef.current?.scrollLeft || 0,
        stories: storiesScrollRef.current?.scrollLeft || 0
      };
    };

    // Save positions when navigating away
    window.addEventListener('beforeunload', saveScrollPositions);
    
    return () => {
      window.removeEventListener('beforeunload', saveScrollPositions);
    };
  }, []);

  // Restore scroll positions after component mounts
  useEffect(() => {
    // Restore scroll positions
    if (scrollPositions.current.window > 0) {
      window.scrollTo(0, scrollPositions.current.window);
    }
    
    // Restore horizontal scroll positions with a small delay to ensure DOM is ready
    setTimeout(() => {
      if (categoriesContainerRef.current && scrollPositions.current.categories > 0) {
        categoriesContainerRef.current.scrollLeft = scrollPositions.current.categories;
      }
      if (citiesContainerRef.current && scrollPositions.current.cities > 0) {
        citiesContainerRef.current.scrollLeft = scrollPositions.current.cities;
      }
      if (galleryScrollRef.current && scrollPositions.current.gallery > 0) {
        galleryScrollRef.current.scrollLeft = scrollPositions.current.gallery;
      }
      if (storiesScrollRef.current && scrollPositions.current.stories > 0) {
        storiesScrollRef.current.scrollLeft = scrollPositions.current.stories;
      }
    }, 100);
  }, []);

  // Function to scroll categories left
  const scrollCategoriesLeft = () => {
    if (categoriesContainerRef.current) {
      categoriesContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  // Function to scroll categories right
  const scrollCategoriesRight = () => {
    if (categoriesContainerRef.current) {
      categoriesContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  // Function to scroll cities left
  const scrollCitiesLeft = () => {
    if (citiesContainerRef.current) {
      citiesContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  // Function to scroll cities right
  const scrollCitiesRight = () => {
    if (citiesContainerRef.current) {
      citiesContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  // Function to scroll stories left
  const scrollStoriesLeft = () => {
    if (storiesScrollRef.current) {
      storiesScrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  // Function to scroll stories right
  const scrollStoriesRight = () => {
    if (storiesScrollRef.current) {
      storiesScrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  // Function to scroll gallery left
  const scrollGalleryLeft = () => {
    if (galleryScrollRef.current) {
      galleryScrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  // Enhanced cached fetch function with client-side cache
  const cachedFetch = async (url: string, cacheKey: string, forceRefresh = false, isStatic = false) => {
    const now = Date.now()
    const CACHE_TIMEOUT = isStatic ? CACHE_TIMEOUT_STATIC : CACHE_TIMEOUT_DYNAMIC
    
    // Check client-side cache first
    if (!forceRefresh) {
      const cachedData = ClientCache.get(cacheKey);
      if (cachedData) {
        console.log(`Using client-side cached data for ${cacheKey}`);
        return cachedData;
      }
    }
    
    // Check if we have valid cached data
    if (!forceRefresh && cache[cacheKey] && cacheTimestamps[cacheKey]) {
      const age = now - cacheTimestamps[cacheKey]
      if (age < CACHE_TIMEOUT) {
        console.log(`Using cached data for ${cacheKey} (age: ${age}ms)`)
        return cache[cacheKey]
      }
    }
    
    // Fetch fresh data
    try {
      console.log(`Fetching fresh data for ${cacheKey}`)
      const response = await fetch(url)
      const data = await response.json()
      
      // Update both caches
      ClientCache.set(cacheKey, data, CACHE_TIMEOUT);
      setCache(prev => ({ ...prev, [cacheKey]: data }))
      setCacheTimestamps(prev => ({ ...prev, [cacheKey]: now }))
      
      return data
    } catch (error) {
      console.error(`Error fetching ${url}:`, error)
      // Return cached data even if stale if available
      if (cache[cacheKey]) {
        console.log(`Using stale cached data for ${cacheKey}`)
        return cache[cacheKey]
      }
      throw error
    }
  }

  // Function to get photographer recommendations
  const fetchApprovedPhotographers = async () => {
    try {
      let photographers: any[] = [];
      
      if (isAuthenticated && user) {
        // Try to fetch user preferences and activity first
        try {
          const preferencesData = await cachedFetch(`/api/user-preferences/${user.id}`, `user-preferences-${user.id}`);
          if (preferencesData) {
            setUserPreferences(preferencesData);
            
            // If user has preferences, fetch personalized recommendations
            if (preferencesData && !preferencesData.isNewUser && 
                (preferencesData.preferredCategories?.length > 0 || 
                 preferencesData.preferredLocation || 
                 preferencesData.priceRange)) {
              
              const params = new URLSearchParams({
                approved: 'true',
                userId: user.id,
                personalized: 'true'
              });
              
              if (preferencesData.preferredCategories?.length > 0) {
                params.append('categories', preferencesData.preferredCategories.join(','));
              }
              if (preferencesData.preferredLocation) {
                params.append('location', preferencesData.preferredLocation);
              }
              if (preferencesData.priceRange) {
                params.append('priceRange', preferencesData.priceRange);
              }
              
              const photographersData = await cachedFetch(`/api/photographers?${params.toString()}&page=1&limit=12`, `photographers-personalized-${params.toString()}`);
              if (photographersData) {
                photographers = photographersData.photographers || [];
              }
            }
          }
        } catch (prefError) {
          // Continue with default fetch if preferences fail
          console.warn('Failed to fetch user preferences:', prefError);
        }
      }
      
      // If no personalized results or user not authenticated, fetch all approved photographers
      if (photographers.length === 0) {
        const data = await cachedFetch('/api/photographers?approved=true&page=1&limit=12', 'photographers-approved');
        if (data) {
          photographers = data.photographers || [];
        }
      }
      
      // Limit to first 12 photographers for performance
      photographers = photographers.slice(0, 12);
      
      // ENHANCED FIX: Prioritize real studio names from database
      photographers = photographers.map((p: any) => {
        // Priority: Real studio name from database
        let studioName;
        
        if (p.studioName && p.studioName.trim() !== '') {
          // Use real studio name from database
          studioName = p.studioName;
        } else {
          // Only generate fallback if no real studio name exists
          studioName = p.name && p.name !== p.email ? 
                      `${p.name} Photography Studio` : 
                      p.email ? `${p.email.split('@')[0]} Photography Studio` : 
                      'Professional Photography Studio';
        }
        
        // Get best available image for studio banner (prioritize studio banner)
        const studioBannerImage = p.studioBannerImage || 
                                 p.bannerImage || 
                                 p.image || 
                                 p.profileImage || 
                                 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=300&fit=crop&crop=center';
        
        // Find the lowest package price if packages exist
        let startingPrice = null;
        if (p.packages && p.packages.length > 0) {
          const activePackages = p.packages.filter((pkg: any) => pkg.isActive !== false);
          if (activePackages.length > 0) {
            const prices = activePackages.map((pkg: any) => pkg.price).filter((price: number) => !isNaN(price));
            if (prices.length > 0) {
              startingPrice = Math.min(...prices);
            }
          }
        }
        
        return {
          ...p,
          studioName,
          studioBannerImage,
          // Ensure startingPrice is properly set (null if no packages)
          startingPrice: startingPrice,
          // Use photographer's actual categories
          specializations: p.categories || p.specializations || [],
          // Ensure name is clean (not email)
          displayName: p.name && p.name !== p.email ? p.name : p.email?.split('@')[0] || 'Photographer'
        };
      });

      // Apply smart sorting for better recommendations
      const sortedPhotographers = photographers.sort((a: any, b: any) => {
        // Prioritize photographers with higher ratings
        if (b.rating !== a.rating) {
          return (b.rating || 0) - (a.rating || 0);
        }
        // Then by experience
        if (b.experience !== a.experience) {
          return (b.experience || 0) - (a.experience || 0);
        }
        // Finally by creation date (newer first)
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
      
      setApprovedPhotographers(sortedPhotographers);
      
    } catch (error) {
      // Silently handle error
      console.error('Error fetching photographers:', error);
      setApprovedPhotographers([]);
    }
  };

  useEffect(() => {
    // Set loading state
    setLoading(true);
    
    // Fetch all homepage data in parallel for maximum performance with caching
    const fetchData = async () => {
      try {
        const [
          homepageData,
          albumData,
          invitationData,
          storiesData,
          imagesData,
          categoriesData,
          photographerGalleriesData
        ] = await Promise.all([
          cachedFetch('/api/homepage-items', 'homepage-items', false, true),
          cachedFetch('/api/digital-album', 'digital-album', false, true),
          cachedFetch('/api/digital-invitation', 'digital-invitation', false, true),
          cachedFetch('/api/stories', 'stories'),
          cachedFetch('/api/gallery/images', 'gallery-images'),
          cachedFetch('/api/gallery/categories', 'gallery-categories', false, true),
          cachedFetch('/api/photographer-galleries', 'photographer-galleries')
        ]);

        // Process homepage items (categories and cities)
        if (homepageData.success && homepageData.data) {
          setCategories(homepageData.data.categories || [])
          setCities(homepageData.data.cities || [])
        } else {
          // Fallback if homepage-items fails
          const [categoriesRes, citiesRes] = await Promise.all([
            cachedFetch('/api/categories', 'categories', false, true),
            cachedFetch('/api/cities', 'cities', false, true)
          ]);
          
          const allCategories = categoriesRes.categories || []
          const selectedCategories = allCategories.filter((cat: any) => cat.selected)
          setCategories(selectedCategories.length > 0 ? selectedCategories : allCategories)
          
          const homeCities = (citiesRes.cities || []).filter((city: any) => city.show_on_home === true)
          setCities(homeCities)
        }
        
        // Set album and invitation data
        setAlbumData(albumData)
        setInvitationData(invitationData)
        
        // Process stories
        const allStories = storiesData.stories || []
        const homeStories = allStories
          .filter((story: any) => story.status === 'approved' && story.showOnHome)
          .map((story: any) => ({
            _id: story._id,
            title: story.title,
            content: story.content,
            imageUrl: story.imageUrl || story.coverImage || "/placeholder.svg?height=300&width=400",
            date: story.date || '',
            location: story.location || '',
            photographer: story.photographerName || story.photographer || 'Photographer'
          }))
        setStories(homeStories)
        
        // Process gallery data
        const images = imagesData.images || []
        const galleryCategories = categoriesData.categories || []
        const photographerGalleries = photographerGalleriesData.galleries || []
        
        setGalleryImages(images)
        
        // Group galleries efficiently
        const allGalleryData: { [key: string]: { images: string[], sources: string[] } } = {}
        
        galleryCategories.forEach((cat: any) => {
          const categoryImages = images.filter((img: any) => img.category === cat.name)
          if (categoryImages.length > 0) {
            allGalleryData[cat.name] = allGalleryData[cat.name] || { images: [], sources: [] }
            allGalleryData[cat.name].images.push(...categoryImages.map((img: any) => img.imageUrl))
            allGalleryData[cat.name].sources.push('Admin')
          }
        })
        
        photographerGalleries
          .filter((gallery: any) => gallery.status === 'approved' && gallery.showOnHome)
          .forEach((gallery: any) => {
            if (gallery.images && gallery.images.length > 0) {
              allGalleryData[gallery.name] = allGalleryData[gallery.name] || { images: [], sources: [] }
              allGalleryData[gallery.name].images.push(...gallery.images)
              allGalleryData[gallery.name].sources.push(gallery.photographerName || 'Photographer')
            }
          })
        
        const groupedGalleries = Object.entries(allGalleryData).map(([name, data]) => ({
          name,
          imageCount: data.images.length,
          sampleImage: data.images[0] || '/placeholder.svg?height=200&width=200',
          allImages: data.images,
          sources: [...new Set(data.sources)]
        }))
        
        setGalleryCategories(groupedGalleries)
      } catch (err) {
        console.error('Failed to load homepage data:', err)
      } finally {
        // Set loading to false when all data is fetched
        setLoading(false);
      }
    };

    fetchData();
    
    // Fetch approved photographers
    fetchApprovedPhotographers()
  }, [isAuthenticated, user?.id]);


  const nextStory = () => {
    // Not needed with continuous scrolling
  };

  const prevStory = () => {
    // Not needed with continuous scrolling
  };

  // Function to track user activity
  const trackUserActivity = async (photographerId: string, action: string) => {
    if (isAuthenticated && user) {
      try {
        await fetch(`/api/user-preferences/${user.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            photographerId,
            action,
          }),
        });
      } catch (error) {
        console.error('Failed to track user activity:', error);
      }
    }
  };


  // Continuous smooth auto-scroll for categories
  useEffect(() => {
    // Disabled continuous animation for performance improvement
    return () => {};
  }, [categories.length]);

  // Continuous smooth auto-scroll for cities
  useEffect(() => {
    // Disabled continuous animation for performance improvement
    return () => {};
  }, [cities.length]);

  // Continuous smooth auto-scroll for gallery
  useEffect(() => {
    // Disabled continuous animation for performance improvement
    return () => {};
  }, [galleryCategories.length]);

  // Continuous smooth auto-scroll for stories
  useEffect(() => {
    // Disabled continuous animation for performance improvement
    return () => {};
  }, [stories.length]);

  // Cleanup intervals and animations on unmount
  useEffect(() => {
    return () => {
      if (storiesIntervalRef.current) {
        clearInterval(storiesIntervalRef.current);
      }
    };
  }, []);

  return (
    <>
      {loading && <HomeContentSkeleton />}
      {!loading && (
        <>
          {/* Recommended For You - Recreated */}
          <section className="py-12 bg-gradient-to-br from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="space-y-8">
                {/* Section Header */}
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {isAuthenticated ? '⭐ Recommended for You' : '⭐ Featured Photography Studios'}
                  </h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    {isAuthenticated 
                      ? 'Discover talented photographers and studios based on your preferences'
                      : 'Explore our curated selection of professional photography studios and photographers'
                    }
                  </p>
                </div>
                
                {/* Photographers Grid */}
                {approvedPhotographers.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="bg-white rounded-2xl shadow-sm border p-12 max-w-md mx-auto">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">📸</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Studios Available</h3>
                      <p className="text-gray-500">
                        We're working on adding more talented photographers to our platform. Check back soon!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative group">
                    {/* Left Scroll Button */}
                    <button
                      onClick={() => {
                        const container = document.querySelector('.photographers-scroll-container');
                        if (container) {
                          container.scrollBy({ left: -300, behavior: 'smooth' });
                        }
                      }}
                      className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white"
                      aria-label="Scroll left"
                    >
                      <ChevronLeft className="w-6 h-6 text-gray-800" />
                    </button>
                    
                    {/* Right Scroll Button */}
                    <button
                      onClick={() => {
                        const container = document.querySelector('.photographers-scroll-container');
                        if (container) {
                          container.scrollBy({ left: 300, behavior: 'smooth' });
                        }
                      }}
                      className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white"
                      aria-label="Scroll right"
                    >
                      <ChevronRight className="w-6 h-6 text-gray-800" />
                    </button>
                    
                    <div className="photographers-scroll-container flex gap-4 overflow-x-auto scrollbar-hide py-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                      {approvedPhotographers.slice(0, 8).map((photographer) => (
                        <div key={photographer._id} className="flex-shrink-0 w-80 group">
                          <PhotographerCard 
                            photographer={{
                              _id: photographer._id,
                              name: photographer.name,
                              studioName: photographer.studioName || photographer.name,
                              studioBannerImage: photographer.studioBannerImage || photographer.bannerImage || photographer.image,
                              location: photographer.location || 'Location not specified',
                              rating: photographer.rating || 0,
                              totalReviews: photographer.totalReviews || 0,
                              startingPrice: photographer.startingPrice,
                              isVerified: photographer.isVerified || false,
                              // Pass both categories and specializations
                              categories: photographer.categories || [],
                              specializations: photographer.specializations || [],
                              experience: photographer.experience || 0
                            }} 
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* View All Button */}
                {approvedPhotographers.length > 0 && (
                  <div className="text-center pt-8">
                    <Link href="/photographers">
                      <Button 
                        variant="outline" 
                        size="lg"
                        className="bg-white border-2 border-gray-200 hover:border-yellow-400 hover:bg-yellow-50 text-gray-900 font-semibold px-8 py-3 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                      >
                        View All Photography Studios →
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Popular Searches Categories */}
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Popular Searches Categories</h2>
              <div className="relative group">
                {/* Left Scroll Button */}
                <button
                  onClick={scrollCategoriesLeft}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity duration-300 hover:bg-white"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-800" />
                </button>
                
                {/* Right Scroll Button */}
                <button
                  onClick={scrollCategoriesRight}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity duration-300 hover:bg-white"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-6 h-6 text-gray-800" />
                </button>
                
                <div
                  ref={categoriesContainerRef}
                  className="flex gap-5 touch-pan-x overflow-x-auto scrollbar-hide"
                  style={{ width: '100%', cursor: 'grab' }}
                  onMouseDown={(e) => {
                    // Only handle mouse down for scrolling if not on a link
                    if ((e.target as HTMLElement).closest('a')) {
                      return;
                    }
                    
                    // Pause animation on mouse down and enable manual scrolling
                    if (categoriesAnimationId) {
                      cancelAnimationFrame(categoriesAnimationId);
                      setCategoriesAnimationId(null);
                    }
                    
                    const scrollContainer = categoriesContainerRef.current;
                    if (!scrollContainer) return;
                    
                    const startX = e.pageX - scrollContainer.offsetLeft;
                    const scrollLeft = scrollContainer.scrollLeft;
                    
                    const handleMouseMove = (moveEvent: MouseEvent) => {
                      moveEvent.preventDefault();
                      const x = moveEvent.pageX - scrollContainer.offsetLeft;
                      const walk = (x - startX) * 2; // Scroll speed multiplier
                      scrollContainer.scrollLeft = scrollLeft - walk;
                    };
                    
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                      
                      // Resume animation after manual scrolling
                      setTimeout(() => {
                        if (categories.length > 0 && categoriesContainerRef.current) {
                          const scrollContainer = categoriesContainerRef.current;
                          const cardWidth = 196; // w-44 (176px) + gap-5 (20px)
                          const originalWidth = categories.length * cardWidth;
                          let scrollPosition = scrollContainer.scrollLeft;
                          let animationId: number;

                          const smoothScroll = () => {
                            scrollPosition += 0.3; // Slower, smoother continuous movement
                            
                            // Seamless loop - when reaching the end, reset to beginning
                            if (scrollPosition >= originalWidth) {
                              scrollPosition = 0;
                              scrollContainer.scrollLeft = 0;
                            } else {
                              scrollContainer.scrollLeft = scrollPosition;
                            }
                            
                            animationId = requestAnimationFrame(smoothScroll);
                            setCategoriesAnimationId(animationId);
                          };

                          animationId = requestAnimationFrame(smoothScroll);
                          setCategoriesAnimationId(animationId);
                        }
                      }, 3000); // Resume after 3 seconds of inactivity
                    };
                    
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                  onMouseEnter={() => {
                    // Pause animation on hover
                    if (categoriesAnimationId) {
                      cancelAnimationFrame(categoriesAnimationId);
                      setCategoriesAnimationId(null);
                    }
                  }}
                  onMouseLeave={() => {
                    // Resume animation when not hovering
                    if (categories.length > 0 && categoriesContainerRef.current) {
                      const scrollContainer = categoriesContainerRef.current;
                      const cardWidth = 196; // w-44 (176px) + gap-5 (20px)
                      const originalWidth = categories.length * cardWidth;
                      let scrollPosition = scrollContainer.scrollLeft;
                      let animationId: number;

                      const smoothScroll = () => {
                        scrollPosition += 0.3; // Slower, smoother continuous movement
                        
                        // Seamless loop - when reaching the end, reset to beginning
                        if (scrollPosition >= originalWidth) {
                          scrollPosition = 0;
                          scrollContainer.scrollLeft = 0;
                        } else {
                          scrollContainer.scrollLeft = scrollPosition;
                        }
                        
                        animationId = requestAnimationFrame(smoothScroll);
                        setCategoriesAnimationId(animationId);
                      };

                      animationId = requestAnimationFrame(smoothScroll);
                      setCategoriesAnimationId(animationId);
                    }
                  }}
                  onTouchStart={(e) => {
                    // Pause animation on touch
                    if (categoriesAnimationId) {
                      cancelAnimationFrame(categoriesAnimationId);
                      setCategoriesAnimationId(null);
                    }
                  }}
                  onTouchEnd={() => {
                    // Resume animation after touch
                    setTimeout(() => {
                      if (categories.length > 0 && categoriesContainerRef.current) {
                        const scrollContainer = categoriesContainerRef.current;
                        const cardWidth = 196; // w-44 (176px) + gap-5 (20px)
                        const originalWidth = categories.length * cardWidth;
                        let scrollPosition = scrollContainer.scrollLeft;
                        let animationId: number;

                        const smoothScroll = () => {
                          scrollPosition += 0.3; // Consistent speed
                          
                          // Seamless loop - when reaching the end, reset to beginning
                          if (scrollPosition >= originalWidth) {
                            scrollPosition = 0;
                            scrollContainer.scrollLeft = 0;
                          } else {
                            scrollContainer.scrollLeft = scrollPosition;
                          }
                          
                          animationId = requestAnimationFrame(smoothScroll);
                          setCategoriesAnimationId(animationId);
                        };

                        animationId = requestAnimationFrame(smoothScroll);
                        setCategoriesAnimationId(animationId);
                      }
                    }, 3000); // Resume after 3 seconds of inactivity
                  }}
                >
                  {/* Render categories only once */}
                  {categories.map((category, index) => (
                    <Link
                      key={`category-${category.name}-${index}`}
                      href={`/wedding-photographers?category=${encodeURIComponent(category.name)}`}
                      className="inline-block align-top flex-shrink-0 w-44"
                    >
                      <Card className="shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col transform hover:-translate-y-2 hover:scale-105 border-2 border-transparent hover:border-orange-400 bg-white hover:bg-orange-50">
                        <CardContent className="p-0 flex-grow flex flex-col">
                          <div className="relative h-36 flex-grow">
                            {category.image ? (
                              <img
                                src={category.image}
                                alt={category.name}
                                className="object-cover rounded-t-lg w-full h-full"
                              />
                            ) : (
                              <NextImage
                                src="/placeholder.svg"
                                alt={category.name}
                                fill
                                className="object-cover rounded-t-lg"
                              />
                            )}
                          </div>
                          <div className="p-4 flex items-center justify-center flex-grow">
                            <h3 className="text-sm font-semibold text-center text-gray-900">{category.name}</h3>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Popular Searches Cities */}
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Popular Searches Cities</h2>
              {cities.length > 0 ? (
                <div className="relative group">
                  {/* Left Scroll Button */}
                  <button
                    onClick={scrollCitiesLeft}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity duration-300 hover:bg-white"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-800" />
                  </button>
                  
                  {/* Right Scroll Button */}
                  <button
                    onClick={scrollCitiesRight}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity duration-300 hover:bg-white"
                    aria-label="Scroll right"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-800" />
                  </button>
                  
                  <div
                    ref={citiesContainerRef}
                    className="flex gap-5 touch-pan-x overflow-x-auto scrollbar-hide"
                    style={{ width: '100%', cursor: 'grab' }}
                    onMouseDown={(e) => {
                      // Only handle mouse down for scrolling if not on a link
                      if ((e.target as HTMLElement).closest('a')) {
                        return;
                      }
                      
                      // Pause animation on mouse down and enable manual scrolling
                      if (citiesAnimationId) {
                        cancelAnimationFrame(citiesAnimationId);
                        setCitiesAnimationId(null);
                      }
                      
                      const scrollContainer = citiesContainerRef.current;
                      if (!scrollContainer) return;
                      
                      const startX = e.pageX - scrollContainer.offsetLeft;
                      const scrollLeft = scrollContainer.scrollLeft;
                      
                      const handleMouseMove = (moveEvent: MouseEvent) => {
                        moveEvent.preventDefault();
                        const x = moveEvent.pageX - scrollContainer.offsetLeft;
                        const walk = (x - startX) * 2; // Scroll speed multiplier
                        scrollContainer.scrollLeft = scrollLeft - walk;
                      };
                      
                      const handleMouseUp = () => {
                        document.removeEventListener('mousemove', handleMouseMove);
                        document.removeEventListener('mouseup', handleMouseUp);
                        
                        // Resume animation after manual scrolling
                        setTimeout(() => {
                          if (cities.length > 0 && citiesContainerRef.current) {
                            const scrollContainer = citiesContainerRef.current;
                            const cardWidth = 196; // w-44 (176px) + gap-5 (20px)
                            const originalWidth = cities.length * cardWidth;
                            let scrollPosition = scrollContainer.scrollLeft;
                            let animationId: number;

                            const smoothScroll = () => {
                              scrollPosition += 0.3;
                              
                              if (scrollPosition >= originalWidth) {
                                scrollPosition = 0;
                                scrollContainer.scrollLeft = 0;
                              } else {
                                scrollContainer.scrollLeft = scrollPosition;
                              }
                              
                              animationId = requestAnimationFrame(smoothScroll);
                              setCitiesAnimationId(animationId);
                            };

                            animationId = requestAnimationFrame(smoothScroll);
                            setCitiesAnimationId(animationId);
                          }
                        }, 3000); // Resume after 3 seconds of inactivity
                      };
                      
                      document.addEventListener('mousemove', handleMouseMove);
                      document.addEventListener('mouseup', handleMouseUp);
                    }}
                    onMouseEnter={() => {
                      // Pause animation on hover
                      if (citiesAnimationId) {
                        cancelAnimationFrame(citiesAnimationId);
                        setCitiesAnimationId(null);
                      }
                    }}
                    onMouseLeave={() => {
                      // Resume animation when not hovering
                      if (cities.length > 0 && citiesContainerRef.current) {
                        const scrollContainer = citiesContainerRef.current;
                        const cardWidth = 196; // w-44 (176px) + gap-5 (20px)
                        const originalWidth = cities.length * cardWidth;
                        let scrollPosition = scrollContainer.scrollLeft;
                        let animationId: number;

                        const smoothScroll = () => {
                          scrollPosition += 0.3; // Slower, smoother continuous movement
                          
                          // Seamless loop - when reaching the end, reset to beginning
                          if (scrollPosition >= originalWidth) {
                            scrollPosition = 0;
                            scrollContainer.scrollLeft = 0;
                          } else {
                            scrollContainer.scrollLeft = scrollPosition;
                          }
                          
                          animationId = requestAnimationFrame(smoothScroll);
                          setCitiesAnimationId(animationId);
                        };

                        animationId = requestAnimationFrame(smoothScroll);
                        setCitiesAnimationId(animationId);
                      }
                    }}
                    onTouchStart={(e) => {
                      // Pause animation on touch
                      if (citiesAnimationId) {
                        cancelAnimationFrame(citiesAnimationId);
                        setCitiesAnimationId(null);
                      }
                    }}
                    onTouchEnd={() => {
                      // Resume animation after touch
                      setTimeout(() => {
                        if (cities.length > 0 && citiesContainerRef.current) {
                          const scrollContainer = citiesContainerRef.current;
                          const cardWidth = 196; // w-44 (176px) + gap-5 (20px)
                          const originalWidth = cities.length * cardWidth;
                          let scrollPosition = scrollContainer.scrollLeft;
                          let animationId: number;

                          const smoothScroll = () => {
                            scrollPosition += 0.3; // Consistent speed
                            
                            if (scrollPosition >= originalWidth) {
                              scrollPosition = 0;
                              scrollContainer.scrollLeft = 0;
                            } else {
                              scrollContainer.scrollLeft = scrollPosition;
                            }
                            
                            animationId = requestAnimationFrame(smoothScroll);
                            setCitiesAnimationId(animationId);
                          };

                          animationId = requestAnimationFrame(smoothScroll);
                          setCitiesAnimationId(animationId);
                        }
                      }, 3000); // Resume after 3 seconds of inactivity
                    }}
                  >
                    {/* Render cities only once */}
                    {cities.map((city, index) => (
                      <Link
                        key={`city-${city.name}-${index}`}
                        href={`/wedding-photographers?city=${encodeURIComponent(city.name)}`}
                        className="inline-block align-top flex-shrink-0 w-44"
                      >
                        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col transform hover:-translate-y-2 hover:scale-105 border-2 border-transparent hover:border-blue-400 bg-white hover:bg-blue-50">
                          <CardContent className="p-0 flex-grow flex flex-col">
                            <div className="relative h-36 flex-grow">
                              {city.image ? (
                                <NextImage
                                  src={city.image}
                                  alt={city.name}
                                  fill
                                  className="object-cover rounded-t-lg"
                                />
                              ) : (
                                <NextImage
                                  src="/placeholder.svg"
                                  alt={city.name}
                                  fill
                                  className="object-cover rounded-t-lg"
                                />
                              )}
                            </div>
                            <div className="p-4 flex items-center justify-center flex-grow">
                              <h3 className="text-sm font-semibold text-center text-gray-900">{city.name}</h3>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                // Empty state when no cities are available
                <div className="text-center py-12">
                  <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Cities Available</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    The admin hasn't added any cities yet. Check back later for popular photography destinations.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Other Services */}
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">ShootingWala Other Services</h2>
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <Card className="shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-0">
                    <div className="relative h-64">
                      <NextImage
                        src={albumData.imageUrl || "/placeholder.svg?height=300&width=400"}
                        alt="Digital Album"
                        fill
                        className="object-cover rounded-t-lg"
                      />
                    </div>
                    <div className="p-6 text-center">
                      <h3 className="text-xl font-bold mb-4 text-gray-900">
                        {albumData.title || "Digital Album"}
                      </h3>
                      <p className={`text-gray-600 mb-4 text-sm text-justify leading-relaxed ${
                        expandedAlbum ? '' : 'line-clamp-2'
                      }`}>
                        {albumData.description || "Create beautiful digital albums for your special moments. Preserve your memories in stunning digital format with customizable layouts, themes, and sharing options."}
                      </p>
                      <Button
                        variant="outline"
                        className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white bg-transparent"
                        onClick={() => setExpandedAlbum(!expandedAlbum)}
                      >
                        {expandedAlbum ? 'Show Less' : 'Know More'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                <Card className="shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-0">
                    <div className="relative h-64">
                      <NextImage
                        src={invitationData.imageUrl || "/placeholder.svg?height=300&width=400"}
                        alt="Digital Invitation"
                        fill
                        className="object-cover rounded-t-lg"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-6 text-center">
                      <h3 className="text-xl font-bold mb-4 text-gray-900">
                        {invitationData.eventTitle || "Digital Invitation"}
                      </h3>
                      <p className={`text-gray-600 mb-4 text-sm text-justify leading-relaxed ${
                        expandedInvitation ? '' : 'line-clamp-2'
                      }`}>
                        {invitationData.description || "Design stunning digital invitations for your events. Create personalized invitations with beautiful templates, custom designs, and easy sharing options for weddings, parties, and special occasions."}
                      </p>
                      {expandedInvitation && invitationData.eventDate && (
                        <p className="text-gray-500 text-xs mb-2">{invitationData.eventDate}</p>
                      )}
                      {expandedInvitation && invitationData.eventLocation && (
                        <p className="text-gray-500 text-xs mb-4">{invitationData.eventLocation}</p>
                      )}
                      <Button
                        variant="outline"
                        className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white bg-transparent"
                        onClick={() => setExpandedInvitation(!expandedInvitation)}
                      >
                        {expandedInvitation ? 'Show Less' : 'Know More'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Real Wedding Stories */}
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Real Wedding Stories</h2>
              
              {stories.length > 0 ? (
                <div className="relative group">
                  {/* Left Scroll Button */}
                  <button
                    onClick={scrollStoriesLeft}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity duration-300 hover:bg-white"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-800" />
                  </button>
                  
                  {/* Right Scroll Button */}
                  <button
                    onClick={scrollStoriesRight}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity duration-300 hover:bg-white"
                    aria-label="Scroll right"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-800" />
                  </button>
                  
                  {/* Stories Carousel */}
                  <div 
                    ref={storiesScrollRef}
                    className="flex gap-5 touch-pan-x overflow-x-auto scrollbar-hide"
                    style={{ width: '100%', cursor: 'grab' }}
                    onMouseDown={(e) => {
                      // Only handle mouse down for scrolling if not on a link
                      if ((e.target as HTMLElement).closest('a')) {
                        return;
                      }
                      
                      // Pause animation on mouse down and enable manual scrolling
                      if (storiesAnimationId) {
                        cancelAnimationFrame(storiesAnimationId);
                        setStoriesAnimationId(null);
                      }
                      
                      const scrollContainer = storiesScrollRef.current;
                      if (!scrollContainer) return;
                      
                      const startX = e.pageX - scrollContainer.offsetLeft;
                      const scrollLeft = scrollContainer.scrollLeft;
                      
                      const handleMouseMove = (moveEvent: MouseEvent) => {
                        moveEvent.preventDefault();
                        const x = moveEvent.pageX - scrollContainer.offsetLeft;
                        const walk = (x - startX) * 2; // Scroll speed multiplier
                        scrollContainer.scrollLeft = scrollLeft - walk;
                      };
                      
                      const handleMouseUp = () => {
                        document.removeEventListener('mousemove', handleMouseMove);
                        document.removeEventListener('mouseup', handleMouseUp);
                        
                        // Resume animation after manual scrolling
                        setTimeout(() => {
                          if (stories.length > 0 && storiesScrollRef.current) {
                            const scrollContainer = storiesScrollRef.current;
                            const cardWidth = 220;
                            const originalWidth = stories.length * cardWidth;
                            let scrollPosition = scrollContainer.scrollLeft;
                            let animationId: number;

                            const smoothScroll = () => {
                              scrollPosition += 0.5;
                              
                              if (scrollPosition >= originalWidth) {
                                scrollPosition = 0;
                                scrollContainer.scrollLeft = 0;
                              } else {
                                scrollContainer.scrollLeft = scrollPosition;
                              }
                              
                              animationId = requestAnimationFrame(smoothScroll);
                              setStoriesAnimationId(animationId);
                            };

                            animationId = requestAnimationFrame(smoothScroll);
                            setStoriesAnimationId(animationId);
                          }
                        }, 3000); // Resume after 3 seconds of inactivity
                      };
                      
                      document.addEventListener('mousemove', handleMouseMove);
                      document.addEventListener('mouseup', handleMouseUp);
                    }}
                    onMouseEnter={() => {
                      // Pause animation on hover
                      if (storiesAnimationId) {
                        cancelAnimationFrame(storiesAnimationId);
                        setStoriesAnimationId(null);
                      }
                    }}
                    onMouseLeave={() => {
                      // Resume animation when not hovering
                      if (stories.length > 0 && storiesScrollRef.current) {
                        const scrollContainer = storiesScrollRef.current;
                        const cardWidth = 220;
                        const originalWidth = stories.length * cardWidth;
                        let scrollPosition = scrollContainer.scrollLeft;
                        let animationId: number;

                        const smoothScroll = () => {
                          scrollPosition += 0.5;
                          
                          // Seamless loop - when reaching the end, reset to beginning
                          if (scrollPosition >= originalWidth) {
                            scrollPosition = 0;
                            scrollContainer.scrollLeft = 0;
                          } else {
                            scrollContainer.scrollLeft = scrollPosition;
                          }
                          
                          animationId = requestAnimationFrame(smoothScroll);
                          setStoriesAnimationId(animationId);
                        };

                        animationId = requestAnimationFrame(smoothScroll);
                        setStoriesAnimationId(animationId);
                      }
                    }}
                    onTouchStart={(e) => {
                      // Pause animation on touch
                      if (storiesAnimationId) {
                        cancelAnimationFrame(storiesAnimationId);
                        setStoriesAnimationId(null);
                      }
                    }}
                    onTouchEnd={() => {
                      // Resume animation after touch
                      setTimeout(() => {
                        if (stories.length > 0 && storiesScrollRef.current) {
                          const scrollContainer = storiesScrollRef.current;
                          const cardWidth = 220;
                          const originalWidth = stories.length * cardWidth;
                          let scrollPosition = scrollContainer.scrollLeft;
                          let animationId: number;

                          const smoothScroll = () => {
                            scrollPosition += 0.5;
                            
                            if (scrollPosition >= originalWidth) {
                              scrollPosition = 0;
                              scrollContainer.scrollLeft = 0;
                            } else {
                              scrollContainer.scrollLeft = scrollPosition;
                            }
                            
                            animationId = requestAnimationFrame(smoothScroll);
                            setStoriesAnimationId(animationId);
                          };

                          animationId = requestAnimationFrame(smoothScroll);
                          setStoriesAnimationId(animationId);
                        }
                      }, 3000); // Resume after 3 seconds of inactivity
                    }}
                  >
                    {/* Render stories only once */}
                    {stories.map((story, index) => (
                      <Card key={`story-${story.title}-${index}`} className="w-64 h-[420px] flex-shrink-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col transform hover:-translate-y-2 hover:scale-105 border-2 border-transparent hover:border-purple-400 bg-white hover:bg-purple-50">
                        <div className="relative h-48 w-full flex-shrink-0">
                          <NextImage
                            src={story.imageUrl || "/placeholder.svg?height=300&width=400"}
                            alt={story.title}
                            fill
                            className="object-cover"
                            loading="lazy"
                          />
                        </div>
                        <CardContent className="p-4 flex flex-col flex-grow">
                          <h3 className="text-lg font-bold mb-2 text-gray-900 text-center h-14 flex items-center justify-center">{story.title}</h3>
                          <p className="text-gray-600 text-sm text-justify flex-grow overflow-hidden line-clamp-4">{story.content}</p>
                          <div className="flex items-center justify-between mt-4 pt-4 border-t">
                            <span className="text-xs text-gray-500">{story.date}</span>
                            <a 
                              href={`/stories/${story._id}`}
                              className="inline-flex items-center justify-center rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-7 px-3"
                            >
                              Read More
                            </a>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No wedding stories available yet.</p>
                </div>
              )}
            </div>
          </section>

          {/* Gallery to Look for */}
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Gallery to Look for</h2>
                <Link href="/gallery">
                  <Button variant="outline" className="text-gray-600 hover:text-gray-900 transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                    View All →
                  </Button>
                </Link>
              </div>
              
              {galleryCategories.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No gallery categories available</p>
                  <p className="text-gray-400">Categories will appear here once images are uploaded through the admin panel</p>
                </div>
              ) : (
                <div className="relative overflow-hidden group">
                  {/* Horizontal Scrollable Container */}
                  <div 
                    ref={galleryScrollRef}
                    className="flex gap-5 touch-pan-x overflow-x-auto scrollbar-hide"
                    style={{
                      width: '100%',
                      cursor: 'grab'
                    }}
                    onMouseDown={(e) => {
                      // Only handle mouse down for scrolling if not on a link
                      if ((e.target as HTMLElement).closest('a')) {
                        return;
                      }
                      
                      // Pause animation on mouse down and enable manual scrolling
                      if (galleryAnimationId) {
                        cancelAnimationFrame(galleryAnimationId);
                        setGalleryAnimationId(null);
                      }
                      
                      const scrollContainer = galleryScrollRef.current;
                      if (!scrollContainer) return;
                      
                      const startX = e.pageX - scrollContainer.offsetLeft;
                      const scrollLeft = scrollContainer.scrollLeft;
                      
                      const handleMouseMove = (moveEvent: MouseEvent) => {
                        moveEvent.preventDefault();
                        const x = moveEvent.pageX - scrollContainer.offsetLeft;
                        const walk = (x - startX) * 2; // Scroll speed multiplier
                        scrollContainer.scrollLeft = scrollLeft - walk;
                      };
                      
                      const handleMouseUp = () => {
                        document.removeEventListener('mousemove', handleMouseMove);
                        document.removeEventListener('mouseup', handleMouseUp);
                        
                        // Resume animation after manual scrolling
                        setTimeout(() => {
                          if (galleryCategories.length > 0 && galleryScrollRef.current) {
                            const scrollContainer = galleryScrollRef.current;
                            const cardWidth = 220;
                            const originalWidth = galleryCategories.length * cardWidth;
                            let scrollPosition = scrollContainer.scrollLeft;
                            let animationId: number;

                            const smoothScroll = () => {
                              scrollPosition += 0.5;
                              
                              if (scrollPosition >= originalWidth) {
                                scrollPosition = 0;
                                scrollContainer.scrollLeft = 0;
                              } else {
                                scrollContainer.scrollLeft = scrollPosition;
                              }
                              
                              animationId = requestAnimationFrame(smoothScroll);
                              setGalleryAnimationId(animationId);
                            };

                            animationId = requestAnimationFrame(smoothScroll);
                            setGalleryAnimationId(animationId);
                          }
                        }, 3000); // Resume after 3 seconds of inactivity
                      };
                      
                      document.addEventListener('mousemove', handleMouseMove);
                      document.addEventListener('mouseup', handleMouseUp);
                    }}
                    onMouseEnter={() => {
                      // Pause animation on hover
                      if (galleryAnimationId) {
                        cancelAnimationFrame(galleryAnimationId);
                        setGalleryAnimationId(null);
                      }
                    }}
                    onMouseLeave={() => {
                      // Resume animation when not hovering
                      if (galleryCategories.length > 0 && galleryScrollRef.current) {
                        const scrollContainer = galleryScrollRef.current;
                        const cardWidth = 220;
                        const originalWidth = galleryCategories.length * cardWidth;
                        let scrollPosition = scrollContainer.scrollLeft;
                        let animationId: number;

                        const smoothScroll = () => {
                          scrollPosition += 0.5;
                          
                          // Seamless loop - when reaching the end, reset to beginning
                          if (scrollPosition >= originalWidth) {
                            scrollPosition = 0;
                            scrollContainer.scrollLeft = 0;
                          } else {
                            scrollContainer.scrollLeft = scrollPosition;
                          }
                          
                          animationId = requestAnimationFrame(smoothScroll);
                          setGalleryAnimationId(animationId);
                        };

                        animationId = requestAnimationFrame(smoothScroll);
                        setGalleryAnimationId(animationId);
                      }
                    }}
                    onTouchStart={(e) => {
                      // Pause animation on touch
                      if (galleryAnimationId) {
                        cancelAnimationFrame(galleryAnimationId);
                        setGalleryAnimationId(null);
                      }
                    }}
                    onTouchEnd={() => {
                      // Resume animation after touch
                      setTimeout(() => {
                        if (galleryCategories.length > 0 && galleryScrollRef.current) {
                          const scrollContainer = galleryScrollRef.current;
                          const cardWidth = 220;
                          const originalWidth = galleryCategories.length * cardWidth;
                          let scrollPosition = scrollContainer.scrollLeft;
                          let animationId: number;

                          const smoothScroll = () => {
                            scrollPosition += 0.5;
                            
                            if (scrollPosition >= originalWidth) {
                              scrollPosition = 0;
                              scrollContainer.scrollLeft = 0;
                            } else {
                              scrollContainer.scrollLeft = scrollPosition;
                            }
                            
                            animationId = requestAnimationFrame(smoothScroll);
                            setGalleryAnimationId(animationId);
                          };

                          animationId = requestAnimationFrame(smoothScroll);
                          setGalleryAnimationId(animationId);
                        }
                      }, 3000); // Resume after 3 seconds of inactivity
                    }}
                  >
                    {/* Render gallery categories only once */}
                    {galleryCategories.map((category, index) => (
                      <Link
                        key={`gallery-${category.name}-${index}`}
                        href={`/gallery/${encodeURIComponent(category.name.toLowerCase().replace(/\s+/g, '-'))}`}
                        className="block flex-shrink-0 w-52"
                      >
                        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-2 h-full flex flex-col transform hover:scale-105 border-2 border-transparent hover:border-teal-400 bg-white hover:bg-teal-50">
                          <CardContent className="p-0 flex-grow flex flex-col">
                            <div className="relative h-36 overflow-hidden flex-grow">
                              <NextImage
                                src={category.sampleImage}
                                alt={category.name}
                                fill
                                className="object-cover rounded-t-lg group-hover:scale-110 transition-transform duration-300"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
                              
                              {/* Image Count Badge */}
                              <div className="absolute top-2 right-2 bg-black/30 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs font-semibold shadow-md">
                                {category.imageCount} {category.imageCount === 1 ? 'image' : 'images'}
                              </div>
                            </div>
                            <div className="p-4 flex items-center justify-center flex-grow">
                              <h3 className="font-bold text-base text-gray-900 text-center">{category.name}</h3>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </>
  )
}
