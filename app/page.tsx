"use client"

import NextImage from "next/image"
import { Button } from "@/components/ui/button"
import { Search, Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import { HomeContent } from "@/components/home/HomeContent"
import { useRouter } from "next/navigation"
import { HeroSectionSkeleton } from "@/components/home/SkeletonLoader"
import { useAuth } from "@/contexts/AuthContext"
import { Sidebar } from "@/components/dashboard/sidebar"
import { ProfileSection } from "@/components/dashboard/profile"
import { PreferencesSection } from "@/components/dashboard/preferences"
import { OrdersSection } from "@/components/dashboard/orders"
import { WishlistSection } from "@/components/dashboard/wishlist"
import { NotificationsSection } from "@/components/dashboard/notifications"
import { PaymentHistorySection } from "@/components/dashboard/payments"
import { SecuritySection } from "@/components/dashboard/security"
import { SupportSection } from "@/components/dashboard/support"
import SearchableDropdown from "@/components/home/SearchableDropdown"

// Simple in-memory cache
const cache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cached fetch function
const cachedFetch = async (url: string) => {
  const now = Date.now();
  
  // Check if we have valid cached data
  if (cache[url] && (now - cache[url].timestamp) < CACHE_DURATION) {
    console.log(`Using cached data for ${url}`);
    return cache[url].data;
  }
  
  // Fetch fresh data
  console.log(`Fetching fresh data for ${url}`);
  const response = await fetch(url);
  const data = await response.json();
  
  // Update cache
  cache[url] = { data, timestamp: now };
  
  return data;
};

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [imgError, setImgError] = useState(false)
  const [heroData, setHeroData] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [photographers, setPhotographers] = useState<any[]>([])
  const [cities, setCities] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeContent, setActiveContent] = useState<string | null>(null)

  useEffect(() => {
    // Set loading state
    setLoading(true);
    
    // Fetch all data in parallel for better performance with caching
    Promise.all([
      cachedFetch('/api/hero-section').catch(() => ({})),
      cachedFetch('/api/categories').catch(() => ({})),
      cachedFetch('/api/requests?type=category&status=approved').catch(() => ({})),
      cachedFetch('/api/photographers?approved=true').catch(() => ({}))
    ])
      .then(([heroDataRes, categoriesData, requestsData, photographersData]) => {
        // Set hero data
        if (heroDataRes.success && heroDataRes.data) {
          setHeroData(heroDataRes.data)
        }
        
        // Process categories
        const allCategoryNames = new Set<string>()
        
        if (categoriesData.success && categoriesData.categories) {
          categoriesData.categories.forEach((cat: any) => {
            if (cat.name) allCategoryNames.add(cat.name)
          })
        }
        
        if (requestsData.success && requestsData.requests) {
          requestsData.requests.forEach((req: any) => {
            if (req.name && req.status === 'approved') allCategoryNames.add(req.name)
          })
        }
        
        if (photographersData.photographers) {
          // Store photographers data
          setPhotographers(photographersData.photographers)
          
          // Extract categories from photographers
          photographersData.photographers.forEach((p: any) => {
            if (p.categories && Array.isArray(p.categories)) {
              p.categories.forEach((cat: string) => {
                if (cat) allCategoryNames.add(cat)
              })
            }
          })
          
          // Extract unique cities from photographers
          const photographerCities = photographersData.photographers
            .map((p: any) => p.location)
            .filter((city: string, index: number, self: string[]) => city && self.indexOf(city) === index)
          
          // Format cities for searchable dropdown
          const formattedCities = photographerCities.map((city: string) => ({
            id: city,
            name: city
          }))
          
          setCities(formattedCities)
        }
        
        // Set unique categories formatted for searchable dropdown
        const uniqueCategories = Array.from(allCategoryNames)
          .sort()
          .map((name) => ({
            id: name,
            name: name
          }))
        
        setCategories(uniqueCategories)
        console.log('Formatted categories:', uniqueCategories);
        console.log('Formatted cities:', cities);
      })
      .catch(err => console.error('Failed to fetch data:', err))
      .finally(() => {
        // Set loading to false when all data is fetched
        setLoading(false);
      })
  }, []);

  const handleSearch = () => {
    // Build search params
    const params = new URLSearchParams()
    
    if (selectedCategory) {
      params.append('category', selectedCategory)
    }
    
    if (selectedCity) {
      params.append('city', selectedCity)
    }
    
    // Navigate to search results page
    if (params.toString()) {
      router.push(`/search?${params.toString()}`)
    }
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  const handleSidebarNavigation = (href: string) => {
    setActiveContent(href)
    // Close sidebar on mobile after navigation
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }

  const renderContent = () => {
    if (!activeContent) {
      return <HomeContent />
    }

    switch (activeContent) {
      case '/dashboard/profile':
        return (
          <div className="space-y-6 p-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Profile</h1>
              <p className="text-gray-600 mt-1">Manage your profile information and preferences</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Section - Takes 2 columns on large screens */}
              <div className="lg:col-span-2">
                <ProfileSection />
              </div>
              
              {/* Preferences Section - Takes 1 column on large screens */}
              <div className="lg:col-span-1">
                <PreferencesSection />
              </div>
            </div>
          </div>
        )
      case '/dashboard/orders':
        return (
          <div className="p-4">
            <OrdersSection />
          </div>
        )
      case '/dashboard/wishlist':
        return (
          <div className="p-4">
            <WishlistSection />
          </div>
        )
      case '/dashboard/notifications':
        return (
          <div className="p-4">
            <NotificationsSection />
          </div>
        )
      case '/dashboard/payments':
        return (
          <div className="p-4">
            <PaymentHistorySection />
          </div>
        )
      case '/dashboard/security':
        return (
          <div className="p-4">
            <SecuritySection />
          </div>
        )
      case '/dashboard/support':
        return (
          <div className="p-4">
            <SupportSection />
          </div>
        )
      default:
        return <HomeContent />
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Show sidebar for authenticated users */}
      {isAuthenticated && (
        <>
          {/* Sidebar toggle button - only visible when sidebar is closed */}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="fixed top-20 left-4 z-50 bg-white p-2 rounded-lg shadow-md hover:bg-gray-100 transition-colors"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5 text-gray-700" />
            </button>
          )}
          
          {/* Sidebar - hidden by default, shown when sidebarOpen is true */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-50">
              {/* Overlay */}
              <div 
                className="fixed inset-0 bg-black bg-opacity-50"
                onClick={() => setSidebarOpen(false)}
              />
              
              {/* Sidebar */}
              <div className="relative w-64 h-full bg-white shadow-lg z-50">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Dashboard</h2>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="p-1 rounded-full hover:bg-gray-200"
                      aria-label="Close sidebar"
                    >
                      <X className="h-5 w-5 text-gray-700" />
                    </button>
                  </div>
                </div>
                <div className="p-2">
                  <Sidebar onNavigate={(href) => {
                    setActiveContent(href)
                    setSidebarOpen(false)
                  }} />
                </div>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Main content area */}
      <div className={isAuthenticated && sidebarOpen ? 'ml-0' : ''}>
        {/* Show dashboard content if user is authenticated and has selected a section */}
        {isAuthenticated && activeContent ? (
          <div className="pt-16">
            {renderContent()}
          </div>
        ) : (
          <>
            {/* Show hero section for all users (authenticated and non-authenticated) when no dashboard section is selected */}
            {loading && <HeroSectionSkeleton />}
            {!loading && heroData && heroData.backgroundImage && (
              <section className="relative h-[600px] flex items-center justify-center">
                {/* Background Image - Only from admin panel */}
                <div className="absolute inset-0">
                  <NextImage
                    src={heroData.backgroundImage}
                    alt="Hero background"
                    fill
                    className="object-cover w-full h-full"
                    style={{ position: "absolute", inset: 0 }}
                    onError={() => setImgError(true)}
                    priority
                  />
                  <div 
                    className="absolute inset-0 bg-black" 
                    style={{ opacity: (heroData?.design?.overlayOpacity || 50) / 100 }}
                  />
                </div>
                <div className={`relative z-10 text-${heroData?.design?.textAlignment || 'center'} text-white max-w-5xl mx-auto px-4`}>
                  {/* Festival/Season Highlight */}
                  {heroData?.festivalBanner?.enabled && (
                    <div className="mb-4">
                      <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                        heroData.festivalBanner.animation ? 'animate-pulse' : ''
                      } ${
                        heroData.festivalBanner.style === 'warning' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black' :
                        heroData.festivalBanner.style === 'success' ? 'bg-gradient-to-r from-green-400 to-green-500 text-black' :
                        heroData.festivalBanner.style === 'info' ? 'bg-gradient-to-r from-blue-400 to-blue-500 text-white' :
                        'bg-gradient-to-r from-red-400 to-red-500 text-white'
                      }`}>
                        {heroData.festivalBanner.text}
                      </span>
                    </div>
                  )}
                  
                  {/* Subtitle - Only if admin provided */}
                  {heroData?.subtitle && (
                    <div className="mb-2">
                      <span className="text-lg md:text-xl font-medium text-yellow-400">
                        {heroData.subtitle}
                      </span>
                    </div>
                  )}
                  
                  {/* Main Title - Only if admin provided */}
                  {heroData?.title && (
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                      {heroData.design?.titleGradient ? (
                        <>
                          {heroData.title.split(' ').slice(0, -2).join(' ')}{' '}
                          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                            {heroData.title.split(' ').slice(-2).join(' ')}
                          </span>
                        </>
                      ) : (
                        heroData.title
                      )}
                    </h1>
                  )}
                  
                  {/* Description - Only if admin provided */}
                  {heroData?.description && (
                    <p className="text-lg md:text-xl lg:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto leading-relaxed">
                      {heroData.description}
                    </p>
                  )}
                  
                  {/* Stats - Only if admin enabled */}
                  {heroData?.stats?.enabled && heroData.stats.items.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm md:text-base">
                      {heroData.stats.items.map((stat: any, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="text-yellow-400">{stat.icon}</span>
                          <span>{stat.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Action Buttons - Only if admin provided */}
                  {heroData?.buttons && heroData.buttons.length > 0 && (
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      {heroData.buttons.map((button: any) => (
                        <Button
                          key={button.id}
                          size="lg"
                          className={
                            button.style === 'primary' 
                              ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600 font-semibold px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300" :
                          button.style === 'secondary'
                              ? "bg-gray-600 text-white hover:bg-gray-700 font-semibold px-8 py-3 text-lg transition-all duration-300" :
                              "text-white border-2 border-white hover:bg-white hover:text-gray-900 bg-transparent font-semibold px-8 py-3 text-lg transition-all duration-300"
                          }
                          variant={button.style === 'outline' ? 'outline' : 'default'}
                          onClick={() => typeof window !== 'undefined' && (window.location.href = button.link)}
                        >
                          {button.icon} {button.text}
                        </Button>
                      ))}
                    </div>
                  )}
                  
                  {/* Quick Links - Only if admin enabled */}
                  {heroData?.quickLinks?.enabled && heroData.quickLinks.items.length > 0 && (
                    <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
                      <span className="text-gray-300">Popular:</span>
                      {heroData.quickLinks.items.map((link: any, index: number) => (
                        <button 
                          key={index}
                          className="text-yellow-400 hover:text-yellow-300 underline"
                          onClick={() => typeof window !== 'undefined' && (window.location.href = link.link)}
                        >
                          {link.text}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Find Your Perfect Photographer Section */}
                <div className="absolute bottom-8 left-0 right-0 z-20 px-4 md:px-8">
                  <div className="max-w-7xl mx-auto">
                    <div className="p-6 md:p-8">
                      <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-white drop-shadow-lg">
                        Find Your Perfect Photographer
                      </h2>
                      
                      <div className="flex flex-col md:flex-row gap-4 items-end">
                        {/* Category Dropdown */}
                        <div className="flex-1">
                          <SearchableDropdown
                            options={categories}
                            value={selectedCategory}
                            onChange={setSelectedCategory}
                            placeholder="Select Category"
                          />
                        </div>

                        {/* Cities Dropdown */}
                        <div className="flex-1">
                          <SearchableDropdown
                            options={cities}
                            value={selectedCity}
                            onChange={setSelectedCity}
                            placeholder="Select City"
                          />
                        </div>

                        {/* Search Button */}
                        <div className="w-full md:w-auto">
                          <button
                            onClick={handleSearch}
                            disabled={!selectedCategory && !selectedCity}
                            className="w-full md:w-auto bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 h-[50px] disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Search className="w-5 h-5" />
                            Search
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Show home content for all users when no dashboard section is selected */}
            <div className={isAuthenticated ? 'pt-16' : ''}>
              <HomeContent />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
