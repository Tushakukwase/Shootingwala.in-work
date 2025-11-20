import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protected routes that require authentication
  const protectedRoutes = [
    '/admin',
    '/admin-dashboard',
    '/studio-dashboard',
    '/dashboard',
    '/user/'
  ]

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  if (isProtectedRoute) {
    // Check for authentication token in cookies
    const token = request.cookies.get('auth-token')?.value
    const userCookie = request.cookies.get('user')?.value

    // If no token or user data, redirect to appropriate login page
    if (!token && !userCookie) {
      let loginUrl
      if (pathname.startsWith('/studio-dashboard')) {
        loginUrl = new URL('/studio-auth', request.url)
      } else if (pathname.startsWith('/admin')) {
        loginUrl = new URL('/studio-auth', request.url) // Use studio-auth for admin too
      } else if (pathname.startsWith('/dashboard') || pathname.startsWith('/user/')) {
        loginUrl = new URL('/login', request.url) // User login page
      } else {
        // Default to studio-auth for other protected routes
        loginUrl = new URL('/studio-auth', request.url)
      }
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Additional check for admin routes - STRICT ADMIN EMAIL VERIFICATION
    if (pathname.startsWith('/admin') && userCookie) {
      try {
        const userData = JSON.parse(decodeURIComponent(userCookie))
        const adminEmail = process.env.ADMIN_EMAIL || 'tusharkukwase24@gmail.com'
        
        console.log('Admin access attempt:', {
          email: userData.email,
          role: userData.role,
          userType: userData.userType,
          adminEmail: adminEmail
        })
        
        // Check if user has admin role OR is the authorized admin email
        const isAdmin = userData.role === 'admin' || userData.userType === 'admin'
        if (!isAdmin) {
          console.log('Access denied: User does not have admin role')
          return NextResponse.redirect(new URL('/studio-dashboard', request.url))
        }
        
        // CRITICAL: Even if user has admin role, verify it's the authorized email
        if (userData.email !== adminEmail) {
          console.log(`Unauthorized admin access attempt by: ${userData.email}`)
          return NextResponse.redirect(new URL('/studio-dashboard', request.url))
        }
        
        console.log('Admin access granted for:', userData.email)
        
      } catch (error) {
        console.log('Error parsing user cookie:', error)
        const loginUrl = new URL('/studio-auth', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/studio-dashboard/:path*',
    '/dashboard/:path*',
    '/user/:path*'
  ]
}