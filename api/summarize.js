export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { events, year } = req.body;
    
    if (!events || !Array.isArray(events)) {
      return res.status(400).json({ error: 'Events array is required' });
    }

    if (!year) {
      return res.status(400).json({ error: 'Year parameter is required' });
    }

    // Simple summarization without external APIs for now
    const eventCount = events.length;
    const categories = [...new Set(events.map(e => e.category).filter(Boolean))];
    const locations = [...new Set(events.map(e => e.location?.name).filter(Boolean))];
    
    const summary = `In ${year}, there were ${eventCount} significant historical events across ${categories.length} categories. ` +
      `The main categories included ${categories.slice(0, 3).join(', ')}. ` +
      `Events occurred in various locations including ${locations.slice(0, 3).join(', ')}${locations.length > 3 ? ' and others' : ''}.`;

    res.json({
      success: true,
      summary,
      metadata: {
        year,
        eventCount,
        categories,
        topLocations: locations.slice(0, 5)
      }
    });
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ 
      error: 'Failed to generate summary',
      message: error.message 
    });
  }
}