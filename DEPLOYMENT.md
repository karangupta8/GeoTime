# Deployment Instructions

## Overview
This application has been configured to work with Vercel deployment. The backend API has been converted to serverless functions that will run on Vercel.

## Current Setup

### Frontend
- React + Vite application
- Configured to use `/api` endpoints (which will be handled by serverless functions)

### Backend (Serverless Functions)
- API functions are located in the `/api` directory
- Each function handles a specific endpoint:
  - `/api/events` - Historical events data
  - `/api/mapbox/config` - Mapbox configuration
  - `/api/summarize` - AI summary generation

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
- `LLM_PROVIDER=fallback`
- `MAPBOX_PUBLIC_TOKEN=your_mapbox_token`
- `NODE_ENV=production`

**For Frontend:**
- `VITE_API_BASE_URL=/api` (or your deployed API URL)

### 3. Verify Deployment
After deployment, your API endpoints should be available at:
- `https://your-domain.vercel.app/api/events`
- `https://your-domain.vercel.app/api/mapbox/config`
- `https://your-domain.vercel.app/api/summarize`

## Troubleshooting

### If API calls still fail:
1. Check that the serverless functions are deployed correctly
2. Verify environment variables are set in Vercel
3. Check Vercel function logs for any errors
4. Ensure the `/api` directory is included in your deployment

### If you need to use a separate backend:
1. Deploy the backend server separately (Heroku, Railway, etc.)
2. Update `VITE_API_BASE_URL` to point to your backend URL
3. Update the frontend configuration accordingly

## Local Development
For local development, the app uses:
- Frontend: `http://localhost:8080`
- Backend: `http://localhost:3001`
- API proxy: Configured in `vite.config.ts`

## Notes
- The Wikipedia API calls may fail in production (this is expected)
- The app falls back to demo data when external APIs are unavailable
- LLM functionality uses fallback mode by default (no API keys required)