"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import PhotographerProfile from "@/components/photographer/photographer-profile"
import ClientCache from "@/lib/cache-utils"

export default function PhotographerProfilePage() {
  const params = useParams()
  const photographerId = params.id as string
  const [scrollPosition, setScrollPosition] = useState(0)

  // Save scroll position when navigating away
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Save current scroll position
      sessionStorage.setItem('scrollPosition', window.scrollY.toString())
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  // Restore scroll position when component mounts
  useEffect(() => {
    const savedPosition = sessionStorage.getItem('scrollPosition')
    if (savedPosition) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedPosition))
      }, 100)
    }
  }, [])

  return <PhotographerProfile photographerId={photographerId} />
}