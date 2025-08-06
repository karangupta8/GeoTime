import React, { useState, useEffect } from 'react';
import MapWithClustering from '@/components/MapClustering';
import TimelineSlider from '@/components/TimelineSlider';
import EventPopup from '@/components/EventPopup';
import TimelineWithSummary from '@/components/TimelineWithSummary'; // ✅ Make sure the path is correct
import Header from '@/components/Header';
import { HistoryDataService } from '@/services/HistoryDataService';
import SummaryService, { EventSummary } from '@/services/SummaryService';
import { HistoricalEvent } from '@/types/HistoricalEvent';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { DEFAULT_YEAR_RANGE } from '@/constants/defaults';

const Index = () => {
  const [selectedYear, setSelectedYear] = useState<number>(1941);
  const [selectedYearRange, setSelectedYearRange] = useState<[number, number]>(DEFAULT_YEAR_RANGE);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const [dataSourceVersion, setDataSourceVersion] = useState<number>(0);
  const [eventCount, setEventCount] = useState<number>(0);
  const [eventSummaries, setEventSummaries] = useState<EventSummary[]>([]);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState<boolean>(false);
  const [mobileActivePanel, setMobileActivePanel] = useState<'timeline' | 'map'>('timeline');
  const historyService = HistoryDataService.getInstance();
  const summaryService = SummaryService.getInstance();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleEventSelect = (event: any) => {
    setSelectedEvent(event);
    setIsPopupOpen(true);
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    setSelectedYearRange([year, year]);
  };

  const handleYearRangeChange = (yearRange: [number, number]) => {
    setSelectedYearRange(yearRange);
    setSelectedYear(yearRange[0]); // Keep backward compatibility
  };

  // Load event count for the selected year range
  useEffect(() => {
    const loadEventCount = async () => {
      try {
        const events = await historyService.getHistoricalEvents(selectedYearRange);
        setEventCount(events.length);
      } catch (error) {
        console.error('Error loading event count:', error);
        setEventCount(0);
      }
    };

    loadEventCount();
  }, [selectedYearRange, historyService, dataSourceVersion]);

  const handleDataSourceChange = () => {
    setDataSourceVersion(prev => prev + 1);
  };

  const handleSummarizeEvent = async (event: HistoricalEvent) => {
    // Check if summary already exists
    const existingSummary = eventSummaries.find(s => s.id === event.id);
    if (existingSummary) {
      toast({
        title: "Summary Already Generated",
        description: "This event has already been summarized.",
      });
      return;
    }

    setIsGeneratingSummary(true);
    
    try {
      const summary = await summaryService.generateSummary(event);
      setEventSummaries(prev => [summary, ...prev]);
      
      toast({
        title: "Summary Generated",
        description: "AI summary has been added to the panel.",
      });
    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
        title: "Summary Failed",
        description: "Unable to generate summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-ocean">
      <Header 
        isMobile={isMobile}
        mobileActivePanel={mobileActivePanel}
        onMobilePanelChange={setMobileActivePanel}
      />
      
      {/* Mobile Layout - Single Panel with Tabs */}
      {isMobile ? (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
          {/* Mobile Panel Toggle */}
          <div className="bg-card/90 backdrop-blur-sm border-b border-border/20 p-2">
            <div className="flex rounded-lg bg-muted/50 p-1">
              <button
                onClick={() => setMobileActivePanel('timeline')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  mobileActivePanel === 'timeline'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Timeline
              </button>
              <button
                onClick={() => setMobileActivePanel('map')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  mobileActivePanel === 'map'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Map
              </button>
            </div>
          </div>

          {/* Mobile Panel Content */}
          <div className="flex-1 overflow-hidden">
            {mobileActivePanel === 'timeline' ? (
              <div className="h-full overflow-y-auto p-2">
                <TimelineWithSummary
                  selectedYear={selectedYear}
                  onYearChange={handleYearChange}
                  onYearRangeChange={handleYearRangeChange}
                  eventCount={eventCount}
                  summaries={eventSummaries}
                  onSummarizeEvent={handleSummarizeEvent}
                  isGeneratingSummary={isGeneratingSummary}
                />
              </div>
            ) : (
              <div className="h-full">
                <MapWithClustering
                  selectedYearRange={selectedYearRange}
                  onEventSelect={handleEventSelect}
                  dataSourceVersion={dataSourceVersion}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Desktop Layout - Side by Side Panels */
        <div className="flex flex-row h-[calc(100vh-4rem)]">
          {/* Left Panel: Combined Timeline + Summary */}
          <div className="w-96 flex-shrink-0 p-6 border-r border-border/20 overflow-y-auto">
            <TimelineWithSummary
              selectedYear={selectedYear}
              onYearChange={handleYearChange}
              onYearRangeChange={handleYearRangeChange}
              eventCount={eventCount}
              summaries={eventSummaries}
              onSummarizeEvent={handleSummarizeEvent}
              isGeneratingSummary={isGeneratingSummary}
            />
          </div>

          {/* Right Panel: Map */}
          <div className="flex-1 relative">
            <MapWithClustering
              selectedYearRange={selectedYearRange}
              onEventSelect={handleEventSelect}
              dataSourceVersion={dataSourceVersion}
            />
          </div>
        </div>
      )}

      {/* Event Popup */}
      <EventPopup 
        event={selectedEvent}
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onSummarizeEvent={handleSummarizeEvent}
      />
    </div>
  );
};

export default Index;
