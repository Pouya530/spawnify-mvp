'use client'

import { useState } from 'react'
import { Info } from 'lucide-react'
import { Card } from '@/components/ui/Card'

export function DataPrivacySettings() {
  const [optIn] = useState(true) // MVP: Always opt-in, cannot change
  
  return (
    <Card className="p-8">
      <h2 className="text-xl font-bold text-neutral-900 mb-6">
        Data Privacy
      </h2>
      
      <div className="space-y-6">
        {/* Information Banner */}
        <div className="p-4 bg-primary-50 border border-primary-200 rounded-xl">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-primary-900">
              <p className="font-medium mb-2">
                Contributing to Mushroom Science
              </p>
              <p>
                Your anonymized cultivation data helps advance research in:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>AI-driven analysis of optimal growing conditions</li>
                <li>Scientific research papers</li>
                <li>Smart grow kit development and optimization</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Opt-in Checkbox (MVP: display only) */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="data-sharing"
            checked={optIn}
            onChange={() => {}} // Disabled in MVP
            disabled
            className="mt-1 w-4 h-4 text-primary-600 rounded border-neutral-300 focus:ring-primary-500"
          />
          <label htmlFor="data-sharing" className="text-sm text-neutral-600">
            <span className="font-medium text-neutral-900">
              Share my anonymized data for scientific research
            </span>
            <br />
            <span className="text-xs">
              Your personal information (email, photos, notes) is never included.
              Only anonymized cultivation data is used.
            </span>
          </label>
        </div>
        
        <p className="text-xs text-neutral-500">
          Note: Opt-out functionality will be available in a future update.
        </p>
        
        {/* Privacy Policy Link */}
        <div className="pt-4 border-t border-neutral-200">
          <a 
            href="/privacy" 
            className="text-sm text-primary-600 hover:text-primary-700 transition-standard"
          >
            View Privacy Policy →
          </a>
        </div>
      </div>
    </Card>
  )
}

