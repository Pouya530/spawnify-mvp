#!/bin/bash
echo "=== LOCAL API KEY ==="
cat .env.local | grep ANTHROPIC_API_KEY

echo ""
echo "=== VERCEL ENV VARS ==="
vercel env ls | grep ANTHROPIC

echo ""
echo "=== PULLED VERCEL ENV ==="
vercel env pull .env.vercel.check
cat .env.vercel.check | grep ANTHROPIC
rm .env.vercel.check


