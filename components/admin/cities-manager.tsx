"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import NextImage from "next/image"
import { Upload, X, Edit3, Trash2, Search, Plus, MapPin, CheckCircle } from "lucide-react"

interface City {
  id: string
  name: string
  image: string
  searchCount?: number
  isPopular?: boolean
  selected?: boolean
  show_on_home?: boolean
}

export default function CitiesManager() {
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [cityName, setCityName] = useState("")
  const [cityImage, setCityImage] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editImage, setEditImage] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const editFileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchCities()
  }, [])

  const fetchCities = async () => {
    try {
      const response = await fetch('/api/cities')
      const data = await response.json()
      const normalizedCities = (data.cities || []).map((city: any) => ({
        ...city,
        id: city._id ? city._id.toString() : city.id
      }))
      setCities(normalizedCities)
      setLoading(false)
    } catch (error) {
      // Silently handle error
      setLoading(false)
    }
  }

  const handleFileUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setCityImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find((file) => file.type.startsWith("image/"))
    if (imageFile) {
      handleFileUpload(imageFile)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const addCity = async () => {
    if (cityName.trim() && cityImage) {
      try {
        const response = await fetch('/api/cities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: cityName.trim(), image: cityImage })
        })
        
        const data = await response.json()
        if (!response.ok) {
          alert(data.error || 'Failed to add city')
          return
        }
        
        await fetchCities()
        setCityName("")
        setCityImage(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        alert('City added successfully')
      } catch (error) {
        alert('Failed to add city')
      }
    }
  }

  const deleteCity = async (id: string) => {
    if (confirm('Are you sure you want to delete this city? This action cannot be undone.')) {
      try {
        console.log('Deleting city with ID:', id) // Debug log
        const response = await fetch('/api/cities', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        })

        const data = await response.json()
        console.log('Delete response:', data) // Debug log
        
        if (response.ok && data.success) {
          // Remove from local state immediately for real-time update
          setCities(prevCities => prevCities.filter(city => city.id !== id))
          alert('City deleted successfully')
        } else {
          throw new Error(data.error || 'Failed to delete city')
        }
      } catch (error) {
        console.error('Delete error:', error)
        alert('Failed to delete city: ' + (error instanceof Error ? error.message : 'Unknown error'))
      }
    }
  }

  const startEdit = (city: City) => {
    setEditId(city.id)
    setEditName(city.name)
    setEditImage(city.image)
  }

  const cancelEdit = () => {
    setEditId(null)
    setEditName("")
    setEditImage(null)
    if (editFileInputRef.current) editFileInputRef.current.value = ""
  }

  const handleEditFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setEditImage(ev.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const saveEdit = async () => {
    if (!editName.trim() || !editImage) return
    
    try {
      const response = await fetch('/api/cities', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editId, name: editName.trim(), image: editImage })
      })

      if (response.ok) {
        await fetchCities()
        cancelEdit()
        alert('City updated successfully')
      } else {
        throw new Error('Failed to update city')
      }
    } catch (error) {
      alert('Failed to update city')
    }
  }

  const toggleCitySelection = async (cityId: string) => {
    try {
      const response = await fetch('/api/cities', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cityId, action: 'toggle-selection' })
      })

      const data = await response.json()
      
      if (response.ok) {
        // Update local state immediately for real-time feedback
        setCities(prevCities => 
          prevCities.map(city => 
            city.id === cityId 
              ? { ...city, selected: data.selected }
              : city
          )
        )
      } else {
        throw new Error(data.error || 'Failed to toggle selection')
      }
    } catch (error) {
      console.error('Failed to toggle city selection:', error)
      alert('Failed to update city selection')
    }
  }

  const toggleShowOnHome = async (cityId: string) => {
    try {
      console.log('Toggling show on home for city ID:', cityId) // Debug log
      const response = await fetch('/api/cities', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cityId, action: 'toggle-show-on-home' })
      })

      const data = await response.json()
      console.log('Toggle show on home response:', data) // Debug log
      
      if (response.ok && data.success) {
        // Update local state immediately for real-time feedback
        setCities(prevCities => 
          prevCities.map(city => 
            city.id === cityId 
              ? { ...city, show_on_home: data.show_on_home }
              : city
          )
        )
      } else {
        throw new Error(data.error || 'Failed to toggle show on home')
      }
    } catch (error) {
      console.error('Failed to toggle show on home:', error)
      alert('Failed to update show on home setting')
    }
  }

  const filteredCities = cities.filter((city) =>
    city.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
            <MapPin className="w-6 h-6 text-blue-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Popular Search Cities
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Manage cities where photography services are available and popular among users
          </p>
        </div>

        {/* Add City Form */}
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add New City
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* City Name */}
              <div className="space-y-3">
                <Label htmlFor="cityName" className="text-sm font-semibold text-gray-700">
                  City Name
                </Label>
                <Input
                  id="cityName"
                  type="text"
                  placeholder="Enter city name (e.g., Mumbai, Delhi)"
                  value={cityName}
                  onChange={(e) => setCityName(e.target.value)}
                  className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* City Image Upload */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">City Image</Label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-all duration-300 ${
                    isDragging
                      ? "border-blue-500 bg-blue-50 scale-105"
                      : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />

                  {cityImage ? (
                    <div className="relative">
                      <div className="w-20 h-20 mx-auto rounded-lg overflow-hidden">
                        <NextImage
                          src={cityImage}
                          alt="Preview"
                          width={80}
                          height={80}
                          className="object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={() => setCityImage(null)}
                        variant="outline"
                        size="sm"
                        className="mt-2 text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                      <p className="text-sm text-gray-600">{isDragging ? "Drop image here" : "Click or drag image"}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Button
              onClick={addCity}
              disabled={!cityName.trim() || !cityImage}
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add City
            </Button>
          </CardContent>
        </Card>

        {/* Existing Cities */}
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Cities ({filteredCities.length})
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search cities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-9 bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading cities...</p>
              </div>
            ) : filteredCities.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No cities found</p>
                <p className="text-gray-400">Add your first city to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-4">
                {filteredCities.map((city) => {
                  const isEditing = editId === city.id
                  return (
                    <div
                      key={city.id}
                      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-[1.02] border border-gray-100 p-4 flex flex-col"
                    >
                      {isEditing ? (
                        // Edit Form
                        <div className="space-y-3">
                          <Input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-8 text-sm"
                          />
                          <div className="relative">
                            <input
                              ref={editFileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleEditFileSelect}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="border border-dashed border-gray-300 rounded p-2 text-center text-xs">
                              {editImage ? "Image Selected" : "Change Image"}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              onClick={saveEdit}
                              className="h-8 text-xs flex-1"
                            >
                              <CheckCircle className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEdit}
                              className="h-8 text-xs flex-1"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // Display Mode
                        <>
                          <div className="relative rounded-lg overflow-hidden mb-3">
                            <NextImage
                              src={city.image}
                              alt={city.name}
                              width={100}
                              height={100}
                              className="w-full h-24 object-cover"
                            />
                            {city.show_on_home && (
                              <Badge className="absolute top-2 right-2 bg-blue-500 text-white text-xs">
                                Home
                              </Badge>
                            )}
                          </div>
                          
                          <h3 className="font-semibold text-sm truncate text-center mb-3">{city.name}</h3>
                          
                          <div className="flex items-center justify-between mt-auto">
                            <Badge variant="secondary" className="text-xs">
                              {city.searchCount || 0} searches
                            </Badge>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => startEdit(city)}
                                className="h-7 w-7 p-0"
                              >
                                <Edit3 className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteCity(city.id)}
                                className="h-7 w-7 p-0 text-red-600"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}