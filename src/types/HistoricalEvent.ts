export interface HistoricalEvent {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  location: {
    latitude: number;
    longitude: number;
    name: string;
  };
  description: string;
  category: string;
  images?: string[];
  wikipediaUrl?: string;
  sources: string[];
  verified: boolean;
}

export interface WikipediaEvent {
  title: string;
  extract: string;
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
  fullurl: string;
  coordinates?: {
    lat: number;
    lon: number;
  };
}

export interface DataSourceConfig {
  name: string;
  enabled: boolean;
  priority: number;
}