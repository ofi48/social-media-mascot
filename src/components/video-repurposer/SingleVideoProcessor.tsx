import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Play, Upload, Video } from 'lucide-react';
import { VideoUpload } from './VideoUpload';
import { useVideoProcessingContext } from './VideoProcessingProvider';
import { VideoPresetSettings } from '@/types/video-preset';

interface SingleVideoProcessorProps {
  settings: VideoPresetSettings;
}

export function SingleVideoProcessor({ settings }: SingleVideoProcessorProps) {
  const [variations, setVariations] = useState(3);
  const { singleProcessing } = useVideoProcessingContext();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
      singleProcessing.analyzeFile(files[0]);
    }
  };

  const handleProcess = async () => {
    if (!selectedFile) return;
    await singleProcessing.processVideo(selectedFile, settings);
  };

  const getEnabledParametersCount = () => {
    let count = 0;
    Object.entries(settings).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null && 'enabled' in value && value.enabled) {
        count++;
      }
    });
    return count;
  };

  return (
    <div className="space-y-6">
      {/* File Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Video</CardTitle>
          <CardDescription>
            Sube un video para generar múltiples variaciones con efectos aleatorios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VideoUpload onFilesSelected={handleFileSelect} />
          
          {selectedFile && (
            <div className="mt-4 p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Video className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <Badge variant="secondary">Listo</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processing Configuration */}
      {selectedFile && (
        <Card>
          <CardHeader>
            <CardTitle>Configuración de Procesamiento</CardTitle>
            <CardDescription>
              {getEnabledParametersCount()} parámetros activos para generar variaciones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="variations">Número de Variaciones</Label>
                <Input
                  id="variations"
                  type="number"
                  min="1"
                  max="10"
                  value={variations}
                  onChange={(e) => setVariations(parseInt(e.target.value) || 3)}
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleProcess}
                  disabled={!selectedFile || singleProcessing.isProcessing}
                  className="w-full flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  {singleProcessing.isProcessing ? 'Procesando...' : 'Procesar Video'}
                </Button>
              </div>
            </div>

            {singleProcessing.error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {singleProcessing.error}
              </div>
            )}

            {singleProcessing.isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Procesando video...</span>
                  <span>{singleProcessing.progress}%</span>
                </div>
                <Progress value={singleProcessing.progress} />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}