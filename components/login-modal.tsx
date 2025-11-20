"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import AuthForm from "./auth-form"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [userType, setUserType] = useState<"user" | "studio">("user") // Default to user as requested
  const [isLogin, setIsLogin] = useState(true)

  // Reset form state when modal opens
  useEffect(() => {
    if (isOpen) {
      setUserType("user")
      setIsLogin(true)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking the backdrop itself, not the modal content
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleModalClick = (e: React.MouseEvent) => {
    // Prevent clicks inside modal from closing it
    e.stopPropagation()
  }

  // This will be called when login/registration is successful
  const handleSuccess = () => {
    onClose()
  }

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className={`bg-white rounded-lg shadow-2xl w-full max-w-xs relative ${
          !isLogin ? 'max-h-[500px] overflow-hidden flex flex-col' : ''
        }`}
        onClick={handleModalClick}
      >
        {/* Close Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-2 top-2 rounded-full p-1 z-10"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>

        {/* Modal Content */}
        <div className={`p-4 pt-7 ${
          !isLogin ? 'overflow-y-auto flex-1' : ''
        }`}>
          <AuthForm 
            userType={userType} 
            isLogin={isLogin} 
            setIsLogin={setIsLogin}
            onSuccess={handleSuccess}
            onSwitchUserType={setUserType}
          />
        </div>
      </div>
    </div>
  )
}