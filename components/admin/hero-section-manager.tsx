"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, Eye, History, Save, Upload, Palette, Link, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface HeroButton {
  id: string
  text: string
  link: string
  style: 'primary' | 'secondary' | 'outline'
  icon?: string
}

interface HeroData {
  id?: string
  backgroundImage: string | null
  title: string
  subtitle: string
  description: string
  buttons: HeroButton[]
  festivalBanner: {
    enabled: boolean
    text: string
    style: 'success' | 'warning' | 'info' | 'error'
    animation: boolean
  }
  stats: {
    enabled: boolean
    items: Array<{
      icon: string
      text: string
    }>
  }
  quickLinks: {
    enabled: boolean
    items: Array<{
      text: string
      link: string
    }>
  }
  design: {
    titleGradient: boolean
    overlayOpacity: number
    textAlignment: 'left' | 'center' | 'right'
    theme: 'default' | 'wedding' | 'festival' | 'modern'
  }
  isActive: boolean
  createdAt: string
}

export default function HeroSectionManager() {
  const [heroData, setHeroData] = useState<HeroData>({
    backgroundImage: null,
    title: "Make Your Moment Very Special",
    subtitle: "",
    description: "Find the perfect photographer for your special moments. From weddings to celebrations, capture memories that last forever with our trusted professionals.",
    buttons: [
      { id: '1', text: '🔍 Search By Category', link: '/wedding-photographers', style: 'primary', icon: '🔍' },
      { id: '2', text: '📍 Search By City', link: '/wedding-photographers', style: 'secondary', icon: '📍' }
    ],
    festivalBanner: {
      enabled: true,
      text: '🎉 Wedding Season Special - Book Now & Save 20%',
      style: 'warning',
      animation: true
    },
    stats: {
      enabled: true,
      items: [
        { icon: '⭐', text: '500+ Happy Couples' },
        { icon: '📸', text: 'Professional Photographers' },
        { icon: '🏆', text: 'Award Winning Service' }
      ]
    },
    quickLinks: {
      enabled: true,
      items: [
        { text: 'Wedding Photography', link: '/wedding-photographers?category=wedding' },
        { text: 'Pre-Wedding Shoots', link: '/wedding-photographers?category=pre-wedding' },
        { text: 'Event Photography', link: '/wedding-photographers?category=events' }
      ]
    },
    design: {
      titleGradient: true,
      overlayOpacity: 50,
      textAlignment: 'center',
      theme: 'wedding'
    },
    isActive: true,
    createdAt: new Date().toISOString()
  })

  const [heroHistory, setHeroHistory] = useState<HeroData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("content")
  const { toast } = useToast()

  useEffect(() => {
    fetchHeroData()
    fetchHeroHistory()
  }, [])

  const fetchHeroData = async () => {
    try {
      const response = await fetch('/api/hero-section')
      const data = await response.json()
      if (data.success && data.data) {
        setHeroData(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch hero data:', error)
    }
  }

  const fetchHeroHistory = async () => {
    try {
      const response = await fetch('/api/hero-section/history')
      const data = await response.json()
      if (data.success) {
        setHeroHistory(data.history || [])
      }
    } catch (error) {
      console.error('Failed to fetch hero history:', error)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({ title: "Error", description: "Please select an image file", variant: "destructive" })
      return
    }

    try {
      const reader = new FileReader()
      reader.onloadend = () => {
        setHeroData(prev => ({
          ...prev,
          backgroundImage: reader.result as string
        }))
      }
      reader.readAsDataURL(file)
    } catch (error) {
      toast({ title: "Error", description: "Failed to upload image", variant: "destructive" })
    }
  }

  const addButton = () => {
    const newButton: HeroButton = {
      id: Date.now().toString(),
      text: 'New Button',
      link: '/',
      style: 'primary'
    }
    setHeroData(prev => ({
      ...prev,
      buttons: [...prev.buttons, newButton]
    }))
  }

  const updateButton = (id: string, field: keyof HeroButton, value: string) => {
    setHeroData(prev => ({
      ...prev,
      buttons: prev.buttons.map(btn => 
        btn.id === id ? { ...btn, [field]: value } : btn
      )
    }))
  }

  const removeButton = (id: string) => {
    setHeroData(prev => ({
      ...prev,
      buttons: prev.buttons.filter(btn => btn.id !== id)
    }))
  }

  const addStat = () => {
    setHeroData(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        items: [...prev.stats.items, { icon: '⭐', text: 'New Stat' }]
      }
    }))
  }

  const updateStat = (index: number, field: 'icon' | 'text', value: string) => {
    setHeroData(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        items: prev.stats.items.map((item, i) => 
          i === index ? { ...item, [field]: value } : item
        )
      }
    }))
  }

  const removeStat = (index: number) => {
    setHeroData(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        items: prev.stats.items.filter((_, i) => i !== index)
      }
    }))
  }

  const addQuickLink = () => {
    setHeroData(prev => ({
      ...prev,
      quickLinks: {
        ...prev.quickLinks,
        items: [...prev.quickLinks.items, { text: 'New Link', link: '/' }]
      }
    }))
  }

  const updateQuickLink = (index: number, field: 'text' | 'link', value: string) => {
    setHeroData(prev => ({
      ...prev,
      quickLinks: {
        ...prev.quickLinks,
        items: prev.quickLinks.items.map((item, i) => 
          i === index ? { ...item, [field]: value } : item
        )
      }
    }))
  }

  const removeQuickLink = (index: number) => {
    setHeroData(prev => ({
      ...prev,
      quickLinks: {
        ...prev.quickLinks,
        items: prev.quickLinks.items.filter((_, i) => i !== index)
      }
    }))
  }

  const saveHeroData = async () => {
    setIsLoading(true)
    try {
      console.log('Saving hero data:', heroData)
      
      // Validate required fields
      if (!heroData.backgroundImage) {
        toast({ 
          title: "Validation Error", 
          description: "Background image is required", 
          variant: "destructive" 
        })
        return
      }

      // Remove id field to avoid duplicate key error
      const { id, ...dataToSave } = heroData

      const response = await fetch('/api/hero-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave)
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)

      if (data.success) {
        toast({ title: "Success", description: "Hero section saved successfully!" })
        fetchHeroData() // Refresh current data
        fetchHeroHistory() // Refresh history
      } else {
        console.error('Save failed:', data.error)
        toast({ 
          title: "Save Failed", 
          description: data.error || "Unknown error occurred", 
          variant: "destructive" 
        })
      }
    } catch (error) {
      console.error('Save error:', error)
      toast({ 
        title: "Error", 
        description: `Failed to save hero section: ${error.message}`, 
        variant: "destructive" 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadFromHistory = (historyItem: HeroData) => {
    setHeroData({
      ...historyItem,
      id: undefined,
      isActive: true,
      createdAt: new Date().toISOString()
    })
    toast({ title: "Loaded", description: "Hero section loaded from history" })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hero Section Manager</h1>
          <p className="text-gray-600">Manage your homepage hero section with festivals, offers, and designs</p>
        </div>
        <Button onClick={saveHeroData} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side - Form */}
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Hero Section Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5 h-12 p-1 bg-gray-100 rounded-lg">
                  <TabsTrigger 
                    value="content" 
                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium text-sm"
                  >
                    <Upload className="w-4 h-4" />
                    Content
                  </TabsTrigger>
                  <TabsTrigger 
                    value="buttons" 
                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium text-sm"
                  >
                    <Link className="w-4 h-4" />
                    Buttons
                  </TabsTrigger>
                  <TabsTrigger 
                    value="features" 
                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium text-sm"
                  >
                    <Sparkles className="w-4 h-4" />
                    Features
                  </TabsTrigger>
                  <TabsTrigger 
                    value="design" 
                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium text-sm"
                  >
                    <Palette className="w-4 h-4" />
                    Design
                  </TabsTrigger>
                  <TabsTrigger 
                    value="history" 
                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium text-sm"
                  >
                    <History className="w-4 h-4" />
                    History
                  </TabsTrigger>
                </TabsList>

            <TabsContent value="content" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Background Image
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden border bg-gray-100">
                      {heroData.backgroundImage ? (
                        <img src={heroData.backgroundImage} alt="Hero background" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Upload className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">Recommended: 1920x1080px, JPG/PNG</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Main Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Main Title</Label>
                    <Input
                      id="title"
                      value={heroData.title}
                      onChange={(e) => setHeroData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Make Your Moment Very Special"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="subtitle">Subtitle (Optional)</Label>
                    <Input
                      id="subtitle"
                      value={heroData.subtitle}
                      onChange={(e) => setHeroData(prev => ({ ...prev, subtitle: e.target.value }))}
                      placeholder="Special occasion subtitle"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={heroData.description}
                      onChange={(e) => setHeroData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your services..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="buttons" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Link className="w-5 h-5" />
                      Call-to-Action Buttons
                    </span>
                    <Button onClick={addButton} size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Button
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {heroData.buttons.map((button) => (
                    <div key={button.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Button {heroData.buttons.indexOf(button) + 1}</h4>
                        <Button
                          onClick={() => removeButton(button.id)}
                          size="sm"
                          variant="outline"
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Button Text</Label>
                          <Input
                            value={button.text}
                            onChange={(e) => updateButton(button.id, 'text', e.target.value)}
                            placeholder="Button text"
                          />
                        </div>
                        <div>
                          <Label>Link URL</Label>
                          <Input
                            value={button.link}
                            onChange={(e) => updateButton(button.id, 'link', e.target.value)}
                            placeholder="/page-url"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Style</Label>
                          <Select value={button.style} onValueChange={(value) => updateButton(button.id, 'style', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="primary">Primary (Filled)</SelectItem>
                              <SelectItem value="secondary">Secondary</SelectItem>
                              <SelectItem value="outline">Outline</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Icon (Optional)</Label>
                          <Input
                            value={button.icon || ''}
                            onChange={(e) => updateButton(button.id, 'icon', e.target.value)}
                            placeholder="🔍 or emoji"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features" className="space-y-6 mt-6">
              {/* Festival Banner */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Festival/Offer Banner
                    </span>
                    <Switch
                      checked={heroData.festivalBanner.enabled}
                      onCheckedChange={(checked) => 
                        setHeroData(prev => ({
                          ...prev,
                          festivalBanner: { ...prev.festivalBanner, enabled: checked }
                        }))
                      }
                    />
                  </CardTitle>
                </CardHeader>
                {heroData.festivalBanner.enabled && (
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Banner Text</Label>
                      <Input
                        value={heroData.festivalBanner.text}
                        onChange={(e) => 
                          setHeroData(prev => ({
                            ...prev,
                            festivalBanner: { ...prev.festivalBanner, text: e.target.value }
                          }))
                        }
                        placeholder="🎉 Special Offer - Limited Time!"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Style</Label>
                        <Select 
                          value={heroData.festivalBanner.style} 
                          onValueChange={(value: any) => 
                            setHeroData(prev => ({
                              ...prev,
                              festivalBanner: { ...prev.festivalBanner, style: value }
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="success">Success (Green)</SelectItem>
                            <SelectItem value="warning">Warning (Yellow)</SelectItem>
                            <SelectItem value="info">Info (Blue)</SelectItem>
                            <SelectItem value="error">Error (Red)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={heroData.festivalBanner.animation}
                          onCheckedChange={(checked) => 
                            setHeroData(prev => ({
                              ...prev,
                              festivalBanner: { ...prev.festivalBanner, animation: checked }
                            }))
                          }
                        />
                        <Label>Animation</Label>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Stats Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Trust Indicators/Stats</span>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={heroData.stats.enabled}
                        onCheckedChange={(checked) => 
                          setHeroData(prev => ({
                            ...prev,
                            stats: { ...prev.stats, enabled: checked }
                          }))
                        }
                      />
                      {heroData.stats.enabled && (
                        <Button onClick={addStat} size="sm">
                          <Plus className="w-4 h-4 mr-1" />
                          Add Stat
                        </Button>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                {heroData.stats.enabled && (
                  <CardContent className="space-y-3">
                    {heroData.stats.items.map((stat, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 border rounded">
                        <Input
                          value={stat.icon}
                          onChange={(e) => updateStat(index, 'icon', e.target.value)}
                          placeholder="⭐"
                          className="w-16"
                        />
                        <Input
                          value={stat.text}
                          onChange={(e) => updateStat(index, 'text', e.target.value)}
                          placeholder="500+ Happy Customers"
                          className="flex-1"
                        />
                        <Button
                          onClick={() => removeStat(index)}
                          size="sm"
                          variant="outline"
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                )}
              </Card>

              {/* Quick Links */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Quick Links</span>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={heroData.quickLinks.enabled}
                        onCheckedChange={(checked) => 
                          setHeroData(prev => ({
                            ...prev,
                            quickLinks: { ...prev.quickLinks, enabled: checked }
                          }))
                        }
                      />
                      {heroData.quickLinks.enabled && (
                        <Button onClick={addQuickLink} size="sm">
                          <Plus className="w-4 h-4 mr-1" />
                          Add Link
                        </Button>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                {heroData.quickLinks.enabled && (
                  <CardContent className="space-y-3">
                    {heroData.quickLinks.items.map((link, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 border rounded">
                        <Input
                          value={link.text}
                          onChange={(e) => updateQuickLink(index, 'text', e.target.value)}
                          placeholder="Wedding Photography"
                          className="flex-1"
                        />
                        <Input
                          value={link.link}
                          onChange={(e) => updateQuickLink(index, 'link', e.target.value)}
                          placeholder="/wedding-photographers"
                          className="flex-1"
                        />
                        <Button
                          onClick={() => removeQuickLink(index)}
                          size="sm"
                          variant="outline"
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="design" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Design Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Theme</Label>
                      <Select 
                        value={heroData.design.theme} 
                        onValueChange={(value: any) => 
                          setHeroData(prev => ({
                            ...prev,
                            design: { ...prev.design, theme: value }
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Default</SelectItem>
                          <SelectItem value="wedding">Wedding</SelectItem>
                          <SelectItem value="festival">Festival</SelectItem>
                          <SelectItem value="modern">Modern</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Text Alignment</Label>
                      <Select 
                        value={heroData.design.textAlignment} 
                        onValueChange={(value: any) => 
                          setHeroData(prev => ({
                            ...prev,
                            design: { ...prev.design, textAlignment: value }
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Left</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="right">Right</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Overlay Opacity: {heroData.design.overlayOpacity}%</Label>
                    <input
                      type="range"
                      min="0"
                      max="80"
                      value={heroData.design.overlayOpacity}
                      onChange={(e) => 
                        setHeroData(prev => ({
                          ...prev,
                          design: { ...prev.design, overlayOpacity: parseInt(e.target.value) }
                        }))
                      }
                      className="w-full mt-2"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={heroData.design.titleGradient}
                      onCheckedChange={(checked) => 
                        setHeroData(prev => ({
                          ...prev,
                          design: { ...prev.design, titleGradient: checked }
                        }))
                      }
                    />
                    <Label>Title Gradient Effect</Label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Hero Section History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {heroHistory.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No history available</p>
                  ) : (
                    <div className="space-y-3">
                      {heroHistory.map((item, index) => (
                        <div key={item.id || index} className="border rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{item.title}</h4>
                              <p className="text-sm text-gray-500">
                                {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString()}
                              </p>
                              <div className="flex gap-2 mt-2">
                                {item.festivalBanner.enabled && (
                                  <Badge variant="secondary">Festival Banner</Badge>
                                )}
                                <Badge variant="outline">{item.buttons.length} Buttons</Badge>
                                <Badge variant="outline">{item.design.theme}</Badge>
                              </div>
                            </div>
                            <Button
                              onClick={() => loadFromHistory(item)}
                              size="sm"
                              variant="outline"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Load
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Live Preview */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-center">Live Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative w-full h-96 rounded-lg overflow-hidden border shadow-lg">
                {/* Background */}
                <div className="absolute inset-0">
                  {heroData.backgroundImage ? (
                    <img src={heroData.backgroundImage} alt="Hero background" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600"></div>
                  )}
                  <div 
                    className="absolute inset-0 bg-black" 
                    style={{ opacity: heroData.design.overlayOpacity / 100 }}
                  ></div>
                </div>

                {/* Content */}
                <div className={`relative z-10 h-full flex flex-col justify-center items-${heroData.design.textAlignment} text-white p-4 text-center`}>
                  {/* Festival Banner */}
                  {heroData.festivalBanner.enabled && (
                    <div className={`mb-2 ${heroData.festivalBanner.animation ? 'animate-pulse' : ''}`}>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        heroData.festivalBanner.style === 'warning' ? 'bg-yellow-400 text-black' :
                        heroData.festivalBanner.style === 'success' ? 'bg-green-400 text-black' :
                        heroData.festivalBanner.style === 'info' ? 'bg-blue-400 text-white' :
                        'bg-red-400 text-white'
                      }`}>
                        {heroData.festivalBanner.text}
                      </span>
                    </div>
                  )}

                  {/* Title */}
                  <h1 className={`text-lg font-bold mb-2 ${
                    heroData.design.titleGradient 
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent' 
                      : ''
                  }`}>
                    {heroData.title}
                  </h1>

                  {/* Subtitle */}
                  {heroData.subtitle && (
                    <h2 className="text-sm font-medium mb-2">{heroData.subtitle}</h2>
                  )}

                  {/* Description */}
                  <p className="text-xs mb-3 opacity-90 line-clamp-2">{heroData.description}</p>

                  {/* Stats */}
                  {heroData.stats.enabled && heroData.stats.items.length > 0 && (
                    <div className="flex justify-center gap-3 mb-3 text-xs">
                      {heroData.stats.items.slice(0, 3).map((stat, index) => (
                        <div key={index} className="flex items-center gap-1">
                          <span>{stat.icon}</span>
                          <span className="truncate">{stat.text}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex flex-col gap-2 mb-3">
                    {heroData.buttons.slice(0, 2).map((button) => (
                      <button
                        key={button.id}
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          button.style === 'primary' 
                            ? 'bg-yellow-400 text-black hover:bg-yellow-500' 
                            : button.style === 'secondary'
                            ? 'bg-gray-600 text-white hover:bg-gray-700'
                            : 'border border-white text-white hover:bg-white hover:text-black'
                        }`}
                      >
                        {button.icon} {button.text}
                      </button>
                    ))}
                  </div>

                  {/* Quick Links */}
                  {heroData.quickLinks.enabled && heroData.quickLinks.items.length > 0 && (
                    <div className="flex justify-center gap-2 text-xs">
                      <span className="opacity-75">Popular:</span>
                      {heroData.quickLinks.items.slice(0, 2).map((link, index) => (
                        <button key={index} className="text-yellow-400 hover:text-yellow-300 underline truncate">
                          {link.text}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}