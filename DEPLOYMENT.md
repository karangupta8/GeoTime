# Deployment Instructions

## Overview
This application has been configured to work with Vercel deployment. The backend API has been converted to serverless functions that will run on Vercel and can make external API calls.

## Current Setup

### Frontend
- React + Vite application
- Configured to use `/api` endpoints (which will be handled by serverless functions)
- Uses relative URLs for same-domain deployment

### Backend (Serverless Functions)
- API functions are located in the `/api` directory
- Each function handles a specific endpoint:
  - `/api/events` - Historical events data (combines Wikipedia API + demo data)
  - `/api/mapbox/config` - Mapbox configuration
  - `/api/summarize` - AI summary generation (OpenAI/Anthropic or fallback)

## Deployment Steps

### 1. Deploy to Vercel
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Deploy the project
vercel

# Follow the prompts to link to your Vercel project
```

### 2. Environment Variables
Set these environment variables in your Vercel project dashboard:

**For API Functions:**
- `LLM_PROVIDER=fallback` (or `openai`/`anthropic` if you have API keys)
- `MAPBOX_PUBLIC_TOKEN=your_mapbox_token`
- `NODE_ENV=production`

**Optional (for LLM functionality):**
- `OPENAI_API_KEY=your_openai_api_key` (if using OpenAI)
- `ANTHROPIC_API_KEY=your_anthropic_api_key` (if using Anthropic)

**For Frontend:**
- `VITE_API_BASE_URL=/api` (uses relative URLs for same-domain deployment)

### 3. Verify Deployment
After deployment, your API endpoints should be available at:
- `https://your-domain.vercel.app/api/events`
- `https://your-domain.vercel.app/api/mapbox/config`
- `https://your-domain.vercel.app/api/summarize`

## Features

### External API Integration
- **Wikipedia API**: Fetches real historical events from Wikipedia
- **OpenAI/Anthropic**: Generates AI summaries (optional)
- **Mapbox**: Provides map configuration and geocoding
- **Fallback Data**: Demo events when external APIs are unavailable

### Smart Fallbacks
- If Wikipedia API fails → Uses demo events
- If LLM API fails → Uses fallback summaries
- If Mapbox fails → Uses default configuration

## Troubleshooting

### If API calls still fail:
1. Check that the serverless functions are deployed correctly
2. Verify environment variables are set in Vercel
3. Check Vercel function logs for any errors
4. Ensure the `/api` directory is included in your deployment

### If external APIs fail:
1. The app will automatically fall back to demo data
2. Check Vercel function logs for specific API errors
3. Verify API keys are correctly set in environment variables

## Local Development
For local development, the app uses:
- Frontend: `http://localhost:8080`
- Backend: `http://localhost:3001`
- API proxy: Configured in `vite.config.ts`

## Notes
- The app works with or without external API keys
- Wikipedia API calls may have rate limits
- LLM functionality requires valid API keys
- All external API failures are gracefully handled with fallbacks