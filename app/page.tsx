"use client"

import NextImage from "next/image"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { HomeContent } from "@/components/home/HomeContent"

export default function HomePage() {
  const [imgError, setImgError] = useState(false)
  const [heroImg, setHeroImg] = useState<string | null>(null)

  useEffect(() => {
    // Fetch hero image
    fetch('/api/hero-image')
      .then(res => res.json())
      .then(data => {
        if (data.image) setHeroImg(data.image);
      });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center">
        <div className="absolute inset-0">
          {heroImg && !imgError ? (
            <img
              src={heroImg}
              alt="Wedding couple"
              className="object-cover w-full h-full"
              style={{ position: "absolute", inset: 0 }}
              onError={() => setImgError(true)}
            />
          ) : (
            <NextImage
              src="/front%20img.jpg"
              alt="Wedding couple"
              fill
              className="object-cover"
              priority
            />
          )}
          <div className="absolute inset-0 bg-black bg-opacity-50" />
        </div>
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Make Your Moment Very Special</h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200">Find Best Photographers With Trusted Values</p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-gray-900 bg-transparent"
            >
              Search By Category
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-gray-900 bg-transparent"
            >
              Search By City
            </Button>
          </div>
        </div>
      </section>

      <HomeContent />
    </div>
  )
}