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
  onSummarizeEvent?: (event: any) => void;
}

const EventSummaryPanel: React.FC<EventSummaryPanelProps> = ({ summaries, isLoading }) => {
  if (summaries.length === 0 && !isLoading) {
    return (
      <div className="h-full bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl shadow-elegant p-3 lg:p-6">
        <div className="space-y-4 lg:space-y-6 h-full flex flex-col">
          <div className="flex items-center gap-2 mb-3 lg:mb-4">
            <Sparkles className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-semibold text-foreground">Event Summaries</h3>
          </div>
          <div className="flex-1 flex flex-col justify-center items-center text-center">
            <Sparkles className="w-12 h-12 mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Summaries Yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Click "Summarize Event" on any map marker to generate AI summaries here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl shadow-elegant p-3 lg:p-6">
      <div className="space-y-4 lg:space-y-6 h-full flex flex-col">
        <div className="flex items-center gap-2 mb-3 lg:mb-4">
          <Sparkles className="w-5 h-5 text-accent" />
          <h3 className="text-lg font-semibold text-foreground">Event Summaries</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          AI-generated insights from historical events
        </p>

        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="space-y-4 pr-4">
              {isLoading && (
                <Card className="p-4 border border-border/50 bg-card/80">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent"></div>
                    <span className="text-sm text-muted-foreground">Generating summary...</span>
                  </div>
                </Card>
              )}
              
              {summaries.map((summary, index) => (
                <Card key={summary.id} className="p-4 border border-border/50 bg-card/80 hover:bg-card/90 transition-colors">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 mt-1 text-accent flex-shrink-0" />
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
                    
                    <p className="text-sm text-foreground leading-relaxed">
                      {summary.summary}
                    </p>
                    
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>AI Summary</span>
                    </div>
                  </div>
                  
                  {index < summaries.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default EventSummaryPanel;