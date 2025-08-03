import fs from 'fs';
import path from 'path';

// Cache for demo events data
let demoEvents = null;

function loadDemoEvents() {
  if (demoEvents) return demoEvents;
  
  try {
    // In Vercel, files in /public are accessible
    const filePath = path.join(process.cwd(), 'public', 'demoEvents.json');
    const jsonData = fs.readFileSync(filePath, 'utf8');
    demoEvents = JSON.parse(jsonData);
    console.log(`✅ Successfully loaded ${demoEvents.length} demo events from JSON file`);
    return demoEvents;
  } catch (error) {
    console.error('❌ Error loading demo events:', error);
    return [];
  }
}

function getDemoEventsByYear(year) {
  const events = loadDemoEvents();
  const filteredEvents = events.filter(event => {
    const eventYear = new Date(event.date).getFullYear();
    return eventYear === year;
  });
  console.log(`Found ${filteredEvents.length} demo events for year ${year}`);
  return filteredEvents;
}

function getEventById(id) {
  const events = loadDemoEvents();
  return events.find(e => e.id === id) || null;
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { method, query, url } = req;
    
    if (method === 'GET') {
      // Parse URL to handle different routes
      const urlPath = new URL(url, `http://${req.headers.host}`).pathname;
      
      // Handle /api/events/:id
      const idMatch = urlPath.match(/^\/api\/events\/(.+)$/);
      if (idMatch) {
        const eventId = idMatch[1];
        const event = getEventById(eventId);
        
        if (!event) {
          return res.status(404).json({ error: 'Event not found' });
        }

        return res.json({
          success: true,
          event
        });
      }

      // Handle /api/events/categories (this should come before the main events handler)
      if (urlPath.endsWith('/categories')) {
        const categories = [
          'Politics', 'War', 'Science', 'Culture', 'Technology', 
          'Sports', 'Religion', 'Economics', 'Discovery', 'Disaster'
        ];
        
        return res.json({
          success: true,
          categories
        });
      }

      // Handle /api/events
      const { year, category, limit = 50 } = query;
      
      if (!year) {
        return res.status(400).json({ error: 'Year parameter is required' });
      }

      const yearNum = parseInt(year);
      if (isNaN(yearNum) || yearNum < -5000 || yearNum > new Date().getFullYear()) {
        return res.status(400).json({ error: 'Invalid year parameter' });
      }

      let events = getDemoEventsByYear(yearNum);
      
      // Filter by category if specified
      if (category) {
        events = events.filter(event => 
          event.category && event.category.toLowerCase().includes(category.toLowerCase())
        );
      }

      // Apply limit
      events = events.slice(0, parseInt(limit));
      
      res.json({
        success: true,
        year: yearNum,
        count: events.length,
        events
      });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in events API:', error);
    res.status(500).json({ 
      error: 'Failed to fetch events',
      message: error.message 
    });
  }
}