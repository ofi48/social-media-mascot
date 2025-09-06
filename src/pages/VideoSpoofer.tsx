import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoSpooferProvider } from "@/components/video-spoofer/VideoSpooferContext";
import { ProcessVideoTab } from "@/components/video-spoofer/ProcessVideoTab";
import { ResultsTab } from "@/components/video-spoofer/ResultsTab";

const VideoSpoofer = () => {
  return (
    <VideoSpooferProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Video Spoofer</h1>
            <p className="text-muted-foreground mt-1">
              Create multiple variations of your videos with customizable FFmpeg parameters
            </p>
          </div>
        </div>

        <Tabs defaultValue="process" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="process">Process Videos</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>
          
          <TabsContent value="process" className="space-y-6">
            <ProcessVideoTab />
          </TabsContent>
          
          <TabsContent value="results" className="space-y-6">
            <ResultsTab />
          </TabsContent>
        </Tabs>
      </div>
    </VideoSpooferProvider>
  );
};

export default VideoSpoofer;