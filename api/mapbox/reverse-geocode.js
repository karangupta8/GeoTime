/**
 * Vercel Serverless Function: Mapbox Reverse Geocoding
 * Provides server-side reverse geocoding functionality using Mapbox API
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
    const { longitude, latitude } = req.body;
    
    // Validate coordinates
    if (!validateCoordinates(longitude, latitude)) {
      return res.status(400).json({
        success: false,
        error: 'Valid longitude and latitude are required'
      });
    }

    // Check for secret token
    const secretToken = process.env.MAPBOX_SECRET_TOKEN;
    if (!secretToken) {
      return res.status(500).json({
        success: false,
        error: 'Server-side reverse geocoding requires MAPBOX_SECRET_TOKEN environment variable'
      });
    }

    // Make request to Mapbox Reverse Geocoding API
    const reverseGeocodingUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${secretToken}&limit=1`;
    
    const response = await fetch(reverseGeocodingUrl);
    
    if (!response.ok) {
      throw new Error(`Mapbox reverse geocoding API error: ${response.status}`);
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
      coordinates: { longitude, latitude }
    });

  } catch (error) {
    console.error('Error in mapbox reverse geocoding handler:', error);
    res.status(500).json({
      success: false,
      error: 'Reverse geocoding failed',
      message: error.message
    });
  }
}

// Helper function to validate coordinates
function validateCoordinates(longitude, latitude) {
  const lng = parseFloat(longitude);
  const lat = parseFloat(latitude);
  
  return !isNaN(lng) && !isNaN(lat) && 
         lng >= -180 && lng <= 180 && 
         lat >= -90 && lat <= 90;
}