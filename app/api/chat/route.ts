import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { getUserGrowLogs, buildGrowLogsContext, buildSystemPrompt } from '@/lib/utils/chatContext'

/**
 * Fetch image from URL and convert to base64
 * Handles both full URLs and filenames (constructs full URL if needed)
 */
async function fetchImageAsBase64(imageUrl: string, userId?: string): Promise<{ base64: string; mediaType: string } | null> {
  try {
    // If URL doesn't start with http/https, construct full Supabase URL
    let fullUrl = imageUrl
    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      // It's just a filename or relative path, construct the full URL
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (!supabaseUrl) {
        console.error('NEXT_PUBLIC_SUPABASE_URL not set, cannot construct image URL')
        return null
      }
      
      // If imageUrl includes /, it's already userId/filename format
      // Otherwise, prepend userId if available
      const path = imageUrl.includes('/') ? imageUrl : (userId ? `${userId}/${imageUrl}` : imageUrl)
      fullUrl = `${supabaseUrl}/storage/v1/object/public/grow-photos/${path}`
      console.log(`Constructed full URL from filename: ${imageUrl} -> ${fullUrl.substring(0, 80)}...`)
    }
    
    console.log(`Fetching image from: ${fullUrl.substring(0, 100)}...`)
    const response = await fetch(fullUrl)
    
    if (!response.ok) {
      console.error(`Failed to fetch image: ${fullUrl.substring(0, 100)}...`, response.status, response.statusText)
      return null
    }
    
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString('base64')
    
    // Determine media type from Content-Type header or URL extension
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const mediaType = contentType.startsWith('image/') ? contentType : 'image/jpeg'
    
    console.log(`Successfully fetched image (${mediaType}, ${buffer.length} bytes)`)
    return { base64, mediaType }
  } catch (error) {
    console.error(`Error fetching image ${imageUrl}:`, error)
    return null
  }
}

export async function POST(req: NextRequest) {
  const requestId = Date.now()
  // Get API key at function scope so it's available in catch block
  const apiKey = process.env.ANTHROPIC_API_KEY
  try {
    console.log(`[${requestId}] === CHAT API CALLED ===`, { timestamp: new Date().toISOString() })
    
    // Check if API key is configured (check dynamically)
    console.log(`[${requestId}] 🔑 API Key exists:`, !!apiKey, 'Prefix:', apiKey?.substring(0, 15))
    
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
    // Note: The SDK automatically adds the anthropic-version header
    let anthropic: Anthropic
    try {
      anthropic = new Anthropic({
        apiKey: apiKey
      })
      console.log(`[${requestId}] ✅ Anthropic client initialized with API key prefix:`, apiKey?.substring(0, 15))
    } catch (error) {
      console.error(`[${requestId}] ❌ Failed to initialize Anthropic client:`, error)
      return NextResponse.json(
        { 
          error: 'Failed to initialize AI service.',
          code: 'INIT_ERROR',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      )
    }

    // Verify user authentication
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log(`[${requestId}] ❌ Auth failed:`, { authError: authError?.message, hasUser: !!user })
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    console.log(`[${requestId}] ✅ User authenticated:`, user?.id)

    const body = await req.json()
    const { conversationId, message, images, isNewConversation } = body
    console.log(`[${requestId}] 📝 Message received:`, { 
      messageLength: message?.length, 
      hasConversationId: !!conversationId, 
      isNewConversation,
      hasImages: !!images,
      imageCount: images?.length || 0
    })

    // Message or images required
    if ((!message || typeof message !== 'string') && (!images || images.length === 0)) {
      return NextResponse.json(
        { error: 'Message or images are required' },
        { status: 400 }
      )
    }

    // Handle new conversation
    console.log(`[${requestId}] 💾 Starting DB operations...`)
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
    console.log(`[${requestId}] ✅ Conversation ID:`, currentConversationId)

    // Save user message
    const { error: userMsgError } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: currentConversationId,
        role: 'user',
        content: message
      })

    if (userMsgError) {
      console.error(`[${requestId}] Error saving user message:`, userMsgError)
      // Don't fail the request if message saving fails, but log it
      // The AI response will still be returned
    } else {
      console.log(`[${requestId}] ✅ User message saved to DB`)
    }

    // Fetch user's grow logs for context
    const growLogs = await getUserGrowLogs(user.id)
    const growLogsContext = buildGrowLogsContext(growLogs)
    const systemPrompt = buildSystemPrompt(growLogsContext)

    // Collect photo URLs from recent grow logs (for image analysis)
    // Store both URL and userId for each photo (needed if URL is just a filename)
    const recentPhotos: Array<{ url: string; userId: string }> = []
    growLogs.slice(0, 5).forEach((log) => {
      if (log.photos && Array.isArray(log.photos) && log.photos.length > 0) {
        log.photos.forEach((photoUrl) => {
          recentPhotos.push({ url: photoUrl, userId: log.user_id })
        })
      }
    })
    console.log(`[${requestId}] 📸 Found ${recentPhotos.length} photo(s) from grow logs`)
    if (recentPhotos.length > 0) {
      console.log(`[${requestId}] 📸 Sample photo URL:`, recentPhotos[0].url.substring(0, 100))
    }

    // Fetch conversation history
    const { data: historyMessages } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('conversation_id', currentConversationId)
      .order('created_at', { ascending: true })
      .limit(20) // Last 20 messages for context

    // Build messages array for Claude
    // Claude supports content blocks: text or image (base64-encoded)
    type ContentBlock = 
      | { type: 'text'; text: string }
      | { 
          type: 'image'
          source: { 
            type: 'base64'
            media_type: string
            data: string
          }
        }
    
    const messages: Array<{ 
      role: 'user' | 'assistant'
      content: string | ContentBlock[]
    }> = []
    
    if (historyMessages) {
      historyMessages.forEach((msg: { role: string; content: string }) => {
        if (msg.role === 'user' || msg.role === 'assistant') {
          // For history, keep as simple text (images not stored in history)
          messages.push({
            role: msg.role as 'user' | 'assistant',
            content: msg.content
          })
        }
      })
    }
    console.log(`[${requestId}] 📚 Conversation history length:`, messages?.length)

    // Build current user message with images if available
    // Priority: 1) User-uploaded images, 2) Grow log photos
    let imageBlocks: ContentBlock[] = []
    
    // First, add user-uploaded images (if any)
    if (images && Array.isArray(images) && images.length > 0) {
      console.log(`[${requestId}] 📸 Processing ${images.length} user-uploaded image(s)...`)
      imageBlocks = images.slice(0, 5).map((img: { base64: string; mediaType: string }) => ({
        type: 'image' as const,
        source: {
          type: 'base64' as const,
          media_type: img.mediaType || 'image/jpeg',
          data: img.base64
        }
      }))
      console.log(`[${requestId}] ✅ Added ${imageBlocks.length} user-uploaded image(s)`)
    }
    
    // Then, add grow log photos if no user images and photos are available
    const shouldIncludeGrowLogImages = imageBlocks.length === 0 && recentPhotos.length > 0
    if (shouldIncludeGrowLogImages) {
      console.log(`[${requestId}] 📸 Fetching ${Math.min(recentPhotos.length, 5)} grow log image(s) for Claude...`)
      const imagePromises = recentPhotos.slice(0, 5).map(async (photoInfo) => {
        const imageData = await fetchImageAsBase64(photoInfo.url, photoInfo.userId)
        if (imageData) {
          return {
            type: 'image' as const,
            source: {
              type: 'base64' as const,
              media_type: imageData.mediaType,
              data: imageData.base64
            }
          } as ContentBlock
        }
        console.log(`[${requestId}] ⚠️ Failed to fetch image: ${photoInfo.url.substring(0, 50)}...`)
        return null
      })
      
      const fetchedImages = await Promise.all(imagePromises)
      imageBlocks = fetchedImages.filter((img): img is ContentBlock => img !== null)
      console.log(`[${requestId}] ✅ Successfully fetched ${imageBlocks.length} of ${recentPhotos.slice(0, 5).length} grow log image(s)`)
    }

    // Build message content - include text and images
    const messageContent: ContentBlock[] = []
    
    // Add text if provided
    if (message && message.trim()) {
      messageContent.push({ type: 'text' as const, text: message })
    }
    
    // Add images if available
    if (imageBlocks.length > 0) {
      messageContent.push(...imageBlocks)
    }
    
    // If no text and no images, add a default message
    if (messageContent.length === 0) {
      messageContent.push({ type: 'text' as const, text: 'Please analyze the attached images.' })
    }
    
    const currentUserMessage: { role: 'user'; content: string | ContentBlock[] } = {
      role: 'user',
      content: messageContent.length === 1 && messageContent[0].type === 'text'
        ? messageContent[0].text
        : messageContent
    }

    // Call Claude API
    const conversationHistory = messages.length > 0 
      ? [...messages, currentUserMessage]
      : [currentUserMessage]
    
    // Using claude-3-haiku-20240307 (verified working model with current API key)
    const modelName = 'claude-3-haiku-20240307'
    const hasImages = imageBlocks.length > 0
    console.log(`[${requestId}] 🚀 About to call Anthropic API`, { 
      model: modelName, 
      historyLength: conversationHistory.length, 
      systemPromptLength: systemPrompt.length,
      apiKeyPrefix: apiKey?.substring(0, 15),
      includesImages: hasImages,
      imageCount: imageBlocks.length,
      imageUrls: recentPhotos.slice(0, 5)
    })
    
    const response = await anthropic.messages.create({
      model: modelName, // Claude 3 Haiku (verified working model)
      max_tokens: 2048,
      system: systemPrompt,
      messages: conversationHistory as any // Type assertion needed for mixed content types
    })
    
    console.log(`[${requestId}] ✅ Anthropic response received`, { 
      contentType: response.content[0]?.type, 
      hasContent: !!response.content[0],
      inputTokens: response.usage?.input_tokens,
      outputTokens: response.usage?.output_tokens
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
    console.log(`[${requestId}] ❌ FULL ERROR:`, {
      name: error.name,
      message: error.message,
      status: error.status,
      type: error.type,
      stack: error.stack,
      error: error.error,
      response: error.response
    })
    console.error(`[${requestId}] Chat API error:`, error)
    
    // Handle Anthropic API errors
    if (error.status === 401 || error.type === 'authentication_error') {
      console.error(`[${requestId}] ❌ API Key Authentication Failed:`, {
        status: error.status,
        type: error.type,
        message: error.message,
        apiKeyPrefix: apiKey?.substring(0, 15),
        apiKeyLength: apiKey?.length
      })
      return NextResponse.json(
        { 
          error: 'Invalid API key. Please check ANTHROPIC_API_KEY environment variable in Vercel.',
          code: 'INVALID_API_KEY',
          debug: {
            hasKey: !!apiKey,
            keyPrefix: apiKey?.substring(0, 15) || 'MISSING',
            keyLength: apiKey?.length || 0,
            nodeEnv: process.env.NODE_ENV
          },
          instructions: {
            step1: 'Go to Vercel Dashboard → Settings → Environment Variables',
            step2: 'Find ANTHROPIC_API_KEY',
            step3: 'Update with your new key from .env.local',
            step4: 'Select ALL environments (Production, Preview, Development)',
            step5: 'Save and redeploy'
          }
        },
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

