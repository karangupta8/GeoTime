export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get Mapbox configuration from environment variables
    const config = {
      publicToken: process.env.MAPBOX_PUBLIC_TOKEN || 'pk.eyJ1Ijoia2FyYW5ndXB0YTgiLCJhIjoiY21kam8zdm5oMGhoNTJyczU3aGtiZTcwMiJ9.BZfMMtGuqqoXp7PjG4QCmg',
      defaultStyle: 'mapbox://styles/mapbox/dark-v11',
      projection: 'globe',
      center: [20, 40],
      zoom: 2,
      pitch: 0
    };
    
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