"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import PhotographerProfile from "@/components/photographer/photographer-profile"

export default function PhotographerProfilePage() {
  const params = useParams()
  const photographerId = params.id as string

  return <PhotographerProfile photographerId={photographerId} />
}