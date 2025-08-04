import React, { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { DEFAULT_YEAR_RANGE } from '@/constants/defaults';

interface TimelineSliderProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
  onYearRangeChange?: (yearRange: [number, number]) => void; // Add this prop
  eventCount?: number;
  onSettingsClick?: () => void;
}

const TimelineSlider: React.FC<TimelineSliderProps> = ({ 
  selectedYear, 
  onYearChange, 
  onYearRangeChange, // Add this prop
  eventCount = 0, 
  onSettingsClick 
}) => {
  const minYear = -1000; // 1000 BCE
  const maxYear = 2025;   // 2025 CE
  const [yearRange, setYearRange] = useState<[number, number]>(DEFAULT_YEAR_RANGE);
  const [startYear, setStartYear] = useState(DEFAULT_YEAR_RANGE[0].toString());
  const [endYear, setEndYear] = useState(DEFAULT_YEAR_RANGE[1].toString());
  const [inputError, setInputError] = useState('');

  useEffect(() => {
    // Only update if the selectedYear is different from our current range
    if (selectedYear !== yearRange[0]) {
      setStartYear(selectedYear.toString());
      setEndYear(selectedYear.toString());
      setYearRange([selectedYear, selectedYear]);
      setInputError('');
    }
  }, [selectedYear, yearRange]);

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
    
    // Call both callbacks for backward compatibility
    onYearChange(start);
    if (onYearRangeChange) {
      onYearRangeChange([start, end]);
    }
  };

  const handleInputChange = (field: 'start' | 'end', value: string) => {
    if (field === 'start') {
      setStartYear(value);
    } else {
      setEndYear(value);
    }
    setInputError('');
  };

  const handleStartYearBlur = () => {
    const start = parseInt(startYear);
    if (!isNaN(start)) {
      const newEnd = Math.min(start + 4, maxYear);
      setEndYear(newEnd.toString());
      setInputError('');
    }
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
    if (onYearRangeChange) {
      onYearRangeChange([start, end]);
    }
    setInputError('');
  };

  const handleKeyPress = (e: React.KeyboardEvent, field: 'start' | 'end') => {
    if (e.key === 'Enter') {
      handleRangeSubmit();
    }
  };

  return (
    <div className="h-full bg-transparent p-3 sm:p-4 lg:p-6">
      <div className="space-y-3 sm:space-y-4 lg:space-y-6 h-full flex flex-col">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-1 sm:mb-2">
              Historical Timeline
            </h2>
            <div className="text-xs sm:text-sm text-muted-foreground">
              {eventCount} event{eventCount !== 1 ? 's' : ''} found
            </div>
            <div className="text-xl sm:text-2xl font-bold text-accent mt-1 sm:mt-2 leading-tight">
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
              className="mt-1 flex-shrink-0"
            >
              <Settings className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        <div className="lg:block hidden">
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
                onBlur={handleStartYearBlur}
                placeholder="Start"
                className={`text-sm ${inputError ? 'border-destructive' : ''}`}
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
                className={`text-sm ${inputError ? 'border-destructive' : ''}`}
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
        
        <div className="flex-1 flex flex-col justify-center min-h-0">
          <div className="relative">
            <label className="text-xs sm:text-sm font-medium text-foreground mb-2 sm:mb-3 block">
              Year Range (max 5 years):
            </label>
            <div className="px-2 sm:px-0">
              <Slider
                value={yearRange}
                onValueChange={handleValueChange}
                min={minYear}
                max={maxYear}
                step={1}
                className="w-full touch-none"
                minStepsBetweenThumbs={0}
              />
            </div>
            
            <div className="flex justify-between mt-2 sm:mt-3 text-xs text-muted-foreground px-2 sm:px-0">
              <span className="text-[10px] sm:text-xs">{formatYear(minYear)}</span>
              <span className="text-[10px] sm:text-xs">{formatYear(maxYear)}</span>
            </div>
          </div>
          
          <div className="text-center text-xs sm:text-sm text-muted-foreground mt-3 sm:mt-6 hidden sm:block">
            Drag to select a year or range.
          </div>
          <div className="text-center text-xs text-muted-foreground mt-2 block sm:hidden">
            Drag to select range.
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineSlider;