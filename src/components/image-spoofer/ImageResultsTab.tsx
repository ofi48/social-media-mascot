import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Eye, Trash2, Image, Calendar } from "lucide-react";
import { useImageProcessing } from "./ImageProcessingContext";
import { toast } from "sonner";

export const ImageResultsTab = () => {
  const { results, clearResults } = useImageProcessing();
  const [selectedResult, setSelectedResult] = useState<any>(null);

  const handleDownload = (variant: any) => {
    try {
      const file = variant.originalFile;
      if (file) {
        const url = URL.createObjectURL(file);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = variant.filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        toast.success(`Downloading ${variant.filename}...`);
      } else {
        toast.error("Original file not available for download");
      }
    } catch (error) {
      toast.error(`Failed to download ${variant.filename}`);
      console.error('Download error:', error);
    }
  };

  const handleDownloadAll = (result: any) => {
    toast.success(`Preparing ${result.variants.length} downloads...`);
    
    result.variants.forEach((variant: any, index: number) => {
      setTimeout(() => {
        handleDownload(variant);
      }, index * 500);
    });
  };

  const handlePreview = (variant: any) => {
    setSelectedResult(variant);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Processing Results</h2>
          <p className="text-muted-foreground">
            View and download your processed image variations
          </p>
        </div>
        {results.length > 0 && (
          <Button variant="outline" onClick={clearResults}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All Results
          </Button>
        )}
      </div>

      {/* Results Stats */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{results.length}</div>
              <div className="text-sm text-muted-foreground">Processed Images</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-secondary">
                {results.reduce((sum, result) => sum + result.variants.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Variations</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-accent">
                {Math.round(results.reduce((sum, result) => sum + result.variants.length, 0) / results.length * 10) / 10}
              </div>
              <div className="text-sm text-muted-foreground">Avg. Variations</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-muted-foreground">
                {formatFileSize(results.length * 2 * 1024 * 1024)}
              </div>
              <div className="text-sm text-muted-foreground">Est. Total Size</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Results List */}
      {results.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Image className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Results Yet</h3>
            <p>Process some images to see results here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {results.map((result) => (
            <Card key={result.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Image className="h-5 w-5" />
                      {result.originalFilename}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {result.timestamp.toLocaleString()}
                      </span>
                      <Badge variant="secondary">
                        {result.variants.length} variations
                      </Badge>
                    </CardDescription>
                  </div>
                  <Button
                    variant="hero"
                    size="sm"
                    onClick={() => handleDownloadAll(result)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {result.variants.map((variant) => (
                    <Card key={variant.id} className="relative group">
                      <CardContent className="p-4">
                        <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                          {variant.url ? (
                            <img 
                              src={variant.url} 
                              alt={variant.filename}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement?.appendChild(
                                  Object.assign(document.createElement('div'), {
                                    className: 'flex items-center justify-center w-full h-full',
                                    innerHTML: '<Image class="h-8 w-8 text-muted-foreground" />'
                                  })
                                );
                              }}
                            />
                          ) : (
                            <Image className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <p className="font-medium text-sm truncate" title={variant.filename}>
                            {variant.filename}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(Math.random() * 5 * 1024 * 1024)}
                          </p>
                          
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handlePreview(variant)}
                            >
                              <Eye className="mr-1 h-3 w-3" />
                              Preview
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleDownload(variant)}
                            >
                              <Download className="mr-1 h-3 w-3" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      <Dialog open={!!selectedResult} onOpenChange={() => setSelectedResult(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          {selectedResult && (
            <div className="space-y-4">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                {selectedResult.url ? (
                  <img 
                    src={selectedResult.url} 
                    alt={selectedResult.filename}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <Image className="h-16 w-16 text-muted-foreground" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{selectedResult.filename}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(Math.random() * 5 * 1024 * 1024)}
                  </p>
                </div>
                <Button onClick={() => handleDownload(selectedResult)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};