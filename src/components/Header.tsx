import React from 'react';
import { Globe2 } from 'lucide-react';

interface HeaderProps {
  onSettingsClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSettingsClick }) => {
  return (
    <header className="absolute top-0 left-0 lg:left-96 right-0 z-10 p-4 lg:p-6">
      <div className="flex items-center justify-start">
        <div className="flex items-center gap-2 text-background">
          <Globe2 className="w-6 lg:w-8 h-6 lg:h-8 text-historical-gold animate-spin-slow" />
          <div>
            <h1 className="text-lg lg:text-2xl font-bold">HistoryMap</h1>
            <p className="text-xs lg:text-sm opacity-90 hidden sm:block">Explore the past through space and time</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;