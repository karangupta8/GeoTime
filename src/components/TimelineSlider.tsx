import React, { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

interface TimelineSliderProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
  eventCount?: number;
  onSettingsClick?: () => void;
}

const TimelineSlider: React.FC<TimelineSliderProps> = ({ selectedYear, onYearChange, eventCount = 0, onSettingsClick }) => {
  const minYear = -1000; // 1000 BCE
  const maxYear = 2025;   // 2025 CE
  const [yearRange, setYearRange] = useState<[number, number]>([selectedYear, selectedYear]);
  const [startYear, setStartYear] = useState(selectedYear.toString());
  const [endYear, setEndYear] = useState(selectedYear.toString());
  const [inputError, setInputError] = useState('');

  useEffect(() => {
    setStartYear(selectedYear.toString());
    setEndYear(selectedYear.toString());
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

  const handleInputChange = (field: 'start' | 'end', value: string) => {
    if (field === 'start') {
      setStartYear(value);
    } else {
      setEndYear(value);
    }
    setInputError('');
  };

  const handleRangeSubmit = () => {
    const start = parseInt(startYear);
    const end = parseInt(endYear);
    
    if (isNaN(start) || isNaN(end)) {
      setInputError('Please enter valid years');
      return;
    }
    
    if (start < minYear || start > maxYear || end < minYear || end > maxYear) {
      setInputError(`Years must be between ${formatYear(minYear)} and ${formatYear(maxYear)}`);
      return;
    }
    
    if (start > end) {
      setInputError('Start year must be before or equal to end year');
      return;
    }
    
    const span = end - start;
    if (span > 5) {
      setInputError('Maximum range is 5 years');
      return;
    }
    
    setYearRange([start, end]);
    onYearChange(start);
    setInputError('');
  };

  const handleKeyPress = (e: React.KeyboardEvent, field: 'start' | 'end') => {
    if (e.key === 'Enter') {
      handleRangeSubmit();
    }
  };

  return (
    <div className="h-full bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl shadow-elegant p-6">
      <div className="space-y-6 h-full flex flex-col">
        <div className="flex items-start justify-between">
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
          {onSettingsClick && (
            <Button
              onClick={onSettingsClick}
              variant="ghost"
              size="sm"
              className="mt-1"
            >
              <Settings className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Year Range (max 5 years):
          </label>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <label className="text-xs text-muted-foreground">Start Year</label>
              <Input
                type="number"
                min={minYear}
                max={maxYear}
                value={startYear}
                onChange={(e) => handleInputChange('start', e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, 'start')}
                placeholder="Start"
                className={`${inputError ? 'border-destructive' : ''}`}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">End Year</label>
              <Input
                type="number"
                min={minYear}
                max={maxYear}
                value={endYear}
                onChange={(e) => handleInputChange('end', e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, 'end')}
                placeholder="End"
                className={`${inputError ? 'border-destructive' : ''}`}
              />
            </div>
          </div>
          <Button 
            onClick={handleRangeSubmit}
            variant="outline"
            size="sm"
            className="w-full"
          >
            Apply Range
          </Button>
          {inputError && (
            <p className="text-sm text-destructive mt-2">{inputError}</p>
          )}
          <p className="text-xs text-muted-foreground mt-2">
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
              <span>Medieval</span>
              <span>Renaissance</span>
              <span>Modern</span>
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