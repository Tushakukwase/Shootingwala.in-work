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
    title: string
    setTitle: (val: string) => void
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

export default function DigitalAlbumManager({
    imageUrl,
    setImageUrl,
    title,
    setTitle,
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
                    <CardTitle className="text-balance">Digital Album Manager</CardTitle>
                    <CardDescription className="text-pretty">
                        Upload album cover and manage album details.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Image upload */}
                    <div className="space-y-3">
                        <Label htmlFor="album-image">Album Cover Image</Label>
                        <div className="flex items-center gap-4">
                            <div className="size-16 rounded-xl overflow-hidden ring-1 ring-border/60 shadow-sm bg-muted flex items-center justify-center shrink-0">
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt="Album cover preview"
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
                                            e.currentTarget.src = '/placeholder.svg?height=80&width=80&query=album%20cover';
                                        }}
                                    />
                                )}
                            </div>
                            <div className="flex-1">
                                <Input
                                    id="album-image"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="file:mr-4 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-foreground file:cursor-pointer file:ring-1 file:ring-inset file:ring-border hover:file:bg-accent transition-colors"
                                />
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Recommended size: 800×800. PNG or JPG.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Album title */}
                    <div className="space-y-2">
                        <Label htmlFor="album-title">Album Title</Label>
                        <Input
                            id="album-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Wedding Memories, Family Album"
                            className="transition-colors focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    {/* Album description */}
                    <div className="space-y-2">
                        <Label htmlFor="album-description">Album Description</Label>
                        <Textarea
                            id="album-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Write a description for your digital album..."
                            rows={4}
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
                            <p className="text-sm text-gray-600">Display this album section on the homepage</p>
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
                                    placeholder="e.g., View Albums, Know More, Get Started"
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
                                        placeholder="/digital-albums or https://example.com"
                                    />
                                    <p className="text-xs text-gray-500">
                                        Use relative URLs (/page) or full URLs (https://example.com)
                                    </p>
                                </div>
                            )}

                            {buttonAction === 'modal' && (
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-blue-700">
                                        Modal will show album details and contact information
                                    </p>
                                </div>
                            )}

                            {buttonAction === 'contact' && (
                                <div className="p-3 bg-green-50 rounded-lg">
                                    <p className="text-sm text-green-700">
                                        Button will open contact form for album inquiries
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="pt-2">
                        <Button type="button" onClick={onSave} className="min-w-32">
                            Save Album Configuration
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Right Side - Live Preview */}
            <Card className="border border-border/60 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-center">Live Preview</CardTitle>
                    <CardDescription className="text-center">
                        See how your album will look
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center p-6">
                    <div className="relative w-80 h-96 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl shadow-xl overflow-hidden border-2">
                        {/* Album Cover */}
                        <div className="relative h-56 bg-gray-200">
                            {imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt="Album cover"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                    <div className="text-gray-400 text-center">
                                        <div className="text-4xl mb-2">📸</div>
                                        <p className="text-xs">Album Cover</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Album Info */}
                        <div className="p-5 bg-white">
                            <h3 className="font-bold text-xl mb-3 text-gray-800">
                                {title || "Album Title"}
                            </h3>
                            <p className="text-base text-gray-600 line-clamp-3 leading-relaxed mb-4">
                                {description || "Your album description will appear here. Add a beautiful description to make your album more engaging."}
                            </p>
                            
                            {/* Button Preview */}
                            {isEnabled && (
                                <button className="w-full bg-orange-500 hover:bg-orange-600 text-white text-base font-medium py-3 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg">
                                    {buttonText || "Know More"}
                                </button>
                            )}
                        </div>
                        
                        {/* Decorative bottom */}
                        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-400 to-purple-400"></div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}