/**
 * Vercel Serverless Function: Mapbox Service Status
 * Provides status information about Mapbox service availability
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
    // Check environment variables
    const publicToken = process.env.MAPBOX_PUBLIC_TOKEN;
    const secretToken = process.env.MAPBOX_SECRET_TOKEN;

    const status = {
      mapbox: {
        publicToken: Boolean(publicToken),
        secretToken: Boolean(secretToken),
        geocodingAvailable: Boolean(secretToken),
        reverseGeocodingAvailable: Boolean(secretToken)
      },
      services: {
        config: Boolean(publicToken),
        geocoding: Boolean(secretToken),
        reverseGeocoding: Boolean(secretToken)
      },
      timestamp: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      status: status
    });

  } catch (error) {
    console.error('Error in mapbox status handler:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}