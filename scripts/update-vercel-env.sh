#!/bin/bash

echo "════════════════════════════════════════════════════════════"
echo "UPDATE VERCEL ENVIRONMENT VARIABLES"
echo "════════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Get API key from .env.local
ANTHROPIC_KEY=$(grep ANTHROPIC_API_KEY .env.local | cut -d= -f2)

if [ -z "$ANTHROPIC_KEY" ]; then
    echo "❌ ANTHROPIC_API_KEY not found in .env.local"
    exit 1
fi

echo "✓ Found API key in .env.local"
echo ""
echo "Updating Vercel environment variables..."
echo ""

# Remove old keys (if they exist)
echo "Removing old keys (if any)..."
vercel env rm ANTHROPIC_API_KEY production -y 2>/dev/null || true
vercel env rm ANTHROPIC_API_KEY preview -y 2>/dev/null || true
vercel env rm ANTHROPIC_API_KEY development -y 2>/dev/null || true

echo ""
echo "Adding new keys..."

# Add to Production
echo "$ANTHROPIC_KEY" | vercel env add ANTHROPIC_API_KEY production
echo -e "${GREEN}✓${NC} Added to Production"

# Add to Preview
echo "$ANTHROPIC_KEY" | vercel env add ANTHROPIC_API_KEY preview
echo -e "${GREEN}✓${NC} Added to Preview"

# Add to Development
echo "$ANTHROPIC_KEY" | vercel env add ANTHROPIC_API_KEY development
echo -e "${GREEN}✓${NC} Added to Development"

echo ""
echo "════════════════════════════════════════════════════════════"
echo "VERIFICATION"
echo "════════════════════════════════════════════════════════════"
echo ""
vercel env ls | grep ANTHROPIC

echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Redeploy: vercel --prod"
echo "2. Wait 2-3 minutes"
echo "3. Test: https://spawnify-mvp-gyf2.vercel.app/api/test-env"

