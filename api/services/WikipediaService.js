import axios from 'axios';

class WikipediaService {
  constructor() {
    this.baseUrl = 'https://en.wikipedia.org/api/rest_v1';
    this.cache = new Map();
    this.requestDelay = 100; // 100ms between requests
    this.lastRequestTime = 0;
  }

  async getEventsByYear(year) {
    const cacheKey = `wikipedia_${year}`;
    
    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
      return cached.data;
    }

    try {
      await this.respectRateLimit();
      
      // Search for events related to the year
      const searchQueries = [
        `${year} events`,
        `${year} history`,
        `${year} war`,
        `${year} politics`
      ];

      const allEvents = [];
      
      for (const query of searchQueries) {
        try {
          const events = await this.searchEvents(query, year);
          allEvents.push(...events);
        } catch (error) {
          console.warn(`Failed to fetch events for query "${query}":`, error.message);
        }
      }

      // Remove duplicates and limit results
      const uniqueEvents = this.deduplicateEvents(allEvents).slice(0, 20);
      
      // Cache the results
      this.cache.set(cacheKey, {
        data: uniqueEvents,
        timestamp: Date.now()
      });

      return uniqueEvents;
    } catch (error) {
      console.error('Error fetching Wikipedia events:', error);
      return [];
    }
  }

  async searchEvents(query, year) {
    try {
      // Search for pages
      const searchResponse = await axios.get(`${this.baseUrl}/page/search/${encodeURIComponent(query)}`, {
        params: { limit: 10 }
      });

      const events = [];
      
      for (const page of searchResponse.data.pages || []) {
        try {
          await this.respectRateLimit();
          
          // Get page details
          const pageResponse = await axios.get(`${this.baseUrl}/page/summary/${encodeURIComponent(page.title)}`);
          const pageData = pageResponse.data;
          
          // Try to get coordinates
          let coordinates = null;
          try {
            await this.respectRateLimit();
            const coordResponse = await axios.get(`${this.baseUrl}/page/coords/${encodeURIComponent(page.title)}`);
            if (coordResponse.data && coordResponse.data.length > 0) {
              const coord = coordResponse.data[0];
              coordinates = { lat: coord.lat, lon: coord.lon };
            }
          } catch (coordError) {
            // Many pages don't have coordinates, that's okay
          }

          // Skip if no coordinates (we need them for the map)
          if (!coordinates) continue;

          const event = this.convertToHistoricalEvent(pageData, coordinates, year);
          if (event) events.push(event);
          
        } catch (pageError) {
          console.warn(`Failed to fetch page details for "${page.title}":`, pageError.message);
        }
      }

      return events;
    } catch (error) {
      console.error('Error searching Wikipedia events:', error);
      return [];
    }
  }

  convertToHistoricalEvent(pageData, coordinates, year) {
    if (!pageData || !coordinates) return null;

    // Generate a unique ID based on title and coordinates
    const id = `wiki_${pageData.title.replace(/\s+/g, '_').toLowerCase()}_${coordinates.lat}_${coordinates.lon}`;

    return {
      id,
      title: pageData.title,
      date: `${year}-01-01`, // Default to beginning of year since exact dates are hard to extract
      location: {
        latitude: coordinates.lat,
        longitude: coordinates.lon,
        name: pageData.title
      },
      description: pageData.extract || pageData.description || 'No description available',
      category: this.determineCategory(pageData.title, pageData.extract || ''),
      images: pageData.thumbnail ? [pageData.thumbnail.source] : [],
      wikipediaUrl: pageData.content_urls?.desktop?.page,
      sources: ['Wikipedia'],
      verified: true
    };
  }

  determineCategory(title, extract) {
    const text = (title + ' ' + extract).toLowerCase();
    
    if (text.includes('war') || text.includes('battle') || text.includes('military')) return 'War';
    if (text.includes('politics') || text.includes('election') || text.includes('government')) return 'Politics';
    if (text.includes('science') || text.includes('discovery') || text.includes('research')) return 'Science';
    if (text.includes('culture') || text.includes('art') || text.includes('music')) return 'Culture';
    if (text.includes('technology') || text.includes('invention') || text.includes('computer')) return 'Technology';
    if (text.includes('sport') || text.includes('olympic') || text.includes('championship')) return 'Sports';
    if (text.includes('religion') || text.includes('church') || text.includes('faith')) return 'Religion';
    if (text.includes('economic') || text.includes('trade') || text.includes('market')) return 'Economics';
    if (text.includes('disaster') || text.includes('earthquake') || text.includes('flood')) return 'Disaster';
    
    return 'History';
  }

  deduplicateEvents(events) {
    const seen = new Set();
    return events.filter(event => {
      const key = `${event.title}_${event.location.latitude}_${event.location.longitude}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  async respectRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.requestDelay) {
      await new Promise(resolve => setTimeout(resolve, this.requestDelay - timeSinceLastRequest));
    }
    
    this.lastRequestTime = Date.now();
  }
}

export default WikipediaService;