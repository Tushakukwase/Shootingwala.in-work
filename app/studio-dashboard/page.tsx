"use client"

import { useState } from "react"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import Dashboard from "@/components/pages/dashboard"
import Portfolio from "@/components/pages/portfolio"
import AvailabilityCalendar from "@/components/pages/availability-calendar"
import RecentReviews from "@/components/pages/recent-reviews"
import EarningSummary from "@/components/pages/earning-summary"
import EditProfile from "@/components/pages/edit-profile"
import ManageBookings from "@/components/pages/manage-bookings"
import CategoriesManagement from "@/components/pages/categories-management"
import CityRegistration from "@/components/pages/city-registration"
import StoriesGalleryManagement from "@/components/pages/stories-gallery-management"
import PhotographerGallery from "@/components/studio/pages/photographer-gallery"
import PhotographerStories from "@/components/studio/pages/photographer-stories"

type PageType = "dashboard" | "portfolio" | "calendar" | "reviews" | "earnings" | "profile" | "bookings" | "categories" | "cities" | "stories" | "gallery" | "real-stories"

export default function Home() {
  const [currentPage, setCurrentPage] = useState<PageType>("dashboard")

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />
      case "portfolio":
        return <Portfolio />
      case "calendar":
        return <AvailabilityCalendar />
      case "reviews":
        return <RecentReviews />
      case "earnings":
        return <EarningSummary />
      case "profile":
        return <EditProfile />
      case "bookings":
        return <ManageBookings />
      case "categories":
        return <CategoriesManagement />
      case "cities":
        return <CityRegistration />
      case "stories":
        return <StoriesGalleryManagement />
      case "gallery":
        return <PhotographerGallery />
      case "real-stories":
        return <PhotographerStories />
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