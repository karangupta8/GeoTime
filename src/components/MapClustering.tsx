import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import Supercluster from 'supercluster';
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

const MapWithClustering: React.FC<MapProps> = ({ selectedYear, onEventSelect }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const superclusterRef = useRef<Supercluster | null>(null);
  const [events, setEvents] = useState<HistoricalEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const historyService = HistoryDataService.getInstance();


  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map with globe projection and satellite imagery
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'satellite': {
            type: 'raster',
            tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
            tileSize: 256,
            attribution: '© Esri, Maxar, Earthstar Geographics'
          }
        },
        layers: [
          {
            id: 'satellite',
            type: 'raster',
            source: 'satellite'
          }
        ]
      },
      center: [30, 15],
      zoom: 1.5,
      pitch: 45
    } as any);

    // Add navigation controls with visual pitch
    map.current.addControl(
      new maplibregl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Disable scroll zoom for smoother globe experience
    map.current.scrollZoom.disable();

    // Add atmosphere and fog effects
    map.current.on('style.load', () => {
      console.log('MapLibre globe loaded successfully');
      // Set globe projection after style load
      if (map.current) {
        (map.current as any).setProjection('globe');
        // Add fog effects if supported
        try {
          (map.current as any).setFog({
            color: 'rgb(186, 210, 235)',
            'high-color': 'rgb(36, 92, 223)',
            'horizon-blend': 0.02,
            'space-color': 'rgb(11, 11, 25)',
            'star-intensity': 0.6
          });
        } catch (error) {
          console.log('Fog effects not supported:', error);
        }
      }
    });

    // Globe rotation variables
    const secondsPerRevolution = 240;
    const maxSpinZoom = 5;
    const slowSpinZoom = 3;
    let userInteracting = false;
    let spinEnabled = true;

    // Spin globe function
    function spinGlobe() {
      if (!map.current) return;
      const zoom = map.current.getZoom();
      if (spinEnabled && !userInteracting && zoom < maxSpinZoom) {
        let distancePerSecond = 360 / secondsPerRevolution;
        if (zoom > slowSpinZoom) {
          const zoomDif = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
          distancePerSecond *= zoomDif;
        }
        const center = map.current.getCenter();
        center.lng -= distancePerSecond;
        map.current.easeTo({ center, duration: 1000, easing: (n) => n });
      }
    }

    // Event listeners for interaction
    map.current.on('mousedown', () => {
      userInteracting = true;
    });
    
    map.current.on('dragstart', () => {
      userInteracting = true;
    });
    
    map.current.on('mouseup', () => {
      userInteracting = false;
      spinGlobe();
    });
    
    map.current.on('touchend', () => {
      userInteracting = false;
      spinGlobe();
    });

    map.current.on('moveend', () => {
      spinGlobe();
    });

    // Start the globe spinning
    spinGlobe();

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
  }, []);

  // Load historical events for the selected year
  useEffect(() => {

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
  }, [selectedYear, historyService, toast]);

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
          cluster.properties.cluster_id
        );
        
        const marker = new maplibregl.Marker(clusterMarker)
          .setLngLat([lng, lat])
          .addTo(map.current!);

        markersRef.current.push(marker);
      } else {
        // This is a single event
        const event = cluster.properties as HistoricalEvent;
        const eventMarker = createEventMarker(event);
        
        const marker = new maplibregl.Marker(eventMarker)
          .setLngLat([lng, lat])
          .addTo(map.current!);

        markersRef.current.push(marker);
      }
    });
  };

  const createClusterMarker = (pointCount: number, clusterId: number) => {
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
          center: [0, 0], // Will be set by the cluster coordinates
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
    if (!map.current || !superclusterRef.current) return;

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
  }, [events, selectedYear, onEventSelect]);


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