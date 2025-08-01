import { HistoricalEvent } from '@/types/HistoricalEvent';

export interface EventSummary {
  id: string;
  title: string;
  date: string;
  summary: string;
  timestamp: number;
}

class SummaryService {
  private static instance: SummaryService;
  private baseUrl: string;

  private constructor() {
    // Use backend API for summary generation
    this.baseUrl = '/api';
  }

  static getInstance(): SummaryService {
    if (!SummaryService.instance) {
      SummaryService.instance = new SummaryService();
    }
    return SummaryService.instance;
  }

  async generateSummary(event: HistoricalEvent): Promise<EventSummary> {
    try {
      console.log('Generating summary for event:', event.title);
      
      const response = await fetch(`${this.baseUrl}/summarize-event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: event.title,
          description: event.description,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to generate summary`);
      }

      const data = await response.json();
      
      return {
        id: event.id,
        title: event.title,
        date: event.date,
        summary: data.summary,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Error generating summary:', error);
      
      // Fallback summary if API fails
      return {
        id: event.id,
        title: event.title,
        date: event.date,
        summary: `${event.description.substring(0, 100)}...`,
        timestamp: Date.now(),
      };
    }
  }
}

export default SummaryService;