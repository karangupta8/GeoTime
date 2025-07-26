import React from 'react';
import { Slider } from '@/components/ui/slider';

interface TimelineSliderProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
}

const TimelineSlider: React.FC<TimelineSliderProps> = ({ selectedYear, onYearChange }) => {
  const minYear = 1000;
  const maxYear = 2024;

  const handleValueChange = (values: number[]) => {
    onYearChange(values[0]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl shadow-elegant">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            Historical Timeline
          </h2>
          <div className="text-2xl font-bold text-accent">
            {selectedYear} CE
          </div>
        </div>
        
        <div className="relative">
          <Slider
            value={[selectedYear]}
            onValueChange={handleValueChange}
            min={minYear}
            max={maxYear}
            step={1}
            className="w-full"
          />
          
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>{minYear} CE</span>
            <span>Medieval</span>
            <span>Renaissance</span>
            <span>Industrial</span>
            <span>Modern</span>
            <span>{maxYear} CE</span>
          </div>
        </div>
        
        <div className="text-center text-sm text-muted-foreground">
          Drag the slider to explore historical events through time
        </div>
      </div>
    </div>
  );
};

export default TimelineSlider;