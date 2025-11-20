"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleAdminLogin = async () => {
    setLoading(true)
    setError("")

    try {
      // Login with admin credentials
      const response = await fetch('/api/studio-auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'tusharkukwase24@gmail.com',
          password: 'admin123',
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Store admin data
        localStorage.setItem('studio', JSON.stringify(data.studio))
        
        // Set auth cookies
        const token = 'admin-' + Date.now()
        document.cookie = `auth-token=${token}; path=/; max-age=86400; SameSite=Strict`
        document.cookie = `user=${JSON.stringify({
          id: data.studio._id,
          name: data.studio.name,
          email: data.studio.email,
          userType: 'admin',
          role: 'admin'
        })}; path=/; max-age=86400; SameSite=Strict`
        
        // Redirect to admin panel
        router.push("/admin")
      } else {
        setError("Admin login failed: " + data.error)
      }
    } catch (error) {
      setError("Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin Access</h1>
          <p className="text-gray-600 mt-2">Quick admin login for tusharkukwase24@gmail.com</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <button
          onClick={handleAdminLogin}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? "Logging in..." : "Login as Admin"}
        </button>

        <div className="mt-4 text-center">
          <button
            onClick={() => router.push('/studio-auth')}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            Back to regular login
          </button>
        </div>
      </div>
    </div>
  )
}