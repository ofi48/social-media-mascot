import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Play, Package, FileVideo, Trash2 } from "lucide-react";
import { useVideoProcessingContext } from "./VideoProcessingProvider";
import { toast } from "sonner";

export function ResultsTab() {
  const { singleProcessing, batchProcessing } = useVideoProcessingContext();

  const allResults = [
    ...singleProcessing.results,
    ...batchProcessing.queue.flatMap(job => job.results || [])
  ];

  const completedJobs = batchProcessing.queue.filter(job => job.status === 'completed');

  // Download a single video file
  const downloadVideo = async (url: string, filename: string) => {
    try {
      toast.info(`Descargando ${filename}...`);
      const response = await fetch(url);
      const blob = await response.blob();
      
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      toast.success(`${filename} descargado exitosamente`);
    } catch (error) {
      console.error('Error downloading video:', error);
      toast.error(`Error al descargar ${filename}`);
    }
  };

  // Download all variations from single processing
  const downloadAllSingleVariations = async () => {
    if (singleProcessing.results.length === 0) return;
    
    toast.info(`Descargando ${singleProcessing.results.length} variaciones...`);
    
    for (const result of singleProcessing.results) {
      await downloadVideo(result.url, result.name);
      // Small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  // Download all variations from a specific batch job
  const downloadJobVariations = async (job: any) => {
    if (!job.results || job.results.length === 0) return;
    
    toast.info(`Descargando ${job.results.length} variaciones de ${job.filename}...`);
    
    for (const result of job.results) {
      await downloadVideo(result.url, result.name);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  // Download all variations from all jobs
  const downloadAllBatchVariations = async () => {
    const totalVariations = allResults.length;
    if (totalVariations === 0) return;
    
    toast.info(`Descargando ${totalVariations} variaciones en total...`);
    
    for (const result of allResults) {
      await downloadVideo(result.url, result.name);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  // Clear all results
  const clearAllResults = () => {
    singleProcessing.resetResults();
    batchProcessing.clearQueue();
    toast.success("Todos los resultados han sido eliminados");
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Resumen de Resultados</span>
            {allResults.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllResults}
                className="flex items-center gap-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Limpiar Todo
              </Button>
            )}
          </CardTitle>
          <CardDescription>
            {allResults.length} variaciones de video generadas en total
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <span>Videos procesados: {completedJobs.length + (singleProcessing.results.length > 0 ? 1 : 0)}</span>
              <span>•</span>
              <span>Variaciones totales: {allResults.length}</span>
            </div>
            <Button 
              disabled={allResults.length === 0}
              onClick={downloadAllBatchVariations}
              className="flex items-center gap-2"
            >
              <Package className="h-4 w-4" />
              Descargar Todo ({allResults.length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Single Processing Results */}
      {singleProcessing.results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Procesamiento Individual</span>
              <Button
                onClick={downloadAllSingleVariations}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Descargar Todas ({singleProcessing.results.length})
              </Button>
            </CardTitle>
            <CardDescription>{singleProcessing.results.length} variaciones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {singleProcessing.results.map((result, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                        <Play className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm truncate">{result.name}</h4>
                        <p className="text-xs text-muted-foreground">Variación {index + 1}</p>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => downloadVideo(result.url, result.name)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Descargar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Batch Processing Results */}
      {completedJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Procesamiento por Lotes</span>
              <Button
                onClick={downloadAllBatchVariations}
                className="flex items-center gap-2"
              >
                <Package className="h-4 w-4" />
                Descargar Todo ({allResults.length})
              </Button>
            </CardTitle>
            <CardDescription>{completedJobs.length} videos completados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {completedJobs.map((job) => (
                <Card key={job.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">{job.filename}</CardTitle>
                        <CardDescription>{job.results?.length || 0} variaciones</CardDescription>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => downloadJobVariations(job)}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Descargar ({job.results?.length || 0})
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {job.results?.map((result, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{result.name}</p>
                            <p className="text-xs text-muted-foreground">Variación {index + 1}</p>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => downloadVideo(result.url, result.name)}
                            title="Descargar esta variación"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {allResults.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileVideo className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay resultados aún</h3>
            <p className="text-muted-foreground">
              Procesa algunos videos para ver los resultados aquí
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}