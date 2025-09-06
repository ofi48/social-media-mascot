import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Play, Video, Upload } from "lucide-react";
import { VideoUpload } from "./VideoUpload";
import { VideoQueueComponent } from "./VideoQueueComponent";
import { ResultsTab } from "./ResultsTab";
import { VideoPreview } from "./VideoPreview";
import { PresetManager } from "./PresetManager";
import { useVideoProcessing } from "@/hooks/useVideoProcessing";
import { useVideoQueue } from "@/hooks/useVideoQueue";
import { VideoPresetSettings, DEFAULT_PRESET } from "@/types/video-preset";
import { toast } from 'sonner';

export const VideoRepurposer = () => {
  const [activeTab, setActiveTab] = useState("process");
  const [settings, setSettings] = useState<VideoPresetSettings>(DEFAULT_PRESET);
  const [variations, setVariations] = useState(3);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewFileName, setPreviewFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Single video processing
  const {
    uploadedFile,
    uploadedFileUrl,
    isProcessing,
    progress,
    results,
    error,
    handleFileSelect,
    processVideo,
    resetResults
  } = useVideoProcessing();

  // Batch processing
  const {
    queue,
    isProcessing: isBatchProcessing,
    currentItem,
    addVideosToQueue,
    removeFromQueue,
    clearQueue,
    retryJob,
    processBatch
  } = useVideoQueue();

  // Combine all results for the Results tab
  const allResults = [
    ...results,
    ...queue.filter(job => job.status === 'completed').flatMap(job => job.results || [])
  ];

  const handleSingleFileSelect = (files: File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
      handleFileSelect(files[0]);
    }
  };

  const handleBatchFilesUpload = (files: File[]) => {
    addVideosToQueue(files, settings, variations);
  };

  const handleProcess = async () => {
    if (!selectedFile) return;
    await processVideo(variations, settings);
  };

  const handleStartBatch = () => {
    processBatch();
  };

  const handlePreview = (name: string, url: string) => {
    setPreviewFileName(name);
    setPreviewUrl(url);
    setShowPreview(true);
  };

  const handleDownload = async (name: string, url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(downloadUrl);
      toast.success(`Downloaded ${name}`);
    } catch (error) {
      toast.error('Download failed');
    }
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center space-y-4 mb-8">
            <h1 className="text-4xl font-bold text-foreground">Video Repurposer</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Transform your videos into multiple unique variations with advanced processing effects. 
              Perfect for content creators, marketers, and social media managers.
            </p>
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="process" className="flex items-center gap-2">
                Process Video
              </TabsTrigger>
              <TabsTrigger value="presets" className="flex items-center gap-2">
                Manage Presets
              </TabsTrigger>
              <TabsTrigger value="results" className="flex items-center gap-2">
                Results
                {allResults.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                    {allResults.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="process" className="mt-6">
              <div className="space-y-6">
                {/* Processing Mode Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle>Modo de Procesamiento</CardTitle>
                    <CardDescription>
                      Selecciona si quieres procesar un solo video o múltiples videos en cola
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="single">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="single">Video Individual</TabsTrigger>
                        <TabsTrigger value="batch">Procesamiento por Lotes</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="single" className="mt-6">
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
                              <VideoUpload onFilesSelected={handleSingleFileSelect} />
                              
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
                                      disabled={!selectedFile || isProcessing}
                                      className="w-full flex items-center gap-2"
                                    >
                                      <Play className="h-4 w-4" />
                                      {isProcessing ? 'Procesando...' : 'Procesar Video'}
                                    </Button>
                                  </div>
                                </div>

                                {error && (
                                  <div className="flex items-center gap-2 text-sm text-destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    {error}
                                  </div>
                                )}

                                {isProcessing && (
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span>Procesando video...</span>
                                      <span>{progress}%</span>
                                    </div>
                                    <Progress value={progress} />
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="batch" className="mt-6">
                        <div className="space-y-6">
                          {/* Video Upload Section */}
                          <Card>
                            <CardHeader>
                              <CardTitle>Subir Videos para Procesamiento por Lotes</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <VideoUpload onFilesSelected={handleBatchFilesUpload} multiple />
                            </CardContent>
                          </Card>

                          {/* Queue Configuration */}
                          {queue.length > 0 && (
                            <Card>
                              <CardHeader>
                                <CardTitle>Configuración del Lote</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="batchVariations">Variaciones por Video</Label>
                                    <Input
                                      id="batchVariations"
                                      type="number"
                                      min="1"
                                      max="10"
                                      value={variations}
                                      onChange={(e) => setVariations(parseInt(e.target.value) || 3)}
                                    />
                                  </div>
                                  <div className="flex items-end">
                                    <Button
                                      onClick={handleStartBatch}
                                      disabled={isBatchProcessing || queue.filter(j => j.status === 'waiting').length === 0}
                                      className="w-full flex items-center gap-2"
                                    >
                                      <Play className="h-4 w-4" />
                                      {isBatchProcessing 
                                        ? 'Procesando...' 
                                        : `Procesar ${queue.filter(j => j.status === 'waiting').length} Video${queue.filter(j => j.status === 'waiting').length > 1 ? 's' : ''}`
                                      }
                                    </Button>
                                  </div>
                                </div>

                                <div className="text-sm text-muted-foreground">
                                  Total: {queue.length} videos • En cola: {queue.filter(j => j.status === 'waiting').length} • 
                                  Variaciones por video: {variations}
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* Queue Display */}
                          <VideoQueueComponent
                            queue={queue}
                            isProcessing={isBatchProcessing}
                            currentItem={currentItem}
                            onRemove={removeFromQueue}
                            onRetry={retryJob}
                            onClear={clearQueue}
                          />
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="presets" className="mt-6">
              <PresetManager
                currentSettings={settings}
                onLoadPreset={setSettings}
              />
            </TabsContent>
            
            <TabsContent value="results" className="mt-6">
              <ResultsTab
                results={allResults}
                batchResults={queue.filter(job => job.status === 'completed')}
                onPreview={handlePreview}
                onDownload={handleDownload}
                onClearResults={() => {
                  resetResults();
                  clearQueue();
                }}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Video Preview Modal */}
      {showPreview && (
        <VideoPreview
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          videoUrl={previewUrl}
          fileName={previewFileName}
          onDownload={() => handleDownload(previewFileName, previewUrl)}
        />
      )}
    </div>
  );
};

export default VideoRepurposer;