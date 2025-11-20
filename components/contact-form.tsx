"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react"

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.message) {
      setError('Please fill in all required fields')
      return
    }
    
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSuccess(true)
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        })
        setTimeout(() => setSuccess(false), 5000)
      } else {
        setError(data.error || 'Failed to send message')
      }
    } catch (error) {
      console.error('Error submitting contact form:', error)
      setError('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-green-700 mb-2">Message Sent Successfully!</h3>
          <p className="text-gray-600 mb-4">
            Thank you for contacting us. We'll get back to you within 24 hours.
          </p>
          <Button onClick={() => setSuccess(false)} variant="outline">
            Send Another Message
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Get in Touch</CardTitle>
          <p className="text-gray-600">
            Have questions about our photography services? We'd love to hear from you.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold">Email Us</h4>
              <p className="text-gray-600">info@photobook.com</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Phone className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold">Call Us</h4>
              <p className="text-gray-600">+91 98765 43210</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold">Visit Us</h4>
              <p className="text-gray-600">Mumbai, Maharashtra, India</p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Business Hours</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
              <p>Saturday: 10:00 AM - 4:00 PM</p>
              <p>Sunday: Closed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Send us a Message</CardTitle>
          <p className="text-gray-600">
            Fill out the form below and we'll respond as soon as possible.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder="What's this about?"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Tell us about your photography needs..."
                rows={5}
                required
              />
            </div>
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
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
            
            <p className="text-xs text-gray-500 text-center">
              By submitting this form, you agree to our privacy policy and terms of service.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}