"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Users, ShoppingCart, BarChart2, Settings as SettingsIcon, Trash, Album, Mail, MapPin, BookOpen, Image as GalleryIcon, Check, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NextImage from "next/image";
import { Upload, X, Eye, Download, Edit3, ImageIcon, Plus, Trash2, Search, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import DigitalAlbumManager from "@/components/admin/digital-album-manager";
import DigitalInvitationManager from "@/components/admin/digital-invitation-manager";
import HeroSectionManager from "@/components/admin/hero-section-manager";

import AllPhotographersView from "@/components/admin/all-photographers-view";
import CategorySuggestionsManager from "@/components/admin/category-suggestions-manager";
import CitySuggestionsManager from "@/components/admin/city-suggestions-manager";
import AllUsersManager from "@/components/admin/all-users-manager";
import GalleryManager from "@/components/admin/gallery-manager";
import StoriesManager from "@/components/admin/stories-manager";
import MessagesView from "@/components/admin/messages-view";
import EnhancedMessagingView from "@/components/admin/enhanced-messaging-view";

import NotificationDropdown from "@/components/admin/notification-dropdown";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import EngagementMetrics from "@/components/admin/engagement-metrics"
import AdminDashboard from "@/components/admin/admin-dashboard";
import NewAdminDashboard from "@/components/admin/new-admin-dashboard";

const menuItems = [
  { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5 mr-3" /> },
  { key: "photographers", label: "Photographers", icon: <Users className="w-5 h-5 mr-3 text-green-500" />, hasBadge: true },
  { key: "users", label: "All Users", icon: <Users className="w-5 h-5 mr-3" /> },
  
  { key: "hero-section", label: "Hero Section", icon: <img src="/placeholder.jpg" alt="Hero" className="w-5 h-5 mr-3 rounded-full border border-gray-300 object-cover" /> },
  { key: "categories", label: "Popular Searches Categories", icon: <BarChart2 className="w-5 h-5 mr-3 text-orange-500" />, hasBadge: true },
  { key: "cities", label: "Popular Searches Cities", icon: <MapPin className="w-5 h-5 mr-3 text-blue-500" />, hasBadge: true },
  { key: "gallery", label: "Gallery", icon: <GalleryIcon className="w-5 h-5 mr-3 text-teal-500" />, hasBadge: true },
  { key: "stories", label: "Real Stories", icon: <BookOpen className="w-5 h-5 mr-3 text-indigo-500" />, hasBadge: true },
  { key: "messages", label: "Messages", icon: <Mail className="w-5 h-5 mr-3 text-green-600" />, hasBadge: true },
  
  { key: "digital-album", label: "Digital Album", icon: <Album className="w-5 h-5 mr-3 text-purple-500" /> },
  { key: "digital-invitation", label: "Digital Invitation", icon: <Mail className="w-5 h-5 mr-3 text-pink-500" /> },
  
];

function HeroImageManager() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageData, setImageData] = useState("");
  const [showPreview, setShowPreview] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find((file) => file.type.startsWith("image/"));

    if (imageFile) {
      handleFileUpload(imageFile);
    }
  }, []);

  const handleFileUpload = (file: File) => {
    if (file.size > 1.5 * 1024 * 1024) {
      alert("Image is too large. Please select an image under 1.5MB.");
      return;
    }
    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const result = e.target?.result as string;
      setSelectedImage(result);
      setImageData(result);
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleUpdateImage = async () => {
    if (imageData) {
      setIsUploading(true);
      try {
        const res = await fetch('/api/hero-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageData })
        });
        const data = await res.json();
        setIsUploading(false);
        if (!res.ok) {
          alert(data.error || 'Failed to update hero image');
          return;
        }
        setSelectedImage(imageData);
        alert('Hero image updated!');
      } catch (err) {
        setIsUploading(false);
        alert('Failed to update hero image');
      }
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImageData("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    // Fetch current hero image from API for preview
    fetch('/api/hero-image')
      .then(res => res.json())
      .then(data => {
        if (data.image) setSelectedImage(data.image);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Hero Section Manager</h1>
          <p className="text-gray-600">Upload and manage your hero section images with ease</p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                Image Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Drag and Drop Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
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

                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-blue-600" />
                  </div>

                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      {isDragging ? "Drop your image here" : "Drag & drop your image"}
                    </p>
                    <p className="text-gray-500">or click to browse files</p>
                  </div>

                  <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                    Supports: JPG, PNG, WebP, GIF
                  </Badge>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowPreview(!showPreview)}
                  variant="outline"
                  className="flex-1 border-gray-300 hover:bg-gray-50 bg-transparent"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {showPreview ? "Hide" : "Show"} Preview
                </Button>
                <Button
                  onClick={handleUpdateImage}
                  disabled={!imageData && !selectedImage}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Update Image
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview Section */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-green-600" />
                  Live Preview
                </CardTitle>
                {selectedImage && (
                  <Button
                    onClick={handleRemoveImage}
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {showPreview && selectedImage ? (
                <div className="space-y-4">
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-inner">
                    {isUploading ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                      </div>
                    ) : (
                      <NextImage
                        src={selectedImage || "/placeholder.svg"}
                        alt="Hero section preview"
                        fill
                        className="object-cover"
                        priority
                      />
                    )}
                  </div>

                  {/* Image Info */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Status:</span>
                      <Badge className="bg-green-100 text-green-800">Ready to use</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Format:</span>
                      <span className="text-sm text-gray-600">
                        {selectedImage && selectedImage.startsWith("data:") ? "Base64 Encoded" : "URL"}
                      </span>
                    </div>
                  </div>

                  {/* Additional Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent"
                    >
                      <Edit3 className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-green-200 text-green-600 hover:bg-green-50 bg-transparent"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="aspect-video rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto">
                      <ImageIcon className="w-8 h-8 text-gray-500" />
                    </div>
                    <p className="text-gray-500 font-medium">No image selected</p>
                    <p className="text-sm text-gray-400">Upload an image to see preview</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

interface Category {
  id: string
  name: string
  image: string
  searchCount?: number
  isPopular?: boolean
  selected?: boolean;
}

interface Photographer {
  id: string
  name: string
  categories: string[]
}

function CategoryManager() {
  const [categoryName, setCategoryName] = useState("")
  const [categoryImage, setCategoryImage] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [photographers, setPhotographers] = useState<Photographer[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState<string | null>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Fetch categories and photographers from MongoDB on mount
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/categories').then(res => res.json()),
      fetch('/api/photographers').then(res => res.json())
    ])
    .then(([categoriesData, photographersData]) => {
      const normalizedCategories = (categoriesData.categories || []).map((cat: any) => ({
        ...cat,
        id: cat._id ? cat._id.toString() : cat.id
      }));
      const normalizedPhotographers = (photographersData.photographers || []).map((photographer: any) => ({
        ...photographer,
        id: photographer._id ? photographer._id.toString() : photographer.id
      }));
      setCategories(normalizedCategories);
      setPhotographers(normalizedPhotographers);
      setLoading(false);
    })
    .catch(() => {
      setError('Failed to load categories');
      setLoading(false);
    });
  }, []);

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
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: categoryName.trim(), image: categoryImage })
        });
        const data = await res.json();
        if (!res.ok) {
          alert(data.error || 'Failed to add category');
          return;
        }
        setCategories([...categories, data]);
        setCategoryName("");
        setCategoryImage(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (err) {
        alert('Failed to add category');
      }
    }
  }

  const deleteCategory = (id: string) => {
    setCategories(categories.filter((cat) => cat.id !== id))
  }

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const startEdit = (category: Category) => {
    setEditId(category.id);
    setEditName(category.name);
    setEditImage(category.image);
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditName("");
    setEditImage(null);
    if (editFileInputRef.current) editFileInputRef.current.value = "";
  };

  const handleEditFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setEditImage(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveEdit = () => {
    if (!editName.trim() || !editImage) return;
    // Prevent duplicate name (except for the one being edited)
    if (categories.some(cat => cat.id !== editId && cat.name.trim().toLowerCase() === editName.trim().toLowerCase())) {
      alert("A category with this name already exists.");
      return;
    }
    setCategories(categories.map(cat =>
      cat.id === editId ? { ...cat, name: editName.trim(), image: editImage! } : cat
    ));
    cancelEdit();
  };

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(selectedCategory === categoryName ? null : categoryName);
  };

  const getPhotographersByCategory = (categoryName: string) => {
    return photographers.filter(photographer => 
      photographer.categories.includes(categoryName)
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
            <Tag className="w-6 h-6 text-orange-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Popular Search Categories
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Manage and organize your photography categories to help users find exactly what they're looking for
          </p>
        </div>

        {/* Add Category Form */}
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
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
                  placeholder="Enter category name (e.g., Wedding Photography)"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
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
                      ? "border-orange-500 bg-orange-50 scale-105"
                      : "border-gray-300 hover:border-orange-400 hover:bg-gray-50"
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
                          src={categoryImage || "/placeholder.svg"}
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
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
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
                <ImageIcon className="w-5 h-5" />
                Existing Categories ({filteredCategories.length})
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
            {filteredCategories.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No categories found</p>
                <p className="text-gray-400">Add your first category to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCategories.map((category) => {
                  const isEditing = editId === category.id;
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
                            <div className="flex flex-col md:flex-row gap-4 items-center w-full">
                              <Input
                                type="text"
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                className="flex-1 h-10 text-base text-gray-900 px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-blue-500 bg-white"
                                placeholder="Edit category name"
                              />
                              <div className="flex items-center gap-2 w-full md:w-auto">
                                <input
                                  id={`edit-file-${category.id}`}
                                  ref={editFileInputRef}
                                  type="file"
                                  accept="image/*"
                                  onChange={handleEditFileSelect}
                                  className="hidden"
                                />
                                <label htmlFor={`edit-file-${category.id}`} className="inline-flex items-center justify-center w-10 h-10 bg-gray-100 border border-gray-300 rounded-full cursor-pointer hover:bg-gray-200 transition" title="Change image">
                                  <Upload className="w-5 h-5 text-gray-600" />
                                </label>
                              </div>
                            </div>
                            {editImage && (
                              <NextImage
                                src={editImage}
                                alt="Preview"
                                width={64}
                                height={64}
                                className="object-cover rounded border mt-4 mx-auto"
                              />
                            )}
                            <div className="flex gap-2 mt-4">
                              <Button onClick={saveEdit} className="bg-blue-600 text-white">Save</Button>
                              <Button onClick={cancelEdit} variant="outline">Cancel</Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center space-x-4">
                              <div className="relative">
                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
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
                                <h3 
                                  className="font-semibold text-gray-900 truncate cursor-pointer hover:text-orange-600 transition-colors"
                                  onClick={() => handleCategoryClick(category.name)}
                                  title="Click to view similar photographers"
                                >
                                  {category.name}
                                </h3>
                                <p className="text-sm text-gray-500">{category.searchCount} searches</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${
                                      category.isPopular
                                        ? "border-green-200 text-green-700 bg-green-50"
                                        : "border-gray-200 text-gray-600 bg-gray-50"
                                    }`}
                                  >
                                    {category.isPopular ? "Popular" : "Standard"}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className="text-xs border-orange-200 text-orange-700 bg-orange-50 cursor-pointer hover:bg-orange-100"
                                    onClick={() => handleCategoryClick(category.name)}
                                  >
                                    View Photographers
                                  </Badge>
                                </div>
                              </div>

                              <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DigitalAlbumSection() {
  const [albumImageUrl, setAlbumImageUrl] = useState<string | null>(null)
  const [albumTitle, setAlbumTitle] = useState<string>("")
  const [albumDescription, setAlbumDescription] = useState<string>("")
  const [albumButtonText, setAlbumButtonText] = useState<string>("Know More")
  const [albumButtonAction, setAlbumButtonAction] = useState<'redirect' | 'modal' | 'contact'>('redirect')
  const [albumRedirectUrl, setAlbumRedirectUrl] = useState<string>("/digital-albums")
  const [albumIsEnabled, setAlbumIsEnabled] = useState<boolean>(true)
  const { toast } = useToast()

  useEffect(() => {
    fetch('/api/digital-album')
      .then(res => res.json())
      .then(data => {
        if (data.imageUrl) setAlbumImageUrl(data.imageUrl)
        if (data.title) setAlbumTitle(data.title)
        if (data.description) setAlbumDescription(data.description)
        if (data.buttonText) setAlbumButtonText(data.buttonText)
        if (data.buttonAction) setAlbumButtonAction(data.buttonAction)
        if (data.redirectUrl) setAlbumRedirectUrl(data.redirectUrl)
        if (data.isEnabled !== undefined) setAlbumIsEnabled(data.isEnabled)
      })
      .catch(err => console.error('Failed to load album data:', err))
  }, [])

  const handleAlbumSave = async () => {
    try {
      let finalImageUrl = albumImageUrl

      // Convert blob URL to base64 if it's a blob
      if (albumImageUrl && albumImageUrl.startsWith('blob:')) {
        try {
          const response = await fetch(albumImageUrl)
          const blob = await response.blob()
          const reader = new FileReader()
          
          finalImageUrl = await new Promise((resolve) => {
            reader.onloadend = () => resolve(reader.result as string)
            reader.readAsDataURL(blob)
          })
        } catch (blobError) {
          console.error('Failed to convert blob to base64:', blobError)
          // Continue with original URL if conversion fails
        }
      }

      const apiResponse = await fetch('/api/digital-album', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: finalImageUrl,
          title: albumTitle,
          description: albumDescription,
          buttonText: albumButtonText,
          buttonAction: albumButtonAction,
          redirectUrl: albumRedirectUrl,
          isEnabled: albumIsEnabled,
        }),
      })

      if (apiResponse.ok) {
        toast({ id: "album-saved", title: "Album saved", description: "Digital album content updated successfully." })
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      toast({ id: "album-error", title: "Error", description: "Failed to save album content. Please try again.", variant: "destructive" })
    }
  }

  return (
    <div className="p-6">
      <DigitalAlbumManager
        imageUrl={albumImageUrl}
        setImageUrl={setAlbumImageUrl}
        title={albumTitle}
        setTitle={setAlbumTitle}
        description={albumDescription}
        setDescription={setAlbumDescription}
        buttonText={albumButtonText}
        setButtonText={setAlbumButtonText}
        buttonAction={albumButtonAction}
        setButtonAction={setAlbumButtonAction}
        redirectUrl={albumRedirectUrl}
        setRedirectUrl={setAlbumRedirectUrl}
        isEnabled={albumIsEnabled}
        setIsEnabled={setAlbumIsEnabled}
        onSave={handleAlbumSave}
      />
    </div>
  )
}

function DigitalInvitationSection() {
  const [invitationImageUrl, setInvitationImageUrl] = useState<string | null>(null)
  const [eventTitle, setEventTitle] = useState<string>("")
  const [eventDate, setEventDate] = useState<string>("")
  const [eventLocation, setEventLocation] = useState<string>("")
  const [invitationDescription, setInvitationDescription] = useState<string>("")
  const [invitationButtonText, setInvitationButtonText] = useState<string>("Know More")
  const [invitationButtonAction, setInvitationButtonAction] = useState<'redirect' | 'modal' | 'contact'>('redirect')
  const [invitationRedirectUrl, setInvitationRedirectUrl] = useState<string>("/digital-invitations")
  const [invitationIsEnabled, setInvitationIsEnabled] = useState<boolean>(true)
  const { toast } = useToast()

  useEffect(() => {
    fetch('/api/digital-invitation')
      .then(res => res.json())
      .then(data => {
        if (data.imageUrl) setInvitationImageUrl(data.imageUrl)
        if (data.eventTitle) setEventTitle(data.eventTitle)
        if (data.eventDate) setEventDate(data.eventDate)
        if (data.eventLocation) setEventLocation(data.eventLocation)
        if (data.description) setInvitationDescription(data.description)
        if (data.buttonText) setInvitationButtonText(data.buttonText)
        if (data.buttonAction) setInvitationButtonAction(data.buttonAction)
        if (data.redirectUrl) setInvitationRedirectUrl(data.redirectUrl)
        if (data.isEnabled !== undefined) setInvitationIsEnabled(data.isEnabled)
      })
      .catch(err => console.error('Failed to load invitation data:', err))
  }, [])

  const handleInvitationSave = async () => {
    try {
      let finalImageUrl = invitationImageUrl

      // Convert blob URL to base64 if it's a blob
      if (invitationImageUrl && invitationImageUrl.startsWith('blob:')) {
        try {
          const response = await fetch(invitationImageUrl)
          const blob = await response.blob()
          const reader = new FileReader()
          
          finalImageUrl = await new Promise((resolve) => {
            reader.onloadend = () => resolve(reader.result as string)
            reader.readAsDataURL(blob)
          })
        } catch (blobError) {
          console.error('Failed to convert blob to base64:', blobError)
          // Continue with original URL if conversion fails
        }
      }

      const apiResponse = await fetch('/api/digital-invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: finalImageUrl,
          eventTitle,
          eventDate,
          eventLocation,
          description: invitationDescription,
          buttonText: invitationButtonText,
          buttonAction: invitationButtonAction,
          redirectUrl: invitationRedirectUrl,
          isEnabled: invitationIsEnabled,
        }),
      })

      if (apiResponse.ok) {
        toast({ id: "invitation-saved", title: "Invitation saved", description: "Digital invitation content updated successfully." })
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      toast({ id: "invitation-error", title: "Error", description: "Failed to save invitation content. Please try again.", variant: "destructive" })
    }
  }

  return (
    <div className="p-6">
      <DigitalInvitationManager
        imageUrl={invitationImageUrl}
        setImageUrl={setInvitationImageUrl}
        eventTitle={eventTitle}
        setEventTitle={setEventTitle}
        eventDate={eventDate}
        setEventDate={setEventDate}
        eventLocation={eventLocation}
        setEventLocation={setEventLocation}
        description={invitationDescription}
        setDescription={setInvitationDescription}
        buttonText={invitationButtonText}
        setButtonText={setInvitationButtonText}
        buttonAction={invitationButtonAction}
        setButtonAction={setInvitationButtonAction}
        redirectUrl={invitationRedirectUrl}
        setRedirectUrl={setInvitationRedirectUrl}
        isEnabled={invitationIsEnabled}
        setIsEnabled={setInvitationIsEnabled}
        onSave={handleInvitationSave}
      />
    </div>
  )
}

export default function AdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [pendingCounts, setPendingCounts] = useState({ categories: 0, cities: 0, photographerGalleries: 0, photographerStories: 0, photographerApprovals: 0, messages: 0, total: 0 });
  const [previousTotal, setPreviousTotal] = useState(0);

  const loadPendingCounts = async () => {
    try {
      const response = await fetch('/api/admin/pending-counts');
      
      if (!response.ok) {
        console.error('Failed to fetch pending counts:', response.status, response.statusText);
        return;
      }
      
      const data = await response.json();
      
      if (data.success) {
        const newTotal = data.data.total;
        // Check if there are new notifications
        if (newTotal > previousTotal && previousTotal > 0) {
          // Show toast notification for new pending items
          toast({
            id: "new-pending-items",
            title: "New Pending Items",
            description: `You have ${newTotal - previousTotal} new pending item(s) to review`,
          });
        }
        setPreviousTotal(newTotal);
        setPendingCounts(data.data);
      } else {
        // Set default values on API error
        setPendingCounts({ categories: 0, cities: 0, photographerGalleries: 0, photographerStories: 0, photographerApprovals: 0, messages: 0, total: 0 });
      }
    } catch (error) {
      console.error('Error loading pending counts:', error);
      // Set default values on network error
      setPendingCounts({ categories: 0, cities: 0, photographerGalleries: 0, photographerStories: 0, photographerApprovals: 0, messages: 0, total: 0 });
    }
  };

  useEffect(() => {
    // Verify admin access on component mount
    const verifyAdminAccess = async () => {
      try {
        // Get user data from cookie
        const getCookie = (name: string) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop()?.split(';').shift();
        };

        // Check both cookie and localStorage for user data
        const userCookie = getCookie('user');
        const localStorageUser = localStorage.getItem('user');
        const localStorageStudio = localStorage.getItem('studio');
        
        let userData = null;
        
        // Try to get user data from cookie first
        if (userCookie) {
          try {
            userData = JSON.parse(decodeURIComponent(userCookie));
          } catch (error) {
            console.error('Error parsing user cookie:', error);
          }
        }
        
        // If no cookie data, try localStorage
        if (!userData && localStorageUser) {
          try {
            userData = JSON.parse(localStorageUser);
          } catch (error) {
            console.error('Error parsing localStorage user:', error);
          }
        }
        
        // If no user data, try studio data
        if (!userData && localStorageStudio) {
          try {
            const studioData = JSON.parse(localStorageStudio);
            userData = {
              email: studioData.email,
              name: studioData.name || studioData.username,
              id: studioData._id || studioData.id
            };
          } catch (error) {
            console.error('Error parsing localStorage studio:', error);
          }
        }
        
        if (!userData || !userData.email) {
          router.push('/studio-auth');
          return;
        }
        
        // Verify with server that this email is authorized for admin access
        const response = await fetch('/api/admin/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userData.email })
        });

        const data = await response.json();
        
        if (data.success && data.isAuthorizedAdmin) {
          setIsAuthorized(true);
          // Load pending counts after authorization
          loadPendingCounts();
        } else {
          console.log('Unauthorized admin access attempt for email:', userData.email);
          // Only redirect to studio dashboard if user is actually a studio, not admin
          if (localStorageStudio && !localStorageUser) {
            router.push('/studio-dashboard');
          } else {
            router.push('/studio-auth');
          }
        }
      } catch (error) {
        console.error('Admin verification failed:', error);
        router.push('/studio-auth');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyAdminAccess();
  }, [router]);

  // Refresh pending counts every 30 seconds
  useEffect(() => {
    if (isAuthorized) {
      const interval = setInterval(loadPendingCounts, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthorized]);

  // Handle URL hash routing for notifications
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1); // Remove the #
      if (hash && hash !== activeSection) {
        setActiveSection(hash);
      }
    };

    // Check hash on mount
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeSection]);

  // Show loading screen while verifying
  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized message if not authorized
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You are not authorized to access this page.</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    console.log('Rendering content for section:', activeSection); // Debug log
    
    switch (activeSection) {
      case "hero-section":
        return <HeroSectionManager />;
      case "categories":
        return <CategorySuggestionsManager />;
      case "cities":
        return <CitySuggestionsManager />;
      case "photographers":
        return <AllPhotographersView />;
      case "users":
        return <AllUsersManager />;
      case "gallery":
        return <GalleryManager />;
      case "stories":
        return <StoriesManager />;
      case "messages":
        return <EnhancedMessagingView />;
      case "digital-album":
        return <DigitalAlbumSection />;
      case "digital-invitation":
        return <DigitalInvitationSection />;

      case "orders":
        return (
          <div className="p-8">
            <h1 className="text-2xl font-bold">Orders Management</h1>
            <p>Orders management coming soon...</p>
          </div>
        );
      case "reports":
        return (
          <div className="p-8">
            <h1 className="text-2xl font-bold">Reports</h1>
            <p>Reports coming soon...</p>
          </div>
        );
      case "settings":
        return (
          <div className="p-8">
            <h1 className="text-2xl font-bold">Settings</h1>
            <p>Settings coming soon...</p>
          </div>
        );
      default:
        return <NewAdminDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
            <NotificationDropdown />
          </div>
        </div>
        <nav className="mt-4">
          {menuItems.map((item) => {
            const getBadgeCount = () => {
              switch (item.key) {
                case 'categories':
                  return pendingCounts.categories || 0;
                case 'cities':
                  return pendingCounts.cities || 0;
                case 'photographers':
                  return pendingCounts.photographerApprovals || 0;
                case 'gallery':
                  return pendingCounts.photographerGalleries || 0;
                case 'stories':
                  return pendingCounts.photographerStories || 0;
                case 'messages':
                  return pendingCounts.messages || 0;
                default:
                  return 0;
              }
            };
            
            const badgeCount = getBadgeCount();
            
            return (
              <button
                key={item.key}
                onClick={() => {
                  console.log('Clicking menu item:', item.key); // Debug log
                  setActiveSection(item.key);
                  // Refresh pending counts when switching tabs
                  if (item.hasBadge) {
                    setTimeout(() => {
                      loadPendingCounts();
                    }, 1000); // Refresh after 1 second to allow for any updates
                  }
                }}
                className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                  activeSection === item.key
                    ? "bg-blue-100 text-blue-700 border-r-2 border-blue-500"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center">
                  {item.icon}
                  {item.label}
                </div>
                {item.hasBadge && badgeCount > 0 && (
                  <Badge className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded-full min-w-[20px] h-5 flex items-center justify-center animate-pulse shadow-lg">
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
      <Toaster />
    </div>
  );
}