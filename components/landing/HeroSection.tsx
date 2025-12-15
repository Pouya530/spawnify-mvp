'use client'

import Link from 'next/link'
import { ArrowRight, Users, FileText, Award } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function HeroSection() {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 opacity-50" />
      
      <div className="container mx-auto px-6 relative">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-primary-200 rounded-full shadow-sm">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-neutral-900">
              Contributing to mushroom science
            </span>
          </div>
          
          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-neutral-900 tracking-tight leading-tight">
            Track Your Mushroom Grows,
            <br />
            <span className="bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
              Advance Science
            </span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
            Join thousands of growers documenting their cultivation journey. 
            Your data helps power AI research and optimize growing conditions worldwide.
          </p>
          
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              href="/signup"
              variant="primary"
              size="large"
              className="w-full sm:w-auto"
            >
              Start Tracking Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Link href="#how-it-works">
              <Button 
                variant="ghost"
                size="large"
                className="w-full sm:w-auto"
              >
                See How It Works
              </Button>
            </Link>
          </div>
          
          {/* Social Proof */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 md:gap-8 text-sm text-neutral-600">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>100+ growers</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>500+ grow logs</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span>Scientific grade data</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

