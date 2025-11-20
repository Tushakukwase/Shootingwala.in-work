"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import NextImage from "next/image"
import { Upload, X, Edit3, Trash2, Search, Plus, Tag, CheckCircle } from "lucide-react"

interface Category {
  id: string
  name: string
  image: string
  searchCount?: number
  isPopular?: boolean
  selected?: boolean
  show_on_home?: boolean
}

export default function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryName, setCategoryName] = useState("")
  const [categoryImage, setCategoryImage] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editImage, setEditImage] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const editFileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      const normalizedCategories = (data.categories || []).map((category: any) => ({
        ...category,
        id: category._id ? category._id.toString() : category.id
      }))
      setCategories(normalizedCategories)
      setLoading(false)
    } catch (error) {
      // Silently handle error
      setLoading(false)
    }
  }

  const handleFileUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setCategoryImage(e.target?.result as string)
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

  const addCategory = async () => {
    if (categoryName.trim() && categoryImage) {
      try {
        const response = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: categoryName.trim(), image: categoryImage })
        })
        
        const data = await response.json()
        if (!response.ok) {
          alert(data.error || 'Failed to add category')
          return
        }
        
        await fetchCategories()
        setCategoryName("")
        setCategoryImage(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        alert('Category added successfully')
      } catch (error) {
        alert('Failed to add category')
      }
    }
  }

  const deleteCategory = async (id: string) => {
    if (confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      try {
        console.log('Deleting category with ID:', id) // Debug log
        const response = await fetch('/api/categories', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        })

        const data = await response.json()
        console.log('Delete response:', data) // Debug log
        
        if (response.ok && data.success) {
          // Remove from local state immediately for real-time update
          setCategories(prevCategories => prevCategories.filter(category => category.id !== id))
          alert('Category deleted successfully')
        } else {
          throw new Error(data.error || 'Failed to delete category')
        }
      } catch (error) {
        console.error('Delete error:', error)
        alert('Failed to delete category: ' + (error instanceof Error ? error.message : 'Unknown error'))
      }
    }
  }

  const startEdit = (category: Category) => {
    setEditId(category.id)
    setEditName(category.name)
    setEditImage(category.image)
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
      const response = await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editId, name: editName.trim(), image: editImage })
      })

      if (response.ok) {
        await fetchCategories()
        cancelEdit()
        alert('Category updated successfully')
      } else {
        throw new Error('Failed to update category')
      }
    } catch (error) {
      alert('Failed to update category')
    }
  }

  const toggleCategorySelection = async (categoryId: string) => {
    try {
      const response = await fetch('/api/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: categoryId, action: 'toggle-selection' })
      })

      const data = await response.json()
      
      if (response.ok) {
        // Update local state immediately for real-time feedback
        setCategories(prevCategories => 
          prevCategories.map(category => 
            category.id === categoryId 
              ? { ...category, selected: data.selected }
              : category
          )
        )
      } else {
        throw new Error(data.error || 'Failed to toggle selection')
      }
    } catch (error) {
      console.error('Failed to toggle category selection:', error)
      alert('Failed to update category selection')
    }
  }

  const toggleShowOnHome = async (categoryId: string) => {
    try {
      console.log('Toggling show on home for category ID:', categoryId) // Debug log
      const response = await fetch('/api/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: categoryId, action: 'toggle-show-on-home' })
      })

      const data = await response.json()
      console.log('Toggle show on home response:', data) // Debug log
      
      if (response.ok && data.success) {
        // Update local state immediately for real-time feedback
        setCategories(prevCategories => 
          prevCategories.map(category => 
            category.id === categoryId 
              ? { ...category, show_on_home: data.show_on_home }
              : category
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

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
            <Tag className="w-6 h-6 text-green-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Popular Search Categories
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Manage photography service categories that are popular among users
          </p>
        </div>

        {/* Add Category Form */}
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add New Category
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Category Name */}
              <div className="space-y-3">
                <Label htmlFor="categoryName" className="text-sm font-semibold text-gray-700">
                  Category Name
                </Label>
                <Input
                  id="categoryName"
                  type="text"
                  placeholder="Enter category name (e.g., Wedding, Portrait)"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="h-12 border-gray-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              {/* Category Image Upload */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">Category Image</Label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-all duration-300 ${
                    isDragging
                      ? "border-green-500 bg-green-50 scale-105"
                      : "border-gray-300 hover:border-green-400 hover:bg-gray-50"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />

                  {categoryImage ? (
                    <div className="relative">
                      <div className="w-20 h-20 mx-auto rounded-lg overflow-hidden">
                        <NextImage
                          src={categoryImage}
                          alt="Preview"
                          width={80}
                          height={80}
                          className="object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={() => setCategoryImage(null)}
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
              onClick={addCategory}
              disabled={!categoryName.trim() || !categoryImage}
              className="w-full h-12 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Category
            </Button>
          </CardContent>
        </Card>

        {/* Existing Categories */}
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Categories ({filteredCategories.length})
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search categories..."
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading categories...</p>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-12">
                <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No categories found</p>
                <p className="text-gray-400">Add your first category to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCategories.map((category) => {
                  const isEditing = editId === category.id
                  return (
                    <Card
                      key={category.id}
                      className="group hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 bg-gradient-to-br from-white to-gray-50"
                    >
                      <CardContent className="p-4 relative">
                        {category.selected && (
                          <span className="absolute top-2 right-2 z-10">
                            <CheckCircle className="w-6 h-6 text-green-500" />
                          </span>
                        )}
                        {isEditing ? (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                            <div className="flex flex-col gap-4">
                              <Input
                                type="text"
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                className="text-base text-gray-900"
                                placeholder="Edit category name"
                              />
                              <div className="flex items-center gap-2">
                                <input
                                  id={`edit-file-${category.id}`}
                                  ref={editFileInputRef}
                                  type="file"
                                  accept="image/*"
                                  onChange={handleEditFileSelect}
                                  className="hidden"
                                />
                                <label htmlFor={`edit-file-${category.id}`} className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 border border-gray-300 rounded cursor-pointer hover:bg-gray-200 transition">
                                  <Upload className="w-4 h-4 mr-2" />
                                  Change Image
                                </label>
                              </div>
                              {editImage && (
                                <NextImage
                                  src={editImage}
                                  alt="Preview"
                                  width={64}
                                  height={64}
                                  className="object-cover rounded border mx-auto"
                                />
                              )}
                              <div className="flex gap-2">
                                <Button onClick={saveEdit} className="bg-green-600 text-white">Save</Button>
                                <Button onClick={cancelEdit} variant="outline">Cancel</Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center space-x-4">
                              <div className="relative">
                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
                                  <NextImage
                                    src={category.image || "/placeholder.svg"}
                                    alt={category.name}
                                    width={64}
                                    height={64}
                                    className="object-cover"
                                  />
                                </div>
                                {category.isPopular && (
                                  <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs">
                                    Hot
                                  </Badge>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 truncate">
                                  {category.name}
                                </h3>
                                <p className="text-sm text-gray-500">{category.searchCount || 0} searches</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge
                                    variant="outline"
                                    className={`text-xs cursor-pointer ${
                                      category.selected
                                        ? "border-green-200 text-green-700 bg-green-50"
                                        : "border-gray-200 text-gray-600 bg-gray-50"
                                    }`}
                                    onClick={() => toggleCategorySelection(category.id)}
                                  >
                                    {category.selected ? "Selected" : "Select"}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${
                                      category.isPopular
                                        ? "border-orange-200 text-orange-700 bg-orange-50"
                                        : "border-gray-200 text-gray-600 bg-gray-50"
                                    }`}
                                  >
                                    {category.isPopular ? "Popular" : "Standard"}
                                  </Badge>
                                </div>
                              </div>

                              <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className={`text-xs px-2 py-1 ${
                                    category.show_on_home 
                                      ? 'bg-green-600 hover:bg-green-700 text-white border-green-600' 
                                      : 'text-green-600 border-green-200 hover:bg-green-50 bg-transparent'
                                  }`}
                                  onClick={() => toggleShowOnHome(category.id)}
                                  title={category.show_on_home ? "Remove from Homepage" : "Show on Homepage"}
                                >
                                  {category.show_on_home ? "On Home" : "Add Home"}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-blue-600 border-blue-200 hover:bg-blue-50 bg-transparent"
                                  onClick={() => startEdit(category)}
                                >
                                  <Edit3 className="w-3 h-3" />
                                </Button>
                                <Button
                                  onClick={() => deleteCategory(category.id)}
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
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