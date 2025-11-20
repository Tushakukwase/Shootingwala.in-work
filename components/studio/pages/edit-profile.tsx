"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export default function EditProfile() {
  const [formData, setFormData] = useState({
    name: "Alex Photography",
    email: "alex@photography.com",
    location: "San Francisco, CA",
    pricePerHour: "250",
    bio: "Professional photographer specializing in weddings and portraits.",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Edit Profile</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Name</label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="bg-input border-border text-foreground"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="bg-input border-border text-foreground"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Location</label>
            <Input
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="bg-input border-border text-foreground"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Price per Hour ($)</label>
            <Input
              name="pricePerHour"
              type="number"
              value={formData.pricePerHour}
              onChange={handleChange}
              className="bg-input border-border text-foreground"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-base">
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}