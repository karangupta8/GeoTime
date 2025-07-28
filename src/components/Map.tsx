import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useToast } from '@/hooks/use-toast';
import { HistoryDataService } from '@/services/HistoryDataService';
import { HistoricalEvent } from '@/types/HistoricalEvent';

// Fix Leaflet's default icon issue with Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapProps {
  selectedYear: number;
  onEventSelect: (event: any) => void;
}

const Map: React.FC<MapProps> = ({ selectedYear, onEventSelect }) => {
  const [events, setEvents] = useState<HistoricalEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const historyService = HistoryDataService.getInstance();

  // Create custom icon for historical events
  const createHistoricalIcon = () => {
    return L.divIcon({
      className: 'historical-marker',
      html: `
        <div class="w-6 h-6 bg-historical-gold rounded-full border-2 border-background shadow-glow animate-glow cursor-pointer hover:scale-110 transition-transform duration-300">
          <div class="w-full h-full bg-historical-gold rounded-full animate-float"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };


  // Load historical events for the selected year
  useEffect(() => {
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
  }, [selectedYear, historyService, toast]);

  // Filter events by exact year match for better synchronization
  const filteredEvents = events.filter(event => {
    const eventYear = new Date(event.date).getFullYear();
    return eventYear === selectedYear;
  });


  return (
    <div className="relative w-full h-screen">
      <MapContainer
        center={[40, 20]}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
        className="relative z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="opacity-90"
        />
        
        {filteredEvents.map((event) => (
          <Marker
            key={event.id}
            position={[event.location.latitude, event.location.longitude]}
            icon={createHistoricalIcon()}
            eventHandlers={{
              click: () => onEventSelect(event),
            }}
          >
            <Popup className="historical-popup">
              <div className="p-2">
                <h3 className="font-semibold text-sm">{event.title}</h3>
                <p className="text-xs text-muted-foreground">{new Date(event.date).getFullYear()}</p>
                <p className="text-xs mt-1">{event.location.name}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-background/10" />
      
      {/* Loading State */}
      {isLoadingEvents && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading historical events for {selectedYear}...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute top-4 left-4 right-4 bg-destructive/90 text-destructive-foreground p-4 rounded-lg z-50">
          <p className="font-medium">Error loading events</p>
          <p className="text-sm opacity-90">{error}</p>
        </div>
      )}

      {/* Events Counter */}
      <div className="absolute top-4 right-4 bg-card/95 backdrop-blur-sm border border-border/50 rounded-lg p-3 z-40">
        <p className="text-sm font-medium text-foreground">
          {filteredEvents.length} events in {selectedYear}
        </p>
      </div>
    </div>
  );
};

export default Map;