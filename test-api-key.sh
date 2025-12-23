#!/bin/bash
API_KEY=$(cat .env.local | grep ANTHROPIC_API_KEY | cut -d= -f2)

echo "Testing API key directly with Anthropic..."
curl -s https://api.anthropic.com/v1/messages \
  -H "content-type: application/json" \
  -H "x-api-key: $API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "claude-3-haiku-20240307",
    "max_tokens": 100,
    "messages": [{"role": "user", "content": "Say hello"}]
  }' | jq '.'

