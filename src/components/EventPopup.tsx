import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, ExternalLink, Verified, Sparkles } from 'lucide-react';
import { HistoricalEvent } from '@/types/HistoricalEvent';

interface EventPopupProps {
  event: HistoricalEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSummarizeEvent?: (event: HistoricalEvent) => void;
}

const EventPopup: React.FC<EventPopupProps> = ({ event, isOpen, onClose, onSummarizeEvent }) => {
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
      'Cultural': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'War': 'bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100',
      'Economic': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Historical': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
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
            <div className="flex items-center gap-2">
              <Badge className={getCategoryColor(event.category)}>
                {event.category}
              </Badge>
              {event.verified && (
                <div className="flex items-center gap-1 text-xs text-accent">
                  <Verified className="w-3 h-3" />
                  <span>Verified</span>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 mt-1 text-accent" />
            <div className="text-sm text-muted-foreground">
              <div>{event.location.name}</div>
              <div className="text-xs">
                {event.location.latitude.toFixed(4)}°N, {event.location.longitude.toFixed(4)}°E
              </div>
            </div>
          </div>
          
          {event.images && event.images.length > 0 && (
            <div className="flex gap-2">
              {event.images.slice(0, 2).map((image, index) => (
                <img 
                  key={index}
                  src={image} 
                  alt={`${event.title} image ${index + 1}`}
                  className="w-20 h-20 object-cover rounded border border-border/50"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ))}
            </div>
          )}
          
          <p className="text-foreground leading-relaxed">
            {event.description}
          </p>
          
          {event.sources && event.sources.length > 0 && (
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Sources: </span>
              {event.sources.join(', ')}
            </div>
          )}
          
          <div className="pt-4 border-t border-border/50 space-y-3">
            {onSummarizeEvent && (
              <DialogClose asChild>
                <Button 
                  variant="outline"
                  className="w-full border-accent/50 text-accent hover:bg-accent/10"
                  onClick={() => onSummarizeEvent(event)}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Summarize Event
                </Button>
              </DialogClose>
            )}
            
            <Button 
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={() => {
                const url = event.wikipediaUrl || `https://en.wikipedia.org/wiki/${encodeURIComponent(event.title)}`;
                window.open(url, '_blank');
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