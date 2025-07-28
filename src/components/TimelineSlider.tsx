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
  const minYear = 1000;
  const maxYear = 2024;
  const [inputYear, setInputYear] = useState(selectedYear.toString());
  const [inputError, setInputError] = useState('');

  useEffect(() => {
    setInputYear(selectedYear.toString());
    setInputError('');
  }, [selectedYear]);

  const handleValueChange = (values: number[]) => {
    onYearChange(values[0]);
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
      setInputError(`Year must be between ${minYear} and ${maxYear}`);
      return;
    }
    onYearChange(year);
    setInputError('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleInputSubmit();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl shadow-elegant">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            Historical Timeline
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {eventCount} event{eventCount !== 1 ? 's' : ''} found
            </div>
            <div className="text-2xl font-bold text-accent">
              {selectedYear} CE
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex-1">
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
                placeholder={`${minYear}-${maxYear}`}
                className={`w-32 ${inputError ? 'border-destructive' : ''}`}
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