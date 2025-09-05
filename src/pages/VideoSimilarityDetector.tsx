import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SimilarityProvider } from "@/components/video-similarity/SimilarityContext";
import FileUploadSection from "@/components/video-similarity/FileUploadSection";
import ResultsSection from "@/components/video-similarity/ResultsSection";

const VideoSimilarityDetector = () => {
  return (
    <SimilarityProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Video Similarity Detector</h1>
            <p className="text-muted-foreground mt-1">
              Advanced video comparison using multiple computer vision algorithms
            </p>
          </div>
        </div>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Files</TabsTrigger>
            <TabsTrigger value="results">View Results</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-6">
            <FileUploadSection />
          </TabsContent>
          
          <TabsContent value="results" className="space-y-6">
            <ResultsSection />
          </TabsContent>
        </Tabs>
      </div>
    </SimilarityProvider>
  );
};

export default VideoSimilarityDetector;