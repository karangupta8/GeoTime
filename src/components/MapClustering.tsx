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

interface MapProps {
  selectedYearRange: [number, number]; // Change from selectedYear to selectedYearRange
  onEventSelect: (event: any) => void;
  dataSourceVersion?: number; // Add this prop
}

const MapWithClustering: React.FC<MapProps> = ({ selectedYearRange, onEventSelect, dataSourceVersion }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const superclusterRef = useRef<Supercluster | null>(null);
  const [mapboxConfig, setMapboxConfig] = useState<any>(null);
  const [hasMapboxConfig, setHasMapboxConfig] = useState(false);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);
  const [events, setEvents] = useState<HistoricalEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const historyService = HistoryDataService.getInstance();

  // Load Mapbox configuration from server
  useEffect(() => {
    const loadMapboxConfig = async () => {
      try {
        setIsLoadingConfig(true);
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
        setHasMapboxConfig(true);
      } catch (error) {
        console.error('Error loading Mapbox config:', error);
        setConfigError(error instanceof Error ? error.message : 'Failed to load map configuration');
      } finally {
        setIsLoadingConfig(false);
      }
    };

    loadMapboxConfig();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !hasMapboxConfig || !mapboxConfig || isLoadingConfig) return;

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
  }, [hasMapboxConfig, mapboxConfig, isLoadingConfig]);

  // Load historical events for the selected year range
  useEffect(() => {
    if (!hasMapboxConfig) return;

    const loadEvents = async () => {
      setIsLoadingEvents(true);
      setError(null);
      
      try {
        const historicalEvents = await historyService.getHistoricalEvents(selectedYearRange);
        console.log(`Map component received ${historicalEvents.length} events for year range ${selectedYearRange[0]}-${selectedYearRange[1]}`);
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
  }, [selectedYearRange, hasMapboxConfig, historyService, toast, dataSourceVersion]); // Add dataSourceVersion to dependencies

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
        
        if (clusterMarker) {
          const marker = new mapboxgl.Marker({
            element: clusterMarker,
            anchor: 'center',
            offset: [0, 0], // Ensure no offset
            pitchAlignment: 'map',
            rotationAlignment: 'map'
          })
            .setLngLat([lng, lat])
            .addTo(map.current!);

          markersRef.current.push(marker);
        }
      } else {
        // This is a single event
        const event = cluster.properties as HistoricalEvent;
        const eventMarker = createEventMarker(event);
        
        // Validate event coordinates more strictly
        if (isFinite(lng) && isFinite(lat) && Math.abs(lng) <= 180 && Math.abs(lat) <= 90) {
          const marker = new mapboxgl.Marker({
            element: eventMarker,
            anchor: 'center',
            offset: [0, 0], // Ensure no offset
            pitchAlignment: 'map',
            rotationAlignment: 'map'
          })
            .setLngLat([lng, lat])
            .addTo(map.current!);

          markersRef.current.push(marker);
        } else {
          console.error('Invalid event coordinates:', { lng, lat, event });
        }
      }
    });
  };

  const createClusterMarker = (pointCount: number, clusterId: number, lng: number, lat: number) => {
    // Validate coordinates more strictly
    if (!isFinite(lng) || !isFinite(lat) || Math.abs(lng) > 180 || Math.abs(lat) > 90) {
      console.error('Invalid cluster coordinates:', { lng, lat, clusterId });
      return null;
    }
    
    // Responsive sizing for mobile devices
    const isMobile = window.innerWidth < 768;
    const baseSize = isMobile ? 44 : 40; // Ensure minimum touch target of 44px on mobile
    const size = pointCount < 10 ? baseSize : pointCount < 100 ? baseSize + 10 : baseSize + 20;
    
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
      transition: transform 0.2s ease;
      position: relative;
      transform-origin: center center;
      pointer-events: auto;
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      outline: none;
    `;
    markerElement.textContent = pointCount.toString();

    markerElement.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation(); // Prevent event bubbling
      try {
        if (superclusterRef.current && isFinite(lng) && isFinite(lat) && Math.abs(lng) <= 180 && Math.abs(lat) <= 90) {
          console.log('Cluster click - expanding to coordinates:', { lng, lat, clusterId });
          const expansionZoom = superclusterRef.current.getClusterExpansionZoom(clusterId);
          // Ensure zoom level is valid
          const targetZoom = Math.min(expansionZoom, 18);
          map.current?.easeTo({
            center: [lng, lat],
            zoom: targetZoom,
            duration: 400,
            essential: true // Ensures the animation completes even if interrupted
          });
        } else {
          console.error('Cannot expand cluster: invalid coordinates or supercluster', { lng, lat, clusterId });
        }
      } catch (error) {
        console.error('Error expanding cluster:', error, { lng, lat, clusterId });
      }
    });

    markerElement.addEventListener('mouseenter', (e) => {
      e.stopPropagation();
      markerElement.style.transform = 'scale(1.1)';
    });

    markerElement.addEventListener('mouseleave', (e) => {
      e.stopPropagation();
      markerElement.style.transform = 'scale(1)';
    });

    return markerElement;
  };

  const createEventMarker = (event: HistoricalEvent) => {
    const isMobile = window.innerWidth < 768;
    const markerSize = isMobile ? 'w-8 h-8' : 'w-6 h-6'; // Larger touch target on mobile
    
    const markerElement = document.createElement('div');
    markerElement.className = 'historical-marker';
    markerElement.innerHTML = `
      <div class="${markerSize} bg-historical-gold rounded-full border-2 border-background shadow-glow animate-glow cursor-pointer hover:scale-110 transition-transform duration-300">
        <div class="w-full h-full bg-historical-gold rounded-full animate-float"></div>
      </div>
    `;

    markerElement.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
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

    console.log(`Clustering ${points.length} events for year range ${selectedYearRange[0]}-${selectedYearRange[1]}`);
    
    // Load points into supercluster
    superclusterRef.current.load(points);
    
    // Update clusters
    updateClusters();
  }, [events, selectedYearRange, hasMapboxConfig, onEventSelect]);

  if (!hasMapboxConfig) {
    return (
      <div className="relative w-full h-screen bg-gradient-ocean flex items-center justify-center">
        <Card className="p-8 max-w-md w-full mx-4 bg-card/95 backdrop-blur-sm border-border/50">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Loading Map Configuration</h2>
            <p className="text-muted-foreground">
              Loading Mapbox configuration from server...
            </p>
            {configError ? (
              <div className="text-destructive text-sm">
                {configError}
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
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-background/10" />
      
      {/* Loading State */}
      {isLoadingEvents && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 sm:h-12 w-8 sm:w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-xs sm:text-sm text-muted-foreground">Loading historical events...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 bg-destructive/90 text-destructive-foreground p-3 sm:p-4 rounded-lg z-10">
          <p className="font-medium text-sm">Error loading events</p>
          <p className="text-xs sm:text-sm opacity-90">{error}</p>
        </div>
      )}

      {/* Event Count Display */}
      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-card/90 backdrop-blur-sm p-2 sm:p-3 rounded-lg border border-border/50 z-10">
        <p className="text-xs sm:text-sm text-muted-foreground">
          Events for {selectedYearRange[0]}-{selectedYearRange[1]}: <span className="text-foreground font-semibold">{events.length}</span>
        </p>
      </div>
    </div>
  );
};

export default MapWithClustering;