'use client'

import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-neutral-900 text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold mb-4 text-primary-400">Spawnify</h3>
            <p className="text-neutral-400">
              Track your mushroom grows. Advance science.
            </p>
          </div>
          
          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <div className="space-y-2 text-neutral-400">
              <Link href="/login" className="block hover:text-white transition-colors">
                Sign In
              </Link>
              <Link href="/signup" className="block hover:text-white transition-colors">
                Sign Up
              </Link>
            </div>
          </div>
          
          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <div className="space-y-2 text-neutral-400">
              <Link href="/privacy" className="block hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="block hover:text-white transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-neutral-800 pt-8 text-center text-neutral-400 text-sm">
          <p>© {currentYear} Spawnify. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

