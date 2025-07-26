import React, { useState } from 'react';
import Map from '@/components/Map';
import TimelineSlider from '@/components/TimelineSlider';
import EventPopup from '@/components/EventPopup';
import Header from '@/components/Header';

const Index = () => {
  const [selectedYear, setSelectedYear] = useState<number>(1969);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);

  const handleEventSelect = (event: any) => {
    setSelectedEvent(event);
    setIsPopupOpen(true);
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  return (
    <div className="min-h-screen relative bg-gradient-ocean">
      <Header />
      
      {/* Map Container */}
      <div className="relative w-full h-screen">
        <Map 
          selectedYear={selectedYear} 
          onEventSelect={handleEventSelect}
        />
        
        {/* Timeline Overlay */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-5xl px-6">
          <TimelineSlider 
            selectedYear={selectedYear}
            onYearChange={handleYearChange}
          />
        </div>
      </div>

      {/* Event Popup */}
      <EventPopup 
        event={selectedEvent}
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
      />
    </div>
  );
};

export default Index;
