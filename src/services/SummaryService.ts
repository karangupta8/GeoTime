import { HistoricalEvent } from '@/types/HistoricalEvent';

export interface EventSummary {
  id: string;
  title: string;
  date: string;
  summary: string;
  timestamp: number;
  provider?: string;
  model?: string;
}

class SummaryService {
  private static instance: SummaryService;
  private baseUrl: string;

  private constructor() {
    // Use environment variable for API base URL, fallback to relative path
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
  }

  static getInstance(): SummaryService {
    if (!SummaryService.instance) {
      SummaryService.instance = new SummaryService();
    }
    return SummaryService.instance;
  }

  async generateSummary(event: HistoricalEvent): Promise<EventSummary> {
    try {
      console.log(`[SummaryService] Generating summary for event: ${event.title}`);
      
      const response = await fetch(`${this.baseUrl}/summarize`, {
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
        let errorMessage = `HTTP ${response.status}: Failed to generate summary`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch {
          // If JSON parsing fails, use the default error message
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Summary generation failed');
      }
      
      console.log(`[SummaryService] Successfully generated summary using ${data.provider || 'unknown'} provider`);
      
      return {
        id: event.id,
        title: event.title,
        date: event.date,
        summary: data.summary,
        timestamp: Date.now(),
        provider: data.provider,
        model: data.model
      };
    } catch (error) {
      console.error('[SummaryService] Error generating summary:', error);
      
      // Enhanced fallback summary with better formatting
      const fallbackSummary = this.createFallbackSummary(event);
      
      return {
        id: event.id,
        title: event.title,
        date: event.date,
        summary: fallbackSummary,
        timestamp: Date.now(),
        provider: 'fallback',
        model: 'local'
      };
    }
  }

  private createFallbackSummary(event: HistoricalEvent): string {
    const description = event.description;
    
    if (description.length <= 100) {
      return description;
    }
    
    // Try to find a good breaking point (end of sentence)
    const truncated = description.substring(0, 97);
    const lastPeriod = truncated.lastIndexOf('.');
    const lastExclamation = truncated.lastIndexOf('!');
    const lastQuestion = truncated.lastIndexOf('?');
    
    const lastSentenceEnd = Math.max(lastPeriod, lastExclamation, lastQuestion);
    
    if (lastSentenceEnd > 50) {
      // If we found a sentence ending after position 50, use it
      return description.substring(0, lastSentenceEnd + 1);
    } else {
      // Otherwise, just truncate and add ellipsis
      return truncated + '...';
    }
  }

  // Method to check API status
  async checkApiStatus(): Promise<{ available: boolean; provider?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/status`);
      
      if (!response.ok) {
        return { available: false, error: `API not available: ${response.status}` };
      }
      
      const data = await response.json();
      
      return {
        available: data.success || false,
        provider: data.providers?.llm,
        error: data.success ? undefined : 'API status check failed'
      };
    } catch (error) {
      console.error('[SummaryService] Status check failed:', error);
      return { 
        available: false, 
        error: error instanceof Error ? error.message : 'Status check failed' 
      };
    }
  }
}

export default SummaryService;