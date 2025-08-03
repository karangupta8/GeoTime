import React from 'react';
import TimelineSlider from './TimelineSlider';
import EventSummaryPanel from './EventSummaryPanel';

interface EventSummary {
  id: string;
  title: string;
  date: string;
  summary: string;
  timestamp: number;
}

interface TimelineWithSummaryProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
  onYearRangeChange?: (yearRange: [number, number]) => void; // Add this prop
  eventCount?: number;
  onSettingsClick?: () => void;
  summaries: EventSummary[];
  onSummarizeEvent?: (event: any) => void; // Add this prop
  isGeneratingSummary?: boolean; // Add this prop
}

const TimelineWithSummary: React.FC<TimelineWithSummaryProps> = ({
  selectedYear,
  onYearChange,
  onYearRangeChange, // Add this prop
  eventCount = 0,
  onSettingsClick,
  summaries,
  onSummarizeEvent, // Add this prop
  isGeneratingSummary = false // Add this prop
}) => {
  return (
    <div className="flex flex-col space-y-4 lg:space-y-6 w-full px-2 lg:px-4 py-4 lg:py-6">
      {/* Timeline Panel - keep original card styling */}
      <div className="rounded-2xl border border-border/50 bg-card/95 backdrop-blur-sm shadow-elegant">
        <TimelineSlider
          selectedYear={selectedYear}
          onYearChange={onYearChange}
          onYearRangeChange={onYearRangeChange} // Pass the prop
          eventCount={eventCount}
          onSettingsClick={onSettingsClick}
        />
      </div>

      {/* Summary Panel - styled as card */}
      <div className="rounded-2xl border border-border/50 bg-card/95 backdrop-blur-sm shadow-elegant">
        <EventSummaryPanel 
          summaries={summaries} 
          isLoading={isGeneratingSummary} 
          onSummarizeEvent={onSummarizeEvent} // Pass the prop
        />
      </div>
    </div>
  );
};

export default TimelineWithSummary;
