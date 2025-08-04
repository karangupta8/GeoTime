import React from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sparkles, Calendar } from 'lucide-react';

interface EventSummary {
  id: string;
  title: string;
  date: string;
  summary: string;
  timestamp: number;
}

interface EventSummaryPanelProps {
  summaries: EventSummary[];
  isLoading: boolean;
}

const EventSummaryPanel: React.FC<EventSummaryPanelProps> = ({ summaries, isLoading }) => {
  if (summaries.length === 0 && !isLoading) {
    return (
      <div className="w-full border-border/20 bg-transparent h-full flex flex-col">
        <div className="p-3 sm:p-4 border-b border-border/20 flex-shrink-0">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <Sparkles className="w-4 sm:w-5 h-4 sm:h-5 text-accent" />
            <h3 className="text-base sm:text-lg font-semibold text-foreground">Event Summaries</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            AI-generated insights from historical events
          </p>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <Sparkles className="w-8 sm:w-12 h-8 sm:h-12 mx-auto mb-3 sm:mb-4 text-muted-foreground/50" />
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xs">
              Click "Summarize Event" on any map marker to generate AI summaries here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full border-border/20 bg-transparent h-full flex flex-col">
      <div className="p-3 sm:p-4 border-b border-border/20 flex-shrink-0">
        <div className="flex items-center gap-2 mb-1 sm:mb-2">
          <Sparkles className="w-4 sm:w-5 h-4 sm:h-5 text-accent" />
          <h3 className="text-base sm:text-lg font-semibold text-foreground">Event Summaries</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          AI-generated insights from historical events
        </p>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-2 sm:p-4 space-y-2 sm:space-y-4">
          {isLoading && (
            <Card className="p-4 border border-border/50 bg-card/80">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent"></div>
                <span className="text-sm text-muted-foreground">Generating summary...</span>
              </div>
            </Card>
          )}
          
          {summaries.map((summary, index) => (
            <Card key={summary.id} className="p-3 sm:p-4 border border-border/50 bg-card/80 hover:bg-card/90 transition-colors">
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 mt-0.5 text-accent flex-shrink-0" />
                  <div className="min-w-0">
                    <h4 className="font-medium text-foreground text-sm leading-tight">
                      {summary.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(summary.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
                
                <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                  {summary.summary}
                </p>
                
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>AI Summary</span>
                </div>
              </div>
              
              {index < summaries.length - 1 && (
                <Separator className="mt-3 sm:mt-4" />
              )}
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default EventSummaryPanel;