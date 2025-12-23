import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { getUserGrowLogs, buildGrowLogsContext, buildSystemPrompt } from '@/lib/utils/chatContext'

export async function POST(req: NextRequest) {
  try {
    // Check if API key is configured (check dynamically)
    const apiKey = process.env.ANTHROPIC_API_KEY
    
    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY is not set in environment variables')
      return NextResponse.json(
        { 
          error: 'AI service is not configured. Please set ANTHROPIC_API_KEY environment variable.',
          code: 'API_KEY_MISSING',
          debug: {
            nodeEnv: process.env.NODE_ENV,
            hasKey: !!apiKey,
            keyLength: apiKey?.length || 0
          }
        },
        { status: 500 }
      )
    }

    // Initialize Anthropic client dynamically
    let anthropic: Anthropic
    try {
      anthropic = new Anthropic({
        apiKey: apiKey
      })
    } catch (error) {
      console.error('Failed to initialize Anthropic client:', error)
      return NextResponse.json(
        { 
          error: 'Failed to initialize AI service.',
          code: 'INIT_ERROR'
        },
        { status: 500 }
      )
    }

    // Verify user authentication
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { conversationId, message, isNewConversation } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Handle new conversation
    let currentConversationId = conversationId
    if (isNewConversation || !conversationId) {
      const { data: newConversation, error: convError } = await supabase
        .from('chat_conversations')
        .insert({
          user_id: user.id,
          title: message.substring(0, 50) || 'New Conversation'
        })
        .select()
        .single()

      if (convError || !newConversation) {
        console.error('Error creating conversation:', convError)
        
        // Check if table doesn't exist
        if (convError?.code === '42P01' || convError?.message?.includes('does not exist')) {
          return NextResponse.json(
            { 
              error: 'Database tables not set up. Please run chat-schema.sql in Supabase SQL Editor.',
              code: 'TABLE_NOT_FOUND'
            },
            { status: 500 }
          )
        }
        
        return NextResponse.json(
          { error: convError?.message || 'Failed to create conversation' },
          { status: 500 }
        )
      }

      currentConversationId = newConversation.id
    }

    // Save user message
    const { error: userMsgError } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: currentConversationId,
        role: 'user',
        content: message
      })

    if (userMsgError) {
      console.error('Error saving user message:', userMsgError)
      // Don't fail the request if message saving fails, but log it
      // The AI response will still be returned
    }

    // Fetch user's grow logs for context
    const growLogs = await getUserGrowLogs(user.id)
    const growLogsContext = buildGrowLogsContext(growLogs)
    const systemPrompt = buildSystemPrompt(growLogsContext)

    // Fetch conversation history
    const { data: historyMessages } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('conversation_id', currentConversationId)
      .order('created_at', { ascending: true })
      .limit(20) // Last 20 messages for context

    // Build messages array for Claude
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = []
    
    if (historyMessages) {
      historyMessages.forEach((msg: { role: string; content: string }) => {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({
            role: msg.role as 'user' | 'assistant',
            content: msg.content
          })
        }
      })
    }

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      system: systemPrompt,
      messages: messages.length > 0 ? messages : [
        {
          role: 'user',
          content: message
        }
      ]
    })

    const assistantMessage = response.content[0].type === 'text' 
      ? response.content[0].text 
      : 'I apologize, but I could not generate a response.'

    // Save assistant message
    const { error: assistantMsgError } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: currentConversationId,
        role: 'assistant',
        content: assistantMessage
      })

    if (assistantMsgError) {
      console.error('Error saving assistant message:', assistantMsgError)
    }

    return NextResponse.json({
      conversationId: currentConversationId,
      message: assistantMessage,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens
      }
    })

  } catch (error: any) {
    console.error('Chat API error:', error)
    
    // Handle Anthropic API errors
    if (error.status === 401) {
      return NextResponse.json(
        { error: 'Invalid API key. Please check ANTHROPIC_API_KEY environment variable.' },
        { status: 500 }
      )
    }

    if (error.status === 404 || error.type === 'not_found_error') {
      // Model not found error
      if (error.error?.message?.includes('model')) {
        return NextResponse.json(
          { 
            error: 'AI model not available. Please contact support.',
            code: 'MODEL_NOT_FOUND',
            details: error.error?.message
          },
          { status: 500 }
        )
      }
    }

    if (error.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { 
        error: error.message || 'An error occurred while processing your request',
        code: error.type || 'UNKNOWN_ERROR',
        details: error.error?.message || error.message
      },
      { status: 500 }
    )
  }
}

// GET endpoint to fetch conversations
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const conversationId = searchParams.get('conversationId')

    if (conversationId) {
      // Fetch specific conversation with messages
      const { data: conversation, error: convError } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .single()

      if (convError || !conversation) {
        // Check if table doesn't exist
        if (convError?.code === '42P01' || convError?.message?.includes('does not exist')) {
          return NextResponse.json({
            conversation: null,
            messages: []
          })
        }
        
        return NextResponse.json(
          { error: 'Conversation not found' },
          { status: 404 }
        )
      }

      const { data: messages, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (messagesError) {
        console.error('Error fetching messages:', messagesError)
        // Return empty messages array if table doesn't exist
        if (messagesError.code === '42P01' || messagesError.message?.includes('does not exist')) {
          return NextResponse.json({
            conversation,
            messages: []
          })
        }
      }

      return NextResponse.json({
        conversation,
        messages: messages || []
      })
    } else {
      // Fetch all conversations for user
      const { data: conversations, error: convsError } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(50)

      if (convsError) {
        console.error('Error fetching conversations:', convsError)
        
        // If table doesn't exist, return empty array instead of error
        if (convsError.code === '42P01' || convsError.message?.includes('does not exist')) {
          return NextResponse.json({
            conversations: []
          })
        }
        
        return NextResponse.json(
          { error: 'Failed to fetch conversations' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        conversations: conversations || []
      })
    }
  } catch (error: any) {
    console.error('Get conversations error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}

// DELETE endpoint to delete a conversation
export async function DELETE(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const conversationId = searchParams.get('conversationId')

    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId is required' },
        { status: 400 }
      )
    }

    // Verify ownership before deleting
    const { error: deleteError } = await supabase
      .from('chat_conversations')
      .delete()
      .eq('id', conversationId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error deleting conversation:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete conversation' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete conversation error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}

