import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Supercluster from 'supercluster';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { HistoryDataService } from '@/services/HistoryDataService';
import { HistoricalEvent } from '@/types/HistoricalEvent';
import API_CONFIG from '@/config/api';

interface MapProps {
  selectedYear: number;
  onEventSelect: (event: any) => void;
}

const MapWithClustering: React.FC<MapProps> = ({ selectedYear, onEventSelect }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const superclusterRef = useRef<Supercluster | null>(null);
  const [mapboxConfig, setMapboxConfig] = useState<any>(null);
  const [hasMapboxConfig, setHasMapboxConfig] = useState<boolean>(false);
  const [events, setEvents] = useState<HistoricalEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const historyService = HistoryDataService.getInstance();

  // Fetch Mapbox configuration from server
  useEffect(() => {
    const fetchMapboxConfig = async () => {
      try {
        const response = await fetch(API_CONFIG.getUrl('mapbox/config'));
        if (!response.ok) {
          throw new Error(`Failed to fetch Mapbox config: ${response.status}`);
        }
        const data = await response.json();
        setMapboxConfig(data.config);
        setHasMapboxConfig(true);
      } catch (error) {
        console.error('Error fetching Mapbox config:', error);
        setError(error instanceof Error ? error.message : 'Failed to load Mapbox configuration');
        toast({
          title: "Configuration Error",
          description: "Failed to load Mapbox configuration from server. Please check server setup.",
          variant: "destructive",
        });
      }
    };

    fetchMapboxConfig();
  }, [toast]);

  useEffect(() => {
    if (!mapContainer.current || !hasMapboxConfig || !mapboxConfig) return;

    // Initialize map with server-provided configuration
    mapboxgl.accessToken = mapboxConfig.publicToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapboxConfig.defaultStyle,
      projection: mapboxConfig.projection as any,
      zoom: mapboxConfig.zoom,
      center: mapboxConfig.center,
      pitch: mapboxConfig.pitch,
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

    // Initialize supercluster
    superclusterRef.current = new Supercluster({
      radius: 40,
      maxZoom: 16,
      minPoints: 2,
    });

    // Update clusters on zoom
    map.current.on('zoom', updateClusters);

    // Cleanup
    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      map.current?.remove();
    };
  }, [hasMapboxConfig, mapboxConfig]);

  // Load historical events for the selected year
  useEffect(() => {
    if (!hasMapboxConfig) return;

    const loadEvents = async () => {
      setIsLoadingEvents(true);
      setError(null);
      
      try {
        const historicalEvents = await historyService.getHistoricalEvents(selectedYear);
        console.log(`Map component received ${historicalEvents.length} events for year ${selectedYear}`);
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
  }, [selectedYear, hasMapboxConfig, historyService, toast]);

  const updateClusters = () => {
    if (!map.current || !superclusterRef.current) return;

    const bounds = map.current.getBounds();
    const bbox: [number, number, number, number] = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ];

    const zoom = Math.floor(map.current.getZoom());
    const clusters = superclusterRef.current.getClusters(bbox, zoom);

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    clusters.forEach(cluster => {
      const [lng, lat] = cluster.geometry.coordinates;
      
      if (cluster.properties?.cluster) {
        // This is a cluster
        const clusterMarker = createClusterMarker(
          cluster.properties.point_count,
          cluster.properties.cluster_id,
          [lng, lat]
        );
        
        const marker = new mapboxgl.Marker({
          element: clusterMarker,
          anchor: 'center'
        })
          .setLngLat([lng, lat])
          .addTo(map.current!);

        markersRef.current.push(marker);
      } else {
        // This is a single event
        const event = cluster.properties as HistoricalEvent;
        const eventMarker = createEventMarker(event);
        
        const marker = new mapboxgl.Marker({
          element: eventMarker,
          anchor: 'center'
        })
          .setLngLat([lng, lat])
          .addTo(map.current!);

        markersRef.current.push(marker);
      }
    });
  };

  const createClusterMarker = (pointCount: number, clusterId: number, coordinates: [number, number]) => {
    const size = pointCount < 10 ? 40 : pointCount < 100 ? 50 : 60;
    
    const markerElement = document.createElement('div');
    markerElement.className = 'cluster-marker';
    markerElement.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      background: hsl(var(--historical-gold));
      border: 2px solid hsl(var(--background));
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: hsl(var(--background));
      font-weight: bold;
      font-size: ${size > 50 ? '14px' : '12px'};
      cursor: pointer;
      box-shadow: 0 0 20px hsl(var(--historical-gold) / 0.5);
      transition: all 0.3s ease;
      transform-origin: center center;
    `;
    markerElement.textContent = pointCount.toString();

    markerElement.addEventListener('click', () => {
      if (superclusterRef.current && map.current) {
        const expansionZoom = superclusterRef.current.getClusterExpansionZoom(clusterId);
        map.current.easeTo({
          center: coordinates,
          zoom: expansionZoom,
          duration: 500,
        });
      }
    });

    markerElement.addEventListener('mouseenter', () => {
      markerElement.style.transform = 'scale(1.1)';
    });

    markerElement.addEventListener('mouseleave', () => {
      markerElement.style.transform = 'scale(1)';
    });

    return markerElement;
  };

  const createEventMarker = (event: HistoricalEvent) => {
    const markerElement = document.createElement('div');
    markerElement.className = 'historical-marker';
    markerElement.innerHTML = `
      <div class="w-6 h-6 bg-historical-gold rounded-full border-2 border-background shadow-glow animate-glow cursor-pointer hover:scale-110 transition-transform duration-300">
        <div class="w-full h-full bg-historical-gold rounded-full animate-float"></div>
      </div>
    `;

    markerElement.addEventListener('click', () => {
      onEventSelect(event);
    });

    return markerElement;
  };

  // Update markers based on loaded events
  useEffect(() => {
    if (!map.current || !hasMapboxConfig || !superclusterRef.current) return;

    // Convert events to GeoJSON format for supercluster
    const points = events.map(event => ({
      type: 'Feature' as const,
      properties: event,
      geometry: {
        type: 'Point' as const,
        coordinates: [event.location.longitude, event.location.latitude],
      },
    }));

    console.log(`Clustering ${points.length} events for year ${selectedYear}`);
    
    // Load points into supercluster
    superclusterRef.current.load(points);
    
    // Update clusters
    updateClusters();
  }, [events, selectedYear, hasMapboxConfig, onEventSelect]);

  if (!hasMapboxConfig) {
    return (
      <div className="relative w-full h-screen bg-gradient-ocean flex items-center justify-center">
        <Card className="p-8 max-w-md w-full mx-4 bg-card/95 backdrop-blur-sm border-border/50">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Loading Map Configuration</h2>
            <p className="text-muted-foreground">
              Loading Mapbox configuration from server...
            </p>
            {error ? (
              <div className="text-destructive text-sm">
                {error}
              </div>
            ) : (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            )}
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

      {/* Event Count Display */}
      <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm p-3 rounded-lg border border-border/50">
        <p className="text-sm text-muted-foreground">
          Events for {selectedYear}: <span className="text-foreground font-semibold">{events.length}</span>
        </p>
      </div>
    </div>
  );
};

export default MapWithClustering;