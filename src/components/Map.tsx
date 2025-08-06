import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { HistoryDataService } from '@/services/HistoryDataService';

// Import the styles
import './Map.css';

interface MapProps {
  selectedYear: number;
  selectedEvent: any;
}

const Map: React.FC<MapProps> = ({ selectedYear, selectedEvent }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapboxConfig, setMapboxConfig] = useState<any>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const { toast } = useToast();
  const historyService = HistoryDataService.getInstance();

  // Load Mapbox configuration from server
  useEffect(() => {
    const loadMapboxConfig = async () => {
      try {
        setIsLoading(true);
        setConfigError(null);
        
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/mapbox/config`);
        
        if (!response.ok) {
          throw new Error(`Failed to load Mapbox configuration: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success || !data.config) {
          throw new Error('Invalid configuration response from server');
        }
        
        // Validate that we have a public token
        if (!data.config.publicToken) {
          throw new Error('Mapbox configuration is not properly set up on the server');
        }
        
        setMapboxConfig(data.config);
      } catch (error) {
        console.error('Error loading Mapbox config:', error);
        setConfigError(error instanceof Error ? error.message : 'Failed to load map configuration');
        toast({
          title: "Configuration Error",
          description: "Failed to load map configuration from server. Please check server setup.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadMapboxConfig();
  }, [toast]);

  useEffect(() => {
    if (!mapContainer.current || !mapboxConfig?.publicToken || isLoading) return;

    // Initialize map with server-provided configuration
    mapboxgl.accessToken = mapboxConfig.publicToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapboxConfig.defaultStyle || 'mapbox://styles/mapbox/dark-v11',
      projection: mapboxConfig.projection as any || 'globe',
      zoom: mapboxConfig.zoom || 1.5,
      center: [0, 20], // Force centered position
      pitch: mapboxConfig.pitch || 0,
      maxZoom: mapboxConfig.maxZoom || 18,
      minZoom: mapboxConfig.minZoom || 0,
      trackResize: false, // Disable analytics tracking
      attributionControl: false, // Disable attribution control to reduce tracking
    });

    map.current.on('load', () => {
      console.log('Map loaded successfully');
      
      // Add navigation controls
      map.current?.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      // Add scale control
      map.current?.addControl(new mapboxgl.ScaleControl(), 'bottom-left');
      
      loadHistoricalEvents();
    });

    map.current.on('error', (e) => {
      console.error('Map error:', e);
      toast({
        title: "Map Error",
        description: "There was an error loading the map. Please refresh the page.",
        variant: "destructive"
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxConfig, isLoading, toast]);

  const loadHistoricalEvents = async () => {
    try {
      const events = await historyService.getHistoricalEvents(selectedYear);
      
      if (!map.current || !events.length) return;

      // Clear existing markers
      const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
      existingMarkers.forEach(marker => marker.remove());

      // Add markers for events
      events.forEach((event) => {
        if (event.location?.latitude && event.location?.longitude) {
          const marker = new mapboxgl.Marker({
            color: '#ef4444',
            scale: 0.8
          })
            .setLngLat([event.location.longitude, event.location.latitude])
            .setPopup(
              new mapboxgl.Popup({ offset: 25 })
                .setHTML(`
                  <div class="p-3 max-w-sm">
                    <h3 class="font-bold text-sm mb-2">${event.title}</h3>
                    <p class="text-xs text-gray-600 mb-2">${event.date}</p>
                    <p class="text-xs">${event.description.substring(0, 150)}...</p>
                  </div>
                `)
            )
            .addTo(map.current!);
        }
      });

      toast({
        title: "Events Loaded",
        description: `Loaded ${events.length} historical events for year ${selectedYear}`,
      });
    } catch (error) {
      console.error('Error loading historical events:', error);
      toast({
        title: "Loading Error",
        description: "Failed to load historical events. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Update events when year changes
  useEffect(() => {
    if (map.current && mapboxConfig) {
      loadHistoricalEvents();
    }
  }, [selectedYear, mapboxConfig]);

  // Fly to selected event
  useEffect(() => {
    if (selectedEvent && map.current && selectedEvent.location?.latitude && selectedEvent.location?.longitude) {
      map.current.flyTo({
        center: [selectedEvent.location.longitude, selectedEvent.location.latitude],
        zoom: 8,
        duration: 2000
      });
    }
  }, [selectedEvent]);

  if (isLoading) {
    return (
      <Card className="w-full h-[600px] flex items-center justify-center">
        <CardContent className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading map configuration...</p>
        </CardContent>
      </Card>
    );
  }

  if (configError) {
    return (
      <Card className="w-full h-[600px]">
        <CardContent className="p-6 h-full flex items-center justify-center">
          <Alert className="w-full max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="mt-2">
              <div className="space-y-4">
                <p className="text-sm">Unable to load map configuration:</p>
                <p className="text-xs text-muted-foreground font-mono">{configError}</p>
                <p className="text-xs text-muted-foreground">
                  Please ensure the server is running and Mapbox is properly configured.
                </p>
                <Button 
                  onClick={() => window.location.reload()} 
                  size="sm" 
                  className="w-full"
                >
                  Retry
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-[600px]">
      <CardContent className="p-0 h-full">
        <div 
          ref={mapContainer} 
          className="w-full h-full rounded-lg overflow-hidden"
          style={{ minHeight: '400px' }}
        />
      </CardContent>
    </Card>
  );
};

export default Map;