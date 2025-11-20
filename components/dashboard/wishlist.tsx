"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Heart, 
  ShoppingCart, 
  Trash2, 
  Filter,
  TrendingDown,
  CheckCircle
} from "lucide-react"
import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "@/hooks/use-toast"

export function WishlistSection() {
  const { user } = useAuth()
  const [wishlistItems, setWishlistItems] = useState<any[]>([])
  const [filteredItems, setFilteredItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")

  // Mock data - in a real app, this would come from API
  const mockWishlist = [
    {
      id: "1",
      name: "Precision Air Rifle - AR-2000",
      description: "High-precision air rifle for target shooting with adjustable stock",
      price: "₹18,500",
      originalPrice: "₹22,000",
      image: "/placeholder.svg?height=200&width=200",
      category: "Rifles",
      inStock: true,
      discount: 16
    },
    {
      id: "2",
      name: "Professional Shooting Glasses",
      description: "Anti-fog shooting glasses with UV protection and side shields",
      price: "₹2,800",
      originalPrice: "₹3,500",
      image: "/placeholder.svg?height=200&width=200",
      category: "Safety Gear",
      inStock: true,
      discount: 20
    },
    {
      id: "3",
      name: "Paper Target Set - 50 Sheets",
      description: "High-visibility paper targets for practice shooting",
      price: "₹450",
      originalPrice: "₹600",
      image: "/placeholder.svg?height=200&width=200",
      category: "Targets",
      inStock: true,
      discount: 25
    },
    {
      id: "4",
      name: "Competition Pistol Holster",
      description: "Premium leather holster for competition shooting",
      price: "₹3,200",
      originalPrice: "₹4,000",
      image: "/placeholder.svg?height=200&width=200",
      category: "Holsters",
      inStock: false,
      discount: 20
    },
    {
      id: "5",
      name: "Shooting Range Ear Protection",
      description: "Professional-grade earmuffs with noise reduction rating of 30dB",
      price: "₹1,850",
      originalPrice: "₹2,200",
      image: "/placeholder.svg?height=200&width=200",
      category: "Safety Gear",
      inStock: true,
      discount: 16
    }
  ]

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) return
      
      try {
        // In a real app, this would fetch wishlist items for the specific user
        // For now, we'll use mock data but simulate an API call
        setLoading(true)
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        setWishlistItems(mockWishlist)
        setFilteredItems(mockWishlist)
      } catch (error) {
        console.error("Failed to fetch wishlist:", error)
        // Fallback to mock data on error
        setWishlistItems(mockWishlist)
        setFilteredItems(mockWishlist)
      } finally {
        setLoading(false)
      }
    }
    
    fetchWishlist()
  }, [user])

  useEffect(() => {
    let result = wishlistItems

    // Apply search filter
    if (searchTerm) {
      result = result.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        result = [...result].sort((a, b) => 
          parseInt(a.price.replace(/[₹,]/g, "")) - parseInt(b.price.replace(/[₹,]/g, ""))
        )
        break
      case "price-high":
        result = [...result].sort((a, b) => 
          parseInt(b.price.replace(/[₹,]/g, "")) - parseInt(a.price.replace(/[₹,]/g, ""))
        )
        break
      case "newest":
      default:
        // Keep original order (newest first)
        break
    }

    setFilteredItems(result)
  }, [searchTerm, sortBy, wishlistItems])

  const removeFromWishlist = (itemId: string) => {
    setWishlistItems(prev => prev.filter(item => item.id !== itemId))
    setFilteredItems(prev => prev.filter(item => item.id !== itemId))
    
    toast({
      id: "remove-wishlist",
      title: "Removed from wishlist",
      description: "Item has been removed from your wishlist",
    })
  }

  const addToCart = (item: any) => {
    toast({
      id: "add-cart",
      title: "Item added to cart",
      description: `${item.name} has been added to your cart`,
    })
  }

  const moveAllToCart = () => {
    if (wishlistItems.length > 0) {
      toast({
        id: "move-all-cart",
        title: "All items added to cart",
        description: `${wishlistItems.length} items have been added to your cart`,
      })
      // In a real app, you would add all items to cart here
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Wishlist</h1>
          <div className="flex gap-2">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <div className="h-10 bg-gray-200 rounded-md w-full animate-pulse"></div>
            </div>
            <div className="w-40">
              <div className="h-10 bg-gray-200 rounded-md w-full animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-40 bg-gray-200 animate-pulse"></div>
              <CardContent className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Wishlist</h1>
        <div className="flex gap-2">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search wishlist..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Move All to Cart Button */}
      {wishlistItems.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={moveAllToCart}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Move All to Cart
          </Button>
        </div>
      )}

      {/* Empty State */}
      {filteredItems.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Your wishlist is empty</h3>
            <p className="text-gray-500 mb-6">Start exploring your favorite shooting gear!</p>
            <Button>Shop Now</Button>
          </CardContent>
        </Card>
      ) : (
        /* Wishlist Items Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-48 object-cover"
                />
                {item.discount > 0 && (
                  <Badge className="absolute top-2 left-2 bg-red-500">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    {item.discount}% OFF
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2 bg-white hover:bg-red-50 border-red-200"
                  onClick={() => removeFromWishlist(item.id)}
                >
                  <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                </Button>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 group-hover:text-yellow-600 transition-colors">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {item.description}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-bold text-lg">{item.price}</span>
                  {item.originalPrice && item.originalPrice !== item.price && (
                    <span className="text-sm text-gray-500 line-through">
                      {item.originalPrice}
                    </span>
                  )}
                </div>
                <div className="mt-3">
                  {item.inStock ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      In Stock
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      Out of Stock
                    </Badge>
                  )}
                </div>
                <Button
                  className="w-full mt-4"
                  disabled={!item.inStock}
                  onClick={() => addToCart(item)}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}