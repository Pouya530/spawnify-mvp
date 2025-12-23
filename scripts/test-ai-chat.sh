#!/bin/bash

echo "🧪 Testing Spawnify AI Chat System..."
echo ""

BASE_URL="${1:-https://spawnify-mvp-gyf2.vercel.app}"

# Test 1: Environment Variables
echo "Test 1: Checking environment variables endpoint..."
ENV_RESPONSE=$(curl -s "${BASE_URL}/api/test-env")
HAS_KEY=$(echo "$ENV_RESPONSE" | jq -r '.hasAnthropicKey // false')
KEY_LENGTH=$(echo "$ENV_RESPONSE" | jq -r '.keyLength // 0')

if [ "$HAS_KEY" = "true" ]; then
  echo "   ✅ API Key exists"
  if [ "$KEY_LENGTH" -ge 200 ] && [ "$KEY_LENGTH" -le 250 ]; then
    echo "   ✅ Key length is correct ($KEY_LENGTH characters)"
  else
    echo "   ⚠️  Key length is unexpected ($KEY_LENGTH characters, expected ~219)"
  fi
else
  echo "   ❌ API Key is missing"
fi

# Test 2: Database Tables
echo ""
echo "Test 2: Checking database tables..."
DB_RESPONSE=$(curl -s "${BASE_URL}/api/chat/setup-check")
CONV_EXISTS=$(echo "$DB_RESPONSE" | jq -r '.tables.chat_conversations.exists // false')
MSG_EXISTS=$(echo "$DB_RESPONSE" | jq -r '.tables.chat_messages.exists // false')

if [ "$CONV_EXISTS" = "true" ] && [ "$MSG_EXISTS" = "true" ]; then
  echo "   ✅ Chat tables exist"
else
  echo "   ❌ Chat tables are missing"
  echo "   → Run scripts/create-chat-tables.sql in Supabase SQL Editor"
fi

# Test 3: Chat Page Accessibility
echo ""
echo "Test 3: Checking chat page..."
CHAT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/dashboard/chat")

if [ "$CHAT_STATUS" = "200" ] || [ "$CHAT_STATUS" = "302" ]; then
  echo "   ✅ Chat page is accessible (HTTP $CHAT_STATUS)"
else
  echo "   ⚠️  Chat page returned HTTP $CHAT_STATUS"
fi

# Test 4: API Endpoint
echo ""
echo "Test 4: Checking chat API endpoint..."
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE_URL}/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message":"test"}')

if [ "$API_STATUS" = "401" ]; then
  echo "   ✅ API endpoint exists (401 = requires authentication, expected)"
elif [ "$API_STATUS" = "500" ]; then
  echo "   ⚠️  API endpoint exists but returned error (500)"
else
  echo "   ℹ️  API endpoint returned HTTP $API_STATUS"
fi

# Summary
echo ""
echo "============================================================"
echo "📊 TEST SUMMARY"
echo "============================================================"

if [ "$HAS_KEY" = "true" ] && [ "$CONV_EXISTS" = "true" ] && [ "$MSG_EXISTS" = "true" ]; then
  echo ""
  echo "✅ All critical checks passed!"
  echo ""
  echo "🎉 Your AI chat system is ready!"
  echo ""
  echo "Next steps:"
  echo "1. Visit: ${BASE_URL}/dashboard/chat"
  echo "2. Log in to your account"
  echo "3. Send a test message"
  echo ""
else
  echo ""
  echo "❌ Some checks failed. Please fix the issues above."
  echo ""
  echo "Common fixes:"
  echo "- Missing API key: Add ANTHROPIC_API_KEY to Vercel environment variables"
  echo "- Missing tables: Run scripts/create-chat-tables.sql in Supabase"
  echo ""
fi

echo "============================================================"

