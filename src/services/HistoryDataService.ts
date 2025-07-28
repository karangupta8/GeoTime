import { HistoricalEvent, DataSourceConfig } from '@/types/HistoricalEvent';

export class HistoryDataService {
  private static instance: HistoryDataService;
  private baseUrl = '/api';
  private cache = new Map<string, { data: HistoricalEvent[], timestamp: number }>();
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes for frontend cache
  
  private dataSources: DataSourceConfig[] = [
    { name: 'API', enabled: true, priority: 1 }
  ];

  // Demo data fallback
  private demoEvents: HistoricalEvent[] = [
    {
      id: '1',
      title: "Fall of the Berlin Wall",
      date: "1989-11-09",
      location: { latitude: 52.5163, longitude: 13.3777, name: "Berlin, Germany" },
      description: "The Berlin Wall, a symbol of the Cold War division, was torn down by East and West Berliners, marking the beginning of German reunification.",
      category: "Political",
      sources: ["Demo Data"],
      verified: false,
      wikipediaUrl: "https://en.wikipedia.org/wiki/Fall_of_the_Berlin_Wall"
    },
    {
      id: '2',
      title: "Moon Landing",
      date: "1969-07-20",
      location: { latitude: 29.7604, longitude: -95.369, name: "Houston, Texas, USA" },
      description: "Neil Armstrong and Buzz Aldrin became the first humans to land on the Moon during the Apollo 11 mission.",
      category: "Science",
      sources: ["Demo Data"],
      verified: false,
      wikipediaUrl: "https://en.wikipedia.org/wiki/Apollo_11"
    },
    {
      id: '3',
      title: "Great Fire of London",
      date: "1666-09-02",
      location: { latitude: 51.5122, longitude: -0.0955, name: "London, England" },
      description: "A major conflagration that swept through the medieval City of London, destroying 13,200 houses and 87 churches.",
      category: "Disaster",
      sources: ["Demo Data"],
      verified: false,
      wikipediaUrl: "https://en.wikipedia.org/wiki/Great_Fire_of_London"
    },
    {
      id: '4',
      title: "French Revolution Begins",
      date: "1789-07-14",
      location: { latitude: 48.8534, longitude: 2.3764, name: "Paris, France" },
      description: "The storming of the Bastille marked the beginning of the French Revolution, fundamentally changing French society.",
      category: "Political",
      sources: ["Demo Data"],
      verified: false,
      wikipediaUrl: "https://en.wikipedia.org/wiki/French_Revolution"
    },
    {
      id: '5',
      title: "Magna Carta Signed",
      date: "1215-06-15",
      location: { latitude: 51.4434, longitude: -0.5544, name: "Runnymede, England" },
      description: "King John of England signed the Magna Carta, establishing the principle that everyone, including the king, was subject to the law.",
      category: "Legal",
      sources: ["Demo Data"],
      verified: false,
      wikipediaUrl: "https://en.wikipedia.org/wiki/Magna_Carta"
    }
  ];

  static getInstance(): HistoryDataService {
    if (!HistoryDataService.instance) {
      HistoryDataService.instance = new HistoryDataService();
    }
    return HistoryDataService.instance;
  }

  async getHistoricalEvents(year: number): Promise<HistoricalEvent[]> {
    const cacheKey = `events_${year}`;
    
    // Clear cache for this year to ensure fresh data
    this.cache.delete(cacheKey);
    
    try {
      console.log(`Fetching events for year ${year}`);
      const response = await fetch(`${this.baseUrl}/events?year=${year}&limit=50`);
      
      if (!response.ok) {
        console.error(`API request failed with status ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Received ${data.events?.length || 0} events from API for year ${year}`);
      
      if (data.success && data.events) {
        // Cache the results
        this.cache.set(cacheKey, {
          data: data.events,
          timestamp: Date.now()
        });
        
        return data.events;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching events from API:', error);
      
      // Fallback to demo data if API fails
      return this.getFallbackEvents(year);
    }
  }

  private getFallbackEvents(year: number): HistoricalEvent[] {
    // Fallback demo events when API is unavailable
    const fallbackEvents = [
      {
        id: "fallback_moon_landing_1969",
        title: "Apollo 11 Moon Landing",
        date: "1969-07-20",
        location: {
          latitude: 28.6139,
          longitude: -80.6081,
          name: "Kennedy Space Center, Florida"
        },
        description: "The first manned moon landing mission (fallback data).",
        category: "Science",
        images: [],
        wikipediaUrl: "https://en.wikipedia.org/wiki/Apollo_11",
        sources: ["Fallback Data"],
        verified: false
      }
    ];

    return fallbackEvents.filter(event => {
      const eventYear = new Date(event.date).getFullYear();
      return eventYear === year;
    });
  }

  async getEventById(id: string): Promise<HistoricalEvent | null> {
    try {
      const response = await fetch(`${this.baseUrl}/events/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.event) {
        return data.event;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching event by ID:', error);
      return null;
    }
  }

  async getCategories(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/categories`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.categories) {
        return data.categories;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return ['Politics', 'War', 'Science', 'Culture', 'Technology'];
    }
  }

  private determineCategory(title: string, extract: string): string {
    const content = (title + ' ' + extract).toLowerCase();
    
    if (content.includes('war') || content.includes('battle') || content.includes('conflict')) return 'War';
    if (content.includes('disaster') || content.includes('fire') || content.includes('earthquake')) return 'Disaster';
    if (content.includes('science') || content.includes('discovery') || content.includes('invention')) return 'Science';
    if (content.includes('political') || content.includes('revolution') || content.includes('government')) return 'Political';
    if (content.includes('cultural') || content.includes('art') || content.includes('music')) return 'Cultural';
    if (content.includes('economic') || content.includes('trade') || content.includes('market')) return 'Economic';
    
    return 'Historical';
  }

  private deduplicateEvents(events: HistoricalEvent[]): HistoricalEvent[] {
    const seen = new Set<string>();
    const unique: HistoricalEvent[] = [];

    for (const event of events) {
      const key = `${event.title.toLowerCase()}_${event.date}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(event);
      }
    }

    return unique.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  enableDataSource(sourceName: string, enabled: boolean): void {
    const source = this.dataSources.find(s => s.name === sourceName);
    if (source) {
      source.enabled = enabled;
    }
  }

  getDataSources(): DataSourceConfig[] {
    return [...this.dataSources];
  }

  // Clear cache to force refresh
  clearCache(): void {
    this.cache.clear();
  }

  // Check API health
  async checkApiHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl.replace('/api', '')}/health`);
      return response.ok;
    } catch (error) {
      console.error('API health check failed:', error);
      return false;
    }
  }
}