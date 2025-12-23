import { ChatConversation, ChatMessage } from './database'

export interface ChatMessageWithId extends ChatMessage {
  id: string
}

export interface ChatConversationWithMessages extends ChatConversation {
  messages?: ChatMessage[]
}

export interface ChatContext {
  growLogs?: any[]
  currentStage?: string
  strain?: string
  recentIssues?: string[]
}

