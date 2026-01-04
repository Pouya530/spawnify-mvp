#!/bin/bash

echo "🔧 Updating ANTHROPIC_API_KEY in Vercel..."
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "❌ Error: .env.local not found"
  exit 1
fi

# Get API key from .env.local
API_KEY=$(cat .env.local | grep ANTHROPIC_API_KEY | cut -d= -f2)

if [ -z "$API_KEY" ]; then
  echo "❌ Error: ANTHROPIC_API_KEY not found in .env.local"
  exit 1
fi

echo "✅ Found API key in .env.local"
echo "   Prefix: ${API_KEY:0:20}..."
echo "   Length: ${#API_KEY} characters"
echo ""

# Check if logged in to Vercel
if ! vercel whoami &>/dev/null; then
  echo "⚠️  Not logged in to Vercel CLI"
  echo "📝 Please run: vercel login"
  echo "   Then run this script again"
  exit 1
fi

echo "✅ Logged in to Vercel"
echo ""

# Add to Production
echo "📤 Adding to Production environment..."
echo "$API_KEY" | vercel env add ANTHROPIC_API_KEY production --force

# Add to Preview
echo ""
echo "📤 Adding to Preview environment..."
echo "$API_KEY" | vercel env add ANTHROPIC_API_KEY preview --force

# Add to Development
echo ""
echo "📤 Adding to Development environment..."
echo "$API_KEY" | vercel env add ANTHROPIC_API_KEY development --force

echo ""
echo "✅ API key updated in all environments!"
echo ""
echo "🔄 Redeploying to production..."
vercel --prod --yes

echo ""
echo "✅ Done! Wait 2-3 minutes, then test:"
echo "   https://spawnify-mvp-gyf2.vercel.app/dashboard/chat"


