"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Edit, Trash2, Save, X, Package, DollarSign, Clock, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

interface PackageItem {
  id: string
  name: string
  price: number
  duration: string
  description: string
  features: string[]
  deliverables: string[]
  isPopular: boolean
  isActive: boolean
}

export default function PackageManager() {
  const [packages, setPackages] = useState<PackageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingPackage, setEditingPackage] = useState<PackageItem | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration: '',
    description: '',
    features: [''],
    deliverables: [''],
    isPopular: false,
    isActive: true
  })

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      setLoading(true)
      const studioData = localStorage.getItem('studio')
      if (!studioData) return

      const studio = JSON.parse(studioData)
      const response = await fetch(`/api/photographer-packages?photographerId=${studio._id}`)
      const data = await response.json()

      if (data.success) {
        setPackages(data.packages || [])
      }
    } catch (error) {
      console.error('Error fetching packages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleArrayChange = (field: 'features' | 'deliverables', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
  }

  const addArrayItem = (field: 'features' | 'deliverables') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }))
  }

  const removeArrayItem = (field: 'features' | 'deliverables', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      duration: '',
      description: '',
      features: [''],
      deliverables: [''],
      isPopular: false,
      isActive: true
    })
    setEditingPackage(null)
    setShowAddForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const studioData = localStorage.getItem('studio')
      if (!studioData) return

      const studio = JSON.parse(studioData)
      
      const packageData = {
        ...formData,
        price: parseFloat(formData.price),
        features: formData.features.filter(f => f.trim()),
        deliverables: formData.deliverables.filter(d => d.trim()),
        photographerId: studio._id
      }

      const url = editingPackage 
        ? `/api/photographer-packages/${editingPackage.id}`
        : '/api/photographer-packages'
      
      const method = editingPackage ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(packageData)
      })

      const data = await response.json()

      if (data.success) {
        await fetchPackages()
        resetForm()
        alert(editingPackage ? 'Package updated successfully!' : 'Package created successfully!')
      } else {
        alert(data.error || 'Failed to save package')
      }
    } catch (error) {
      console.error('Error saving package:', error)
      alert('Failed to save package')
    }
  }

  const handleEdit = (pkg: PackageItem) => {
    setFormData({
      name: pkg.name,
      price: pkg.price.toString(),
      duration: pkg.duration,
      description: pkg.description,
      features: pkg.features.length ? pkg.features : [''],
      deliverables: pkg.deliverables.length ? pkg.deliverables : [''],
      isPopular: pkg.isPopular,
      isActive: pkg.isActive
    })
    setEditingPackage(pkg)
    setShowAddForm(true)
  }

  const handleDelete = async (packageId: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return

    try {
      const response = await fetch(`/api/photographer-packages/${packageId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        await fetchPackages()
        alert('Package deleted successfully!')
      } else {
        alert(data.error || 'Failed to delete package')
      }
    } catch (error) {
      console.error('Error deleting package:', error)
      alert('Failed to delete package')
    }
  }

  const togglePackageStatus = async (packageId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/photographer-packages/${packageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      })

      const data = await response.json()

      if (data.success) {
        await fetchPackages()
      } else {
        alert(data.error || 'Failed to update package status')
      }
    } catch (error) {
      console.error('Error updating package status:', error)
      alert('Failed to update package status')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Package Management</h2>
          <p className="text-gray-600">Create and manage your photography packages</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} disabled={showAddForm}>
          <Plus className="w-4 h-4 mr-2" />
          Add Package
        </Button>
      </div>

      {/* Add/Edit Package Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border rounded-lg p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {editingPackage ? 'Edit Package' : 'Add New Package'}
            </h3>
            <Button variant="ghost" size="sm" onClick={resetForm}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Package Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Wedding Premium Package"
                  required
                />
              </div>

              <div>
                <Label htmlFor="price">Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="25000"
                  required
                />
              </div>

              <div>
                <Label htmlFor="duration">Duration *</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  placeholder="e.g., 8 hours, Full day"
                  required
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isPopular}
                    onChange={(e) => handleInputChange('isPopular', e.target.checked)}
                  />
                  <span>Mark as Popular</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  />
                  <span>Active</span>
                </label>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of this package..."
                rows={3}
              />
            </div>

            {/* Features */}
            <div>
              <Label>Features Included</Label>
              {formData.features.map((feature, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={feature}
                    onChange={(e) => handleArrayChange('features', index, e.target.value)}
                    placeholder="e.g., Professional editing"
                  />
                  {formData.features.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('features', index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem('features')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Feature
              </Button>
            </div>

            {/* Deliverables */}
            <div>
              <Label>Deliverables</Label>
              {formData.deliverables.map((deliverable, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={deliverable}
                    onChange={(e) => handleArrayChange('deliverables', index, e.target.value)}
                    placeholder="e.g., 300+ edited photos"
                  />
                  {formData.deliverables.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('deliverables', index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem('deliverables')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Deliverable
              </Button>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                {editingPackage ? 'Update Package' : 'Create Package'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Packages List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <motion.div
            key={pkg.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`relative ${!pkg.isActive ? 'opacity-60' : ''}`}
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{pkg.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-2xl font-bold text-primary">
                        ₹{pkg.price.toLocaleString()}
                      </span>
                      <Badge variant="outline">{pkg.duration}</Badge>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    {pkg.isPopular && (
                      <Badge className="bg-yellow-500">Popular</Badge>
                    )}
                    <Badge variant={pkg.isActive ? "default" : "secondary"}>
                      {pkg.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {pkg.description && (
                  <p className="text-sm text-gray-600">{pkg.description}</p>
                )}

                {pkg.features.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Features:</h4>
                    <ul className="space-y-1">
                      {pkg.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {pkg.deliverables.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Deliverables:</h4>
                    <ul className="space-y-1">
                      {pkg.deliverables.map((deliverable, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <Package className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span>{deliverable}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(pkg)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => togglePackageStatus(pkg.id, pkg.isActive)}
                  >
                    {pkg.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(pkg.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {packages.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No packages yet</h3>
          <p className="text-gray-600 mb-4">Create your first photography package to get started</p>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Package
          </Button>
        </div>
      )}
    </div>
  )
}