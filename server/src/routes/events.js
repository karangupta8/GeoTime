import express from 'express';
import DataService from '../services/DataService.js';

const router = express.Router();
const dataService = new DataService();

// Get historical events by year or year range
router.get('/', async (req, res) => {
  try {
    const { year, startYear, endYear, category, limit = 50 } = req.query;
    
    let events = [];
    
    // Handle year range (startYear and endYear)
    if (startYear && endYear) {
      const startYearNum = parseInt(startYear);
      const endYearNum = parseInt(endYear);
      
      if (isNaN(startYearNum) || isNaN(endYearNum) || 
          startYearNum < -5000 || endYearNum > new Date().getFullYear() ||
          startYearNum > endYearNum) {
        return res.status(400).json({ error: 'Invalid year range parameters' });
      }
      
      // Get events for each year in the range
      const allEvents = [];
      for (let y = startYearNum; y <= endYearNum; y++) {
        const yearEvents = await dataService.getHistoricalEvents(y, { category, limit: parseInt(limit) });
        allEvents.push(...yearEvents);
      }
      
      // Sort by date and limit results
      events = allEvents
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, parseInt(limit));
        
    } else if (year) {
      // Handle single year
      const yearNum = parseInt(year);
      if (isNaN(yearNum) || yearNum < -5000 || yearNum > new Date().getFullYear()) {
        return res.status(400).json({ error: 'Invalid year parameter' });
      }
      
      events = await dataService.getHistoricalEvents(yearNum, { category, limit: parseInt(limit) });
    } else {
      return res.status(400).json({ error: 'Either year or startYear/endYear parameters are required' });
    }
    
    res.json({
      success: true,
      year: year ? parseInt(year) : null,
      startYear: startYear ? parseInt(startYear) : null,
      endYear: endYear ? parseInt(endYear) : null,
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
});

// Get event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await dataService.getEventById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({
      success: true,
      event
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ 
      error: 'Failed to fetch event',
      message: error.message 
    });
  }
});

// Get available categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await dataService.getCategories();
    
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      error: 'Failed to fetch categories',
      message: error.message 
    });
  }
});

export default router;