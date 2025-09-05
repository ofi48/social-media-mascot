import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageSimilarityProvider } from "@/components/image-similarity/ImageSimilarityContext";
import FileUploadSection from "@/components/image-similarity/FileUploadSection";
import ResultsSection from "@/components/image-similarity/ResultsSection";

const ImageSimilarityDetector = () => {
  return (
    <ImageSimilarityProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Image Similarity Detector</h1>
            <p className="text-muted-foreground mt-1">
              Advanced multi-layered image comparison using computer vision and AI algorithms
            </p>
          </div>
        </div>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Images</TabsTrigger>
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
    </ImageSimilarityProvider>
  );
};

export default ImageSimilarityDetector;