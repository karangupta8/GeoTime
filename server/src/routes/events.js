import express from 'express';
import DataService from '../services/DataService.js';

const router = express.Router();
const dataService = new DataService();

// Get historical events by year
router.get('/', async (req, res) => {
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