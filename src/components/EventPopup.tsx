import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, ExternalLink } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  date: string;
  location: [number, number];
  description: string;
  category: string;
}

interface EventPopupProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

const EventPopup: React.FC<EventPopupProps> = ({ event, isOpen, onClose }) => {
  if (!event) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Political': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Science': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Disaster': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'Legal': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Cultural': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full mx-4 bg-card/95 backdrop-blur-sm border-border/50">
        <DialogHeader className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <DialogTitle className="text-xl font-bold text-foreground pr-8">
              {event.title}
            </DialogTitle>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(event.date)}</span>
            </div>
            <Badge className={getCategoryColor(event.category)}>
              {event.category}
            </Badge>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 mt-1 text-accent" />
            <span className="text-sm text-muted-foreground">
              Coordinates: {event.location[1].toFixed(4)}°N, {event.location[0].toFixed(4)}°E
            </span>
          </div>
          
          <p className="text-foreground leading-relaxed">
            {event.description}
          </p>
          
          <div className="pt-4 border-t border-border/50">
            <Button 
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={() => {
                // In a real implementation, this would link to the actual Wikipedia article
                window.open(`https://en.wikipedia.org/wiki/${encodeURIComponent(event.title)}`, '_blank');
              }}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Read Full Article
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground text-center">
            Historical data sourced from Wikipedia and educational databases
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventPopup;