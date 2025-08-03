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

function getDemoEventsByYearRange(startYear, endYear) {
  const events = loadDemoEvents();
  const filteredEvents = events.filter(event => {
    const eventYear = new Date(event.date).getFullYear();
    return eventYear >= startYear && eventYear <= endYear;
  });
  console.log(`Found ${filteredEvents.length} demo events for year range ${startYear}-${endYear}`);
  return filteredEvents;
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
      const { year, startYear, endYear, category, limit = 50 } = query;
      
      // Support both single year and year range
      let events;
      let yearDisplay; // Add this variable to store the year display value
      
      if (startYear && endYear) {
        // Year range mode
        const startYearNum = parseInt(startYear);
        const endYearNum = parseInt(endYear);
        
        if (isNaN(startYearNum) || isNaN(endYearNum) || 
            startYearNum < -5000 || endYearNum > new Date().getFullYear() ||
            startYearNum > endYearNum) {
          return res.status(400).json({ error: 'Invalid year range parameters' });
        }
        
        events = getDemoEventsByYearRange(startYearNum, endYearNum);
        yearDisplay = `${startYearNum}-${endYearNum}`; // Set the display value
      } else if (year) {
        // Single year mode (backward compatibility)
        const yearNum = parseInt(year);
        if (isNaN(yearNum) || yearNum < -5000 || yearNum > new Date().getFullYear()) {
          return res.status(400).json({ error: 'Invalid year parameter' });
        }
        events = getDemoEventsByYear(yearNum);
        yearDisplay = yearNum.toString(); // Set the display value
      } else {
        return res.status(400).json({ error: 'Year or year range parameters are required' });
      }

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
        year: yearDisplay, // Use the properly set display value
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