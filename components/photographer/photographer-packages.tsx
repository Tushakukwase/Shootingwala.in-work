"use client"

import { motion } from "framer-motion"
import { Check, Star, MessageCircle, Package } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Package {
  id: string
  name: string
  price: number
  duration: string
  deliverables: string[]
  features: string[]
  isPopular?: boolean
}

interface PhotographerPackagesProps {
  packages: Package[]
}

export default function PhotographerPackages({ packages }: PhotographerPackagesProps) {
  // Debug: Log packages received
  console.log('Packages component received:', packages.length, 'packages');
  if (packages.length > 0) {
    console.log('Sample package:', packages[0]);
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price)
  }

  const handleRequestQuote = (packageId: string) => {
    // Handle quote request
    const selectedPackage = packages.find(pkg => pkg.id === packageId)
    if (selectedPackage) {
      const message = `Hi! I'm interested in your ${selectedPackage.name} (₹${selectedPackage.price.toLocaleString()}) for ${selectedPackage.duration}. Can we discuss the details?`
      const whatsappUrl = `https://wa.me/919876543210?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, '_blank')
    }
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card className="shadow-lg sticky top-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-blue-500 rounded"></div>
            Packages & Pricing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {packages.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-700 mb-2">No Packages Available</h3>
              <p className="text-sm text-gray-500">
                This photographer hasn't created any packages yet.
              </p>
              <Button variant="outline" className="mt-4" size="sm">
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact for Custom Quote
              </Button>
            </div>
          ) : (
            packages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`relative border rounded-lg p-4 ${
                  pkg.isPopular 
                    ? 'border-primary bg-primary/5' 
                    : 'border-gray-200 hover:border-gray-300'
                } transition-colors`}
              >
                {pkg.isPopular && (
                  <div className="absolute -top-3 left-4">
                    <Badge className="bg-primary">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg">{pkg.name}</h3>
                    <p className="text-sm text-gray-600">{pkg.duration} coverage</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-primary">
                      {formatPrice(pkg.price)}
                    </span>
                    <span className="text-sm text-gray-500">onwards</span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-900">What's included:</h4>
                    <ul className="space-y-1">
                      {pkg.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 space-y-2">
                    <Button 
                      className="w-full"
                      variant={pkg.isPopular ? "default" : "outline"}
                      onClick={() => handleRequestQuote(pkg.id)}
                    >
                      Request Quote
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-xs"
                    >
                      <MessageCircle className="w-3 h-3 mr-1" />
                      Ask Questions
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          )}

          <div className="pt-4 border-t">
            <p className="text-xs text-gray-500 text-center">
              Prices may vary based on location, date, and specific requirements. 
              Contact for custom packages.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}