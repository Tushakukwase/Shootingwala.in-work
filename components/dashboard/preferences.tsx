"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/contexts/AuthContext"
import { useState, useEffect } from "react"

export function PreferencesSection() {
  const { user } = useAuth()
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: false
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      // In a real app, you would fetch preferences from the API
      // For now, we'll use default values
      setPreferences({
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: false
      })
    }
  }, [user])

  const handleToggle = (type: string) => {
    setPreferences(prev => ({
      ...prev,
      [type]: !prev[type as keyof typeof prev]
    }))
    
    // In a real app, you would save to the API here
    console.log(`Toggled ${type} to ${!preferences[type as keyof typeof preferences]}`)
  }

  return (
    <Card className="shadow-sm h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold">Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <div>
              <h3 className="font-medium text-gray-900">Email Notifications</h3>
              <p className="text-sm text-gray-500">Receive email notifications</p>
            </div>
            <Switch
              checked={preferences.emailNotifications}
              onCheckedChange={() => handleToggle("emailNotifications")}
              disabled={loading}
            />
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <div>
              <h3 className="font-medium text-gray-900">SMS Notifications</h3>
              <p className="text-sm text-gray-500">Receive SMS notifications</p>
            </div>
            <Switch
              checked={preferences.smsNotifications}
              onCheckedChange={() => handleToggle("smsNotifications")}
              disabled={loading}
            />
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <div>
              <h3 className="font-medium text-gray-900">Push Notifications</h3>
              <p className="text-sm text-gray-500">Receive push notifications</p>
            </div>
            <Switch
              checked={preferences.pushNotifications}
              onCheckedChange={() => handleToggle("pushNotifications")}
              disabled={loading}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}