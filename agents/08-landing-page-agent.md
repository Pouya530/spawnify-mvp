# Landing Page Agent

## Role
You are the Landing Page Agent responsible for implementing the public-facing landing page that converts visitors into users for Spawnify MVP.

## Primary Objectives
1. Create compelling landing page with clear value proposition
2. Showcase key features and benefits
3. Highlight scientific contribution angle
4. Include strong call-to-action (CTA) buttons
5. Implement luxurious, modern design
6. Ensure mobile responsiveness

## Tech Stack
- Next.js 14.2+ (App Router)
- Tailwind CSS
- Lucide React icons
- Design system components

## Route

```
/ → Landing page (public)
```

## Page Structure

### File: `app/page.tsx`

**Purpose:** Convert visitors to sign up for Spawnify

**Sections:**
1. Hero Section
2. Features Section
3. Scientific Impact Section
4. How It Works
5. Call-to-Action
6. Footer

```tsx
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <LandingNav />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Features Section */}
      <FeaturesSection />
      
      {/* Scientific Impact */}
      <ScientificImpactSection />
      
      {/* How It Works */}
      <HowItWorksSection />
      
      {/* Final CTA */}
      <CTASection />
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
```

## 1. Landing Navigation

### File: `components/landing/LandingNav.tsx`

**Purpose:** Simple, elegant navigation for landing page

```tsx
export function LandingNav() {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-neutral-200">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-neutral-900">
          Spawnify
        </Link>
        
        {/* Nav Links (optional for MVP) */}
        <div className="flex items-center gap-4">
          <Link 
            href="/login"
            className="text-sm text-neutral-600 hover:text-neutral-900 transition"
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
  );
}
```

## 2. Hero Section

### File: `components/landing/HeroSection.tsx`

**Purpose:** Compelling headline and primary CTA

**Key Elements:**
- Bold headline
- Supporting subheadline
- Primary CTA button
- Visual element (optional gradient/pattern)

```tsx
export function HeroSection() {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 opacity-50" />
      
      <div className="container mx-auto px-6 relative">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-primary-200 rounded-full">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-neutral-900">
              Contributing to mushroom science
            </span>
          </div>
          
          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-neutral-900 tracking-tight leading-tight">
            Track Your Mushroom Grows,
            <br />
            <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
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
            <Button 
              href="#how-it-works"
              variant="ghost"
              size="large"
              className="w-full sm:w-auto"
            >
              See How It Works
            </Button>
          </div>
          
          {/* Social Proof */}
          <div className="pt-8 flex items-center justify-center gap-8 text-sm text-neutral-600">
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
  );
}
```

## 3. Features Section

### File: `components/landing/FeaturesSection.tsx`

**Purpose:** Highlight key platform features

**Features to Showcase:**
- Detailed tracking
- Photo documentation
- Gamification system
- Scientific contribution

```tsx
export function FeaturesSection() {
  const features = [
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
  ];
  
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
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <Card className="p-8 hover:shadow-xl hover:border-primary-300 transition-all">
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
  );
}
```

## 4. Scientific Impact Section

### File: `components/landing/ScientificImpactSection.tsx`

**Purpose:** Emphasize the scientific contribution aspect

```tsx
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
                Your Data Powers Tomorrow's Breakthroughs
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
  );
}

function ImpactItem({ icon, title, description }) {
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
  );
}

function StatItem({ label, value }) {
  return (
    <div className="border-l-4 border-primary-500 pl-4">
      <p className="text-sm text-neutral-600 mb-1">{label}</p>
      <p className="text-3xl font-bold text-neutral-900">{value}</p>
    </div>
  );
}
```

## 5. How It Works Section

### File: `components/landing/HowItWorksSection.tsx`

**Purpose:** Explain the process in simple steps

```tsx
export function HowItWorksSection() {
  const steps = [
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
  ];
  
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
                <div className="hidden lg:block absolute top-16 left-full w-full h-px bg-neutral-700" />
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
  );
}
```

## 6. Final CTA Section

### File: `components/landing/CTASection.tsx`

**Purpose:** Strong final call-to-action before footer

```tsx
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
  );
}
```

## 7. Footer

### File: `components/landing/Footer.tsx`

**Purpose:** Legal links and company info

```tsx
export function Footer() {
  return (
    <footer className="bg-neutral-900 text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold mb-4">Spawnify</h3>
            <p className="text-neutral-400">
              Track your mushroom grows. Advance science.
            </p>
          </div>
          
          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <div className="space-y-2 text-neutral-400">
              <Link href="/login" className="block hover:text-white transition">
                Sign In
              </Link>
              <Link href="/signup" className="block hover:text-white transition">
                Sign Up
              </Link>
            </div>
          </div>
          
          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <div className="space-y-2 text-neutral-400">
              <Link href="/privacy" className="block hover:text-white transition">
                Privacy Policy
              </Link>
              <Link href="/terms" className="block hover:text-white transition">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-neutral-800 pt-8 text-center text-neutral-400 text-sm">
          <p>© {new Date().getFullYear()} Spawnify. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
```

## Design Principles

### Visual Hierarchy
- Large, bold headlines (text-5xl to text-7xl)
- Clear section separation with generous padding
- Contrast between sections (white, neutral-50, neutral-900)

### Spacing
- Section padding: py-20 md:py-32
- Container padding: px-6
- Element gaps: gap-8 to gap-12

### Colors
- Primary gradient for emphasis
- Neutral backgrounds
- Dark section for contrast (How It Works)

### CTAs
- Multiple CTAs throughout page
- Primary button: "Start Tracking Free", "Get Started"
- Ghost button: "See How It Works", "Sign In"

## Animations (Optional Enhancement)

### Scroll Animations
```tsx
// Can add in Phase 2 with framer-motion
import { motion } from 'framer-motion';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};
```

## SEO Optimization

### Meta Tags (in layout.tsx)
```tsx
export const metadata = {
  title: 'Spawnify - Track Mushroom Grows, Advance Science',
  description: 'Join thousands of growers documenting their cultivation journey. Your data helps power AI research and optimize growing conditions worldwide.',
  keywords: 'mushroom cultivation, grow tracking, mycology, mushroom growing, scientific research'
};
```

## Responsive Design

### Mobile-First
- Single column on mobile
- Stack CTAs vertically
- Readable font sizes
- Touch-friendly buttons

### Tablet
- Two-column grids
- Horizontal CTAs

### Desktop
- Full multi-column layouts
- Max-width containers
- Generous spacing

## Implementation Checklist
- [ ] Create landing page layout
- [ ] Implement LandingNav component
- [ ] Create HeroSection with gradient
- [ ] Build FeaturesSection with cards
- [ ] Implement ScientificImpactSection
- [ ] Create HowItWorksSection with steps
- [ ] Build CTASection
- [ ] Create Footer with links
- [ ] Add responsive breakpoints
- [ ] Test all CTAs link correctly
- [ ] Verify design matches specification
- [ ] Test on mobile, tablet, desktop
- [ ] Optimize images (if any)
- [ ] Add meta tags for SEO

## Success Criteria
- Clear value proposition in hero
- Features are easy to understand
- Scientific impact is compelling
- Multiple clear CTAs throughout
- Design is luxurious and modern
- Fully responsive on all devices
- Fast load times (<3s)
- No console errors
- Links work correctly

## Files to Create
1. `app/page.tsx`
2. `components/landing/LandingNav.tsx`
3. `components/landing/HeroSection.tsx`
4. `components/landing/FeaturesSection.tsx`
5. `components/landing/ScientificImpactSection.tsx`
6. `components/landing/HowItWorksSection.tsx`
7. `components/landing/CTASection.tsx`
8. `components/landing/Footer.tsx`

## Handoff to Other Agents
- **Design System Agent:** Uses all UI components
- **Authentication Agent:** Links to /login and /signup
- **Dashboard Agent:** User lands here after signup
