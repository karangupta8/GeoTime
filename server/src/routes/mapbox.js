import express from 'express';
import MapService from '../services/mapService.js';

const router = express.Router();
const mapService = new MapService();

// Get Mapbox configuration for frontend
router.get('/config', async (req, res) => {
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
});

// Future: Add geocoding endpoint
router.get('/geocode', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    // For now, return not implemented
    res.status(501).json({ 
      error: 'Server-side geocoding not implemented yet',
      message: 'Use client-side geocoding with public token for now'
    });
  } catch (error) {
    console.error('Error geocoding:', error);
    res.status(500).json({ 
      error: 'Failed to geocode',
      message: error.message 
    });
  }
});

// Future: Add reverse geocoding endpoint
router.get('/reverse', async (req, res) => {
  try {
    const { lng, lat } = req.query;
    
    if (!lng || !lat) {
      return res.status(400).json({ error: 'lng and lat parameters are required' });
    }

    // For now, return not implemented
    res.status(501).json({ 
      error: 'Server-side reverse geocoding not implemented yet',
      message: 'Use client-side reverse geocoding with public token for now'
    });
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    res.status(500).json({ 
      error: 'Failed to reverse geocode',
      message: error.message 
    });
  }
});

export default router;