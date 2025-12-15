import { createClient } from '@/lib/supabase/client'

export async function deletePhotos(photoUrls: string[], userId: string): Promise<void> {
  const supabase = createClient()
  
  for (const url of photoUrls) {
    try {
      // Extract path from URL
      // URL format: https://[project].supabase.co/storage/v1/object/public/grow-photos/[userId]/[filename]
      const urlParts = url.split('/grow-photos/')
      if (urlParts.length === 2) {
        const path = urlParts[1]
        
        const { error } = await supabase.storage
          .from('grow-photos')
          .remove([path])
        
        if (error) {
          console.error('Error deleting photo:', error)
          // Continue with other photos even if one fails
        }
      }
    } catch (error) {
      console.error('Error processing photo deletion:', error)
    }
  }
}

