/**
 * Vercel Serverless Function: Mapbox Geocoding
 * Provides server-side geocoding functionality using Mapbox API
 */

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { query } = req.body;
    
    // Validate input
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter is required'
      });
    }

    // Check for secret token
    const secretToken = process.env.MAPBOX_SECRET_TOKEN;
    if (!secretToken) {
      return res.status(500).json({
        success: false,
        error: 'Server-side geocoding requires MAPBOX_SECRET_TOKEN environment variable'
      });
    }

    // Make request to Mapbox Geocoding API
    const geocodingUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query.trim())}.json?access_token=${secretToken}&limit=5`;
    
    const response = await fetch(geocodingUrl);
    
    if (!response.ok) {
      throw new Error(`Mapbox geocoding API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform the results to a simpler format
    const results = data.features?.map(feature => ({
      id: feature.id,
      place_name: feature.place_name,
      place_type: feature.place_type[0],
      coordinates: feature.geometry.coordinates,
      bbox: feature.bbox,
      context: feature.context
    })) || [];

    res.status(200).json({
      success: true,
      results: results,
      query: query.trim()
    });

  } catch (error) {
    console.error('Error in mapbox geocoding handler:', error);
    res.status(500).json({
      success: false,
      error: 'Geocoding failed',
      message: error.message
    });
  }
}