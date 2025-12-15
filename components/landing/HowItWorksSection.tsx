'use client'

import { UserPlus, FileText, Award, Globe } from 'lucide-react'

interface Step {
  number: string
  title: string
  description: string
  icon: React.ReactNode
}

const steps: Step[] = [
  {
    number: '01',
    title: 'Sign Up Free',
    description: 'Create your account in seconds. No credit card required.',
    icon: <UserPlus className="w-6 h-6" />
  },
  {
    number: '02',
    title: 'Log Your Grows',
    description: 'Track every detail from inoculation to harvest with our easy-to-use forms.',
    icon: <FileText className="w-6 h-6" />
  },
  {
    number: '03',
    title: 'Earn Points',
    description: 'Get rewarded for detailed logging. Unlock tiers and contribute to science.',
    icon: <Award className="w-6 h-6" />
  },
  {
    number: '04',
    title: 'Make an Impact',
    description: 'Your data helps advance mushroom cultivation research worldwide.',
    icon: <Globe className="w-6 h-6" />
  }
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-neutral-900 text-white">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            How It Works
          </h2>
          <p className="text-xl text-neutral-400">
            Start contributing to mushroom science in four simple steps
          </p>
        </div>
        
        {/* Steps */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector Line (desktop only) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-px bg-neutral-700 -z-10" style={{ width: 'calc(100% - 2rem)' }} />
              )}
              
              <div className="relative">
                {/* Step Number */}
                <div className="text-6xl font-bold text-neutral-800 mb-4">
                  {step.number}
                </div>
                
                {/* Icon */}
                <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center text-white mb-4">
                  {step.icon}
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-bold mb-2">
                  {step.title}
                </h3>
                <p className="text-neutral-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

