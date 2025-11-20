"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Props = {
    imageUrl: string | null
    setImageUrl: (url: string | null) => void
    title: string
    setTitle: (val: string) => void
    description: string
    setDescription: (val: string) => void
    onSave: () => void
}

export default function DigitalAlbumManager({
    imageUrl,
    setImageUrl,
    title,
    setTitle,
    description,
    setDescription,
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

        const url = URL.createObjectURL(file)
        if (lastObjectUrl.current) {
            URL.revokeObjectURL(lastObjectUrl.current)
        }
        lastObjectUrl.current = url
        setImageUrl(url)
    }

    return (
        <Card className="border border-border/60 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="space-y-1">
                <CardTitle className="text-balance">Digital Album Manager</CardTitle>
                <CardDescription className="text-pretty">
                    Upload album cover and manage album details.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Image upload with live preview */}
                <div className="space-y-3">
                    <Label htmlFor="album-image">Album Cover Image</Label>
                    <div className="flex items-center gap-4">
                        <div className="size-20 rounded-xl overflow-hidden ring-1 ring-border/60 shadow-sm bg-muted flex items-center justify-center shrink-0">
                            {imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt="Album cover preview"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <img
                                    src="/placeholder.svg?height=80&width=80&query=album%20cover"
                                    alt="Placeholder"
                                    className="h-full w-full object-cover opacity-50"
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
                        placeholder="Enter album title..."
                        className="w-full"
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
                        {description.length} characters
                    </p>
                </div>

                {/* Actions */}
                <div className="pt-2">
                    <Button type="button" onClick={onSave} className="min-w-32">
                        Save Album
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}