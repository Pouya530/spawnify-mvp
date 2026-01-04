# AI Chat Image Support Enhancement

## Overview
The AI chat assistant now includes images from grow logs when providing tutorials, troubleshooting advice, and personalized recommendations.

## Changes Made

### 1. Enhanced Context Building (`lib/utils/chatContext.ts`)
- **Added photo URL inclusion**: Grow log context now includes all photo URLs from recent logs
- **Enhanced field coverage**: Added pH level, weight, light hours, TEK method, TEK notes, and general notes to context
- **Updated system prompt**: Added instructions for image analysis and visual troubleshooting

### 2. Image Integration (`app/api/chat/route.ts`)
- **Photo collection**: Automatically collects photo URLs from the 5 most recent grow logs
- **Smart image inclusion**: Images are included when:
  - User mentions photos/images/pictures
  - User asks for troubleshooting help
  - User asks "what", "why", "how" questions
  - User asks to diagnose, analyze, or check something
  - It's the first message in a conversation
- **Image format**: Photos are sent to Claude API as content blocks with URL sources
- **Limit**: Maximum 5 photos per message to avoid token limits

### 3. System Prompt Updates
The AI assistant now:
- Analyzes images to identify contamination, growth stages, environmental issues
- Provides visual troubleshooting based on photos
- References specific images when giving advice
- Mentions what it sees in photos when relevant

## How It Works

1. **User sends a message** to the AI chat
2. **System fetches** the user's recent grow logs (last 20)
3. **Photos are collected** from logs with images
4. **Context is built** including all grow log data and photo URLs
5. **Images are included** in the API call if the message matches trigger keywords
6. **Claude analyzes** the images along with the text context
7. **Response includes** visual analysis and image-specific advice

## Example Use Cases

### Troubleshooting
- User: "What's wrong with my grow?"
- System includes recent photos automatically
- AI analyzes images and provides visual diagnosis

### Tutorial Requests
- User: "How do I know when to harvest?"
- System includes photos showing growth stages
- AI provides step-by-step guidance with visual references

### Problem Diagnosis
- User: "Is this contamination?"
- System includes photos from recent logs
- AI analyzes images and identifies contamination types

## Technical Details

### Image Format
```typescript
{
  type: 'image',
  source: {
    type: 'url',
    url: 'https://supabase-storage-url/...'
  }
}
```

### Content Blocks
Messages can include mixed content:
- Text blocks: User's message
- Image blocks: Photo URLs from grow logs

### Model Support
- Currently using: `claude-3-haiku-20240307`
- All Claude 3 models support vision/image analysis
- Images are sent as URL references (public Supabase Storage URLs)

## Benefits

1. **Visual Troubleshooting**: AI can see actual grow conditions
2. **Better Diagnosis**: Identifies issues from photos
3. **Personalized Advice**: References user's specific setup
4. **Step-by-Step Guidance**: Uses images to explain techniques
5. **TEK Analysis**: Analyzes substrate and growing conditions visually

## Testing

To test image support:
1. Create a grow log with photos
2. Ask the AI: "Can you analyze my photos?" or "What do you see in my grow?"
3. The AI should reference the images and provide visual analysis

## Future Enhancements

- Allow users to explicitly request image analysis
- Add image upload directly in chat interface
- Support multiple image analysis in one response
- Add image comparison between different grow stages


