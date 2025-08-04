# Vercel Deployment Guide

This guide explains how to deploy your GeoTime application to Vercel with serverless backend functionality.

## Project Structure

The project has been configured for Vercel deployment with the following structure:

```
/
├── api/                          # Vercel serverless functions
│   ├── events.js                 # Historical events API
│   ├── health.js                 # Health check endpoint
│   ├── summarize.js              # Event summarization API
│   └── mapbox/
│       └── config.js             # Mapbox configuration API
├── public/
│   └── demoEvents.json           # Historical events data (accessible to serverless functions)
├── src/                          # Frontend React application
├── vercel.json                   # Vercel configuration
└── env.example                   # Environment variables template
```

## Deployment Steps

### 1. Environment Variables

Set up the following environment variables in your Vercel project:

- **Required:**
  - `MAPBOX_PUBLIC_TOKEN` - Your Mapbox public access token
  
- **Optional:**
  - `NODE_ENV` - Set to "production" for production deployment

### 2. Vercel Configuration

The `vercel.json` file is already configured with:
- Serverless function routing for all API endpoints
- CORS headers for cross-origin requests
- Proper URL rewrites for SPA functionality

### 3. Deploy to Vercel

#### Option A: Using Vercel CLI
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Deploy from your project directory
vercel

# Follow the prompts to link your project
```

#### Option B: Using Git Integration
1. Push your code to GitHub/GitLab/Bitbucket
2. Connect your repository to Vercel at https://vercel.com
3. Configure environment variables in the Vercel dashboard
4. Deploy automatically on each push

### 4. Verify Deployment

After deployment, test the following endpoints:

- `https://your-app.vercel.app/health` - Health check
- `https://your-app.vercel.app/api/events?year=1969&limit=10` - Events API
- `https://your-app.vercel.app/api/mapbox/config` - Mapbox config
- `https://your-app.vercel.app/` - Frontend application

## API Endpoints

### GET /api/events
- **Query Parameters:**
  - `year` (required) - Year to fetch events for
  - `category` (optional) - Filter by event category
  - `limit` (optional) - Number of events to return (default: 50)
- **Example:** `/api/events?year=1969&limit=10`

### GET /api/events/:id
- **Parameters:**
  - `id` - Event ID
- **Example:** `/api/events/12345`

### GET /api/events/categories
- **Returns:** List of available event categories

### GET /api/mapbox/config
- **Returns:** Mapbox configuration for frontend

### POST /api/summarize
- **Body:** `{ "events": [...], "year": 1969 }`
- **Returns:** Generated summary of events

### GET /health
- **Returns:** API health status

## Data Source

The application uses `demoEvents.json` located in the `/public` directory. This file contains historical events data and is accessible to the serverless functions at runtime.

To update the data:
1. Replace `/public/demoEvents.json` with your new data file
2. Ensure the JSON structure matches the expected format
3. Redeploy the application

## Troubleshooting

### Common Issues

1. **404 errors on API endpoints**
   - Check that `vercel.json` is properly configured
   - Verify serverless functions are in the `/api` directory
   - Ensure functions export a default handler function

2. **CORS errors**
   - CORS headers are configured in each API function
   - Check browser console for specific CORS errors

3. **Data loading issues**
   - Verify `demoEvents.json` is in the `/public` directory
   - Check Vercel function logs for file loading errors

4. **Environment variable issues**
   - Configure variables in Vercel dashboard
   - Use the exact variable names from `env.example`

### Debugging

- Check Vercel function logs in the Vercel dashboard
- Use the browser's Network tab to inspect API requests
- Test API endpoints directly using curl or Postman

## Performance Considerations

- Serverless functions have cold start times
- Large data files should be optimized for size
- Consider caching strategies for frequently accessed data
- Use appropriate HTTP status codes and response formats

## Security

- API endpoints include CORS configuration
- No sensitive data is exposed in frontend code
- Environment variables are securely managed by Vercel
- Consider rate limiting for production use