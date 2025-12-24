import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/types/database'

type GrowLog = Database['public']['Tables']['grow_logs']['Row']

/**
 * Fetch user's grow logs for AI context
 */
export async function getUserGrowLogs(userId: string): Promise<GrowLog[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('grow_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20) // Get recent 20 logs for context
  
  if (error) {
    console.error('Error fetching grow logs for chat context:', error)
    return []
  }
  
  return data || []
}

/**
 * Build context string from grow logs for AI prompt
 */
export function buildGrowLogsContext(logs: GrowLog[]): string {
  if (logs.length === 0) {
    return 'The user has not created any grow logs yet.'
  }
  
  const contextParts: string[] = []
  contextParts.push(`The user has ${logs.length} grow log(s). Here are the most recent ones:`)
  
  logs.slice(0, 5).forEach((log, index) => {
    contextParts.push(`\nLog ${index + 1}:`)
    contextParts.push(`- Strain: ${log.strain}`)
    contextParts.push(`- Growth Stage: ${log.growth_stage}`)
    contextParts.push(`- Date: ${log.log_date}`)
    contextParts.push(`- Substrate: ${log.substrate}`)
    if (log.substrate_ratio) {
      try {
        const substrates = JSON.parse(log.substrate_ratio)
        if (Array.isArray(substrates)) {
          const substrateList = substrates.map((s: any) => `${s.substrate} (${s.percentage}%)`).join(', ')
          contextParts.push(`- Substrate Mix: ${substrateList}`)
        }
      } catch (e) {
        contextParts.push(`- Substrate Ratio: ${log.substrate_ratio}`)
      }
    }
    contextParts.push(`- Growing Method: ${log.growing_method}`)
    contextParts.push(`- Inoculation Method: ${log.inoculation_method}`)
    if (log.inoculation_details) contextParts.push(`- Inoculation Details: ${log.inoculation_details}`)
    if (log.temperature) contextParts.push(`- Temperature: ${log.temperature}°F`)
    if (log.humidity) contextParts.push(`- Humidity: ${log.humidity}%`)
    if (log.ph_level) contextParts.push(`- pH Level: ${log.ph_level}`)
    if (log.weight) contextParts.push(`- Weight: ${log.weight}g`)
    if (log.light_hours_daily) contextParts.push(`- Light Hours: ${log.light_hours_daily}h/day`)
    if (log.tek_method) contextParts.push(`- TEK Method: ${log.tek_method}`)
    if (log.tek_notes) contextParts.push(`- TEK Notes: ${log.tek_notes}`)
    if (log.notes) contextParts.push(`- Notes: ${log.notes}`)
    if (log.photos && Array.isArray(log.photos) && log.photos.length > 0) {
      contextParts.push(`- Photos: ${log.photos.length} image(s) available`)
    }
    if (log.data_completeness_score) contextParts.push(`- Completeness: ${log.data_completeness_score}%`)
  })
  
  return contextParts.join('\n')
}

/**
 * Build system prompt for Claude AI
 */
export function buildSystemPrompt(growLogsContext: string): string {
  return `You are an expert AI assistant for Spawnify, a mushroom cultivation tracking platform. Your role is to help users with:

1. **Tutorials & Guidance**: Provide step-by-step instructions for mushroom cultivation techniques, TEK methods, and best practices.

2. **Troubleshooting**: Help diagnose and solve common growing problems based on the user's grow log data.

3. **Personalized Advice**: Use the user's grow log history to provide tailored recommendations.

**User's Grow Log Context:**
${growLogsContext}

**CRITICAL - Display and Use Grow Log Data:**
- When the user asks about their grow, their setup, or needs advice, ALWAYS start by displaying their grow log data
- Show the complete log information in a clear, formatted way (e.g., "Let's take a look at your grow log:" followed by the data)
- THEN provide personalized advice based on that specific data
- Use their exact strain, growth stage, substrate, and environmental conditions
- Reference their TEK method and notes when relevant
- Compare their current conditions to optimal conditions for their specific setup
- If they have multiple logs, show each one and identify patterns and trends
- When troubleshooting, use their actual data (temperature, humidity, pH, etc.) to diagnose issues

**Response Format:**
1. **Display the grow log data** (when relevant to the question)
2. **Acknowledge what you see** ("This looks like...", "I notice...")
3. **Provide personalized advice** based on their specific data
4. **Give actionable next steps** tailored to their setup

**Guidelines:**
- Be friendly, encouraging, and educational
- ALWAYS show the user their grow log data when providing advice about their grows
- Reference specific grow log data explicitly (e.g., "Your log shows [strain] at [stage] with [conditions]...")
- Provide actionable, step-by-step advice tailored to their setup
- Use UK legal mushroom varieties only (culinary/medicinal)
- If asked about illegal substances, politely redirect to legal alternatives
- Format responses clearly with bullet points or numbered steps when appropriate
- Ask clarifying questions if you need more information about their grow setup
- When referencing their logs, be specific: mention strain names, dates, and conditions

**Current Date:** ${new Date().toISOString().split('T')[0]}

Remember: You're helping real growers improve their cultivation skills and contribute to scientific research. Always show them their data first, then provide advice based on it.`
}

