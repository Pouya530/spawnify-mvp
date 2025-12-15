import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">
              Spawnify
            </h1>
          </Link>
          <p className="text-neutral-600 mt-2 text-sm">
            Track your mushroom grows. Advance science.
          </p>
        </div>
        
        {/* Form content */}
        {children}
      </div>
    </div>
  )
}

