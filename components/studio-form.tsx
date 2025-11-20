"use client"

import type React from "react"
import { useState } from "react"
import { Eye, EyeOff, Mail, Lock, User, Phone, Building2 } from "lucide-react"
import { useRouter } from "next/navigation"
import SocialButtons from "./social-buttons"
import PasswordStrengthIndicator from "./password-strength-indicator"
import OTPInput from "./otp-input"

interface StudioFormProps {
  isLogin: boolean
  setIsLogin: (value: boolean) => void
  onSwitchToUser?: () => void
  onSuccess?: () => void
}

export default function StudioForm({ isLogin, setIsLogin, onSwitchToUser, onSuccess }: StudioFormProps) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    studioName: "",
    photographerName: "",
    email: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
  })

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (!isLogin && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    // Only validate other fields for registration
    if (!isLogin) {
      if (!formData.studioName) {
        newErrors.studioName = "Studio name is required"
      }

      if (!formData.photographerName) {
        newErrors.photographerName = "Photographer name is required"
      }

      if (!formData.mobileNumber) {
        newErrors.mobileNumber = "Mobile number is required"
      } else if (!/^\d{10}$/.test(formData.mobileNumber.replace(/\D/g, ""))) {
        newErrors.mobileNumber = "Please enter a valid 10-digit mobile number"
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password"
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setErrors({})

    try {
      if (isLogin) {
        // Validate password is provided for login
        if (!formData.password) {
          setErrors({ password: "Password is required for login" })
          setLoading(false)
          return
        }

        // Use existing studio-auth login API
        const response = await fetch('/api/studio-auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        })

        const data = await response.json()

        if (data.success) {
          // Set loading state to prevent UI flickering
          setLoading(true)
          
          // Store studio data in localStorage
          localStorage.setItem('studio', JSON.stringify(data.studio))
          
          // Set auth cookies for middleware
          const token = 'studio-' + Date.now()
          document.cookie = `auth-token=${token}; path=/; max-age=86400; SameSite=Strict`
          document.cookie = `user=${JSON.stringify({
            id: data.studio._id,
            name: data.studio.name || data.studio.username,
            email: data.studio.email,
            userType: data.studio.role === 'admin' ? 'admin' : 'photographer',
            role: data.studio.role || 'photographer'
          })}; path=/; max-age=86400; SameSite=Strict`
          
          // Close modal if callback provided
          if (onSuccess) {
            onSuccess()
          }
          
          // Check for redirect parameter
          const urlParams = new URLSearchParams(window.location.search)
          const redirectPath = urlParams.get('redirect')
          
          if (redirectPath) {
            router.push(redirectPath)
          } else if (data.studio.role === 'admin') {
            // Additional verification for admin access
            const adminEmail = 'tusharkukwase24@gmail.com'
            if (data.studio.email === adminEmail) {
              router.push("/admin")
            } else {
              // Even if role is admin, redirect to studio dashboard if not authorized email
              router.push("/studio-dashboard")
            }
          } else {
            router.push("/studio-dashboard")
          }
          
          // Prevent any further execution
          return
        } else {
          setErrors({ general: data.error || "Login failed. Please try again." })
        }
      } else {
        // Register new studio
        const response = await fetch('/api/studio-auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: formData.photographerName,
            email: formData.email,
            mobile: formData.mobileNumber,
            password: formData.password,
            studioName: formData.studioName,
            emailVerified: true,
            mobileVerified: true,
          }),
        })

        const data = await response.json()

        if (data.success) {
          setSuccess("Registration Successful! Your account is pending admin approval. You will be notified once approved.")
          setTimeout(() => {
            setIsLogin(true)
            setSuccess("")
          }, 3000)
        } else {
          setErrors({ general: data.error || "Registration failed. Please try again." })
        }
      }
    } catch (error) {
      setErrors({ general: "Network error. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {isLogin ? "Studio Login" : "Register Studio"}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {isLogin ? "Access your studio account" : "Create your studio account"}
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg text-sm">
          {success}
        </div>
      )}

      {/* Error Message */}
      {errors.general && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
          {errors.general}
        </div>
      )}

      {/* Social Buttons */}
      <SocialButtons />

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
        <span className="text-sm text-slate-500 dark:text-slate-400">or continue with email</span>
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Email - Always show first */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="photographer@example.com"
              autoFocus={isLogin}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition"
            />
          </div>
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        {/* Password - Show second for login only */}
        {isLogin && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>
        )}

        {/* Additional fields only for registration */}
        {!isLogin && (
          <>
            {/* Studio Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Studio Name</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  name="studioName"
                  value={formData.studioName}
                  onChange={handleInputChange}
                  placeholder="Your Studio Name"
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition"
                />
              </div>
              {errors.studioName && <p className="text-red-500 text-sm mt-1">{errors.studioName}</p>}
            </div>

            {/* Photographer Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Photographer Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  name="photographerName"
                  value={formData.photographerName}
                  onChange={handleInputChange}
                  placeholder="Your Name"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition"
                />
              </div>
              {errors.photographerName && <p className="text-red-500 text-sm mt-1">{errors.photographerName}</p>}
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  placeholder="+91 9876543210"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition"
                />
              </div>
              {errors.mobileNumber && <p className="text-red-500 text-sm mt-1">{errors.mobileNumber}</p>}
            </div>

            {/* Password - Show after other fields for registration */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              {/* Password Strength Indicator */}
              {formData.password && <PasswordStrengthIndicator password={formData.password} />}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition"
                />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              {/* Password Match Indicator */}
              {formData.password && formData.confirmPassword && (
                <div className="mt-2">
                  {formData.password === formData.confirmPassword ? (
                    <p className="text-green-600 text-sm flex items-center gap-1">
                      <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </span>
                      Passwords match
                    </p>
                  ) : (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <span className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✗</span>
                      </span>
                      Passwords do not match
                    </p>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Forgot Password Link */}
        {isLogin && (
          <a href="#" className="text-sm text-purple-600 dark:text-purple-400 hover:underline block">
            Forgot password?
          </a>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white font-semibold py-2.5 rounded-lg transition transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (isLogin ? "Signing In..." : "Creating Studio Account...") : (isLogin ? "Sign In" : "Create Studio Account")}
        </button>
      </form>

      {/* Toggle Login/Signup */}
      <div className="text-center text-sm text-slate-600 dark:text-slate-400">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-purple-600 dark:text-purple-400 font-semibold hover:underline"
        >
          {isLogin ? "Sign up" : "Sign in"}
        </button>
      </div>

      {/* Switch to User */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
        <button
          onClick={onSwitchToUser}
          className="w-full text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium py-2 transition"
          disabled={!onSwitchToUser}
        >
          Switch to User {isLogin ? "Login" : "Signup"}
        </button>
      </div>
    </div>
  )
}