"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { 
  Key, 
  Shield, 
  Smartphone, 
  Laptop, 
  Lock, 
  Mail, 
  Phone, 
  Trash2, 
  LogOut,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  Clock
} from "lucide-react"
import { useState } from "react"

export function SecuritySection() {
  const [isEditingPassword, setIsEditingPassword] = useState(false)
  const [isEditingRecovery, setIsEditingRecovery] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: ""
  })
  const [recoveryForm, setRecoveryForm] = useState({
    email: "user@example.com",
    phone: "+91 98765 43210"
  })

  // Mock data
  const lastPasswordUpdate = "2023-05-15"
  const joinedDate = "2022-01-15"
  const lastLogin = "2023-06-20 14:30"
  const loginActivities = [
    {
      id: "1",
      device: "Windows 11 - Chrome",
      ip: "192.168.1.100",
      location: "Mumbai, India",
      timestamp: "2023-06-20 14:30",
      current: true
    },
    {
      id: "2",
      device: "iPhone 14 - Safari",
      ip: "192.168.1.101",
      location: "Mumbai, India",
      timestamp: "2023-06-19 09:15",
      current: false
    },
    {
      id: "3",
      device: "MacBook Pro - Firefox",
      ip: "192.168.1.102",
      location: "Delhi, India",
      timestamp: "2023-06-18 16:45",
      current: false
    }
  ]

  const trustedDevices = [
    {
      id: "1",
      device: "Windows 11 - Chrome",
      lastActive: "2023-06-20 14:30",
      location: "Mumbai, India"
    },
    {
      id: "2",
      device: "iPhone 14 - Safari",
      lastActive: "2023-06-19 09:15",
      location: "Mumbai, India"
    }
  ]

  const securityQuestions = [
    {
      id: "1",
      question: "What was your first pet's name?",
      answer: "Max"
    },
    {
      id: "2",
      question: "What is your mother's maiden name?",
      answer: "Smith"
    }
  ]

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would submit the form to the server
    console.log("Password change requested", passwordForm)
    setIsEditingPassword(false)
    setPasswordForm({
      oldPassword: "",
      newPassword: "",
      confirmNewPassword: ""
    })
  }

  const handleRecoveryUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would submit the form to the server
    console.log("Recovery info updated", recoveryForm)
    setIsEditingRecovery(false)
  }

  const signOutAllDevices = () => {
    // In a real app, you would call an API to sign out all devices
    alert("All devices signed out")
  }

  const removeTrustedDevice = (deviceId: string) => {
    // In a real app, you would call an API to remove the trusted device
    console.log("Removing trusted device", deviceId)
  }

  const deactivateAccount = () => {
    if (confirm("Are you sure you want to deactivate your account? You can reactivate it later.")) {
      // In a real app, you would call an API to deactivate the account
      alert("Account deactivated")
    }
  }

  const deleteAccount = () => {
    if (confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) {
      // In a real app, you would call an API to delete the account
      alert("Account deleted")
    }
  }

  return (
    <div className="space-y-6">
      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-md">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Joined Date</p>
                  <p className="font-medium">{joinedDate}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-md">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Last Login</p>
                  <p className="font-medium">{lastLogin}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Password Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Last password update</p>
                <p className="font-medium">{lastPasswordUpdate}</p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setIsEditingPassword(true)}
                disabled={isEditingPassword}
              >
                Change Password
              </Button>
            </div>

            {isEditingPassword && (
              <form onSubmit={handlePasswordChange} className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="oldPassword">Old Password</Label>
                  <Input
                    id="oldPassword"
                    type="password"
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                  <Input
                    id="confirmNewPassword"
                    type="password"
                    value={passwordForm.confirmNewPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmNewPassword: e.target.value})}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Update Password</Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsEditingPassword(false)
                      setPasswordForm({
                        oldPassword: "",
                        newPassword: "",
                        confirmNewPassword: ""
                      })
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable 2FA</p>
              <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center gap-2 mt-4">
            <Smartphone className="h-4 w-4 text-gray-500" />
            <span className="text-sm">Receive codes via SMS</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Mail className="h-4 w-4 text-gray-500" />
            <span className="text-sm">Receive codes via Email</span>
          </div>
        </CardContent>
      </Card>

      {/* Login Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Laptop className="h-5 w-5" />
            Login Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loginActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 border rounded-md">
                <div>
                  <div className="flex items-center gap-2">
                    <Laptop className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{activity.device}</span>
                    {activity.current && (
                      <Badge variant="default">Current</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{activity.ip} • {activity.location}</p>
                  <p className="text-xs text-gray-400">{activity.timestamp}</p>
                </div>
              </div>
            ))}
            <Button variant="outline" onClick={signOutAllDevices}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign out from all devices
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Security Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityQuestions.map((question) => (
              <div key={question.id} className="p-3 border rounded-md">
                <p className="font-medium">{question.question}</p>
                <p className="text-sm text-gray-500 mt-1">Answer: {question.answer}</p>
              </div>
            ))}
            <Button variant="outline">Update Security Questions</Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Recovery */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Account Recovery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Recovery Email</p>
                <p className="font-medium">{recoveryForm.email}</p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setIsEditingRecovery(true)}
                disabled={isEditingRecovery}
              >
                Update
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Recovery Phone</p>
                <p className="font-medium">{recoveryForm.phone}</p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setIsEditingRecovery(true)}
                disabled={isEditingRecovery}
              >
                Update
              </Button>
            </div>

            {isEditingRecovery && (
              <form onSubmit={handleRecoveryUpdate} className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={recoveryForm.email}
                    onChange={(e) => setRecoveryForm({...recoveryForm, email: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={recoveryForm.phone}
                    onChange={(e) => setRecoveryForm({...recoveryForm, phone: e.target.value})}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Update Recovery Info</Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsEditingRecovery(false)
                      setRecoveryForm({
                        email: "user@example.com",
                        phone: "+91 98765 43210"
                      })
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Trusted Devices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Laptop className="h-5 w-5" />
            Trusted Devices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trustedDevices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-3 border rounded-md">
                <div>
                  <p className="font-medium">{device.device}</p>
                  <p className="text-sm text-gray-500">Last active: {device.lastActive}</p>
                  <p className="text-xs text-gray-400">{device.location}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => removeTrustedDevice(device.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Account Deactivation / Delete */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            Account Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Deactivate Account</h3>
              <p className="text-sm text-gray-500 mb-3">
                Temporarily disable your account. You can reactivate it later by logging in.
              </p>
              <Button variant="outline" onClick={deactivateAccount}>
                Deactivate Account
              </Button>
            </div>
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2 text-red-600">Delete Account</h3>
              <p className="text-sm text-gray-500 mb-3">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <Button variant="destructive" onClick={deleteAccount}>
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Security Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">New Login Alerts</p>
                <p className="text-sm text-gray-500">Get notified when someone logs into your account</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Password Change Alerts</p>
                <p className="text-sm text-gray-500">Get notified when your password is changed</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">2FA Change Alerts</p>
                <p className="text-sm text-gray-500">Get notified when 2FA settings are changed</p>
              </div>
              <Switch />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
