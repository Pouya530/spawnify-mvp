'use client'

import { ClipboardList, Camera, Trophy, Microscope } from 'lucide-react'
import { Card } from '@/components/ui/Card'

interface Feature {
  icon: React.ReactNode
  title: string
  description: string
}

const features: Feature[] = [
  {
    icon: <ClipboardList className="w-8 h-8" />,
    title: 'Comprehensive Tracking',
    description: 'Log every detail from inoculation to harvest. Track strains, substrates, environmental conditions, and growing techniques.'
  },
  {
    icon: <Camera className="w-8 h-8" />,
    title: 'Photo Documentation',
    description: 'Upload photos at each growth stage. Build a visual timeline of your cultivation journey.'
  },
  {
    icon: <Trophy className="w-8 h-8" />,
    title: 'Gamification',
    description: 'Earn points for detailed logs. Progress through Bronze, Silver, and Gold tiers as you contribute more data.'
  },
  {
    icon: <Microscope className="w-8 h-8" />,
    title: 'Scientific Impact',
    description: 'Your anonymized data contributes to AI research, scientific papers, and smart grow kit development.'
  }
]

function FeatureCard({ icon, title, description }: Feature) {
  return (
    <Card className="p-8 hover:shadow-xl hover:border-primary-300 transition-all h-full">
      <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-neutral-900 mb-3">
        {title}
      </h3>
      <p className="text-neutral-600 leading-relaxed">
        {description}
      </p>
    </Card>
  )
}

export function FeaturesSection() {
  return (
    <section className="py-20 md:py-32 bg-neutral-50">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 tracking-tight mb-4">
            Everything You Need to Track
          </h2>
          <p className="text-xl text-neutral-600">
            Professional-grade tools for hobbyists and enthusiasts
          </p>
        </div>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  )
}

