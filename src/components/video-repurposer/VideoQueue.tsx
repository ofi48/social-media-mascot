import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { VideoUpload } from './VideoUpload';
import { VideoQueueComponent } from './VideoQueueComponent';
import { useVideoQueue } from '@/hooks/useVideoQueue';
import { VideoPresetSettings } from '@/types/video-preset';
import { Play } from 'lucide-react';

interface VideoQueueProps {
  settings: VideoPresetSettings;
}

export function VideoQueue({ settings }: VideoQueueProps) {
  const [numVariations, setNumVariations] = useState(3);
  const { queue, isProcessing, addVideosToQueue, processBatch, removeFromQueue, retryJob, clearQueue, preprocessingProgress } = useVideoQueue();

  const handleFilesUpload = (files: File[]) => {
    addVideosToQueue(files, settings, numVariations);
  };

  const handleStartBatch = () => {
    processBatch();
  };

  const queuedVideos = queue.filter(job => job.status === 'waiting').length;
  const totalVideos = queue.length;

  return (
    <div className="space-y-6">
      {/* Video Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Subir Videos para Procesamiento por Lotes</CardTitle>
        </CardHeader>
        <CardContent>
          <VideoUpload onFilesSelected={handleFilesUpload} />
        </CardContent>
      </Card>

      {/* Queue Configuration */}
      {totalVideos > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Configuración del Lote</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="variations">Variaciones por Video</Label>
                <Input
                  id="variations"
                  type="number"
                  min="1"
                  max="10"
                  value={numVariations}
                  onChange={(e) => setNumVariations(parseInt(e.target.value) || 3)}
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleStartBatch}
                  disabled={isProcessing || queuedVideos === 0}
                  className="w-full flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  {isProcessing 
                    ? 'Procesando...' 
                    : `Procesar ${queuedVideos} Video${queuedVideos > 1 ? 's' : ''}`
                  }
                </Button>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              Total: {totalVideos} videos • En cola: {queuedVideos} • 
              Variaciones por video: {numVariations}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Queue Display */}
      <VideoQueueComponent
        queue={queue}
        isProcessing={isProcessing}
        currentItem={null}
        onRemove={removeFromQueue}
        onRetry={retryJob}
        onClear={clearQueue}
      />
    </div>
  );
}