"use client"

import { useState, useEffect } from "react"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import Dashboard from "@/components/pages/dashboard"
import AvailabilityCalendar from "@/components/pages/availability-calendar"
import RecentReviews from "@/components/pages/recent-reviews"
import EarningSummary from "@/components/pages/earning-summary"
import ManageBookings from "@/components/pages/manage-bookings"
import CategoriesManagement from "@/components/pages/categories-management"
import CityRegistration from "@/components/pages/city-registration"
import PhotographerGallery from "@/components/studio/pages/photographer-gallery"
import PhotographerStories from "@/components/studio/pages/photographer-stories"
import PackageManager from "@/components/studio/package-manager"
import ProfileManager from "@/components/studio/profile-manager"
import StudioMessages from "@/components/studio/messages"
import EventsSection from "@/components/studio/events" // Updated import path

type PageType = "dashboard" | "portfolio" | "calendar" | "reviews" | "earnings" | "bookings" | "categories" | "cities" | "gallery" | "real-stories" | "packages" | "messages" | "events"

export default function Home() {
  const [currentPage, setCurrentPage] = useState<PageType>("dashboard")

  useEffect(() => {
    // Listen for navigation events from portfolio highlights
    const handleNavigateToGallery = () => {
      setCurrentPage("gallery")
    }
    
    const handleNavigateToStories = () => {
      setCurrentPage("real-stories")
    }

    // Listen for navigation from notifications
    const handleNavigateFromNotification = (event: CustomEvent) => {
      const { page } = event.detail
      setCurrentPage(page as PageType)
    }

    window.addEventListener('navigateToGallery', handleNavigateToGallery)
    window.addEventListener('navigateToStories', handleNavigateToStories)
    window.addEventListener('navigateFromNotification', handleNavigateFromNotification as EventListener)

    return () => {
      window.removeEventListener('navigateToGallery', handleNavigateToGallery)
      window.removeEventListener('navigateToStories', handleNavigateToStories)
      window.removeEventListener('navigateFromNotification', handleNavigateFromNotification as EventListener)
    }
  }, [])

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />
      case "portfolio":
        return <ProfileManager />
      case "calendar":
        return <AvailabilityCalendar />
      case "reviews":
        return <RecentReviews />
      case "earnings":
        return <EarningSummary />
      case "bookings":
        return <ManageBookings />
      case "categories":
        return <CategoriesManagement />
      case "cities":
        return <CityRegistration />
      case "gallery":
        return <PhotographerGallery />
      case "real-stories":
        return <PhotographerStories />
      case "packages":
        return <PackageManager />
      case "messages":
        return <StudioMessages />
      case "events":
        return <EventsSection />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  )
}