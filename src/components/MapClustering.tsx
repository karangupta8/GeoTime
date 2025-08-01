import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Supercluster from 'supercluster';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { HistoryDataService } from '@/services/HistoryDataService';
import { HistoricalEvent } from '@/types/HistoricalEvent';

interface MapProps {
  selectedYear: number;
  onEventSelect: (event: any) => void;
}

const MapWithClustering: React.FC<MapProps> = ({ selectedYear, onEventSelect }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const superclusterRef = useRef<Supercluster | null>(null);
  const [isMapboxConfigured, setIsMapboxConfigured] = useState<boolean>(false);
  const [isCheckingConfig, setIsCheckingConfig] = useState<boolean>(true);
  const [events, setEvents] = useState<HistoricalEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const historyService = HistoryDataService.getInstance();

  // Check if Mapbox is configured on the backend
  useEffect(() => {
    const checkMapboxConfig = async () => {
      try {
        const response = await fetch('/api/mapbox/config');
        const data = await response.json();
        setIsMapboxConfigured(data.configured);
        
        if (!data.configured) {
          toast({
            title: "Mapbox Not Configured",
            description: "Please configure your Mapbox API key in the server environment variables.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error checking Mapbox configuration:', error);
        setIsMapboxConfigured(false);
        toast({
          title: "Server Connection Error",
          description: "Unable to connect to the backend server. Please ensure it's running.",
          variant: "destructive",
        });
      } finally {
        setIsCheckingConfig(false);
      }
    };

    checkMapboxConfig();
  }, [toast]);

  useEffect(() => {
    if (!mapContainer.current || !isMapboxConfigured) return;

    // Initialize map with a dummy token (will use proxy for actual requests)
    mapboxgl.accessToken = 'pk.dummy'; // Not used, but required by mapbox-gl
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'mapbox-tiles': {
            type: 'raster',
            tiles: ['/api/mapbox/tiles/{z}/{x}/{y}?style=dark-v11'],
            tileSize: 512,
          },
        },
        layers: [
          {
            id: 'mapbox-tiles',
            type: 'raster',
            source: 'mapbox-tiles',
          },
        ],
      },
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

    // Initialize supercluster
    superclusterRef.current = new Supercluster({
      radius: 40,
      maxZoom: 16,
      minPoints: 2,
    });

    // Update clusters on zoom
    map.current.on('zoom', updateClusters);
    map.current.on('moveend', updateClusters);

    // Cleanup
    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      map.current?.remove();
    };
  }, [isMapboxConfigured]);

  // Load historical events for the selected year
  useEffect(() => {
    if (!isMapboxConfigured) return;

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
  }, [selectedYear, isMapboxConfigured, historyService, toast]);

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
          lng,
          lat
        );
        
        const marker = new mapboxgl.Marker(clusterMarker)
          .setLngLat([lng, lat])
          .addTo(map.current!);

        markersRef.current.push(marker);
      } else {
        // This is a single event
        const event = cluster.properties as HistoricalEvent;
        const eventMarker = createEventMarker(event);
        
        const marker = new mapboxgl.Marker(eventMarker)
          .setLngLat([lng, lat])
          .addTo(map.current!);

        markersRef.current.push(marker);
      }
    });
  };

  const createClusterMarker = (pointCount: number, clusterId: number, lng: number, lat: number) => {
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
    `;
    markerElement.textContent = pointCount.toString();

    markerElement.addEventListener('click', () => {
      if (superclusterRef.current) {
        const expansionZoom = superclusterRef.current.getClusterExpansionZoom(clusterId);
        map.current?.easeTo({
          center: [lng, lat],
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
    if (!map.current || !isMapboxConfigured || !superclusterRef.current) return;

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
  }, [events, selectedYear, isMapboxConfigured, onEventSelect]);

  if (isCheckingConfig) {
    return (
      <div className="relative w-full h-screen bg-gradient-ocean flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Checking server configuration...</p>
        </div>
      </div>
    );
  }

  if (!isMapboxConfigured) {
    return (
      <div className="relative w-full h-screen bg-gradient-ocean flex items-center justify-center">
        <Card className="p-8 max-w-md w-full mx-4 bg-card/95 backdrop-blur-sm border-border/50">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Mapbox Configuration Required</h2>
            <p className="text-muted-foreground">
              The interactive map requires a Mapbox API key to be configured on the server. 
              Please add your Mapbox public token to the server's environment variables.
            </p>
            <div className="bg-muted p-4 rounded-lg text-left">
              <p className="text-sm font-mono">
                1. Create a <code>.env</code> file in the server directory<br/>
                2. Add: <code>MAPBOX_ACCESS_TOKEN=your_token_here</code><br/>
                3. Restart the server
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Get your token at{' '}
              <a 
                href="https://mapbox.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                mapbox.com
              </a>
            </p>
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