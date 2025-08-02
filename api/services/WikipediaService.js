// Simplified WikipediaService that doesn't use external APIs

class WikipediaService {
  constructor() {
    this.cache = new Map();
  }

  async getEventsByYear(year) {
    const cacheKey = `wikipedia_${year}`;
    
    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
      return cached.data;
    }

    // Return empty array - no external API calls
    const events = [];
    
    // Cache the results
    this.cache.set(cacheKey, {
      data: events,
      timestamp: Date.now()
    });

    return events;
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

export default WikipediaService;