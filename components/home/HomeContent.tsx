"use client"

import NextImage from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"

export function HomeContent() {
  const { user, isAuthenticated } = useAuth()
  const [categoriesScroll, setCategoriesScroll] = useState(0)
  const [citiesScroll, setCitiesScroll] = useState(0)
  const [categories, setCategories] = useState<{ name: string; image: string }[]>([])
  const [cities, setCities] = useState<{ name: string; image: string }[]>([])
  const [stories, setStories] = useState<{ title: string; content: string; imageUrl: string; date: string }[]>([])
  const [galleryImages, setGalleryImages] = useState<{ category: string; imageUrl: string; uploaderName: string }[]>([])
  const [galleryCategories, setGalleryCategories] = useState<{ name: string; imageCount: number; sampleImage: string; allImages?: string[]; sources?: string[] }[]>([])
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0)
  const [approvedPhotographers, setApprovedPhotographers] = useState<any[]>([])
  const [userPreferences, setUserPreferences] = useState<any>(null)
  const categoriesContainerRef = useRef<HTMLDivElement>(null);
  const citiesContainerRef = useRef<HTMLDivElement>(null);
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

  // Function to get photographer recommendations
  const fetchApprovedPhotographers = async () => {
    try {
      let photographers = [];
      
      if (isAuthenticated && user) {
        // Try to fetch user preferences and activity first
        try {
          const preferencesRes = await fetch(`/api/user-preferences/${user.id}`);
          if (preferencesRes.ok) {
            const preferences = await preferencesRes.json();
            setUserPreferences(preferences);
            
            // If user has preferences, fetch personalized recommendations
            if (preferences && !preferences.isNewUser && 
                (preferences.preferredCategories?.length > 0 || 
                 preferences.preferredLocation || 
                 preferences.priceRange)) {
              
              const params = new URLSearchParams({
                approved: 'true',
                userId: user.id,
                personalized: 'true'
              });
              
              if (preferences.preferredCategories?.length > 0) {
                params.append('categories', preferences.preferredCategories.join(','));
              }
              if (preferences.preferredLocation) {
                params.append('location', preferences.preferredLocation);
              }
              if (preferences.priceRange) {
                params.append('priceRange', preferences.priceRange);
              }
              
              const photographersRes = await fetch(`/api/photographers?${params.toString()}`);
              if (photographersRes.ok) {
                const data = await photographersRes.json();
                photographers = data.photographers || [];
              }
            }
          }
        } catch (prefError) {
          // Continue with default fetch if preferences fail
        }
      }
      
      // If no personalized results or user not authenticated, fetch all approved photographers
      if (photographers.length === 0) {
        const res = await fetch('/api/photographers?approved=true');
        if (res.ok) {
          const data = await res.json();
          photographers = data.photographers || [];
        }
      }
      
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
      setApprovedPhotographers([]);
    }
  };

  useEffect(() => {
    // Fetch homepage items (approved categories and cities with show_on_home = true)
    fetch('/api/homepage-items')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCategories(data.data.categories || []);
          setCities(data.data.cities || []);
        }
      })
      .catch(err => {
        // Silently handle error - fallback to existing APIs if homepage-items fails
        fetch('/api/categories')
          .then(res => res.json())
          .then(data => {
            const allCategories = data.categories || [];
            const selectedCategories = allCategories.filter((cat: any) => cat.selected);
            setCategories(selectedCategories.length > 0 ? selectedCategories : allCategories);
          });
        
        fetch('/api/cities')
          .then(res => res.json())
          .then(data => {
            const allCities = data.cities || [];
            const selectedCities = allCities.filter((city: any) => city.selected);
            setCities(selectedCities.length > 0 ? selectedCities : allCities);
          });
      });

    // Fetch digital album data
    fetch('/api/digital-album')
      .then(res => res.json())
      .then(data => {
        setAlbumData(data);
      })
      .catch(err => {/* Silently handle error */});

    // Fetch digital invitation data
    fetch('/api/digital-invitation')
      .then(res => res.json())
      .then(data => {
        setInvitationData(data);
      })
      .catch(err => {/* Silently handle error */});

    // Fetch stories data (including photographer stories)
    Promise.all([
      fetch('/api/stories').then(res => res.json()),
      fetch('/api/photographer-stories').then(res => res.json())
    ])
    .then(([adminStoriesData, photographerStoriesData]) => {
      const adminStories = adminStoriesData.stories || [];
      const photographerStories = photographerStoriesData.stories || [];
      
      // Filter photographer stories that are approved and should show on home
      const approvedPhotographerStories = photographerStories
        .filter((story: any) => story.status === 'approved' && story.showOnHome)
        .map((story: any) => ({
          _id: story.id,
          title: story.title,
          content: story.content,
          imageUrl: story.coverImage,
          date: story.date,
          location: story.location,
          photographer: story.photographerName || 'Photographer'
        }));
      
      // Combine admin stories with approved photographer stories
      setStories([...adminStories, ...approvedPhotographerStories]);
    })
    .catch(err => {/* Silently handle error */});

    // Fetch gallery images and categories (including photographer galleries)
    Promise.all([
      fetch('/api/gallery/images').then(res => res.json()),
      fetch('/api/gallery/categories').then(res => res.json()),
      fetch('/api/photographer-galleries').then(res => res.json())
    ])
    .then(([imagesData, categoriesData, photographerGalleriesData]) => {
      const images = imagesData.images || [];
      const categories = categoriesData.categories || [];
      const photographerGalleries = photographerGalleriesData.galleries || [];
      
      setGalleryImages(images);
      
      // Group all galleries by name to avoid duplicates
      const allGalleryData: { [key: string]: { images: string[], sources: string[] } } = {};
      
      // Add admin categories
      categories.forEach((cat: any) => {
        const categoryImages = images.filter((img: any) => img.category === cat.name);
        if (categoryImages.length > 0) {
          if (!allGalleryData[cat.name]) {
            allGalleryData[cat.name] = { images: [], sources: [] };
          }
          allGalleryData[cat.name].images.push(...categoryImages.map((img: any) => img.imageUrl));
          allGalleryData[cat.name].sources.push('Admin');
        }
      });
      
      // Add approved photographer galleries
      photographerGalleries
        .filter((gallery: any) => gallery.status === 'approved' && gallery.showOnHome)
        .forEach((gallery: any) => {
          if (gallery.images && gallery.images.length > 0) {
            if (!allGalleryData[gallery.name]) {
              allGalleryData[gallery.name] = { images: [], sources: [] };
            }
            allGalleryData[gallery.name].images.push(...gallery.images);
            allGalleryData[gallery.name].sources.push(gallery.photographerName || 'Photographer');
          }
        });
      
      // Convert to array format for display
      const groupedGalleries = Object.entries(allGalleryData).map(([name, data]) => ({
        name,
        imageCount: data.images.length,
        sampleImage: data.images[0] || '/placeholder.svg?height=200&width=200',
        allImages: data.images,
        sources: [...new Set(data.sources)] // Remove duplicate sources
      }));
      
      setGalleryCategories(groupedGalleries);
    })
    .catch(err => {/* Silently handle error */});

    // Fetch approved photographers
    fetchApprovedPhotographers();
  }, [isAuthenticated, user?.id]);

  const scrollCategories = (direction: "left" | "right") => {
    const container = categoriesContainerRef.current;
    if (container) {
      const scrollAmount = 300;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const scrollCities = (direction: "left" | "right") => {
    const container = citiesContainerRef.current;
    if (container) {
      const scrollAmount = 300;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const nextStory = () => {
    if (stories.length <= 3) return;
    setCurrentStoryIndex((prev) => (prev + 3) % stories.length);
  };

  const prevStory = () => {
    if (stories.length <= 3) return;
    setCurrentStoryIndex((prev) => (prev - 3 + stories.length) % stories.length);
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

  // Auto-advance stories every 5 seconds
  useEffect(() => {
    if (stories.length > 3) {
      const interval = setInterval(nextStory, 5000);
      return () => clearInterval(interval);
    }
  }, [stories.length]);

  return (
    <>
      {/* Recommended For You */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-black">
                  {isAuthenticated ? '⭐ Recommended for you' : '⭐ Featured Photographers'}
                </h2>
                {isAuthenticated && (
                  <p className="text-sm text-gray-600 mt-1">
                    {userPreferences && !userPreferences.isNewUser 
                      ? 'Based on your preferences and activity' 
                      : 'Curated selection of top-rated photographers'}
                  </p>
                )}
                {!isAuthenticated && (
                  <p className="text-sm text-gray-600 mt-1">
                    Top-rated photographers on our platform
                  </p>
                )}
              </div>
              <Link href="/photographers">
                <Button 
                  variant="ghost" 
                  className="rounded-full text-black hover:bg-yellow-100 font-semibold"
                >
                  See all →
                </Button>
              </Link>
            </div>
            
            {approvedPhotographers.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="bg-gray-50 rounded-lg p-8">
                  <p className="text-gray-600 text-lg mb-2">No photographers available right now</p>
                  <p className="text-gray-500 text-sm">
                    We're working on adding more talented photographers to our platform. Check back soon!
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {approvedPhotographers.slice(0, 8).map((p) => (
                <Card
                  key={p._id}
                  className="group overflow-hidden border-2 border-yellow-200 bg-white hover:border-yellow-400 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                  onClick={() => trackUserActivity(p._id, 'card_viewed')}
                >
                  <div className="relative h-40 w-full bg-yellow-50">
                    <NextImage
                      src={p.image || `/placeholder.svg?height=160&width=320&query=photographer+studio`}
                      alt={`${p.name} studio banner`}
                      fill
                      sizes="(min-width: 1024px) 25vw, 50vw"
                      className="object-cover"
                    />
                    {p.rating > 0 && (
                      <div className="absolute top-2 right-2 bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-bold">
                        ⭐ {p.rating.toFixed(1)}
                      </div>
                    )}
                  </div>
                  
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-bold text-black">{p.name}</CardTitle>
                    <p className="text-sm text-gray-600 font-medium">{p.location}</p>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2 text-xs">
                      {(p.tags || p.categories || []).slice(0, 3).map((t: string) => (
                        <span 
                          key={t} 
                          className="rounded-full bg-yellow-200 text-black px-3 py-1 font-semibold"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      {p.rating > 0 ? (
                        <span className="text-gray-600 font-medium">
                          {"⭐".repeat(Math.round(p.rating))} {p.rating.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-gray-500 font-medium text-xs">New Photographer</span>
                      )}
                      <span className="font-bold text-black">From ${p.startingPrice}</span>
                    </div>
                    
                    <Button 
                      className={cn(
                        "w-full rounded-full mt-2 bg-yellow-400 text-black hover:bg-yellow-500 font-semibold transition-all hover:shadow-md focus-visible:ring-2 focus-visible:ring-yellow-400"
                      )}
                      onClick={() => trackUserActivity(p._id, 'book_clicked')}
                    >
                      📞 Book Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Popular Searches Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Popular Searches Categories</h2>
          <div className="relative">
            {/* Scroll Buttons */}
            <button
              type="button"
              onClick={() => scrollCategories("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full p-2 border border-gray-200 hover:bg-gray-100 transition hidden md:block"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={() => scrollCategories("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full p-2 border border-gray-200 hover:bg-gray-100 transition hidden md:block"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            <div
              ref={categoriesContainerRef}
              className="flex overflow-x-auto whitespace-nowrap space-x-6 pb-4 scrollbar-hide"
            >
              {categories.length === 0 ? (
                <div className="text-gray-500 text-center w-full">No categories added yet.</div>
              ) : (
                categories.map((category, index) => (
                  <Link
                    key={index}
                    href={`/wedding-photographers?category=${encodeURIComponent(category.name)}`}
                    className="inline-block align-top"
                  >
                    <Card className="flex-shrink-0 w-64 shadow-lg hover:shadow-xl transition-shadow inline-block align-top cursor-pointer">
                      <CardContent className="p-0">
                        <div className="relative h-48">
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
                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-center text-gray-900">{category.name}</h3>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Popular Searches Cities */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Popular Searches Cities</h2>
          <div className="relative">
            {/* Scroll Buttons (desktop only) */}
            <button
              type="button"
              onClick={() => scrollCities("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full p-2 border border-gray-200 hover:bg-gray-100 transition hidden md:block"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={() => scrollCities("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full p-2 border border-gray-200 hover:bg-gray-100 transition hidden md:block"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            <div
              ref={citiesContainerRef}
              className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide"
            >
              {cities.length === 0 ? (
                <div className="text-gray-500 text-center w-full">No cities added yet.</div>
              ) : (
                cities.map((city) => (
                  <Link
                    key={city._id || city.name}
                    href={`/wedding-photographers?city=${encodeURIComponent(city.name)}`}
                    className="inline-block align-top"
                  >
                    <Card className="flex-shrink-0 w-64 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                      <CardContent className="p-0">
                        <div className="relative h-48">
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
                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-center text-gray-900">{city.name}</h3>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          </div>
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
            <div className="relative">
              {/* Navigation Arrows */}
              {stories.length > 3 && (
                <>
                  <button
                    onClick={prevStory}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors"
                    aria-label="Previous stories"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-600" />
                  </button>
                  <button
                    onClick={nextStory}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors"
                    aria-label="Next stories"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-600" />
                  </button>
                </>
              )}

              {/* Stories Carousel */}
              <div className="overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 md:px-12">
                  {/* Show 3 stories at a time on desktop, 1 on mobile, 2 on tablet */}
                  {stories.length <= 3 ? (
                    // Show all stories if 3 or fewer
                    stories.map((story, index) => (
                      <Card key={`story-${index}`} className="shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                        <div className="relative h-64">
                          <NextImage
                            src={story.imageUrl || "/placeholder.svg?height=300&width=400"}
                            alt={story.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <CardContent className="p-6">
                          <h3 className="text-xl font-bold mb-3 text-gray-900">{story.title}</h3>
                          <p className="text-gray-600 mb-4 line-clamp-3">{story.content}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">{story.date}</span>
                            <a 
                              href={`/stories/${story._id}`}
                              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                            >
                              Read More
                            </a>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    // Show carousel for more than 3 stories
                    [0, 1, 2].map((offset) => {
                      const storyIndex = (currentStoryIndex + offset) % stories.length;
                      const currentStory = stories[storyIndex];
                      return (
                        <Card key={`story-${storyIndex}`} className="shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                          <div className="relative h-64">
                            <NextImage
                              src={currentStory.imageUrl || "/placeholder.svg?height=300&width=400"}
                              alt={currentStory.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <CardContent className="p-6">
                            <h3 className="text-xl font-bold mb-3 text-gray-900">{currentStory.title}</h3>
                            <p className="text-gray-600 mb-4 line-clamp-3">{currentStory.content}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">{currentStory.date}</span>
                              <a 
                                href={`/stories/${currentStory._id}`}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                              >
                                Read More
                              </a>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Dots Indicator */}
              {stories.length > 3 && (
                <div className="flex justify-center mt-8 space-x-2">
                  {Array.from({ length: Math.ceil(stories.length / 3) }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStoryIndex(index * 3)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        Math.floor(currentStoryIndex / 3) === index
                          ? 'bg-orange-500'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Go to story set ${index + 1}`}
                    />
                  ))}
                </div>
              )}
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
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Gallery to Look for</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {galleryCategories.map((category, index) => (
              <Link
                key={index}
                href={`/gallery/${encodeURIComponent(category.name.toLowerCase().replace(/\s+/g, '-'))}`}
                className="block"
              >
                <Card className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
                  <CardContent className="p-0">
                    <div className="relative h-32 overflow-hidden">
                      <NextImage
                        src={category.sampleImage}
                        alt={category.name}
                        fill
                        className="object-cover rounded-t-lg group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm text-center text-gray-900">{category.name}</h3>
                      <div className="text-center mt-1">
                        <p className="text-xs text-gray-500">
                          {category.imageCount} {category.imageCount === 1 ? 'image' : 'images'}
                        </p>
                        {category.sources && category.sources.length > 0 && (
                          <p className="text-xs text-gray-400">
                            by {category.sources.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          {galleryCategories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No gallery categories available</p>
              <p className="text-gray-400">Categories will appear here once images are uploaded through the admin panel</p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}