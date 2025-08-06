import React from 'react';
import { Globe2 } from 'lucide-react';

interface HeaderProps {
  isMobile?: boolean;
  mobileActivePanel?: 'timeline' | 'map';
  onMobilePanelChange?: (panel: 'timeline' | 'map') => void;
}

const Header: React.FC<HeaderProps> = ({ 
  isMobile = false,
  mobileActivePanel,
  onMobilePanelChange
}) => {
  return (
    <header className={`relative z-10 bg-card/90 backdrop-blur-sm border-b border-border/20 ${
      isMobile ? 'p-3' : 'p-4 lg:p-6'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe2 className={`text-historical-gold animate-spin-slow ${
            isMobile ? 'w-5 h-5' : 'w-6 lg:w-8 h-6 lg:h-8'
          }`} />
          <div>
            <h1 className={`font-bold text-foreground ${
              isMobile ? 'text-lg' : 'text-lg lg:text-2xl'
            }`}>
              HistoryMap
            </h1>
            {!isMobile && (
              <p className="text-xs lg:text-sm opacity-90 text-muted-foreground hidden sm:block">
                Explore the past through space and time
              </p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;