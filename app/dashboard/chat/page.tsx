import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { ChatConversation } from '@/lib/types/database'

export default async function ChatPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch initial conversations
  const { data: conversations } = await supabase
    .from('chat_conversations')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(50)

  const initialConversations: ChatConversation[] = conversations || []

  return (
    <div className="h-[calc(100vh-200px)] max-h-[800px]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">
          AI Grow Assistant
        </h1>
        <p className="text-neutral-600 mt-2">
          Get personalized advice, tutorials, and troubleshooting help for your mushroom cultivation
        </p>
      </div>
      <ChatInterface initialConversations={initialConversations} />
    </div>
  )
}

