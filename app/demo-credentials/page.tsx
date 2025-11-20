"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, User, Camera, Shield } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function DemoCredentialsPage() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">Demo Credentials</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Use these demo accounts to test the PhotoBook platform
            </p>
          </div>

          {/* Demo Accounts Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Regular Users */}
            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Regular Users</CardTitle>
                <CardDescription>Test user dashboard and booking features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">Email:</p>
                    <div className="flex items-center justify-between">
                      <code className="text-sm">user@example.com</code>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => copyToClipboard('user@example.com')}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="text-sm font-medium text-gray-700 mt-2">Password:</p>
                    <div className="flex items-center justify-between">
                      <code className="text-sm">user123</code>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => copyToClipboard('user123')}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">Email:</p>
                    <div className="flex items-center justify-between">
                      <code className="text-sm">sarah@example.com</code>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => copyToClipboard('sarah@example.com')}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="text-sm font-medium text-gray-700 mt-2">Password:</p>
                    <div className="flex items-center justify-between">
                      <code className="text-sm">sarah123</code>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => copyToClipboard('sarah123')}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <Link href="/login">
                  <Button className="w-full">
                    Login as User
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Photographers */}
            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Camera className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Photographers</CardTitle>
                <CardDescription>Test studio dashboard and portfolio management</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">Username:</p>
                    <div className="flex items-center justify-between">
                      <code className="text-sm">photographer</code>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => copyToClipboard('photographer')}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="text-sm font-medium text-gray-700 mt-2">Password:</p>
                    <div className="flex items-center justify-between">
                      <code className="text-sm">photo123</code>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => copyToClipboard('photo123')}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <Link href="/studio-auth">
                  <Button className="w-full">
                    Login as Photographer
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Admin */}
            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle className="text-xl">Administrator</CardTitle>
                <CardDescription>Test admin panel and management features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">Email:</p>
                    <div className="flex items-center justify-between">
                      <code className="text-sm text-xs">tusharkukwase24@gmail.com</code>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => copyToClipboard('tusharkukwase24@gmail.com')}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="text-sm font-medium text-gray-700 mt-2">Password:</p>
                    <div className="flex items-center justify-between">
                      <code className="text-sm">admin123</code>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => copyToClipboard('admin123')}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <Link href="/studio-auth">
                  <Button className="w-full">
                    Login as Admin
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Instructions */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>How to Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold text-blue-600 mb-2">Regular Users</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Browse photographers</li>
                    <li>• View portfolios</li>
                    <li>• Book sessions</li>
                    <li>• Manage preferences</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-600 mb-2">Photographers</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Manage portfolio</li>
                    <li>• View bookings</li>
                    <li>• Update profile</li>
                    <li>• Track earnings</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-red-600 mb-2">Administrator</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Manage photographers</li>
                    <li>• Approve registrations</li>
                    <li>• View analytics</li>
                    <li>• System settings</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Back to Home */}
          <div className="text-center">
            <Link href="/">
              <Button variant="outline" size="lg">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}