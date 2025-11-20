"use client"

import { useState } from "react"
import UserForm from "./user-form"
import StudioForm from "./studio-form"

interface AuthFormProps {
  userType: "user" | "studio"
  isLogin: boolean
  setIsLogin: (value: boolean) => void
  onSuccess?: () => void
  onSwitchUserType?: (type: "user" | "studio") => void
}

export default function AuthForm({ userType, isLogin, setIsLogin, onSuccess, onSwitchUserType }: AuthFormProps) {
  // Switch functions for user and studio forms
  const handleSwitchToStudio = () => {
    if (onSwitchUserType) {
      onSwitchUserType("studio")
    }
  }

  const handleSwitchToUser = () => {
    if (onSwitchUserType) {
      onSwitchUserType("user")
    }
  }

  return (
    <div className="w-full">
      <div className="relative">
        <div
          className={`transition-all duration-500 ease-in-out transform ${
            userType === "user" ? "opacity-100 scale-100" : "opacity-0 scale-95 absolute inset-0 pointer-events-none"
          }`}
        >
          <UserForm 
            isLogin={isLogin} 
            setIsLogin={setIsLogin} 
            onSwitchToStudio={handleSwitchToStudio}
            onSuccess={onSuccess}
          />
        </div>
        <div
          className={`transition-all duration-500 ease-in-out transform ${
            userType === "studio" ? "opacity-100 scale-100" : "opacity-0 scale-95 absolute inset-0 pointer-events-none"
          }`}
        >
          <StudioForm 
            isLogin={isLogin} 
            setIsLogin={setIsLogin} 
            onSwitchToUser={handleSwitchToUser}
            onSuccess={onSuccess}
          />
        </div>
      </div>
    </div>
  )
}