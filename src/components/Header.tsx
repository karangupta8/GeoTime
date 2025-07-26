import React from 'react';
import { Globe2, Clock, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onSettingsClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSettingsClick }) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-10 p-6">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-background">
            <Globe2 className="w-8 h-8 text-historical-gold animate-spin-slow" />
            <div>
              <h1 className="text-2xl font-bold">HistoryMap</h1>
              <p className="text-sm opacity-90">Explore the past through space and time</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-background/80">
            <Clock className="w-5 h-5" />
            <span className="text-sm">Interactive Historical Timeline</span>
          </div>
          
          <Button
            onClick={onSettingsClick}
            variant="ghost"
            size="sm"
            className="bg-background/10 backdrop-blur-sm border border-white/20 text-background hover:bg-white/20"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;