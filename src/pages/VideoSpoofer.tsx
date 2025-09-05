import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProcessVideoTab } from "@/components/video-spoofer/ProcessVideoTab";
import { ResultsTab } from "@/components/video-spoofer/ResultsTab";
import { VideoProcessingProvider } from "@/components/video-spoofer/VideoProcessingContext";

const VideoSpoofer = () => {
  const [activeTab, setActiveTab] = useState("process");

  return (
    <VideoProcessingProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Video Spoofer</h1>
            <p className="text-muted-foreground mt-1">
              Transform your videos with sophisticated processing parameters to create unique variations
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="process" className="flex items-center gap-2">
              Process Video
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              Results
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="process" className="mt-6">
            <ProcessVideoTab />
          </TabsContent>
          
          <TabsContent value="results" className="mt-6">
            <ResultsTab />
          </TabsContent>
        </Tabs>
      </div>
    </VideoProcessingProvider>
  );
};

export default VideoSpoofer;