'use client'

import { ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export function CTASection() {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-6">
        <Card className="max-w-4xl mx-auto p-12 md:p-16 text-center bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-200">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 tracking-tight mb-6">
            Ready to Start Tracking?
          </h2>
          <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
            Join the community of growers contributing to the future of mushroom cultivation
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button href="/signup" variant="primary" size="large">
              Create Free Account
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button href="/login" variant="secondary" size="large">
              Sign In
            </Button>
          </div>
          
          <p className="text-sm text-neutral-500 mt-6">
            Free forever. No credit card required.
          </p>
        </Card>
      </div>
    </section>
  )
}

