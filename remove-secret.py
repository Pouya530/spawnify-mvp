#!/usr/bin/env python3
import re
import sys

if len(sys.argv) < 2:
    sys.exit(1)

filepath = sys.argv[1]
try:
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Remove lines containing API keys
    lines = content.split('\n')
    filtered_lines = []
    for line in lines:
        if 'API_KEY="sk-ant-api03-' in line or 'API_KEY=sk-ant-api03-' in line:
            # Replace with safe placeholder
            filtered_lines.append('API_KEY="${ANTHROPIC_API_KEY:-your-api-key-here}"')
        else:
            filtered_lines.append(line)
    
    with open(filepath, 'w') as f:
        f.write('\n'.join(filtered_lines))
except Exception as e:
    sys.exit(1)


