"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/AuthContext"
import { Settings, Save, CheckCircle } from "lucide-react"

export function Preferences() {
  const { user } = useAuth()
  const [preferences, setPreferences] = useState({
    preferredCategories: [] as string[],
    preferredLocation: '',
    priceRange: '',
  })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const availableCategories = [
    'Wedding', 'Portrait', 'Event', 'Product', 'Fashion', 'Nature', 'Architecture', 'Street'
  ]

  const priceRanges = [
    { value: 'low', label: 'Budget Friendly (₹0 - ₹500)' },
    { value: 'medium', label: 'Mid Range (₹500 - ₹1,500)' },
    { value: 'high', label: 'Premium (₹1,500 - ₹5,000)' },
    { value: 'premium', label: 'Luxury (₹5,000+)' }
  ]

  useEffect(() => {
    if (user) {
      fetchPreferences()
    }
  }, [user])

  const fetchPreferences = async () => {
    try {
      const response = await fetch(`/api/user-preferences/${user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setPreferences({
          preferredCategories: data.preferredCategories || [],
          preferredLocation: data.preferredLocation || '',
          priceRange: data.priceRange || '',
        })
      }
    } catch (error) {
      console.error('Failed to fetch preferences:', error)
    }
  }

  const handleCategoryChange = (category: string, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      preferredCategories: checked 
        ? [...prev.preferredCategories, category]
        : prev.preferredCategories.filter(c => c !== category)
    }))
  }

  const handleSave = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/user-preferences/${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      })

      if (response.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (error) {
      console.error('Failed to save preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-orange-500" />
          Photography Preferences
        </CardTitle>
        <p className="text-sm text-gray-600">
          Set your preferences to get personalized photographer recommendations
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preferred Categories */}
        <div>
          <Label className="text-base font-semibold">Preferred Photography Types</Label>
          <p className="text-sm text-gray-600 mb-3">Select the types of photography you're most interested in</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {availableCategories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={category}
                  checked={preferences.preferredCategories.includes(category)}
                  onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                />
                <Label htmlFor={category} className="text-sm">{category}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Preferred Location */}
        <div>
          <Label htmlFor="location" className="text-base font-semibold">Preferred Location</Label>
          <p className="text-sm text-gray-600 mb-2">City or area where you usually need photography services</p>
          <Input
            id="location"
            placeholder="e.g., Mumbai, Delhi, Bangalore"
            value={preferences.preferredLocation}
            onChange={(e) => setPreferences(prev => ({ ...prev, preferredLocation: e.target.value }))}
          />
        </div>

        {/* Price Range */}
        <div>
          <Label className="text-base font-semibold">Budget Range</Label>
          <p className="text-sm text-gray-600 mb-2">Your typical budget for photography services</p>
          <Select
            value={preferences.priceRange}
            onValueChange={(value) => setPreferences(prev => ({ ...prev, priceRange: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your budget range" />
            </SelectTrigger>
            <SelectContent>
              {priceRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-3 pt-4">
          <Button 
            onClick={handleSave} 
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Preferences
              </>
            )}
          </Button>
          
          {saved && (
            <div className="flex items-center text-green-600">
              <CheckCircle className="w-4 h-4 mr-1" />
              <span className="text-sm">Preferences saved!</span>
            </div>
          )}
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> Setting your preferences helps us show you photographers that match your style and budget. 
            You can update these anytime, and we'll learn from your activity to improve recommendations.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}