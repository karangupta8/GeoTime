import React, { useState, useEffect } from 'react';
import MapWithClustering from '@/components/MapClustering';
import TimelineSlider from '@/components/TimelineSlider';
import EventPopup from '@/components/EventPopup';
import EventSummaryPanel from '@/components/EventSummaryPanel';
import Header from '@/components/Header';
import DataSourcePanel from '@/components/DataSourcePanel';
import { HistoryDataService } from '@/services/HistoryDataService';
import SummaryService, { EventSummary } from '@/services/SummaryService';
import { HistoricalEvent } from '@/types/HistoricalEvent';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [selectedYear, setSelectedYear] = useState<number>(1969);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const [isDataSourcePanelOpen, setIsDataSourcePanelOpen] = useState<boolean>(false);
  const [dataSourceVersion, setDataSourceVersion] = useState<number>(0);
  const [eventCount, setEventCount] = useState<number>(0);
  const [eventSummaries, setEventSummaries] = useState<EventSummary[]>([]);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState<boolean>(false);
  const historyService = HistoryDataService.getInstance();
  const summaryService = SummaryService.getInstance();
  const { toast } = useToast();

  const handleEventSelect = (event: any) => {
    setSelectedEvent(event);
    setIsPopupOpen(true);
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  // Load event count for the selected year
  useEffect(() => {
    const loadEventCount = async () => {
      try {
        const events = await historyService.getHistoricalEvents(selectedYear);
        setEventCount(events.length);
      } catch (error) {
        console.error('Error loading event count:', error);
        setEventCount(0);
      }
    };

    loadEventCount();
  }, [selectedYear, historyService, dataSourceVersion]);

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
      <Header onSettingsClick={() => setIsDataSourcePanelOpen(true)} />
      
      {/* Main Layout - Three panel layout: Summary, Timeline, Map */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Summary Panel */}
        <EventSummaryPanel 
          summaries={eventSummaries}
          isLoading={isGeneratingSummary}
        />

        {/* Middle Timeline Pane */}
        <div className="w-96 flex-shrink-0 p-6 border-r border-border/20">
          <TimelineSlider 
            selectedYear={selectedYear}
            onYearChange={handleYearChange}
            eventCount={eventCount}
            onSettingsClick={() => setIsDataSourcePanelOpen(true)}
          />
        </div>

        {/* Right Map Container */}
        <div className="flex-1 relative">
          <MapWithClustering 
            selectedYear={selectedYear} 
            onEventSelect={handleEventSelect}
            key={dataSourceVersion} // Force re-render when data sources change
          />
        </div>
      </div>

      {/* Event Popup */}
      <EventPopup 
        event={selectedEvent}
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onSummarizeEvent={handleSummarizeEvent}
      />

      {/* Data Source Panel */}
      <DataSourcePanel
        isOpen={isDataSourcePanelOpen}
        onClose={() => setIsDataSourcePanelOpen(false)}
        onDataSourceChange={handleDataSourceChange}
      />
    </div>
  );
};

export default Index;
