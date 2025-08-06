/**
 * Vercel Serverless Function: Mapbox Configuration
 * Provides public Mapbox configuration for the frontend
 */

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Get Mapbox public token from environment variables
    const publicToken = process.env.MAPBOX_PUBLIC_TOKEN;

    if (!publicToken) {
      console.error('MAPBOX_PUBLIC_TOKEN environment variable not set');
      return res.status(500).json({
        success: false,
        error: 'Mapbox configuration not available',
        message: 'Server configuration error'
      });
    }

    // Validate token format (should start with 'pk.')
    if (!publicToken.startsWith('pk.')) {
      console.error('Invalid MAPBOX_PUBLIC_TOKEN format');
      return res.status(500).json({
        success: false,
        error: 'Invalid Mapbox configuration',
        message: 'Token format error'
      });
    }

    // Return the configuration
    const config = {
      styles: {
        light: 'mapbox://styles/mapbox/light-v11',
        dark: 'mapbox://styles/mapbox/dark-v11',
        satellite: 'mapbox://styles/mapbox/satellite-v9',
        streets: 'mapbox://styles/mapbox/streets-v12',
        outdoors: 'mapbox://styles/mapbox/outdoors-v12'
      },
      defaultStyle: 'mapbox://styles/mapbox/dark-v11',
      projection: 'globe',
      zoom: 1.5,
      center: [0, 20],
      pitch: 0,
      maxZoom: 18,
      minZoom: 0,
      hasPublicToken: true,
      publicToken: publicToken
    };

    res.status(200).json({
      success: true,
      config: config
    });

  } catch (error) {
    console.error('Error in mapbox config handler:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}