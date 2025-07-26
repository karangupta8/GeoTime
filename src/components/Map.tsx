import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

// For demo purposes - would be replaced with Wikipedia integration
const historicalEvents = [
  {
    id: 1,
    title: "Fall of the Berlin Wall",
    date: "1989-11-09",
    location: [13.3777, 52.5163], // Berlin
    description: "The Berlin Wall, a symbol of the Cold War division, was torn down by East and West Berliners, marking the beginning of German reunification.",
    category: "Political"
  },
  {
    id: 2,
    title: "Moon Landing",
    date: "1969-07-20",
    location: [-95.369, 29.7604], // Houston (Mission Control)
    description: "Neil Armstrong and Buzz Aldrin became the first humans to land on the Moon during the Apollo 11 mission.",
    category: "Science"
  },
  {
    id: 3,
    title: "Great Fire of London",
    date: "1666-09-02",
    location: [-0.0955, 51.5122], // London
    description: "A major conflagration that swept through the medieval City of London, destroying 13,200 houses and 87 churches.",
    category: "Disaster"
  },
  {
    id: 4,
    title: "French Revolution Begins",
    date: "1789-07-14",
    location: [2.3764, 48.8534], // Paris
    description: "The storming of the Bastille marked the beginning of the French Revolution, fundamentally changing French society.",
    category: "Political"
  },
  {
    id: 5,
    title: "Magna Carta Signed",
    date: "1215-06-15",
    location: [-0.5544, 51.4434], // Runnymede
    description: "King John of England signed the Magna Carta, establishing the principle that everyone, including the king, was subject to the law.",
    category: "Legal"
  }
];

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
  const { toast } = useToast();

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

  // Update markers based on selected year
  useEffect(() => {
    if (!map.current || !hasApiKey) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Filter events by year
    const filteredEvents = historicalEvents.filter(event => {
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
        .setLngLat(event.location as [number, number])
        .addTo(map.current!);

      // Add click event
      markerElement.addEventListener('click', () => {
        onEventSelect(event);
      });

      markersRef.current.push(marker);
    });
  }, [selectedYear, hasApiKey, onEventSelect]);

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
    </div>
  );
};

export default Map;