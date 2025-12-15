'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function LandingNav() {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-neutral-200">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-primary-600 hover:text-primary-700 transition-colors">
          Spawnify
        </Link>
        
        {/* Nav Links */}
        <div className="flex items-center gap-4">
          <Link 
            href="/login"
            className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            Sign In
          </Link>
          <Button 
            href="/signup"
            variant="primary"
            size="medium"
          >
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  )
}

