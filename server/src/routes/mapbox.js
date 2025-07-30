import express from 'express';
import axios from 'axios';

const router = express.Router();

// Mapbox proxy endpoint for map styles
router.get('/mapbox/styles/:styleId', async (req, res) => {
  try {
    const { styleId } = req.params;
    const accessToken = process.env.MAPBOX_ACCESS_TOKEN;

    if (!accessToken) {
      return res.status(500).json({ 
        error: 'Mapbox access token not configured' 
      });
    }

    const response = await axios.get(
      `https://api.mapbox.com/styles/v1/mapbox/${styleId}?access_token=${accessToken}`
    );

    res.json(response.data);
  } catch (error) {
    console.error('Mapbox styles proxy error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch map style',
      message: error.message 
    });
  }
});

// Mapbox configuration endpoint
router.get('/mapbox/config', (req, res) => {
  const accessToken = process.env.MAPBOX_ACCESS_TOKEN;
  
  if (!accessToken) {
    return res.status(500).json({ 
      configured: false,
      error: 'Mapbox access token not configured' 
    });
  }

  res.json({
    configured: true,
    // Don't send the actual token, just confirm it's configured
    hasToken: true
  });
});

// Mapbox tiles proxy
router.get('/mapbox/tiles/:z/:x/:y', async (req, res) => {
  try {
    const { z, x, y } = req.params;
    const { style = 'light-v11' } = req.query;
    const accessToken = process.env.MAPBOX_ACCESS_TOKEN;

    if (!accessToken) {
      return res.status(500).json({ 
        error: 'Mapbox access token not configured' 
      });
    }

    const tileUrl = `https://api.mapbox.com/styles/v1/mapbox/${style}/tiles/512/${z}/${x}/${y}@2x?access_token=${accessToken}`;
    
    const response = await axios.get(tileUrl, {
      responseType: 'stream'
    });

    res.set({
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=3600'
    });

    response.data.pipe(res);
  } catch (error) {
    console.error('Mapbox tiles proxy error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch map tiles',
      message: error.message 
    });
  }
});

export default router;