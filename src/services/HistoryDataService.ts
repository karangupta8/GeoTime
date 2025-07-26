import { HistoricalEvent, WikipediaEvent, DataSourceConfig } from '@/types/HistoricalEvent';
import { WikipediaService } from './WikipediaService';

export class HistoryDataService {
  private static instance: HistoryDataService;
  private dataSources: DataSourceConfig[] = [
    { name: 'Wikipedia', enabled: true, priority: 1 },
    { name: 'LocalData', enabled: true, priority: 2 }
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
    const allEvents: HistoricalEvent[] = [];

    // Get events from enabled data sources
    for (const source of this.dataSources.filter(s => s.enabled)) {
      try {
        let sourceEvents: HistoricalEvent[] = [];

        switch (source.name) {
          case 'Wikipedia':
            sourceEvents = await this.getWikipediaEvents(year);
            break;
          case 'LocalData':
            sourceEvents = this.getDemoEvents(year);
            break;
        }

        allEvents.push(...sourceEvents);
      } catch (error) {
        console.warn(`Failed to fetch events from ${source.name}:`, error);
      }
    }

    // Sort by date and remove duplicates
    return this.deduplicateEvents(allEvents);
  }

  private async getWikipediaEvents(year: number): Promise<HistoricalEvent[]> {
    try {
      const wikipediaEvents = await WikipediaService.searchHistoricalEvents(year, 20);
      return wikipediaEvents
        .filter(event => event.coordinates) // Only events with coordinates
        .map(this.convertWikipediaEvent);
    } catch (error) {
      console.error('Error fetching Wikipedia events:', error);
      return [];
    }
  }

  private getDemoEvents(year: number): HistoricalEvent[] {
    return this.demoEvents.filter(event => {
      const eventYear = new Date(event.date).getFullYear();
      return eventYear <= year;
    });
  }

  private convertWikipediaEvent(wikipediaEvent: WikipediaEvent): HistoricalEvent {
    const id = `wiki_${wikipediaEvent.title.replace(/\s+/g, '_')}`;
    
    // Extract year from title or use current year as fallback
    const yearMatch = wikipediaEvent.title.match(/\b(1[0-9]{3}|20[0-9]{2})\b/);
    const year = yearMatch ? yearMatch[0] : new Date().getFullYear().toString();
    
    // Determine category based on title content
    const category = this.determineCategory(wikipediaEvent.title, wikipediaEvent.extract);

    return {
      id,
      title: wikipediaEvent.title,
      date: `${year}-01-01`, // Default to January 1st if specific date not available
      location: {
        latitude: wikipediaEvent.coordinates!.lat,
        longitude: wikipediaEvent.coordinates!.lon,
        name: wikipediaEvent.title
      },
      description: wikipediaEvent.extract.length > 300 
        ? wikipediaEvent.extract.substring(0, 300) + '...'
        : wikipediaEvent.extract,
      category,
      images: wikipediaEvent.thumbnail ? [wikipediaEvent.thumbnail.source] : [],
      wikipediaUrl: wikipediaEvent.fullurl,
      sources: ['Wikipedia'],
      verified: true
    };
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

  async importCustomEvents(events: HistoricalEvent[]): Promise<void> {
    const customKey = 'custom_historical_events';
    try {
      localStorage.setItem(customKey, JSON.stringify(events));
    } catch (error) {
      console.error('Failed to import custom events:', error);
      throw new Error('Failed to save custom events');
    }
  }

  getCustomEvents(): HistoricalEvent[] {
    const customKey = 'custom_historical_events';
    try {
      const stored = localStorage.getItem(customKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load custom events:', error);
      return [];
    }
  }
}