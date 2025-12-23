import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { ChatConversation } from '@/lib/types/database'
import { Card } from '@/components/ui/Card'

export default async function ChatPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch initial conversations with error handling
  let initialConversations: ChatConversation[] = []
  let tableExists = true
  
  try {
    const { data: conversations, error } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching conversations:', error)
      // Check if table doesn't exist (PostgreSQL error code 42P01)
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        tableExists = false
      }
    } else {
      initialConversations = conversations || []
    }
  } catch (err: any) {
    console.error('Unexpected error fetching conversations:', err)
    // If it's a table not found error, mark as such
    if (err.message?.includes('does not exist') || err.code === '42P01') {
      tableExists = false
    }
  }

  // Show setup message if tables don't exist
  if (!tableExists) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">
            AI Grow Assistant
          </h1>
          <p className="text-neutral-600 mt-2">
            Get personalized advice, tutorials, and troubleshooting help for your mushroom cultivation
          </p>
        </div>
        <Card className="p-8 bg-amber-50 border-amber-200">
          <h2 className="text-xl font-bold text-amber-900 mb-4">
            Database Setup Required
          </h2>
          <p className="text-amber-800 mb-4">
            The chat feature requires database tables to be set up. Please follow these steps:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-amber-800 mb-6">
            <li>Open your Supabase project dashboard</li>
            <li>Go to <strong>SQL Editor</strong></li>
            <li>Open the file <code className="bg-amber-100 px-2 py-1 rounded">chat-schema.sql</code></li>
            <li>Copy all contents and paste into SQL Editor</li>
            <li>Click <strong>Run</strong> or press Cmd/Ctrl + Enter</li>
            <li>Refresh this page</li>
          </ol>
          <div className="bg-white p-4 rounded-lg border border-amber-300">
            <p className="text-sm font-medium text-amber-900 mb-2">File location:</p>
            <code className="text-xs text-amber-800 bg-amber-100 px-2 py-1 rounded block">
              /chat-schema.sql
            </code>
          </div>
        </Card>
      </div>
    )
  }

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

