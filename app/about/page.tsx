"use client"

import NextImage from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Camera, Users, Award, Heart, Star, CheckCircle } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">About ShootingWala</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              India's premier platform connecting you with professional photographers for all your special moments. 
              We believe every moment deserves to be captured beautifully.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6">
                At ShootingWala, we're passionate about connecting talented photographers with clients who value 
                quality and creativity. Our mission is to make professional photography accessible to everyone, 
                whether it's for weddings, events, portraits, or commercial projects.
              </p>
              <p className="text-lg text-gray-600">
                We carefully vet our photographers to ensure you get the best service and stunning results 
                that you'll treasure for a lifetime.
              </p>
            </div>
            <div className="relative h-96">
              <NextImage
                src="/placeholder.svg?height=400&width=600"
                alt="Professional photographer at work"
                fill
                className="object-cover rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Impact</h2>
            <p className="text-lg text-gray-600">Numbers that speak for themselves</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-orange-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">500+</div>
              <div className="text-gray-600">Professional Photographers</div>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-orange-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">10,000+</div>
              <div className="text-gray-600">Happy Clients</div>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-orange-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">50+</div>
              <div className="text-gray-600">Cities Covered</div>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-orange-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">25,000+</div>
              <div className="text-gray-600">Moments Captured</div>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-lg text-gray-600">What drives us every day</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Star className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Quality First</h3>
                <p className="text-gray-600">
                  We maintain the highest standards by working only with verified, professional photographers 
                  who deliver exceptional results.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-8 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Trust & Reliability</h3>
                <p className="text-gray-600">
                  Your special moments are precious. We ensure reliable service and transparent communication 
                  throughout your photography journey.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-8 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Passion for Excellence</h3>
                <p className="text-gray-600">
                  We're passionate about photography and committed to helping you create beautiful memories 
                  that last a lifetime.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-orange-500">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Capture Your Moments?</h2>
          <p className="text-xl text-orange-100 mb-8">
            Join thousands of satisfied clients who trust ShootingWala for their photography needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/photographers">
              <Button size="lg" variant="secondary" className="bg-white text-orange-500 hover:bg-gray-100">
                Find Photographers
              </Button>
            </Link>
            <Link href="/photographer-register">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-orange-500">
                Join as Photographer
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}