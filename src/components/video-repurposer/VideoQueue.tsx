import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Play, Trash2, X, RefreshCw, Upload } from "lucide-react";
import { VideoUpload } from "./VideoUpload";
import { useVideoProcessingContext } from "./VideoProcessingProvider";

export function VideoQueue() {
  const [variations, setVariations] = useState(3);
  const { settings, batchProcessing } = useVideoProcessingContext();

  const handleFilesUpload = (files: File[]) => {
    batchProcessing.addToQueue(files);
  };

  const handleStartBatch = async () => {
    await batchProcessing.processBatch(settings, variations);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-muted';
      case 'processing': return 'bg-primary';
      case 'completed': return 'bg-secondary';
      case 'error': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="space-y-6">
      <VideoUpload 
        onFilesSelected={handleFilesUpload} 
        multiple 
        disabled={batchProcessing.isProcessing} 
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Cola de Procesamiento</CardTitle>
              <CardDescription>{batchProcessing.queue.length} videos en cola</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Variaciones:</span>
                <Badge variant="secondary">{variations}</Badge>
              </div>
              <Slider
                value={[variations]}
                onValueChange={([value]) => setVariations(value)}
                min={1}
                max={20}
                step={1}
                className="w-24"
                disabled={batchProcessing.isProcessing}
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Total: {batchProcessing.queue.length}</span>
              <span>Esperando: {batchProcessing.queue.filter(j => j.status === 'waiting').length}</span>
              <span>Procesando: {batchProcessing.queue.filter(j => j.status === 'processing').length}</span>
              <span>Completados: {batchProcessing.queue.filter(j => j.status === 'completed').length}</span>
              <span>Errores: {batchProcessing.queue.filter(j => j.status === 'error').length}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={batchProcessing.clearQueue}
                disabled={batchProcessing.isProcessing || batchProcessing.queue.length === 0}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Limpiar Cola
              </Button>
              <Button
                onClick={handleStartBatch}
                disabled={batchProcessing.isProcessing || batchProcessing.queue.filter(job => job.status === 'waiting').length === 0}
              >
                <Play className="mr-2 h-4 w-4" />
                {batchProcessing.isProcessing ? 'Procesando...' : 'Iniciar Lote'}
              </Button>
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {batchProcessing.queue.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Upload className="mx-auto h-12 w-12 mb-4" />
                <p>No hay videos en la cola. Sube videos para comenzar el procesamiento por lotes.</p>
              </div>
            ) : (
              batchProcessing.queue.map((job) => (
                <Card key={job.id}>
                  <CardContent className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <Badge 
                          variant="outline" 
                          className={`${getStatusColor(job.status)} text-white border-none min-w-[80px] justify-center`}
                        >
                          {job.status === 'waiting' && 'Esperando'}
                          {job.status === 'processing' && 'Procesando'}
                          {job.status === 'completed' && 'Completado'}
                          {job.status === 'error' && 'Error'}
                        </Badge>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{job.filename}</p>
                          {job.status === 'processing' && (
                            <Progress value={job.progress} className="h-1 mt-1" />
                          )}
                          {job.status === 'error' && job.errorMessage && (
                            <p className="text-xs text-destructive mt-1">{job.errorMessage}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {job.status === 'error' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => batchProcessing.retryJob(job.id)}
                            disabled={batchProcessing.isProcessing}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => batchProcessing.removeFromQueue(job.id)}
                          disabled={batchProcessing.isProcessing && job.status === 'processing'}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}