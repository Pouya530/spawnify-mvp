#!/bin/bash

echo "🚀 Deploying Spawnify AI Chat System..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found. Run this from the project root."
  exit 1
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
  echo "⚠️  Warning: .env.local not found. Make sure environment variables are set in Vercel."
fi

# Verify setup first
echo "📋 Step 1: Verifying setup..."
npm run verify-setup

if [ $? -ne 0 ]; then
  echo ""
  echo "❌ Setup verification failed. Please fix issues before deploying."
  exit 1
fi

echo ""
echo "📦 Step 2: Building project..."
npm run build

if [ $? -ne 0 ]; then
  echo ""
  echo "❌ Build failed. Please fix errors before deploying."
  exit 1
fi

echo ""
echo "🔍 Step 3: Checking git status..."
if [ -d ".git" ]; then
  git status --short
  echo ""
  read -p "Commit changes? (y/n) " -n 1 -r
  echo ""
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    git add .
    git commit -m "Deploy: AI Chat system updates"
    echo ""
    echo "📤 Step 4: Pushing to GitHub..."
    git push origin main
  fi
else
  echo "⚠️  Not a git repository. Skipping git operations."
fi

echo ""
echo "🌐 Step 5: Deploying to Vercel..."
vercel --prod --yes

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Deployment complete!"
  echo ""
  echo "📝 Next steps:"
  echo "1. Wait 2-3 minutes for deployment to complete"
  echo "2. Test the chat: npm run test-chat"
  echo "3. Visit: https://spawnify-mvp-gyf2.vercel.app/dashboard/chat"
  echo ""
  echo "🔗 Deployment URL: https://spawnify-mvp-gyf2.vercel.app"
else
  echo ""
  echo "❌ Deployment failed. Check errors above."
  exit 1
fi


