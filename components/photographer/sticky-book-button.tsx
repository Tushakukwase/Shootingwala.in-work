"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Phone, MessageCircle, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface StickyBookButtonProps {
  photographer: {
    id: string
    name: string
    contact: {
      phone: string
    }
    packages: {
      price: number
    }[]
  }
}

export default function StickyBookButton({ photographer }: StickyBookButtonProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling 300px
      setIsVisible(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleBookNow = () => {
    // Scroll to packages section or open booking modal
    const packagesSection = document.querySelector('[data-section="packages"]')
    if (packagesSection) {
      packagesSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleCall = () => {
    window.open(`tel:${photographer.contact.phone}`)
  }

  const handleWhatsApp = () => {
    const message = encodeURIComponent(`Hi ${photographer.name}, I'm interested in your photography services. Can we discuss?`)
    window.open(`https://wa.me/${photographer.contact.phone.replace(/\D/g, '')}?text=${message}`)
  }

  const minPrice = Math.min(...photographer.packages.map(pkg => pkg.price))
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Mobile Sticky Button */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-white border-t shadow-lg md:hidden"
          >
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-sm text-gray-600">Starting from</p>
                <p className="font-bold text-lg text-primary">{formatPrice(minPrice)}</p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsLiked(!isLiked)}
                  className="p-2"
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current text-red-500' : ''}`} />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCall}
                  className="p-2"
                >
                  <Phone className="w-4 h-4" />
                </Button>
                
                <Button
                  onClick={handleBookNow}
                  className="px-6"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Now
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Desktop Floating Action Buttons */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 z-40 hidden md:flex flex-col gap-3"
          >
            {/* Like Button */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLiked(!isLiked)}
                className="w-12 h-12 rounded-full p-0 bg-white shadow-lg border-gray-200"
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current text-red-500' : 'text-gray-600'}`} />
              </Button>
            </motion.div>

            {/* WhatsApp Button */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={handleWhatsApp}
                className="w-12 h-12 rounded-full p-0 bg-green-500 hover:bg-green-600 border-green-500 shadow-lg"
              >
                <MessageCircle className="w-5 h-5 text-white" />
              </Button>
            </motion.div>

            {/* Call Button */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={handleCall}
                className="w-12 h-12 rounded-full p-0 bg-blue-500 hover:bg-blue-600 border-blue-500 shadow-lg"
              >
                <Phone className="w-5 h-5 text-white" />
              </Button>
            </motion.div>

            {/* Main Book Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card className="p-3 shadow-lg bg-white">
                <div className="text-center mb-2">
                  <p className="text-xs text-gray-600">Starting from</p>
                  <p className="font-bold text-primary">{formatPrice(minPrice)}</p>
                </div>
                <Button
                  onClick={handleBookNow}
                  className="w-full"
                  size="sm"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Now
                </Button>
              </Card>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}