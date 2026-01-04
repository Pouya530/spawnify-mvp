# Spawnify AI Agent Training Guide

## Overview

This guide explains how the Spawnify AI Chat system uses specialized agents to provide expert mushroom cultivation advice.

## Agent System Architecture

### 5 Specialized Agents

1. **Master Mycologist** (`.cursor/agents/master-mycologist.md`)
   - Species encyclopedia
   - Cultivation methods
   - Environmental optimization
   - Expert-level knowledge

2. **Troubleshooting Specialist** (`.cursor/agents/troubleshooting-specialist.md`)
   - Problem diagnosis
   - Contamination identification
   - Growth issue solutions
   - Environmental troubleshooting

3. **Personalized Advisor** (`.cursor/agents/personalized-advisor.md`)
   - Grow log analysis
   - Progress tracking
   - Personalized recommendations
   - Skill progression guidance

4. **Substrate Specialist** (`.cursor/agents/substrate-specialist.md`)
   - Substrate types and preparation
   - Field capacity optimization
   - Spawn ratios
   - Species-specific substrates

5. **Equipment Specialist** (`.cursor/agents/equipment-specialist.md`)
   - Equipment recommendations
   - Budget setups
   - DIY alternatives
   - Maintenance and care

## How Agents Work

### Agent Selection

The system automatically selects the appropriate agent based on:
- User's question type
- User's experience level (from grow logs)
- Context from previous messages
- Specific topic (species, equipment, troubleshooting, etc.)

### Agent Knowledge Base

Each agent has:
- **Core Knowledge**: Deep expertise in their domain
- **Response Style**: Tailored to their specialty
- **Integration**: References user's grow logs
- **Guidelines**: Species-specific, UK legal varieties only

### Response Generation

1. **Context Gathering**: System fetches user's grow logs
2. **Agent Selection**: Chooses appropriate agent(s)
3. **Knowledge Application**: Agent applies expertise
4. **Personalization**: References user's specific data
5. **Response Delivery**: Provides actionable advice

## Agent Capabilities

### Master Mycologist
- Species identification and characteristics
- Cultivation method recommendations
- Environmental parameter optimization
- Advanced techniques and research

### Troubleshooting Specialist
- Visual problem identification
- Root cause analysis
- Step-by-step solutions
- Prevention strategies

### Personalized Advisor
- Experience level assessment
- Progress tracking
- Species progression recommendations
- Method advancement guidance

### Substrate Specialist
- Substrate type selection
- Preparation methods
- Field capacity optimization
- Species-specific recommendations

### Equipment Specialist
- Equipment recommendations by budget
- DIY alternatives
- Setup optimization
- Maintenance guidance

## Integration with Spawnify

### Grow Log Analysis
- Agents reference user's grow log history
- Compare conditions to optimal ranges
- Track patterns and improvements
- Suggest next steps based on data

### Personalized Guidance
- Adapt to user's experience level
- Reference specific grows and outcomes
- Celebrate milestones and progress
- Provide context-aware recommendations

### UK Legal Focus
- Only recommend legal culinary/medicinal varieties
- Redirect illegal substance questions
- Focus on educational cultivation

## Usage Examples

### Example 1: Beginner Question
**User**: "How do I start growing mushrooms?"

**Agent**: Personalized Advisor + Master Mycologist
**Response**: 
- Assesses beginner status
- Recommends starter species (Oyster mushrooms)
- Provides step-by-step PF Tek or bucket tek guide
- References user's grow log history (if any)

### Example 2: Troubleshooting
**User**: "My mushrooms have green mold, what do I do?"

**Agent**: Troubleshooting Specialist
**Response**:
- Identifies contamination type (Trichoderma)
- Provides immediate actions (isolate, dispose)
- Explains root causes
- Suggests prevention strategies
- References user's grow log for context

### Example 3: Equipment Question
**User**: "What equipment do I need for a monotub?"

**Agent**: Equipment Specialist
**Response**:
- Lists essential equipment
- Provides budget options
- Suggests DIY alternatives
- References user's current setup (from logs)

### Example 4: Substrate Question
**User**: "What substrate is best for Lion's Mane?"

**Agent**: Substrate Specialist + Master Mycologist
**Response**:
- Recommends hardwood sawdust
- Explains supplementation needs
- Provides preparation steps
- References user's previous substrate choices

## Best Practices

### For Users
- Provide specific details about your grow
- Include photos when possible
- Describe symptoms accurately
- Share your experience level
- Update grow logs regularly

### For Agents
- Always reference user's grow logs when relevant
- Provide actionable, step-by-step advice
- Explain the "why" behind recommendations
- Celebrate successes and normalize failures
- Focus on UK legal varieties only

## Agent Training Data

### Knowledge Sources
- Academic mycology research
- Practical cultivation experience
- Community best practices
- Scientific literature
- Real-world troubleshooting

### Continuous Improvement
- Agents learn from user interactions
- Feedback improves responses
- New species knowledge added
- Techniques updated based on results

## Technical Details

### Agent Files Location
- `.cursor/agents/master-mycologist.md`
- `.cursor/agents/troubleshooting-specialist.md`
- `.cursor/agents/personalized-advisor.md`
- `.cursor/agents/substrate-specialist.md`
- `.cursor/agents/equipment-specialist.md`

### System Integration
- Agents are loaded into Claude AI system prompts
- Context from grow logs is included
- Responses are personalized based on user data
- All interactions are logged for improvement

## Support

For questions about the agent system:
1. Check this guide
2. Review agent files in `.cursor/agents/`
3. Test with `npm run test-chat`
4. Check deployment status with `npm run verify-setup`


