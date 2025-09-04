import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Download, Eye, Trash2, Video, Calendar } from "lucide-react";
import { useVideoProcessing } from "./VideoProcessingContext";
import { toast } from "sonner";

export const ResultsTab = () => {
  const { results, clearResults } = useVideoProcessing();
  const [selectedResult, setSelectedResult] = useState<any>(null);

  const handleDownload = (variant: any, originalFile?: File) => {
    try {
      // Use the original file if available, otherwise create a mock download
      const file = originalFile || variant.originalFile;
      if (file) {
        const blob = new Blob([file], { type: file.type });
        const url = URL.createObjectURL(blob);
        
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
        // Fallback for cases where original file is not available
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
      }, index * 500); // Stagger downloads to avoid browser blocking
    });
  };

  const handlePreview = (variant: any) => {
    // Mock preview functionality
    toast.info(`Opening preview for ${variant.filename}`);
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
            View and download your processed video variations
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
              <div className="text-sm text-muted-foreground">Processed Videos</div>
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
                {formatFileSize(results.length * 50 * 1024 * 1024)} {/* Mock total size */}
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
            <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Results Yet</h3>
            <p>Process some videos to see results here</p>
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
                      <Video className="h-5 w-5" />
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
                        <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center">
                          <Video className="h-8 w-8 text-muted-foreground" />
                        </div>
                        
                        <div className="space-y-2">
                          <p className="font-medium text-sm truncate" title={variant.filename}>
                            {variant.filename}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(Math.random() * 50 * 1024 * 1024)} {/* Mock file size */}
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
            <DialogTitle>Video Preview</DialogTitle>
          </DialogHeader>
          {selectedResult && (
            <div className="space-y-4">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <Video className="h-16 w-16 text-muted-foreground" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{selectedResult.filename}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(Math.random() * 50 * 1024 * 1024)}
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