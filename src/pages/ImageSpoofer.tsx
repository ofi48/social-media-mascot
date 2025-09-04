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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="process">Process Images</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="presets">Manage Presets</TabsTrigger>
          </TabsList>
          
          <TabsContent value="process" className="space-y-6">
            <ProcessImageTab />
          </TabsContent>
          
          <TabsContent value="results" className="space-y-6">
            <ImageResultsTab />
          </TabsContent>
          
          <TabsContent value="presets" className="space-y-6">
            <div className="text-center py-12 text-muted-foreground">
              <h3 className="text-lg font-medium mb-2">Preset Management</h3>
              <p>Save and load processing parameter presets (Coming Soon)</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ImageProcessingProvider>
  );
};

export default ImageSpoofer;