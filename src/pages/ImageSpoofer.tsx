import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageProcessingProvider } from "@/components/image-spoofer/ImageProcessingContext";
import { ProcessImageTab } from "@/components/image-spoofer/ProcessImageTab";
import { ImageResultsTab } from "@/components/image-spoofer/ImageResultsTab";

const ImageSpoofer = () => {
  return (
    <ImageProcessingProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Image Spoofer</h1>
            <p className="text-muted-foreground mt-1">
              Create unique variations of your images while maintaining visual appeal
            </p>
          </div>
        </div>

        <Tabs defaultValue="process" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="process">Process Images</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>
          
          <TabsContent value="process" className="space-y-6">
            <ProcessImageTab />
          </TabsContent>
          
          <TabsContent value="results" className="space-y-6">
            <ImageResultsTab />
          </TabsContent>
        </Tabs>
      </div>
    </ImageProcessingProvider>
  );
};

export default ImageSpoofer;