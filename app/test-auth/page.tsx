"use client"

import { useState, useEffect } from "react"

export default function TestAuthPage() {
  const [authInfo, setAuthInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get client-side auth info
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

        // Also get server-side debug info
        const response = await fetch('/api/debug/auth')
        const serverInfo = await response.json()

        setAuthInfo({
          client: {
            authToken,
            userCookie,
            userData,
            studio,
          },
          server: serverInfo
        })
      } catch (error) {
        console.error('Auth check failed:', error)
        setAuthInfo({ error: error.message })
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Authentication Debug</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Current Authentication State</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(authInfo, null, 2)}
          </pre>
        </div>

        <div className="mt-6 space-x-4">
          <a 
            href="/admin-login" 
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Admin Login
          </a>
          <a 
            href="/admin" 
            className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Try Admin Page
          </a>
          <a 
            href="/studio-auth" 
            className="inline-block bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Regular Login
          </a>
        </div>
      </div>
    </div>
  )
}