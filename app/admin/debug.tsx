"use client"

import { useEffect, useState } from "react"

export default function AdminDebug() {
  const [authInfo, setAuthInfo] = useState<any>(null)

  useEffect(() => {
    // Get auth info from cookies and localStorage
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
    }

    const authToken = getCookie('auth-token')
    const userCookie = getCookie('user')
    const studioData = localStorage.getItem('studio')

    let userData = null
    if (userCookie) {
      try {
        userData = JSON.parse(decodeURIComponent(userCookie))
      } catch (e) {
        console.error('Error parsing user cookie:', e)
      }
    }

    let studio = null
    if (studioData) {
      try {
        studio = JSON.parse(studioData)
      } catch (e) {
        console.error('Error parsing studio data:', e)
      }
    }

    setAuthInfo({
      authToken,
      userCookie,
      userData,
      studio,
      rawUserCookie: userCookie
    })
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Debug Info</h1>
      <div className="bg-gray-100 p-4 rounded">
        <pre>{JSON.stringify(authInfo, null, 2)}</pre>
      </div>
    </div>
  )
}