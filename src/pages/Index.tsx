import React, { useState, useEffect } from 'react';
import Map from '@/components/Map';
import TimelineSlider from '@/components/TimelineSlider';
import EventPopup from '@/components/EventPopup';
import Header from '@/components/Header';
import DataSourcePanel from '@/components/DataSourcePanel';
import { HistoryDataService } from '@/services/HistoryDataService';

const Index = () => {
  const [selectedYear, setSelectedYear] = useState<number>(1969);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const [isDataSourcePanelOpen, setIsDataSourcePanelOpen] = useState<boolean>(false);
  const [dataSourceVersion, setDataSourceVersion] = useState<number>(0);
  const [eventCount, setEventCount] = useState<number>(0);
  const historyService = HistoryDataService.getInstance();

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

  return (
    <div className="min-h-screen relative bg-gradient-ocean">
      <Header onSettingsClick={() => setIsDataSourcePanelOpen(true)} />
      
      {/* Map Container */}
      <div className="relative w-full h-screen">
        <Map 
          selectedYear={selectedYear} 
          onEventSelect={handleEventSelect}
          key={dataSourceVersion} // Force re-render when data sources change
        />
        
        {/* Timeline Overlay */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-5xl px-6">
          <TimelineSlider 
            selectedYear={selectedYear}
            onYearChange={handleYearChange}
            eventCount={eventCount}
          />
        </div>
      </div>

      {/* Event Popup */}
      <EventPopup 
        event={selectedEvent}
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
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
