import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Play, Package, ExternalLink } from "lucide-react";
import { useVideoProcessingContext } from "./VideoProcessingProvider";
import { toast } from "sonner";

export function ResultsTab() {
  const { singleProcessing, batchProcessing } = useVideoProcessingContext();

  const allResults = [
    ...singleProcessing.results,
    ...batchProcessing.queue.flatMap(job => job.results || [])
  ];

  const completedJobs = batchProcessing.queue.filter(job => job.status === 'completed');

  const handleDownload = async (result: any, filename?: string) => {
    try {
      // Since we're using mock URLs, we'll show a message explaining this is a demo
      toast.info("Esta es una demo - En producción se descargaría el video procesado");
      
      // For demo purposes, let's open the video URL in a new tab
      window.open(result.url, '_blank');
    } catch (error) {
      toast.error("Error al descargar el video");
      console.error('Download error:', error);
    }
  };

  const handleDownloadAll = () => {
    toast.info(`Descargando ${allResults.length} videos... (Función demo)`);
    // In production, this would create a ZIP file with all videos
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Resultados</CardTitle>
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
              onClick={handleDownloadAll}
            >
              <Package className="mr-2 h-4 w-4" />
              Descargar Todo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Single Processing Results */}
      {singleProcessing.results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Procesamiento Individual</CardTitle>
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
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleDownload(result, result.name)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Descargar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(result.url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
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
            <CardTitle>Procesamiento por Lotes</CardTitle>
            <CardDescription>{completedJobs.length} videos completados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {completedJobs.map((job) => (
                <Card key={job.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{job.filename}</CardTitle>
                    <CardDescription>{job.results?.length || 0} variaciones</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                      {job.results?.map((result, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{result.name}</p>
                            <p className="text-xs text-muted-foreground">Variación {index + 1}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleDownload(result, result.name)}
                              title="Descargar"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => window.open(result.url, '_blank')}
                              title="Ver"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
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
            <Play className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
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