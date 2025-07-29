import React, { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface TimelineSliderProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
  eventCount?: number;
}

const TimelineSlider: React.FC<TimelineSliderProps> = ({ selectedYear, onYearChange, eventCount = 0 }) => {
  const minYear = -1000; // 1000 BCE
  const maxYear = 1000;  // 1000 CE
  const [yearRange, setYearRange] = useState<[number, number]>([selectedYear, selectedYear]);
  const [inputYear, setInputYear] = useState(selectedYear.toString());
  const [inputError, setInputError] = useState('');

  useEffect(() => {
    setInputYear(selectedYear.toString());
    setYearRange([selectedYear, selectedYear]);
    setInputError('');
  }, [selectedYear]);

  const formatYear = (year: number): string => {
    if (year < 0) {
      return `${Math.abs(year)} BCE`;
    }
    return `${year} CE`;
  };

  const handleValueChange = (values: number[]) => {
    const [start, end] = values;
    const span = end - start;
    
    // Limit to maximum 5 year span
    if (span > 5) {
      return;
    }
    
    setYearRange([start, end]);
    // For now, use the start year as the selected year
    onYearChange(start);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputYear(value);
    setInputError('');
  };

  const handleInputSubmit = () => {
    const year = parseInt(inputYear);
    if (isNaN(year)) {
      setInputError('Please enter a valid year');
      return;
    }
    if (year < minYear || year > maxYear) {
      setInputError(`Year must be between ${formatYear(minYear)} and ${formatYear(maxYear)}`);
      return;
    }
    onYearChange(year);
    setYearRange([year, year]);
    setInputError('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleInputSubmit();
    }
  };

  return (
    <div className="h-full bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl shadow-elegant p-6">
      <div className="space-y-6 h-full flex flex-col">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Historical Timeline
          </h2>
          <div className="text-sm text-muted-foreground">
            {eventCount} event{eventCount !== 1 ? 's' : ''} found
          </div>
          <div className="text-2xl font-bold text-accent mt-2">
            {yearRange[0] === yearRange[1] 
              ? formatYear(yearRange[0])
              : `${formatYear(yearRange[0])} - ${formatYear(yearRange[1])}`
            }
          </div>
        </div>
        
        <div>
          <label htmlFor="year-input" className="text-sm font-medium text-foreground mb-2 block">
            Enter Year:
          </label>
          <div className="flex gap-2">
            <Input
              id="year-input"
              type="number"
              min={minYear}
              max={maxYear}
              value={inputYear}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={`${minYear} to ${maxYear}`}
              className={`flex-1 ${inputError ? 'border-destructive' : ''}`}
            />
            <Button 
              onClick={handleInputSubmit}
              variant="outline"
              size="sm"
            >
              Go
            </Button>
          </div>
          {inputError && (
            <p className="text-sm text-destructive mt-1">{inputError}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Use negative numbers for BCE (e.g., -500 for 500 BCE)
          </p>
        </div>
        
        <div className="flex-1 flex flex-col justify-center">
          <div className="relative">
            <label className="text-sm font-medium text-foreground mb-3 block">
              Year Range (max 5 years):
            </label>
            <Slider
              value={yearRange}
              onValueChange={handleValueChange}
              min={minYear}
              max={maxYear}
              step={1}
              className="w-full"
              minStepsBetweenThumbs={0}
            />
            
            <div className="flex justify-between mt-3 text-xs text-muted-foreground">
              <span>{formatYear(minYear)}</span>
              <span>Classical</span>
              <span>Late Antiquity</span>
              <span>Early Medieval</span>
              <span>{formatYear(maxYear)}</span>
            </div>
          </div>
          
          <div className="text-center text-sm text-muted-foreground mt-6">
            Drag to select a year or range. Hold and drag both handles to select a time span.
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineSlider;