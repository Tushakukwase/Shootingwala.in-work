"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Props = {
  imageUrl: string | null
  setImageUrl: (url: string | null) => void
  eventTitle: string
  setEventTitle: (val: string) => void
  eventDate: string
  setEventDate: (val: string) => void
  eventLocation: string
  setEventLocation: (val: string) => void
  description: string
  setDescription: (val: string) => void
  buttonText: string
  setButtonText: (val: string) => void
  buttonAction: 'redirect' | 'modal' | 'contact'
  setButtonAction: (val: 'redirect' | 'modal' | 'contact') => void
  redirectUrl: string
  setRedirectUrl: (val: string) => void
  isEnabled: boolean
  setIsEnabled: (val: boolean) => void
  onSave: () => void
}

export default function DigitalInvitationManager({ 
  imageUrl, 
  setImageUrl, 
  eventTitle,
  setEventTitle,
  eventDate,
  setEventDate,
  eventLocation,
  setEventLocation,
  description, 
  setDescription,
  buttonText,
  setButtonText,
  buttonAction,
  setButtonAction,
  redirectUrl,
  setRedirectUrl,
  isEnabled,
  setIsEnabled,
  onSave 
}: Props) {
  const lastObjectUrl = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      if (lastObjectUrl.current) {
        URL.revokeObjectURL(lastObjectUrl.current)
      }
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return
    }

    const url = URL.createObjectURL(file)
    if (lastObjectUrl.current) {
      URL.revokeObjectURL(lastObjectUrl.current)
    }
    lastObjectUrl.current = url
    
    // Set the URL with a small delay to ensure blob is ready
    setTimeout(() => {
      setImageUrl(url)
    }, 10)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Side - Form */}
      <Card className="border border-border/60 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="space-y-1">
          <CardTitle className="text-balance">Digital Invitation Manager</CardTitle>
          <CardDescription className="text-pretty">
            Create and manage digital invitations for events.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Image upload */}
          <div className="space-y-3">
            <Label htmlFor="invitation-image">Invitation Background Image</Label>
            <div className="flex items-center gap-4">
              <div className="size-16 rounded-xl overflow-hidden ring-1 ring-border/60 shadow-sm bg-muted flex items-center justify-center shrink-0">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Invitation preview"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.jpg';
                    }}
                  />
                ) : (
                  <img 
                    src="/placeholder.jpg" 
                    alt="Placeholder" 
                    className="h-full w-full object-cover opacity-60"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg?height=80&width=80&query=invitation';
                    }}
                  />
                )}
              </div>
              <div className="flex-1">
                <Input
                  id="invitation-image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file:mr-4 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-foreground file:cursor-pointer file:ring-1 file:ring-inset file:ring-border hover:file:bg-accent transition-colors"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Recommended size: 1080×1920. PNG or JPG.
                </p>
              </div>
            </div>
          </div>

          {/* Event title */}
          <div className="space-y-2">
            <Label htmlFor="event-title">Event Title</Label>
            <Input
              id="event-title"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="e.g., Wedding Celebration, Birthday Party"
              className="transition-colors focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Event date */}
          <div className="space-y-2">
            <Label htmlFor="event-date">Event Date</Label>
            <Input
              id="event-date"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="transition-colors focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Event location */}
          <div className="space-y-2">
            <Label htmlFor="event-location">Event Location</Label>
            <Input
              id="event-location"
              value={eventLocation}
              onChange={(e) => setEventLocation(e.target.value)}
              placeholder="e.g., Grand Ballroom, City Hotel"
              className="transition-colors focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="invitation-description">Additional Details</Label>
            <Textarea
              id="invitation-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any additional details for the invitation..."
              rows={3}
              className="resize-y"
            />
            <p className="text-xs text-muted-foreground">
              {(description || '').length} characters
            </p>
          </div>

          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
            <div>
              <Label className="text-base font-medium">Show on Homepage</Label>
              <p className="text-sm text-gray-600">Display this invitation section on the homepage</p>
            </div>
            <Switch
              checked={isEnabled}
              onCheckedChange={setIsEnabled}
            />
          </div>

          {/* Button Configuration */}
          {isEnabled && (
            <div className="space-y-4 p-4 border rounded-lg">
              <h4 className="font-medium text-lg">Button Configuration</h4>
              
              <div className="space-y-2">
                <Label htmlFor="button-text">Button Text</Label>
                <Input
                  id="button-text"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  placeholder="e.g., Create Invitation, Know More, Get Started"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="button-action">Button Action</Label>
                <Select value={buttonAction} onValueChange={setButtonAction}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="redirect">Redirect to Page</SelectItem>
                    <SelectItem value="modal">Open Modal/Popup</SelectItem>
                    <SelectItem value="contact">Contact Form</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {buttonAction === 'redirect' && (
                <div className="space-y-2">
                  <Label htmlFor="redirect-url">Redirect URL</Label>
                  <Input
                    id="redirect-url"
                    value={redirectUrl}
                    onChange={(e) => setRedirectUrl(e.target.value)}
                    placeholder="/digital-invitations or https://example.com"
                  />
                  <p className="text-xs text-gray-500">
                    Use relative URLs (/page) or full URLs (https://example.com)
                  </p>
                </div>
              )}

              {buttonAction === 'modal' && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    Modal will show invitation details and contact information
                  </p>
                </div>
              )}

              {buttonAction === 'contact' && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700">
                    Button will open contact form for invitation inquiries
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="pt-2">
            <Button type="button" onClick={onSave} className="min-w-32">
              Save Invitation Configuration
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Right Side - Live Preview */}
      <Card className="border border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-center">Live Preview</CardTitle>
          <CardDescription className="text-center">
            See how your invitation will look
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center p-6">
          <div className="relative w-80 h-[500px] bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl shadow-xl overflow-hidden border-2">
            {/* Background Image */}
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Invitation background"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            
            {/* Overlay for text readability */}
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
            
            {/* Content Overlay */}
            <div className="relative z-10 h-full flex flex-col justify-center items-center text-center p-8 text-white">
              {/* Event Title */}
              <h1 className="text-2xl font-bold mb-6 drop-shadow-lg">
                {eventTitle || "Your Event Title"}
              </h1>
              
              {/* Event Date */}
              {eventDate && (
                <div className="mb-4">
                  <p className="text-base font-medium drop-shadow">
                    📅 {new Date(eventDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
              
              {/* Event Location */}
              {eventLocation && (
                <div className="mb-5">
                  <p className="text-base drop-shadow">
                    📍 {eventLocation}
                  </p>
                </div>
              )}
              
              {/* Description */}
              {description && (
                <div className="mb-6">
                  <p className="text-sm leading-relaxed drop-shadow max-w-64">
                    {description}
                  </p>
                </div>
              )}
              
              {/* Button Preview */}
              {isEnabled && (
                <div className="mb-6">
                  <button className="bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium py-3 px-6 rounded-full transition-colors shadow-lg hover:shadow-xl">
                    {buttonText || "Know More"}
                  </button>
                </div>
              )}
              
              {/* Decorative Elements */}
              <div className="mt-auto">
                <div className="w-20 h-1 bg-white opacity-60 mx-auto mb-3"></div>
                <p className="text-sm opacity-90 font-medium">You're Invited!</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}