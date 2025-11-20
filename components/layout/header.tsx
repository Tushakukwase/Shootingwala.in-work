"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Camera, Menu, X } from "lucide-react"
import { useState } from "react"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Camera className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">PhotoBook</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Home
            </Link>
            <Link 
              href="/gallery" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Gallery
            </Link>
            <Link 
              href="/photographers" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Photographers
            </Link>
            <Link 
              href="/about" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Contact
            </Link>
          </nav>

          {/* Desktop Login Button */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/demo-credentials">
              <Button variant="ghost" className="font-medium text-sm">
                Demo Accounts
              </Button>
            </Link>
            <Link href="/studio-auth">
              <Button variant="outline" className="font-medium">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="font-medium">
                Sign Up
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur">
            <nav className="flex flex-col space-y-4 px-4 py-6">
              <Link 
                href="/" 
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/gallery" 
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Gallery
              </Link>
              <Link 
                href="/photographers" 
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Photographers
              </Link>
              <Link 
                href="/about" 
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/contact" 
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="flex flex-col space-y-2 pt-4 border-t">
                <Link href="/demo-credentials" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full font-medium text-sm">
                    Demo Accounts
                  </Button>
                </Link>
                <Link href="/studio-auth" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full font-medium">
                    Login
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full font-medium">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}