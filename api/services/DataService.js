import WikipediaService from './WikipediaService.js';

// Demo events data - embedded directly to avoid file reading issues
const demoEvents = [
  {
    id: 'moon_landing_1969',
    title: 'Apollo 11 Moon Landing',
    date: '1969-07-20',
    location: { latitude: 28.6139, longitude: -80.6081, name: 'Kennedy Space Center, Florida' },
    description: 'The first manned moon landing mission, with Neil Armstrong and Buzz Aldrin becoming the first humans to walk on the lunar surface.',
    category: 'Science',
    images: [],
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Apollo_11',
    sources: ['NASA', 'Demo Data'],
    verified: true
  },
  {
    id: 'woodstock_1969',
    title: 'Woodstock Music Festival',
    date: '1969-08-15',
    endDate: '1969-08-18',
    location: { latitude: 41.7014, longitude: -74.3535, name: 'Bethel, New York' },
    description: 'A pivotal moment in music history, featuring performances by Jimi Hendrix, Janis Joplin, and many other legendary artists.',
    category: 'Culture',
    images: [],
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Woodstock',
    sources: ['Historical Records', 'Demo Data'],
    verified: true
  },
  {
    id: 'internet_arpanet_1969',
    title: 'First ARPANET Connection',
    date: '1969-10-29',
    location: { latitude: 34.0522, longitude: -118.2437, name: 'UCLA, Los Angeles' },
    description: 'The first host-to-host message sent over ARPANET, the precursor to the modern internet.',
    category: 'Technology',
    images: [],
    wikipediaUrl: 'https://en.wikipedia.org/wiki/ARPANET',
    sources: ['UCLA', 'Demo Data'],
    verified: true
  },
  {
    id: 'berlin_wall_1989',
    title: 'Fall of the Berlin Wall',
    date: '1989-11-09',
    location: { latitude: 52.5163, longitude: 13.3777, name: 'Berlin, Germany' },
    description: 'The Berlin Wall, a symbol of the Cold War division, was torn down by East and West Berliners, marking the beginning of German reunification.',
    category: 'Political',
    sources: ['Demo Data'],
    verified: false,
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Fall_of_the_Berlin_Wall'
  },
  {
    id: 'great_fire_london_1666',
    title: 'Great Fire of London',
    date: '1666-09-02',
    location: { latitude: 51.5122, longitude: -0.0955, name: 'London, England' },
    description: 'A major conflagration that swept through the medieval City of London, destroying 13,200 houses and 87 churches.',
    category: 'Disaster',
    sources: ['Demo Data'],
    verified: false,
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Great_Fire_of_London'
  }
];

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