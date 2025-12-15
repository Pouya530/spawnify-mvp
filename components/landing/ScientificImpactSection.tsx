'use client'

import { Brain, BookOpen, Zap, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface ImpactItemProps {
  icon: React.ReactNode
  title: string
  description: string
}

function ImpactItem({ icon, title, description }: ImpactItemProps) {
  return (
    <div className="flex gap-4">
      <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 flex-shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="font-semibold text-neutral-900 mb-1">{title}</h4>
        <p className="text-sm text-neutral-600">{description}</p>
      </div>
    </div>
  )
}

interface StatItemProps {
  label: string
  value: string
}

function StatItem({ label, value }: StatItemProps) {
  return (
    <div className="border-l-4 border-primary-500 pl-4">
      <p className="text-sm text-neutral-600 mb-1">{label}</p>
      <p className="text-3xl font-bold text-neutral-900">{value}</p>
    </div>
  )
}

export function ScientificImpactSection() {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div className="space-y-6">
              <div className="inline-block px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                Scientific Research
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 tracking-tight">
                Your Data Powers Tomorrow&apos;s Breakthroughs
              </h2>
              
              <p className="text-lg text-neutral-600 leading-relaxed">
                Every grow log you create contributes to a growing scientific dataset 
                that will revolutionize mushroom cultivation.
              </p>
              
              <div className="space-y-4">
                <ImpactItem 
                  icon={<Brain className="w-6 h-6" />}
                  title="AI-Driven Analysis"
                  description="Machine learning models identify optimal growing conditions across thousands of data points"
                />
                <ImpactItem 
                  icon={<BookOpen className="w-6 h-6" />}
                  title="Scientific Papers"
                  description="Anonymized data contributes to peer-reviewed research in mycology"
                />
                <ImpactItem 
                  icon={<Zap className="w-6 h-6" />}
                  title="Smart Grow Kits"
                  description="Your insights help design the next generation of automated growing systems"
                />
              </div>
              
              <Button href="/signup" variant="primary" size="large">
                Join the Research
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
            
            {/* Right: Visual Element */}
            <div className="relative">
              <Card className="p-8 bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-200">
                <div className="space-y-6">
                  <StatItem label="Target Contributors" value="6,000" />
                  <StatItem label="Data Points Collected" value="50,000+" />
                  <StatItem label="Research Partners" value="Coming Soon" />
                </div>
              </Card>
              
              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary-200 rounded-full opacity-20 blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-secondary-200 rounded-full opacity-20 blur-2xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

