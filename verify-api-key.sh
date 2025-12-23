#!/bin/bash

echo "=== ANTHROPIC API KEY VERIFICATION ==="
echo ""

# Check local .env.local
echo "1. LOCAL .env.local FILE:"
if [ -f .env.local ]; then
  LOCAL_KEY=$(cat .env.local | grep ANTHROPIC_API_KEY | cut -d= -f2)
  if [ -z "$LOCAL_KEY" ]; then
    echo "   ❌ ANTHROPIC_API_KEY not found in .env.local"
  else
    LOCAL_LENGTH=${#LOCAL_KEY}
    LOCAL_PREFIX=${LOCAL_KEY:0:15}
    echo "   Key Prefix: $LOCAL_PREFIX"
    echo "   Key Length: $LOCAL_LENGTH"
    
    if [[ $LOCAL_PREFIX == "sk-ant-api03-" ]]; then
      echo "   ✅ Format: Valid (starts with sk-ant-api03-)"
    else
      echo "   ❌ Format: Invalid (should start with sk-ant-api03-)"
    fi
    
    if [ $LOCAL_LENGTH -ge 200 ] && [ $LOCAL_LENGTH -le 250 ]; then
      echo "   ✅ Length: Valid (~219 characters)"
    else
      echo "   ⚠️  Length: Unexpected (expected ~219, got $LOCAL_LENGTH)"
    fi
    
    # Test the key
    echo ""
    echo "   Testing API key..."
    RESPONSE=$(curl -s https://api.anthropic.com/v1/messages \
      -H "content-type: application/json" \
      -H "x-api-key: $LOCAL_KEY" \
      -H "anthropic-version: 2023-06-01" \
      -d '{"model": "claude-3-sonnet-20240229", "max_tokens": 10, "messages": [{"role": "user", "content": "hi"}]}' 2>&1)
    
    if echo "$RESPONSE" | jq -e '.content' > /dev/null 2>&1; then
      echo "   ✅ API Key: WORKS! Connection successful."
    elif echo "$RESPONSE" | jq -e '.error' > /dev/null 2>&1; then
      ERROR_MSG=$(echo "$RESPONSE" | jq -r '.error.message // .error.type // "Unknown error"')
      echo "   ❌ API Key: FAILED - $ERROR_MSG"
    else
      echo "   ⚠️  API Key: Could not verify (check response)"
    fi
  fi
else
  echo "   ❌ .env.local file not found"
fi

echo ""
echo "2. VERCEL PRODUCTION:"
VERCEL_RESPONSE=$(curl -s https://spawnify-mvp-gyf2.vercel.app/api/test-env)
VERCEL_HAS_KEY=$(echo "$VERCEL_RESPONSE" | jq -r '.hasAnthropicKey')
VERCEL_LENGTH=$(echo "$VERCEL_RESPONSE" | jq -r '.keyLength')
VERCEL_PREFIX=$(echo "$VERCEL_RESPONSE" | jq -r '.keyPrefix')

if [ "$VERCEL_HAS_KEY" = "true" ]; then
  echo "   ✅ API Key: EXISTS in Vercel"
  echo "   Key Prefix: $VERCEL_PREFIX"
  echo "   Key Length: $VERCEL_LENGTH"
  
  if [[ $VERCEL_PREFIX == "sk-ant-api03-" ]]; then
    echo "   ✅ Format: Valid"
  else
    echo "   ❌ Format: Invalid (should start with sk-ant-api03-)"
  fi
  
  if [ "$VERCEL_LENGTH" -ge 200 ] && [ "$VERCEL_LENGTH" -le 250 ]; then
    echo "   ✅ Length: Valid"
  else
    echo "   ⚠️  Length: Unexpected (expected ~219, got $VERCEL_LENGTH)"
  fi
else
  echo "   ❌ API Key: NOT SET in Vercel"
fi

echo ""
echo "=== SUMMARY ==="
echo ""
echo "Anthropic API keys should:"
echo "  - Start with: sk-ant-api03-"
echo "  - Be approximately: 219 characters long"
echo "  - Be obtained from: https://console.anthropic.com/"
echo ""
echo "To update Vercel API key:"
echo "  1. Go to: https://vercel.com/pynos-projects/spawnify-mvp-gyf2/settings/environment-variables"
echo "  2. Find ANTHROPIC_API_KEY"
echo "  3. Update the value"
echo "  4. Select ALL environments (Production, Preview, Development)"
echo "  5. Save and redeploy"
echo ""

