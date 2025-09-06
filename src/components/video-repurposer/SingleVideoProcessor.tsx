import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Play, Download } from "lucide-react";
import { VideoUpload } from "./VideoUpload";
import { useVideoProcessingContext } from "./VideoProcessingProvider";
import { formatBytes, formatDuration } from "@/utils/videoProcessing";

export function SingleVideoProcessor() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [variations, setVariations] = useState(3);
  const { settings, singleProcessing } = useVideoProcessingContext();

  const handleFileUpload = (files: File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
      singleProcessing.analyzeFile(files[0]);
    }
  };

  const handleProcess = async () => {
    if (!selectedFile) return;
    await singleProcessing.processVideo(selectedFile, settings, variations);
  };

  const getEnabledParametersCount = () => {
    let count = 0;
    Object.values(settings).forEach((value) => {
      if (typeof value === 'object' && value !== null && 'enabled' in value && value.enabled) {
        count++;
      }
    });
    return count;
  };

  return (
    <div className="space-y-6">
      <VideoUpload onFilesSelected={handleFileUpload} disabled={singleProcessing.isProcessing} />
      
      {selectedFile && (
        <Card>
          <CardHeader>
            <CardTitle>Video Seleccionado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatBytes(selectedFile.size)}
                  {singleProcessing.metadata && ` • ${formatDuration(singleProcessing.metadata.duration)}`}
                </p>
              </div>
              <Badge variant="secondary">{getEnabledParametersCount()} parámetros activos</Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Variaciones:</span>
                <Badge variant="outline">{variations}</Badge>
              </div>
              <Slider
                value={[variations]}
                onValueChange={([value]) => setVariations(value)}
                min={1}
                max={10}
                step={1}
                disabled={singleProcessing.isProcessing}
              />
            </div>
            
            <Button 
              onClick={handleProcess}
              disabled={singleProcessing.isProcessing || !selectedFile}
              className="w-full"
            >
              <Play className="mr-2 h-4 w-4" />
              {singleProcessing.isProcessing ? 'Procesando...' : 'Procesar Video'}
            </Button>
          </CardContent>
        </Card>
      )}

      {singleProcessing.isProcessing && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Procesando video...</span>
                <span className="text-sm text-muted-foreground">{Math.round(singleProcessing.progress)}%</span>
              </div>
              <Progress value={singleProcessing.progress} />
            </div>
          </CardContent>
        </Card>
      )}

      {singleProcessing.results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados</CardTitle>
            <CardDescription>{singleProcessing.results.length} variaciones generadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {singleProcessing.results.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{result.name}</p>
                    <p className="text-xs text-muted-foreground">Variación {index + 1}</p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Descargar
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}