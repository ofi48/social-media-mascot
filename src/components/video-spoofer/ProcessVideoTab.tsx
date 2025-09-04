import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Play, Settings, Users, Download, CheckCircle } from "lucide-react";
import { useVideoProcessing } from "./VideoProcessingContext";
import { VideoUpload } from "./VideoUpload";
import { ProcessingParameters } from "./ProcessingParameters";
import { BatchQueue } from "./BatchQueue";
import { ProcessingProgress } from "./ProcessingProgress";
import { toast } from "sonner";

export const ProcessVideoTab = () => {
  const { processingMode, setProcessingMode, isProcessing, parameters, processVideo, results } = useVideoProcessing();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [variations, setVariations] = useState(5);
  const [lastProcessedResult, setLastProcessedResult] = useState<any>(null);

  const handleFileUpload = (files: File[]) => {
    setSelectedFiles(files);
    if (processingMode === 'batch') {
      // Auto-add to queue in batch mode
      // This would be handled by the upload component
    }
  };

  const getEnabledParametersCount = () => {
    return Object.values(parameters).filter(param => 
      typeof param === 'object' && param && 'enabled' in param && param.enabled
    ).length + (parameters.flipHorizontal ? 1 : 0) + (parameters.usMetadata ? 1 : 0) + 
    (parameters.randomPixelSize ? 1 : 0) + (parameters.watermark.enabled ? 1 : 0);
  };

  const handleProcessVideo = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please upload a video file first");
      return;
    }

    if (getEnabledParametersCount() === 0) {
      toast.error("Please enable at least one processing parameter");
      return;
    }

    try {
      await processVideo(selectedFiles[0], variations);
      // Get the latest result after processing
      const latestResult = results[0];
      setLastProcessedResult(latestResult);
      toast.success(`Successfully created ${variations} video variations!`);
    } catch (error) {
      toast.error("Failed to process video");
    }
  };

  const handleDownloadAll = () => {
    if (!lastProcessedResult) return;
    
    // Create download links for all variations
    lastProcessedResult.variants.forEach((variant: any, index: number) => {
      // In a real implementation, these would be actual video URLs
      const link = document.createElement('a');
      link.href = variant.url;
      link.download = variant.filename;
      link.click();
    });
    
    toast.success(`Downloading ${lastProcessedResult.variants.length} video variations...`);
  };

  const handleDownloadSingle = (variant: any) => {
    const link = document.createElement('a');
    link.href = variant.url;
    link.download = variant.filename;
    link.click();
    toast.success(`Downloading ${variant.filename}...`);
  };

  return (
    <div className="space-y-6">
      {/* Processing Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Processing Mode
          </CardTitle>
          <CardDescription>
            Choose between single video processing or batch processing multiple videos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={processingMode} onValueChange={(value) => setProcessingMode(value as 'single' | 'batch')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single" className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                Single Processing
              </TabsTrigger>
              <TabsTrigger value="batch" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Batch Processing
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Processing Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Section */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Upload Video{processingMode === 'batch' ? 's' : ''}
            </CardTitle>
            <CardDescription>
              {processingMode === 'single' 
                ? 'Upload a video file to process'
                : 'Upload multiple videos for batch processing'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VideoUpload 
              mode={processingMode}
              onFilesSelected={handleFileUpload}
              maxFiles={processingMode === 'single' ? 1 : 10}
            />
            
            {selectedFiles.length > 0 && processingMode === 'single' && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Variations to Generate:</span>
                  <Badge variant="secondary">{variations}</Badge>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={variations}
                  onChange={(e) => setVariations(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1</span>
                  <span>20</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Processing Results for Single Mode */}
        {processingMode === 'single' && lastProcessedResult && (
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-secondary" />
                Processing Complete
              </CardTitle>
              <CardDescription>
                {lastProcessedResult.variants.length} variations created
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary mb-2">
                    {lastProcessedResult.variants.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Video variations ready
                  </div>
                </div>

                <Button 
                  variant="hero" 
                  className="w-full" 
                  onClick={handleDownloadAll}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download All Variations
                </Button>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {lastProcessedResult.variants.map((variant: any, index: number) => (
                    <div key={variant.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{variant.filename}</p>
                        <p className="text-xs text-muted-foreground">Variation {index + 1}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadSingle(variant)}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Processing Progress for Single Mode */}
        {processingMode === 'single' && isProcessing && (
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary animate-spin" />
                Processing Video
              </CardTitle>
              <CardDescription>
                Creating {variations} variations...
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProcessingProgress />
            </CardContent>
          </Card>
        )}

        {/* Start Processing Button for Single Mode */}
        {processingMode === 'single' && selectedFiles.length > 0 && !isProcessing && (
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Ready to Process</CardTitle>
              <CardDescription>
                Start processing your video with current parameters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Will create <span className="font-semibold text-foreground">{variations}</span> variations
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Using <span className="font-semibold text-foreground">{getEnabledParametersCount()}</span> parameters
                  </div>
                </div>
                
                <Button 
                  variant="hero" 
                  className="w-full" 
                  onClick={handleProcessVideo}
                  disabled={getEnabledParametersCount() === 0}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start Processing
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Parameters */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Processing Parameters</span>
              <Badge variant="outline">
                {getEnabledParametersCount()} enabled
              </Badge>
            </CardTitle>
            <CardDescription>
              Configure randomization ranges for video processing parameters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProcessingParameters />
          </CardContent>
        </Card>
      </div>

      {/* Batch Queue */}
      {processingMode === 'batch' && (
        <Card>
          <CardHeader>
            <CardTitle>Batch Processing Queue</CardTitle>
            <CardDescription>
              Manage your video processing queue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BatchQueue variations={variations} setVariations={setVariations} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};