"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { X } from "lucide-react"

interface PhotographerData {
  id: string
  name: string
  studioName: string
  email: string
  phone: string
  location: string
  bio: string
  experience: number
  specialization: string[]
}

interface EditPhotographerFormProps {
  photographer: PhotographerData
  onClose: () => void
  onSave: (updatedPhotographer: PhotographerData) => void
}

export default function EditPhotographerForm({ photographer, onClose, onSave }: EditPhotographerFormProps) {
  const [formData, setFormData] = useState<PhotographerData>(photographer)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      
      // In a real implementation, you would call an API to save the changes
      // For now, we'll just simulate a successful save
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onSave(formData)
      toast({
        title: "Success",
        description: "Photographer details updated successfully",
      })
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update photographer details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Edit Photographer Details</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Photographer Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <Label htmlFor="studioName">Studio Name</Label>
              <Input
                id="studioName"
                name="studioName"
                value={formData.studioName}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <Label htmlFor="experience">Experience (years)</Label>
              <Input
                id="experience"
                name="experience"
                type="number"
                value={formData.experience}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}