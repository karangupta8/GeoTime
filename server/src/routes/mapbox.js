import express from 'express';
import MapService from '../services/mapService.js';

const router = express.Router();
const mapService = new MapService();

// Get Mapbox configuration (public data only)
router.get('/config', async (req, res) => {
  try {
    const config = mapService.getPublicConfig();
    
    res.json({
      success: true,
      config: config
    });
  } catch (error) {
    console.error('[MapboxRoute] Config error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get Mapbox configuration',
      message: error.message
    });
  }
});

// Server-side geocoding endpoint
router.post('/geocode', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter is required'
      });
    }

    const results = await mapService.geocode(query.trim());
    
    res.json(results);
  } catch (error) {
    console.error('[MapboxRoute] Geocoding error:', error);
    res.status(500).json({
      success: false,
      error: 'Geocoding failed',
      message: error.message
    });
  }
});

// Server-side reverse geocoding endpoint
router.post('/reverse-geocode', async (req, res) => {
  try {
    const { longitude, latitude } = req.body;
    
    if (!mapService.validateCoordinates(longitude, latitude)) {
      return res.status(400).json({
        success: false,
        error: 'Valid longitude and latitude are required'
      });
    }

    const results = await mapService.reverseGeocode(longitude, latitude);
    
    res.json(results);
  } catch (error) {
    console.error('[MapboxRoute] Reverse geocoding error:', error);
    res.status(500).json({
      success: false,
      error: 'Reverse geocoding failed',
      message: error.message
    });
  }
});

// Get service status
router.get('/status', async (req, res) => {
  try {
    const status = mapService.getServiceStatus();
    
    res.json({
      success: true,
      status: status
    });
  } catch (error) {
    console.error('[MapboxRoute] Status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get service status',
      message: error.message
    });
  }
});

export default router;