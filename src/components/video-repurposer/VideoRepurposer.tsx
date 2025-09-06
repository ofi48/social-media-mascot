import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProcessVideoTab } from "./ProcessVideoTab";
import { ManagePresetsTab } from "./ManagePresetsTab";
import { ResultsTab } from "./ResultsTab";
import { VideoProcessingProvider, useVideoProcessingContext } from "./VideoProcessingProvider";

const VideoRepurposerContent = () => {
  const [activeTab, setActiveTab] = useState("process");
  const { singleProcessing, batchProcessing } = useVideoProcessingContext();

  // Don't auto-switch tabs - let user control navigation
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Video Spoofer</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Genera múltiples variaciones únicas de tus videos con parámetros de procesamiento avanzados. 
          Perfecto para creadores de contenido, especialistas en marketing y gestores de redes sociales.
        </p>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="process" className="flex items-center gap-2">
            Procesar Video
          </TabsTrigger>
          <TabsTrigger value="presets" className="flex items-center gap-2">
            Gestionar Presets
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            Resultados
            {(singleProcessing.results.length > 0 || batchProcessing.queue.filter(job => job.status === 'completed').length > 0) && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                {singleProcessing.results.length + batchProcessing.queue.filter(job => job.status === 'completed').length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="process" className="mt-6">
          <ProcessVideoTab />
        </TabsContent>
        
        <TabsContent value="presets" className="mt-6">
          <ManagePresetsTab />
        </TabsContent>
        
        <TabsContent value="results" className="mt-6">
          <ResultsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const VideoRepurposer = () => {
  return (
    <VideoProcessingProvider>
      <VideoRepurposerContent />
    </VideoProcessingProvider>
  );
};

export default VideoRepurposer;