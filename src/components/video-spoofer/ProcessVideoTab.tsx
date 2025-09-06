import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { VideoUpload } from "@/components/video-spoofer/VideoUpload";
import { FFmpegParameters } from "@/components/video-spoofer/FFmpegParameters";
import { useVideoSpoofer } from "@/components/video-spoofer/VideoSpooferContext";
import { Play, Loader2 } from "lucide-react";

export function ProcessVideoTab() {
  const {
    selectedFiles,
    setSelectedFiles,
    numVariations,
    setNumVariations,
    isProcessing,
    processingProgress,
    processVideos,
    settings
  } = useVideoSpoofer();

  const getEnabledParametersCount = () => {
    return Object.values(settings).filter(param => 
      typeof param === 'object' && 'enabled' in param && param.enabled
    ).length + (settings.flipHorizontal ? 1 : 0);
  };

  return (
    <div className="space-y-6">
      {/* File Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Videos</CardTitle>
        </CardHeader>
        <CardContent>
          <VideoUpload
            onFilesSelected={setSelectedFiles}
            multiple={true}
            disabled={isProcessing}
            maxSize={100 * 1024 * 1024} // 100MB
          />
          {selectedFiles.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                Selected files: {selectedFiles.length}
              </p>
              <ul className="mt-2 space-y-1">
                {selectedFiles.map((file, index) => (
                  <li key={index} className="text-sm flex justify-between">
                    <span>{file.name}</span>
                    <span className="text-muted-foreground">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Variations Settings */}
      {selectedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Variation Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Number of variations per video: {numVariations}</Label>
              <Slider
                value={[numVariations]}
                onValueChange={(value) => setNumVariations(value[0])}
                min={1}
                max={5}
                step={1}
                disabled={isProcessing}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Total variations: {selectedFiles.length * numVariations}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* FFmpeg Parameters */}
      {selectedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>FFmpeg Parameters</CardTitle>
            <p className="text-sm text-muted-foreground">
              {getEnabledParametersCount()} parameters enabled
            </p>
          </CardHeader>
          <CardContent>
            <FFmpegParameters />
          </CardContent>
        </Card>
      )}

      {/* Process Button */}
      {selectedFiles.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <Button
              onClick={processVideos}
              disabled={isProcessing || getEnabledParametersCount() === 0}
              className="w-full"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing... ({Math.round(processingProgress)}%)
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Process {selectedFiles.length} Video{selectedFiles.length > 1 ? 's' : ''}
                </>
              )}
            </Button>
            
            {isProcessing && (
              <div className="mt-4 space-y-2">
                <Progress value={processingProgress} className="w-full" />
                <p className="text-sm text-center text-muted-foreground">
                  {processingProgress < 50 ? 'Uploading and initializing...' : 'Processing videos...'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}