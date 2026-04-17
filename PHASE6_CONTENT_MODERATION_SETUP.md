# Phase 6: Content Moderation with OpenAI

## Overview
All location descriptions and access guides are checked with OpenAI's Moderation API before being submitted. Flagged content is rejected with a warning.

## OpenAI Moderation API

The moderation check is automatic and happens before upload:

### Categories Checked
- **Sexual**: adult content or sexual abuse material
- **Hate Speech**: hate towards identity groups
- **Violence**: violent content or glorification of violence
- **Self-Harm**: encouraging self-harm
- **Harassment**: targeted harassment
- **Illegal Activity**: instructions for illegal acts

### How It Works
1. User submits location with description/access guide
2. Content is sent to OpenAI Moderation API
3. If flagged, upload is rejected with error message
4. If safe, location is uploaded normally

## API Key Setup
Already configured in `.env.local`:
```
VITE_OPENAI_API_KEY=sk-proj-...
```

The key is used directly from the frontend (client-side moderation). For production, consider:
- Using a backend API for moderation
- Caching moderation results
- Implementing fallback behavior if API is unavailable

## Changes Made
- `useContentModeration()` hook - calls OpenAI Moderation API
- `handleUpload()` now checks content before uploading
- User sees alert if content is flagged

## Testing Moderation

1. Try uploading a location with problematic content
2. Content should be rejected with flag details
3. Try again with normal content - should succeed

Example flagged descriptions:
- Sexual or adult content
- Hate speech or slurs
- Violent content
- Illegal activity instructions

## Costs
- OpenAI Moderation API: $0.001 per 1K requests (very cheap)
- No charge for safe content

## Error Handling
If OpenAI API is unavailable:
- Moderation returns `safe: true` (fails open)
- Content is uploaded without moderation
- Error is logged to console

Consider adding a fallback moderation rule or disabling uploads if API fails.

## Next Steps
- Phase 7: Comment threads with real-time updates
- Phase 8: Satellite map style toggle
