import React, { useState, useEffect } from 'react';
import { Eye, Download, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { VideoProcessingResult } from '@/types/video-preset';

interface VideoCardProps {
  result: VideoProcessingResult;
  onPreview: (name: string, url: string) => void;
  onDownload: (name: string, url: string) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ 
  result, 
  onPreview, 
  onDownload 
}) => {
  const [thumbnail, setThumbnail] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Generate thumbnail from video
    const generateThumbnail = async () => {
      try {
        const video = document.createElement('video');
        video.crossOrigin = 'anonymous';
        video.currentTime = 1; // Capture at 1 second
        
        video.onloadeddata = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          if (ctx) {
            ctx.drawImage(video, 0, 0);
            const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.7);
            setThumbnail(thumbnailUrl);
          }
          setLoading(false);
        };
        
        video.onerror = () => {
          setLoading(false);
        };
        
        video.src = result.url;
      } catch (error) {
        console.error('Error generating thumbnail:', error);
        setLoading(false);
      }
    };

    generateThumbnail();
  }, [result.url]);

  const getEffectsApplied = () => {
    if (!result.processingDetails) return [];
    
    const effects = [];
    const details = result.processingDetails;
    
    if (details.videoBitrate) effects.push(`${details.videoBitrate}k bitrate`);
    if (details.saturation && details.saturation !== 1) effects.push('Color adjusted');
    if (details.speed && details.speed !== 1) effects.push(`${details.speed}x speed`);
    if (details.flipHorizontal) effects.push('Flipped');
    if (details.zoom && details.zoom !== 1) effects.push('Zoomed');
    if (details.rotation && details.rotation !== 0) effects.push('Rotated');
    
    return effects;
  };

  return (
    <div className="group relative overflow-hidden rounded-lg border bg-card hover:shadow-lg transition-all duration-300">
      <div className="aspect-video relative">
        {loading ? (
          <Skeleton className="w-full h-full" />
        ) : thumbnail ? (
          <img 
            src={thumbnail} 
            alt={result.name}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Video className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
        
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              onClick={() => onPreview(result.name, result.url)}
              className="bg-white/90 text-black hover:bg-white"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={() => onDownload(result.name, result.url)}
              className="bg-white/90 text-black hover:bg-white"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <h4 className="font-medium truncate mb-2" title={result.name}>
          {result.name}
        </h4>
        
        {result.processingDetails && (
          <div className="text-xs text-muted-foreground space-y-1 mb-3">
            {result.processingDetails.videoBitrate && (
              <div>Quality: {result.processingDetails.videoBitrate}k</div>
            )}
            {getEffectsApplied().length > 0 && (
              <div>Effects: {getEffectsApplied().slice(0, 2).join(', ')}
                {getEffectsApplied().length > 2 && '...'}
              </div>
            )}
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <Badge variant="secondary" className="text-xs">
            Video
          </Badge>
          <div className="flex space-x-1">
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => onPreview(result.name, result.url)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => onDownload(result.name, result.url)}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};