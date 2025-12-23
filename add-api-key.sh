#!/bin/bash

# Script to add ANTHROPIC_API_KEY to Vercel via CLI

# API_KEY should be read from .env.local or provided as argument
# Usage: ./add-api-key.sh [API_KEY]
# If no argument provided, reads from .env.local
if [ -z "$1" ]; then
  if [ -f .env.local ]; then
    API_KEY=$(cat .env.local | grep ANTHROPIC_API_KEY | cut -d= -f2)
  else
    echo "❌ Error: No API key provided and .env.local not found"
    echo "Usage: ./add-api-key.sh [API_KEY]"
    exit 1
  fi
else
  API_KEY="$1"
fi

echo "🔧 Adding ANTHROPIC_API_KEY to Vercel..."
echo ""

# Check if logged in
if ! vercel whoami &>/dev/null; then
    echo "⚠️  Not logged in to Vercel CLI"
    echo "📝 Please run: vercel login"
    echo "   Then run this script again"
    exit 1
fi

echo "✅ Logged in to Vercel"
echo ""

# Add environment variable for all environments
echo "Adding ANTHROPIC_API_KEY to Production..."
echo "$API_KEY" | vercel env add ANTHROPIC_API_KEY production

echo ""
echo "Adding ANTHROPIC_API_KEY to Preview..."
echo "$API_KEY" | vercel env add ANTHROPIC_API_KEY preview

echo ""
echo "Adding ANTHROPIC_API_KEY to Development..."
echo "$API_KEY" | vercel env add ANTHROPIC_API_KEY development

echo ""
echo "✅ Environment variable added!"
echo ""
echo "🔄 Now redeploying..."
vercel --prod

echo ""
echo "✅ Done! Test at: https://spawnify-mvp-gyf2.vercel.app/api/chat/debug"

