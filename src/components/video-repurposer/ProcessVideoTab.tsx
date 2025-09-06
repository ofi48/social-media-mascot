import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoQueue } from "./VideoQueue";
import { SingleVideoProcessor } from "./SingleVideoProcessor";
import { useVideoProcessingContext } from "./VideoProcessingProvider";
import { VideoProcessingPanel } from "./VideoProcessingPanel";

export function ProcessVideoTab() {
  const { processingMode, setProcessingMode } = useVideoProcessingContext();

  return (
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
          <Tabs value={processingMode} onValueChange={(value) => setProcessingMode(value as 'single' | 'batch')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single">Video Individual</TabsTrigger>
              <TabsTrigger value="batch">Procesamiento por Lotes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="single" className="mt-6">
              <SingleVideoProcessor />
            </TabsContent>
            
            <TabsContent value="batch" className="mt-6">
              <VideoQueue />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Processing Parameters */}
      <VideoProcessingPanel />
    </div>
  );
}