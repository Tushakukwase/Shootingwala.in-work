"use client"

import { useState } from "react"
import UserForm from "./user-form"
import StudioForm from "./studio-form"

export default function AuthForm() {
  const [userType, setUserType] = useState<"user" | "studio">("studio") // Default to studio for studio-auth page
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="w-full max-w-md">
      <div className="relative">
        <div
          className={`transition-all duration-500 ease-in-out transform ${
            userType === "user" ? "opacity-100 scale-100" : "opacity-0 scale-95 absolute inset-0 pointer-events-none"
          }`}
        >
          <UserForm isLogin={isLogin} setIsLogin={setIsLogin} onSwitchToStudio={() => setUserType("studio")} />
        </div>
        <div
          className={`transition-all duration-500 ease-in-out transform ${
            userType === "studio" ? "opacity-100 scale-100" : "opacity-0 scale-95 absolute inset-0 pointer-events-none"
          }`}
        >
          <StudioForm isLogin={isLogin} setIsLogin={setIsLogin} onSwitchToUser={() => setUserType("user")} />
        </div>
      </div>
    </div>
  )
}