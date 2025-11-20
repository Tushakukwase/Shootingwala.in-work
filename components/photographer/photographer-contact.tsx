"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Phone, Mail, Instagram, Facebook, Globe, MessageCircle, Send, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"

interface ContactInfo {
  phone: string
  email: string
  instagram?: string
  facebook?: string
  website?: string
}

interface PhotographerContactProps {
  contact: ContactInfo
}

export default function PhotographerContact({ contact }: PhotographerContactProps) {
  const { isAuthenticated } = useAuth()
  const [showMessageForm, setShowMessageForm] = useState(false)
  const [showOTPModal, setShowOTPModal] = useState(false)
  const [showContactInfo, setShowContactInfo] = useState(false)
  const [userName, setUserName] = useState('')
  const [userPhone, setUserPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [messageForm, setMessageForm] = useState({
    name: '',
    email: '',
    phone: '',
    eventDate: '',
    eventType: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setMessageForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('Message sent:', messageForm)
    alert('Message sent successfully! The photographer will get back to you soon.')
    
    setMessageForm({
      name: '',
      email: '',
      phone: '',
      eventDate: '',
      eventType: '',
      message: ''
    })
    setShowMessageForm(false)
    setIsSubmitting(false)
  }

  const handleContactClick = () => {
    if (isAuthenticated) {
      // User is logged in, show contact info directly
      setShowContactInfo(true)
    } else {
      // User not logged in, show OTP modal
      setShowOTPModal(true)
    }
  }

  const handleSendOTP = async () => {
    if (!userName || userName.trim().length < 2) {
      alert('Please enter your name')
      return
    }
    
    if (!userPhone || userPhone.length < 10) {
      alert('Please enter a valid phone number')
      return
    }

    setIsVerifying(true)
    // Simulate sending OTP
    await new Promise(resolve => setTimeout(resolve, 1000))
    setOtpSent(true)
    setIsVerifying(false)
    alert(`OTP sent to ${userPhone}`)
  }

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      alert('Please enter a valid 6-digit OTP')
      return
    }

    setIsVerifying(true)
    // Simulate OTP verification
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock verification - in production, verify with backend
    if (otp === '123456' || true) { // For demo, accept any OTP
      setShowOTPModal(false)
      setShowContactInfo(true)
      setIsVerifying(false)
      alert('Phone verified successfully!')
    } else {
      setIsVerifying(false)
      alert('Invalid OTP. Please try again.')
    }
  }

  const socialLinks = [
    {
      name: 'Instagram',
      icon: Instagram,
      url: contact.instagram ? `https://instagram.com/${contact.instagram.replace('@', '')}` : null,
      handle: contact.instagram,
      color: 'text-pink-500'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: contact.facebook ? `https://facebook.com/${contact.facebook}` : null,
      handle: contact.facebook,
      color: 'text-blue-600'
    },
    {
      name: 'Website',
      icon: Globe,
      url: contact.website ? `https://${contact.website}` : null,
      handle: contact.website,
      color: 'text-gray-600'
    }
  ].filter(link => link.url)

  return (
    <>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <MessageCircle className="w-5 h-5 text-primary" />
              Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Direct Contact */}
            <div className="space-y-3">
              {contact.phone && (isAuthenticated || showContactInfo) ? (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <a 
                      href={`tel:${contact.phone}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {contact.phone}
                    </a>
                  </div>
                </div>
              ) : contact.phone && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-green-500" />
                  <div className="flex-1">
                    <p className="font-medium">Phone</p>
                    <p className="text-sm text-gray-600">Click to view contact number</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleContactClick}
                    className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
                  >
                    View Number
                  </Button>
                </div>
              )}

            {contact.email && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium">Email</p>
                  <a 
                    href={`mailto:${contact.email}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {contact.email}
                  </a>
                </div>
              </div>
            )}

            {!contact.phone && !contact.email && (
              <div className="text-center py-4 text-gray-500">
                <p>Contact information not available</p>
                <p className="text-sm">Please use the message form below</p>
              </div>
            )}
          </div>

          {/* Social Media */}
          {socialLinks.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">Follow on Social Media</h4>
              <div className="space-y-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <social.icon className={`w-5 h-5 ${social.color}`} />
                    <div>
                      <p className="font-medium text-sm">{social.name}</p>
                      <p className="text-xs text-gray-600">{social.handle}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Message Form Toggle */}
          <div className="pt-4 border-t">
            {!showMessageForm ? (
              <Button 
                onClick={() => setShowMessageForm(true)}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Send a Message</h4>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowMessageForm(false)}
                  >
                    Cancel
                  </Button>
                </div>

                <form onSubmit={handleSubmitMessage} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={messageForm.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Your full name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={messageForm.email}
                        onChange={handleInputChange}
                        required
                        placeholder="your@email.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={messageForm.phone}
                        onChange={handleInputChange}
                        placeholder="+91 98765 43210"
                      />
                    </div>

                    <div>
                      <Label htmlFor="eventDate">Event Date</Label>
                      <Input
                        id="eventDate"
                        name="eventDate"
                        type="date"
                        value={messageForm.eventDate}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div>
                      <Label htmlFor="eventType">Event Type</Label>
                      <select
                        id="eventType"
                        name="eventType"
                        value={messageForm.eventType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">Select event type</option>
                        <option value="wedding">Wedding</option>
                        <option value="pre-wedding">Pre-wedding</option>
                        <option value="portrait">Portrait</option>
                        <option value="event">Event</option>
                        <option value="product">Product</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={messageForm.message}
                        onChange={handleInputChange}
                        required
                        placeholder="Tell me about your event, requirements, and any specific questions..."
                        rows={4}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
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
              </div>
            )}
          </div>

          {/* Quick Contact Actions */}
          {contact.phone && (isAuthenticated || showContactInfo) && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(`tel:${contact.phone}`)}
              >
                <Phone className="w-3 h-3 mr-1" />
                Call
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(`https://wa.me/${contact.phone.replace(/\D/g, '')}`)}
              >
                <MessageCircle className="w-3 h-3 mr-1" />
                WhatsApp
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>

    {/* OTP Verification Modal */}
    {showOTPModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Verify Your Phone Number</h3>
            <button
              onClick={() => {
                setShowOTPModal(false)
                setOtpSent(false)
                setUserName('')
                setUserPhone('')
                setOtp('')
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!otpSent ? (
            <div className="space-y-4">
              <p className="text-gray-600">Enter your details to view photographer's contact information</p>
              <div>
                <Label htmlFor="userName">Full Name *</Label>
                <Input
                  id="userName"
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <Label htmlFor="userPhone">Phone Number *</Label>
                <Input
                  id="userPhone"
                  type="tel"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  maxLength={10}
                />
              </div>
              <Button
                onClick={handleSendOTP}
                disabled={isVerifying}
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
              >
                {isVerifying ? 'Sending...' : 'Send OTP'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600">OTP sent to {userName} ({userPhone})</p>
              <div>
                <Label htmlFor="otp">Enter 6-digit OTP *</Label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  maxLength={6}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleVerifyOTP}
                  disabled={isVerifying}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
                >
                  {isVerifying ? 'Verifying...' : 'Verify OTP'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setOtpSent(false)
                    setOtp('')
                  }}
                >
                  Resend
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    )}
    </>
  )
}