"use client"

import type React from "react"
import { useState } from "react"
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import SocialButtons from "./social-buttons"
import PasswordStrengthIndicator from "./password-strength-indicator"
import OTPInput from "./otp-input"

interface UserFormProps {
  isLogin: boolean
  setIsLogin: (value: boolean) => void
  onSwitchToStudio?: () => void
  onSuccess?: () => void
}

export default function UserForm({ isLogin, setIsLogin, onSwitchToStudio, onSuccess }: UserFormProps) {
  const router = useRouter()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [useOTP, setUseOTP] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
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

    if (!isLogin && !formData.fullName) {
      newErrors.fullName = "Full name is required"
    }

    if (!useOTP && !formData.password) {
      newErrors.password = "Password is required"
    } else if (!useOTP && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (!isLogin && !useOTP && !formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (!isLogin && !useOTP && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
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
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok && data.success) {
        if (isLogin) {
          // Set loading state to prevent UI flickering
          setLoading(true)
          
          // Set auth cookies
          const token = 'user-' + Date.now()
          document.cookie = `auth-token=${token}; path=/; max-age=86400; SameSite=Strict`
          document.cookie = `user=${JSON.stringify({
            id: data.user.id,
            name: data.user.fullName,
            email: data.user.email,
            userType: 'client',
            role: 'client'
          })}; path=/; max-age=86400; SameSite=Strict`

          // Update AuthContext with user data
          login(data.user)
          
          // Close modal if callback provided
          if (onSuccess) {
            onSuccess()
          }
          
          // Redirect to personalized user page
          const username = data.user.fullName?.toLowerCase().replace(/\s+/g, '-') || 'user'
          router.push(`/user/${username}`)
          
          // Prevent any further execution
          return
        } else {
          setSuccess("Registration successful! Please login.")
          setTimeout(() => {
            setIsLogin(true)
            setSuccess("")
          }, 2000)
        }
      } else {
        setErrors({ general: data.error || 'Authentication failed' })
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' })
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
          {isLogin ? "Welcome Back" : "Create Account"}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {isLogin ? "Sign in to your account" : "Join us today"}
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
        {/* Full Name (Signup only) */}
        {!isLogin && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="John Doe"
                autoFocus
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
              />
            </div>
            {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
          </div>
        )}

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="you@example.com"
              autoFocus={isLogin}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
            />
          </div>
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        {/* Password or OTP Toggle */}
        {!useOTP ? (
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
                className="w-full pl-10 pr-10 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
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
            {/* Password Strength Indicator (Signup only) */}
            {!isLogin && formData.password && <PasswordStrengthIndicator password={formData.password} />}
          </div>
        ) : (
          <OTPInput />
        )}

        {/* Confirm Password (Signup only) */}
        {!isLogin && !useOTP && (
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
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
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
        )}

        {/* OTP Toggle for Login */}
        {isLogin && (
          <button
            type="button"
            onClick={() => setUseOTP(!useOTP)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            {useOTP ? "Use password instead" : "Use OTP instead"}
          </button>
        )}

        {/* Remember Me & Forgot Password */}
        {isLogin && (
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-600 dark:text-slate-400">Remember me</span>
            </label>
            <a href="#" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Forgot password?
            </a>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-2.5 rounded-lg transition transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (isLogin ? "Signing In..." : "Creating Account...") : (isLogin ? "Sign In" : "Create Account")}
        </button>
      </form>

      {/* Toggle Login/Signup */}
      <div className="text-center text-sm text-slate-600 dark:text-slate-400">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
        >
          {isLogin ? "Sign up" : "Sign in"}
        </button>
      </div>

      {/* Switch to Studio */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={onSwitchToStudio}
          className="w-full text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium py-2 transition"
          disabled={!onSwitchToStudio}
        >
          Are you a Studio? {isLogin ? "Login" : "Sign up"}
        </button>
      </div>
    </div>
  )
}