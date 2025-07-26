import { WikipediaEvent } from '@/types/HistoricalEvent';

export class WikipediaService {
  private static readonly BASE_URL = 'https://en.wikipedia.org/api/rest_v1';
  private static readonly CACHE_PREFIX = 'wikipedia_';
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  static async searchHistoricalEvents(year: number, limit: number = 50): Promise<WikipediaEvent[]> {
    const cacheKey = `${this.CACHE_PREFIX}events_${year}`;
    const cached = this.getCachedData(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      // Search for historical events in a specific year
      const searchQuery = `"${year}" historical events`;
      const searchUrl = `${this.BASE_URL}/page/summary/${encodeURIComponent(searchQuery)}`;
      
      // Get events related to the year
      const events = await this.fetchEventsForYear(year, limit);
      
      this.setCachedData(cacheKey, events);
      return events;
    } catch (error) {
      console.error('Error fetching Wikipedia events:', error);
      return [];
    }
  }

  private static async fetchEventsForYear(year: number, limit: number): Promise<WikipediaEvent[]> {
    const events: WikipediaEvent[] = [];
    
    // Search for events by category and year
    const categories = [
      `Category:${year}_events`,
      `Category:${year}_in_politics`,
      `Category:${year}_disasters`,
      `Category:${year}_in_science`,
      `Category:${year}_wars`,
      `Category:${year}_births`,
      `Category:${year}_deaths`
    ];

    for (const category of categories) {
      try {
        const categoryEvents = await this.fetchCategoryMembers(category);
        events.push(...categoryEvents.slice(0, Math.floor(limit / categories.length)));
      } catch (error) {
        console.warn(`Failed to fetch events for category ${category}:`, error);
      }
    }

    return events.slice(0, limit);
  }

  private static async fetchCategoryMembers(category: string): Promise<WikipediaEvent[]> {
    try {
      const url = `https://en.wikipedia.org/w/api.php`;
      const params = new URLSearchParams({
        action: 'query',
        list: 'categorymembers',
        cmtitle: category,
        cmlimit: '20',
        format: 'json',
        origin: '*'
      });

      const response = await fetch(`${url}?${params}`);
      const data = await response.json();
      
      if (!data.query?.categorymembers) {
        return [];
      }

      const events: WikipediaEvent[] = [];
      
      for (const member of data.query.categorymembers.slice(0, 10)) {
        try {
          const eventData = await this.fetchPageDetails(member.title);
          if (eventData) {
            events.push(eventData);
          }
        } catch (error) {
          console.warn(`Failed to fetch details for ${member.title}:`, error);
        }
      }

      return events;
    } catch (error) {
      console.error('Error fetching category members:', error);
      return [];
    }
  }

  private static async fetchPageDetails(title: string): Promise<WikipediaEvent | null> {
    try {
      const url = 'https://en.wikipedia.org/w/api.php';
      const params = new URLSearchParams({
        action: 'query',
        prop: 'extracts|pageimages|coordinates|info',
        exintro: 'true',
        exlimit: '1',
        piprop: 'thumbnail',
        pithumbsize: '300',
        titles: title,
        format: 'json',
        origin: '*',
        inprop: 'url'
      });

      const response = await fetch(`${url}?${params}`);
      const data = await response.json();
      
      const pages = data.query?.pages;
      if (!pages) return null;

      const page = Object.values(pages)[0] as any;
      if (!page || page.missing) return null;

      return {
        title: page.title,
        extract: page.extract || 'No description available.',
        thumbnail: page.thumbnail,
        fullurl: page.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title)}`,
        coordinates: page.coordinates?.[0] ? {
          lat: page.coordinates[0].lat,
          lon: page.coordinates[0].lon
        } : undefined
      };
    } catch (error) {
      console.error(`Error fetching page details for ${title}:`, error);
      return null;
    }
  }

  static async searchEventsByLocation(lat: number, lon: number, radius: number = 100): Promise<WikipediaEvent[]> {
    try {
      const url = 'https://en.wikipedia.org/w/api.php';
      const params = new URLSearchParams({
        action: 'query',
        list: 'geosearch',
        gscoord: `${lat}|${lon}`,
        gsradius: radius.toString(),
        gslimit: '20',
        format: 'json',
        origin: '*'
      });

      const response = await fetch(`${url}?${params}`);
      const data = await response.json();
      
      if (!data.query?.geosearch) {
        return [];
      }

      const events: WikipediaEvent[] = [];
      
      for (const result of data.query.geosearch) {
        const eventData = await this.fetchPageDetails(result.title);
        if (eventData) {
          events.push(eventData);
        }
      }

      return events;
    } catch (error) {
      console.error('Error searching events by location:', error);
      return [];
    }
  }

  private static getCachedData(key: string): any {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const data = JSON.parse(cached);
      if (Date.now() - data.timestamp > this.CACHE_DURATION) {
        localStorage.removeItem(key);
        return null;
      }

      return data.value;
    } catch (error) {
      return null;
    }
  }

  private static setCachedData(key: string, value: any): void {
    try {
      const data = {
        value,
        timestamp: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }
}