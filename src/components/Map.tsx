import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { HistoryDataService } from '@/services/HistoryDataService';
import { HistoricalEvent } from '@/types/HistoricalEvent';

interface MapProps {
  selectedYear: number;
  onEventSelect: (event: any) => void;
}

const Map: React.FC<MapProps> = ({ selectedYear, onEventSelect }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [apiKey, setApiKey] = useState<string>('');
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [events, setEvents] = useState<HistoricalEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const historyService = HistoryDataService.getInstance();

  // Check if user has Mapbox API key
  useEffect(() => {
    const savedKey = localStorage.getItem('mapbox_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      setHasApiKey(true);
    }
  }, []);

  const saveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('mapbox_api_key', apiKey.trim());
      setHasApiKey(true);
      toast({
        title: "API Key Saved",
        description: "Mapbox API key saved successfully. Initializing map...",
      });
    }
  };

  useEffect(() => {
    if (!mapContainer.current || !hasApiKey) return;

    // Initialize map
    mapboxgl.accessToken = localStorage.getItem('mapbox_api_key') || '';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      projection: 'globe' as any,
      zoom: 2,
      center: [20, 40],
      pitch: 0,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add atmosphere and fog effects
    map.current.on('style.load', () => {
      map.current?.setFog({
        color: 'hsl(210, 30%, 8%)',
        'high-color': 'hsl(195, 25%, 15%)',
        'horizon-blend': 0.1,
      });
    });

    // Cleanup
    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      map.current?.remove();
    };
  }, [hasApiKey]);

  // Load historical events for the selected year
  useEffect(() => {
    if (!hasApiKey) return;

    const loadEvents = async () => {
      setIsLoadingEvents(true);
      setError(null);
      
      try {
        const historicalEvents = await historyService.getHistoricalEvents(selectedYear);
        setEvents(historicalEvents);
      } catch (error) {
        console.error('Error loading historical events:', error);
        setError(error instanceof Error ? error.message : 'Failed to load events');
        toast({
          title: "Error Loading Events",
          description: "Failed to load historical events from API. Using fallback data.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingEvents(false);
      }
    };

    loadEvents();
  }, [selectedYear, hasApiKey, historyService, toast]);

  // Update markers based on loaded events
  useEffect(() => {
    if (!map.current || !hasApiKey) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Filter events by year
    const filteredEvents = events.filter(event => {
      const eventYear = new Date(event.date).getFullYear();
      return eventYear <= selectedYear;
    });

    // Add markers for filtered events
    filteredEvents.forEach(event => {
      // Create custom marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'historical-marker';
      markerElement.innerHTML = `
        <div class="w-6 h-6 bg-historical-gold rounded-full border-2 border-background shadow-glow animate-glow cursor-pointer hover:scale-110 transition-transform duration-300">
          <div class="w-full h-full bg-historical-gold rounded-full animate-float"></div>
        </div>
      `;

      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([event.location.longitude, event.location.latitude])
        .addTo(map.current!);

      // Add click event
      markerElement.addEventListener('click', () => {
        onEventSelect(event);
      });

      markersRef.current.push(marker);
    });
  }, [events, selectedYear, hasApiKey, onEventSelect]);

  if (!hasApiKey) {
    return (
      <div className="relative w-full h-screen bg-gradient-ocean flex items-center justify-center">
        <Card className="p-8 max-w-md w-full mx-4 bg-card/95 backdrop-blur-sm border-border/50">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Connect to Mapbox</h2>
            <p className="text-muted-foreground">
              To display the interactive historical map, please enter your Mapbox public token. 
              You can find it at{' '}
              <a 
                href="https://mapbox.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                mapbox.com
              </a>
            </p>
            <div className="space-y-3">
              <Input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Mapbox public token"
                className="transition-all duration-300 focus:ring-2 focus:ring-accent/50"
              />
              <Button 
                onClick={saveApiKey}
                disabled={!apiKey.trim()}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                Connect Map
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen">
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-background/10" />
      
      {/* Loading State */}
      {isLoadingEvents && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading historical events...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute top-4 left-4 right-4 bg-destructive/90 text-destructive-foreground p-4 rounded-lg">
          <p className="font-medium">Error loading events</p>
          <p className="text-sm opacity-90">{error}</p>
        </div>
      )}
    </div>
  );
};

export default Map;