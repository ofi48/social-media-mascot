import React, { useState } from 'react';
import { Play, Settings, Upload, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MultiFileUpload } from './MultiFileUpload';
import { VideoQueue } from './VideoQueue';
import { ParameterSection } from './ParameterSection';
import { VideoPresetSettings, QueueItem } from '@/types/video-preset';

interface ProcessTabProps {
  // Single video processing
  uploadedFile: File | null;
  uploadedFileUrl: string;
  processing: boolean;
  progress: number;
  numCopies: number;
  setNumCopies: (num: number) => void;
  settings: VideoPresetSettings;
  setSettings: (settings: VideoPresetSettings) => void;
  handleFileSelect: (file: File) => void;
  handleStartProcess: () => void;
  
  // Batch processing
  queueFiles: File[];
  queue: QueueItem[];
  isProcessing: boolean;
  currentItem: string | null;
  onFilesAdded: (files: File[]) => void;
  onFileRemoved: (index: number) => void;
  onClearFiles: () => void;
  onRemoveFromQueue: (id: string) => void;
  onRetryJob: (id: string) => void;
  onClearQueue: () => void;
  onStartBatch: (files: File[], settings: VideoPresetSettings, copies: number) => void;
}

export const ProcessTab: React.FC<ProcessTabProps> = ({
  uploadedFile,
  uploadedFileUrl,
  processing,
  progress,
  numCopies,
  setNumCopies,
  settings,
  setSettings,
  handleFileSelect,
  handleStartProcess,
  queueFiles,
  queue,
  isProcessing,
  currentItem,
  onFilesAdded,
  onFileRemoved,
  onClearFiles,
  onRemoveFromQueue,
  onRetryJob,
  onClearQueue,
  onStartBatch
}) => {
  const [batchCopies, setBatchCopies] = useState(3);
  const [processingMode, setProcessingMode] = useState<'single' | 'batch'>('single');

  const handleSingleFileUpload = (files: File[]) => {
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleBatchStart = () => {
    if (queueFiles.length > 0) {
      onStartBatch(queueFiles, settings, batchCopies);
    }
  };

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Processing Mode Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Processing Mode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={processingMode} onValueChange={(value) => setProcessingMode(value as 'single' | 'batch')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single" className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                Single Video
              </TabsTrigger>
              <TabsTrigger value="batch" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Batch Processing
              </TabsTrigger>
            </TabsList>

            <TabsContent value="single" className="mt-6 space-y-6">
              {/* Single Video Upload */}
              <div className="space-y-4">
                <MultiFileUpload
                  files={uploadedFile ? [uploadedFile] : []}
                  onFilesAdded={handleSingleFileUpload}
                  onFileRemoved={() => {}}
                  onClearAll={() => {}}
                  maxFiles={1}
                />

                {uploadedFile && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Video className="h-8 w-8 text-primary" />
                          <div>
                            <p className="font-medium">{uploadedFile.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatFileSize(uploadedFile.size)}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">Ready</Badge>
                      </div>

                      {uploadedFileUrl && (
                        <div className="mt-4">
                          <video
                            src={uploadedFileUrl}
                            className="w-full max-h-60 rounded-lg"
                            controls
                            preload="metadata"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Single Video Controls */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="single-copies">Number of Variations</Label>
                    <Input
                      id="single-copies"
                      type="number"
                      min="1"
                      max="10"
                      value={numCopies}
                      onChange={(e) => setNumCopies(parseInt(e.target.value) || 3)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={handleStartProcess}
                      disabled={!uploadedFile || processing}
                      className="w-full"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {processing ? 'Processing...' : 'Start Processing'}
                    </Button>
                  </div>
                </div>

                {processing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Processing...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="batch" className="mt-6 space-y-6">
              {/* Batch Upload */}
              <MultiFileUpload
                files={queueFiles}
                onFilesAdded={onFilesAdded}
                onFileRemoved={onFileRemoved}
                onClearAll={onClearFiles}
                maxFiles={10}
              />

              {/* Batch Controls */}
              {queueFiles.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="batch-copies">Variations per Video</Label>
                    <Input
                      id="batch-copies"
                      type="number"
                      min="1"
                      max="10"
                      value={batchCopies}
                      onChange={(e) => setBatchCopies(parseInt(e.target.value) || 3)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={handleBatchStart}
                      disabled={queueFiles.length === 0 || isProcessing}
                      className="w-full"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {isProcessing ? 'Processing...' : `Process ${queueFiles.length} Videos`}
                    </Button>
                  </div>
                </div>
              )}

              {/* Queue Display */}
              <VideoQueue
                queue={queue}
                isProcessing={isProcessing}
                currentItem={currentItem}
                onRemove={onRemoveFromQueue}
                onRetry={onRetryJob}
                onClear={onClearQueue}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Processing Parameters */}
      <ParameterSection
        settings={settings}
        onSettingsChange={setSettings}
      />
    </div>
  );
};