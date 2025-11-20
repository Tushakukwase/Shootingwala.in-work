"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Here you would typically send the form data to your API
      console.log("Contact form submitted:", formData)
      
      setSuccess(true)
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      })
    } catch (err) {
      setError("Failed to send message. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get in touch with us. We're here to help with all your photography needs.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-orange-500" />
                  Email Us
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-2">General Inquiries:</p>
                <p className="font-semibold text-gray-900">info@shootingwala.in</p>
                <p className="text-gray-600 mt-4 mb-2">For Photographers:</p>
                <p className="font-semibold text-gray-900">photographers@shootingwala.in</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-orange-500" />
                  Call Us
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-2">Customer Support:</p>
                <p className="font-semibold text-gray-900">+91 2269645750</p>
                <p className="text-gray-600 mt-4 mb-2">Business Hours:</p>
                <p className="font-semibold text-gray-900">24/7</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-500" />
                  Visit Us
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-2">Registered Office:</p>
                <p className="font-semibold text-gray-900 mb-4">
                  shootingwala, Hanuman Ward, Thana, Petrol Pump<br />
                  Jawahar Nagar Road, Bhandara<br />
                  Maharashtra, India - 441906
                </p>
                {/* Google Maps Embed */}
                <div className="mt-4 rounded-lg overflow-hidden">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3752.979644781999!2d79.6964573148897!3d21.18333338590376!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd4951f0c641983%3A0x7a8d0d0e5d5f5d5d!2sShootingwala!5e0!3m2!1sen!2sin!4v1654567890123!5m2!1sen!2sin" 
                    width="100%" 
                    height="300" 
                    style={{ border: 0 }}
                    allowFullScreen={true} 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Shootingwala Location"
                  ></iframe>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-500" />
                  Response Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We typically respond to all inquiries within 24 hours during business days.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Send us a Message</CardTitle>
                <p className="text-gray-600">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>
              </CardHeader>
              <CardContent>
                {success && (
                  <Alert className="mb-6 border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Thank you for your message! We'll get back to you soon.
                    </AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert className="mb-6 border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="mt-1"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="mt-1"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        className="mt-1"
                        placeholder="+91 9876543210"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        className="mt-1"
                        placeholder="What is this regarding?"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      className="mt-1 min-h-[120px]"
                      placeholder="Please provide details about your inquiry..."
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600">Quick answers to common questions</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  How do I book a photographer?
                </h3>
                <p className="text-gray-600">
                  Browse our photographer profiles, check their availability, and contact them directly 
                  through our platform. You can also call us for personalized recommendations.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  What are your service charges?
                </h3>
                <p className="text-gray-600">
                  Our platform is free for clients. Photographers set their own rates, and you pay them 
                  directly. No hidden fees or commissions from our side.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  How do you verify photographers?
                </h3>
                <p className="text-gray-600">
                  All photographers go through a thorough verification process including portfolio review, 
                  background checks, and client feedback analysis before joining our platform.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Can I cancel or reschedule a booking?
                </h3>
                <p className="text-gray-600">
                  Cancellation and rescheduling policies vary by photographer. Please check the specific 
                  terms with your chosen photographer or contact us for assistance.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}