import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Play, Settings, Users } from "lucide-react";
import { useVideoProcessing } from "./VideoProcessingContext";
import { VideoUpload } from "./VideoUpload";
import { ProcessingParameters } from "./ProcessingParameters";
import { BatchQueue } from "./BatchQueue";
import { toast } from "sonner";

export const ProcessVideoTab = () => {
  const { processingMode, setProcessingMode, isProcessing, parameters } = useVideoProcessing();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [variations, setVariations] = useState(5);

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