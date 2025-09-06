import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Download, Eye, Trash2, Video, Calendar, Clock, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { useVideoProcessing } from "./VideoProcessingContext";
import { useJobStatus } from "@/hooks/useJobStatus";
import { toast } from "sonner";

export const ResultsTab = () => {
  const { results, clearResults, downloadAllResults } = useVideoProcessing();
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  
  // Get the most recent job ID from results - handle case where processingDetails might not exist
  const latestJobId = results.length > 0 && results[0].variants.length > 0 
    ? results[0].variants[0].processingDetails?.jobId || null
    : null;
  
  const { jobStatus, loading: jobLoading, error: jobError, refetch } = useJobStatus(latestJobId);

  const handleDownload = (variant: any, originalFile?: File) => {
    try {
      // Check if this is a real processed video URL or still processing
      if (variant.url && variant.url.startsWith('http')) {
        // Create a link to download from the URL
        const link = document.createElement('a');
        link.href = variant.url;
        link.download = variant.name || variant.filename;
        link.target = '_blank';
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success(`Downloading ${variant.name || variant.filename}...`);
      } else if (variant.blob) {
        // Use the processed blob if available
        const url = URL.createObjectURL(variant.blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = variant.filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        toast.success(`Downloading ${variant.filename}...`);
      } else if (originalFile) {
        // Fallback to original file
        const url = URL.createObjectURL(originalFile);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = originalFile.name;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        toast.success(`Downloading original file: ${originalFile.name}...`);
      } else {
        toast.error("Video is still processing. Please wait and try again.");
      }
    } catch (error) {
      toast.error(`Failed to download ${variant.filename || variant.name}`);
      console.error('Download error:', error);
    }
  };

  const handleDownloadAll = (result: any) => {
    const availableVariants = result.variants.filter((v: any) => v.url && v.url.startsWith('http'));
    
    if (availableVariants.length === 0) {
      toast.error("No processed videos available for download yet. Please wait for processing to complete.");
      return;
    }
    
    toast.success(`Preparing ${availableVariants.length} downloads...`);
    
    availableVariants.forEach((variant: any, index: number) => {
      setTimeout(() => {
        handleDownload(variant);
      }, index * 500); // Stagger downloads to avoid browser blocking
    });
  };

  const handleDownloadAllResults = () => {
    const allAvailableVariants = results.flatMap(result => 
      result.variants.filter((v: any) => v.url && v.url.startsWith('http'))
    );
    
    if (allAvailableVariants.length === 0) {
      toast.error("No processed videos available for download yet.");
      return;
    }
    
    toast.success(`Starting download of ${allAvailableVariants.length} video variations...`);
    downloadAllResults();
  };

  const handlePreview = (variant: any) => {
    if (variant.url && variant.url.startsWith('http')) {
      window.open(variant.url, '_blank');
    } else {
      toast.info("Preview not available - video is still processing");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'processing':
        return 'secondary';
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Job Status Card */}
      {jobStatus && (
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(jobStatus.status)}
                <CardTitle className="text-lg">Processing Status</CardTitle>
                <Badge variant={getStatusBadgeVariant(jobStatus.status)}>
                  {jobStatus.status.charAt(0).toUpperCase() + jobStatus.status.slice(1)}
                </Badge>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refetch}
                disabled={jobLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${jobLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Original File</p>
                <p className="font-medium">{jobStatus.originalFilename}</p>
              </div>
              <div>
                <p className="text-muted-foreground">File Size</p>
                <p className="font-medium">{jobStatus.fileSizeMB?.toFixed(2)} MB</p>
              </div>
              <div>
                <p className="text-muted-foreground">Results Available</p>
                <p className="font-medium">{jobStatus.results?.length || 0} videos</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-3">{jobStatus.message}</p>
            {jobStatus.errorMessage && (
              <p className="text-sm text-red-600 mt-2">{jobStatus.errorMessage}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Processing Results</h2>
          <p className="text-muted-foreground">
            View and download your processed video variations
          </p>
        </div>
        {(results.length > 0 || (jobStatus?.results && jobStatus.results.length > 0)) && (
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

      {/* Download All Button */}
      {((results.length > 0 && results.some(r => r.variants.some((v: any) => v.url?.startsWith('http')))) || 
        (jobStatus?.results && jobStatus.results.length > 0)) && (
        <div className="flex justify-center">
          <Button
            variant="hero"
            size="lg"
            onClick={handleDownloadAllResults}
            className="px-8"
          >
            <Download className="mr-2 h-4 w-4" />
            Download All Available ({
              jobStatus?.results?.length || 
              results.reduce((sum, result) => sum + result.variants.filter((v: any) => v.url?.startsWith('http')).length, 0)
            })
          </Button>
        </div>
      )}

      {/* Real-time Results from Job Status */}
      {jobStatus?.results && jobStatus.results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              {jobStatus.originalFilename} - Latest Results
            </CardTitle>
            <CardDescription>
              Processing completed at {new Date(jobStatus.completedAt || jobStatus.updatedAt).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {jobStatus.results.map((result, index) => (
                <Card key={index} className="relative group">
                  <CardContent className="p-4">
                    <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                      {result.url ? (
                        <video 
                          src={result.url} 
                          className="w-full h-full object-cover rounded-lg"
                          controls
                          preload="metadata"
                        />
                      ) : (
                        <Video className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <p className="font-medium text-sm truncate" title={result.name}>
                        {result.name}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Ready for download
                      </Badge>
                      
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handlePreview(result)}
                          disabled={!result.url}
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          Preview
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleDownload(result)}
                          disabled={!result.url}
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
      )}

      {/* Results List */}
      {results.length === 0 && (!jobStatus?.results || jobStatus.results.length === 0) ? (
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