#!/bin/bash

# Script to add ANTHROPIC_API_KEY to Vercel via CLI

API_KEY="${ANTHROPIC_API_KEY:-your-api-key-here}"

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

