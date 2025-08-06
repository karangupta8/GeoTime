import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Database, Loader2, RefreshCw, X } from 'lucide-react';
import { HistoryDataService } from '@/services/HistoryDataService';
import { DataSourceConfig } from '@/types/HistoricalEvent';
import { useIsMobile } from '@/hooks/use-mobile';

interface DataSourcePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onDataSourceChange: () => void;
}

const DataSourcePanel: React.FC<DataSourcePanelProps> = ({ 
  isOpen, 
  onClose, 
  onDataSourceChange 
}) => {
  const [dataSources, setDataSources] = useState<DataSourceConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const historyService = HistoryDataService.getInstance();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isOpen) {
      setDataSources(historyService.getDataSources());
    }
  }, [isOpen, historyService]);

  const handleSourceToggle = (sourceName: string, enabled: boolean) => {
    historyService.enableDataSource(sourceName, enabled);
    setDataSources(historyService.getDataSources());
    onDataSourceChange();
  };

  const handleRefreshData = async () => {
    setIsLoading(true);
    try {
      // Clear cache in the data service
      historyService.clearCache();
      
      onDataSourceChange();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSourceDescription = (sourceName: string) => {
    const descriptions = {
      'API': 'Backend API serving Wikipedia events and curated historical data with geographic coordinates'
    };
    return descriptions[sourceName as keyof typeof descriptions] || 'External data source';
  };

  const getSourceStatus = (sourceName: string) => {
    if (sourceName === 'API') {
      return 'Backend API';
    }
    return 'Unknown';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className={`${
        isMobile 
          ? 'w-full h-full max-w-none rounded-none m-0' 
          : 'w-full max-w-md'
      } bg-card/95 backdrop-blur-sm border-border/50`}>
        <CardHeader className={`space-y-3 ${isMobile ? 'pb-3' : ''}`}>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Data Sources
            </CardTitle>
            <Button 
              variant="ghost" 
              size={isMobile ? "default" : "sm"}
              onClick={onClose}
              className={isMobile ? "h-10 w-10 p-0" : "h-8 w-8 p-0"}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Configure which data sources to use for historical events
          </p>
        </CardHeader>
        
        <CardContent className={`space-y-4 ${isMobile ? 'flex-1 overflow-y-auto' : ''}`}>
          {dataSources.map((source) => (
            <div 
              key={source.name}
              className="flex items-start justify-between p-3 rounded-lg border border-border/50 bg-muted/30"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm">{source.name}</h4>
                  <Badge 
                    variant="secondary" 
                    className="text-xs"
                  >
                    {getSourceStatus(source.name)}
                  </Badge>
                  {source.priority === 1 && (
                    <Badge variant="outline" className="text-xs">
                      Primary
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {getSourceDescription(source.name)}
                </p>
              </div>
              
              <Switch
                checked={source.enabled}
                onCheckedChange={(enabled) => handleSourceToggle(source.name, enabled)}
                className="ml-3"
              />
            </div>
          ))}
          
          <div className="pt-4 border-t border-border/50 space-y-3">
            <Button 
              onClick={handleRefreshData}
              disabled={isLoading}
              className="w-full"
              variant="outline"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Refresh Data
            </Button>
            
            <div className="text-xs text-muted-foreground text-center space-y-1">
              <p>Changes take effect immediately</p>
              <p>API data is cached for 5 minutes</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataSourcePanel;