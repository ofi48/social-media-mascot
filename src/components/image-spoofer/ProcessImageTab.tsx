import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Play, Settings, Users, Download, CheckCircle, Image } from "lucide-react";
import { useImageProcessing } from "./ImageProcessingContext";
import { ImageUpload } from "./ImageUpload";
import { ImageProcessingParameters } from "./ImageProcessingParameters";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export const ProcessImageTab = () => {
  const { 
    processingMode, 
    setProcessingMode, 
    isProcessing, 
    parameters, 
    processImage, 
    results,
    processingProgress
  } = useImageProcessing();
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [variations, setVariations] = useState(5);
  const [lastProcessedResult, setLastProcessedResult] = useState<any>(null);

  const handleFileUpload = (files: File[]) => {
    setSelectedFiles(files);
  };

  const getEnabledParametersCount = () => {
    const rangeParams = [
      'brightness', 'contrast', 'saturation', 'hue', 'gamma',
      'noise', 'blur', 'sharpen', 'vignette', 'rotation', 'scale',
      'customSize', 'randomCrop', 'quality'
    ];
    
    const rangeCount = rangeParams.filter(param => {
      const paramValue = parameters[param as keyof typeof parameters];
      return paramValue && 
             typeof paramValue === 'object' && 
             'enabled' in paramValue && 
             (paramValue as any).enabled;
    }).length;
    
    const booleanCount = [
      parameters.flipHorizontal,
      parameters.flipVertical,
      parameters.vintage,
      parameters.edgeEnhancement,
      parameters.watermark.enabled
    ].filter(Boolean).length;
    
    return rangeCount + booleanCount;
  };

  const handleProcessImage = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please upload an image file first");
      return;
    }

    if (getEnabledParametersCount() === 0) {
      toast.error("Please enable at least one processing parameter");
      return;
    }

    try {
      await processImage(selectedFiles[0], variations);
      const latestResult = results[0];
      setLastProcessedResult(latestResult);
      toast.success(`Successfully created ${variations} image variations!`);
    } catch (error) {
      toast.error("Failed to process image");
    }
  };

  const handleDownloadAll = async () => {
    if (!lastProcessedResult) return;
    
    toast.success(`Preparing ${lastProcessedResult.variants.length} image downloads...`);
    
    for (let i = 0; i < lastProcessedResult.variants.length; i++) {
      const variant = lastProcessedResult.variants[i];
      setTimeout(() => {
        downloadImageFile(variant.filename, variant.originalFile || selectedFiles[0]);
      }, i * 500);
    }
  };

  const handleDownloadSingle = (variant: any) => {
    downloadImageFile(variant.filename, variant.originalFile || selectedFiles[0]);
    toast.success(`Downloading ${variant.filename}...`);
  };

  const downloadImageFile = (filename: string, originalFile: File | Blob) => {
    try {
      const url = URL.createObjectURL(originalFile);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      toast.error(`Failed to download ${filename}`);
      console.error('Download error:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Processing Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Processing Mode
          </CardTitle>
          <CardDescription>
            Choose between single image processing or batch processing multiple images
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={processingMode} onValueChange={(value) => setProcessingMode(value as 'single' | 'batch')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single" className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                Single Processing
              </TabsTrigger>
              <TabsTrigger value="batch" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Batch Processing
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Processing Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Section */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Upload Image{processingMode === 'batch' ? 's' : ''}
            </CardTitle>
            <CardDescription>
              {processingMode === 'single' 
                ? 'Upload an image file to process'
                : 'Upload multiple images for batch processing'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload 
              mode={processingMode}
              onFilesSelected={handleFileUpload}
              maxFiles={processingMode === 'single' ? 1 : 10}
            />
            
            {selectedFiles.length > 0 && processingMode === 'single' && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Variations to Generate:</span>
                  <Badge variant="secondary">{variations}</Badge>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={variations}
                  onChange={(e) => setVariations(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1</span>
                  <span>20</span>
                </div>
              </div>
            )}
            
            {/* Large Process Button */}
            {processingMode === 'single' && (
              <div className="mt-6 space-y-4">
                <Button 
                  variant="hero" 
                  size="lg"
                  className="w-full h-12 text-lg font-semibold"
                  onClick={handleProcessImage}
                  disabled={selectedFiles.length === 0 || getEnabledParametersCount() === 0 || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Settings className="mr-2 h-5 w-5 animate-spin" />
                      Processing {variations} Variations...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-5 w-5" />
                      Process Image - Create {variations} Variations
                    </>
                  )}
                </Button>
                
                {selectedFiles.length === 0 && (
                  <p className="text-xs text-center text-muted-foreground">
                    Upload an image file to enable processing
                  </p>
                )}
                
                {selectedFiles.length > 0 && getEnabledParametersCount() === 0 && (
                  <p className="text-xs text-center text-destructive">
                    Enable at least one processing parameter to start
                  </p>
                )}
                
                {selectedFiles.length > 0 && getEnabledParametersCount() > 0 && !isProcessing && (
                  <p className="text-xs text-center text-muted-foreground">
                    Ready to process with {getEnabledParametersCount()} parameters enabled
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Processing Results for Single Mode */}
        {processingMode === 'single' && lastProcessedResult && !isProcessing && (
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-secondary" />
                Processing Complete
              </CardTitle>
              <CardDescription>
                {lastProcessedResult.variants.length} variations created
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary mb-2">
                    {lastProcessedResult.variants.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Image variations ready
                  </div>
                </div>

                <Button 
                  variant="hero" 
                  className="w-full" 
                  onClick={handleDownloadAll}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download All Variations
                </Button>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {lastProcessedResult.variants.map((variant: any, index: number) => (
                    <div key={variant.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{variant.filename}</p>
                        <p className="text-xs text-muted-foreground">Variation {index + 1}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadSingle(variant)}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Processing Progress for Single Mode */}
        {processingMode === 'single' && isProcessing && (
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary animate-spin" />
                Processing Image
              </CardTitle>
              <CardDescription>
                Creating {variations} variations...
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progress</span>
                    <Badge variant="outline">{processingProgress}%</Badge>
                  </div>
                  <Progress value={processingProgress} className="h-2" />
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>• Applying color adjustments</div>
                  <div>• Processing visual effects</div>
                  <div>• Generating variations</div>
                  <div>• Optimizing output quality</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Parameters */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Processing Parameters</span>
              <Badge variant="outline">
                {getEnabledParametersCount()} enabled
              </Badge>
            </CardTitle>
            <CardDescription>
              Configure randomization ranges for image processing parameters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImageProcessingParameters />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};