import React from 'react';
import { Video, Trash2, RotateCcw, X, Eye, Download, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QueueItem } from '@/types/video-preset';

interface VideoQueueComponentProps {
  queue: QueueItem[];
  isProcessing: boolean;
  currentItem: string | null;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
  onClear: () => void;
  onPreview?: (name: string, url: string) => void;
  onDownload?: (name: string, url: string) => void;
}

export const VideoQueueComponent: React.FC<VideoQueueComponentProps> = ({
  queue,
  isProcessing,
  currentItem,
  onRemove,
  onRetry,
  onClear,
  onPreview,
  onDownload
}) => {
  const getStatusVariant = (status: QueueItem['status']) => {
    switch (status) {
      case 'waiting':
        return 'secondary';
      case 'processing':
        return 'default';
      case 'completed':
        return 'default';
      case 'error':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusColor = (status: QueueItem['status']) => {
    switch (status) {
      case 'waiting':
        return 'text-muted-foreground';
      case 'processing':
        return 'text-blue-600';
      case 'completed':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  if (queue.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No videos in processing queue</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Processing Queue ({queue.length})</h3>
        {queue.length > 0 && (
          <Button variant="outline" size="sm" onClick={onClear}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>
      
      <div className="space-y-3">
        {queue.map((item) => (
          <div 
            key={item.id} 
            className={`border rounded-lg p-4 space-y-3 transition-all ${
              currentItem === item.id ? 'border-primary bg-primary/5' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Video className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">{item.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(item.fileSize)}
                    {item.numCopies && ` • ${item.numCopies} variations`}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={getStatusVariant(item.status)}
                  className={getStatusColor(item.status)}
                >
                  {item.status}
                </Badge>
                
                {item.status === 'error' && (
                  <Button size="sm" variant="outline" onClick={() => onRetry(item.id)}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                )}
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => onRemove(item.id)}
                  disabled={item.status === 'processing'}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {item.status === 'processing' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing...</span>
                  <span>{Math.round(item.progress)}%</span>
                </div>
                <Progress value={item.progress} className="w-full" />
              </div>
            )}
            
            {item.error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{item.error}</AlertDescription>
              </Alert>
            )}
            
            {item.results && item.results.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-green-600">
                  Completed: {item.results.length} variations generated
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {item.results.map((result, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm"
                    >
                      <span className="truncate pr-2" title={result.name}>
                        {result.name}
                      </span>
                      <div className="flex space-x-1 flex-shrink-0">
                        {onPreview && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => onPreview(result.name, result.url)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        )}
                        {onDownload && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => onDownload(result.name, result.url)}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};