import DataService from './services/DataService.js';

const dataService = new DataService();

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { year, category, limit = 50 } = req.query;
    
    if (!year) {
      return res.status(400).json({ error: 'Year parameter is required' });
    }

    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < -5000 || yearNum > new Date().getFullYear()) {
      return res.status(400).json({ error: 'Invalid year parameter' });
    }

    const events = await dataService.getHistoricalEvents(yearNum, { category, limit: parseInt(limit) });
    
    res.json({
      success: true,
      year: yearNum,
      count: events.length,
      events
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ 
      error: 'Failed to fetch events',
      message: error.message 
    });
  }
}