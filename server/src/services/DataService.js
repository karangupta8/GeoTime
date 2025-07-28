import WikipediaService from './WikipediaService.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const demoEventsPath = join(__dirname, '../data/demoEvents.json');

let demoEvents = [];
try {
  const jsonData = readFileSync(demoEventsPath, 'utf8');
  demoEvents = JSON.parse(jsonData);
  console.log(`Loaded ${demoEvents.length} demo events from JSON file`);
} catch (error) {
  console.error('Error loading demo events:', error);
  demoEvents = [];
}

class DataService {
  constructor() {
    this.wikipediaService = new WikipediaService();
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes for testing
  }

  async getHistoricalEvents(year, options = {}) {
    const { category, limit = 50 } = options;
    const cacheKey = `events_${year}_${category || 'all'}_${limit}`;
    
    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    try {
      // Get events from multiple sources
      const [wikipediaEvents, localDemoEvents] = await Promise.all([
        this.wikipediaService.getEventsByYear(year),
        this.getDemoEventsByYear(year)
      ]);

      // Combine and deduplicate events
      const allEvents = [...wikipediaEvents, ...localDemoEvents];
      const deduplicatedEvents = this.deduplicateEvents(allEvents);
      
      // Filter by category if specified
      let filteredEvents = category 
        ? deduplicatedEvents.filter(event => 
            event.category.toLowerCase().includes(category.toLowerCase())
          )
        : deduplicatedEvents;

      // Sort by date and limit results
      filteredEvents = filteredEvents
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, limit);

      // Cache the results
      this.cache.set(cacheKey, {
        data: filteredEvents,
        timestamp: Date.now()
      });

      return filteredEvents;
    } catch (error) {
      console.error('Error fetching historical events:', error);
      // Fallback to demo events only
      return this.getDemoEventsByYear(year).slice(0, limit);
    }
  }

  async getEventById(id) {
    // Search in cache first
    for (const [key, value] of this.cache.entries()) {
      const event = value.data.find(e => e.id === id);
      if (event) return event;
    }

    // Search in demo events
    const demoEvent = demoEvents.find(e => e.id === id);
    if (demoEvent) return demoEvent;

    return null;
  }

  async getCategories() {
    const categories = [
      'Politics', 'War', 'Science', 'Culture', 'Technology', 
      'Sports', 'Religion', 'Economics', 'Discovery', 'Disaster'
    ];
    
    return categories;
  }

  getDemoEventsByYear(year) {
    const filteredEvents = demoEvents.filter(event => {
      const eventYear = new Date(event.date).getFullYear();
      return eventYear === year;
    });
    console.log(`Found ${filteredEvents.length} demo events for year ${year}`);
    return filteredEvents;
  }

  deduplicateEvents(events) {
    const seen = new Set();
    return events.filter(event => {
      const key = `${event.title.toLowerCase()}_${event.date}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}

export default DataService;