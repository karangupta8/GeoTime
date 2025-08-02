import MapService from '../services/mapService.js';

const mapService = new MapService();

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const config = mapService.getMapboxConfig();
    
    res.json({
      success: true,
      config
    });
  } catch (error) {
    console.error('Error getting Mapbox config:', error);
    res.status(500).json({ 
      error: 'Failed to get Mapbox configuration',
      message: error.message 
    });
  }
}