import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useVideoSpoofer } from "@/components/video-spoofer/VideoSpooferContext";
import { Download, FileVideo, Clock, Cpu } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function ResultsTab() {
  const { results, isProcessing, jobStatus } = useVideoSpoofer();
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleDownload = async (result: any) => {
    if (!result.url) return;
    
    setDownloadingIds(prev => new Set(prev).add(result.name));
    
    try {
      const response = await fetch(result.url);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = result.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download started",
        description: `${result.name} is being downloaded.`,
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download the video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(result.name);
        return newSet;
      });
    }
  };

  const handleDownloadAll = async () => {
    for (const result of results) {
      if (result.url) {
        await handleDownload(result);
        // Small delay between downloads to avoid overwhelming the browser
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  };

  if (isProcessing) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="text-muted-foreground">Processing videos...</p>
            {jobStatus && (
              <div className="space-y-2">
                <Badge variant="outline">{jobStatus.status}</Badge>
                <p className="text-sm text-muted-foreground">{jobStatus.message}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <FileVideo className="w-12 h-12 text-muted-foreground mx-auto" />
            <div>
              <p className="text-lg font-medium text-foreground">No results yet</p>
              <p className="text-sm text-muted-foreground">
                Process some videos to see the results here
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Processing Results</h2>
          <p className="text-muted-foreground">
            {results.length} video variation{results.length > 1 ? 's' : ''} generated
          </p>
        </div>
        <Button onClick={handleDownloadAll} disabled={results.length === 0}>
          <Download className="w-4 h-4 mr-2" />
          Download All
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {results.map((result, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileVideo className="w-4 h-4" />
                {result.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Processing Details */}
              {result.processingDetails && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Processing Details</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {result.processingDetails.outputSizeMB && (
                      <div className="flex items-center gap-1">
                        <FileVideo className="w-3 h-3" />
                        <span>{result.processingDetails.outputSizeMB} MB</span>
                      </div>
                    )}
                    {result.processingDetails.processingTimeMs && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{(result.processingDetails.processingTimeMs / 1000).toFixed(1)}s</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Applied Parameters */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {Object.entries(result.processingDetails)
                      .filter(([key, value]) => 
                        !['outputSizeMB', 'processingTimeMs', 'variationIndex', 'processedAt', 'seed'].includes(key) &&
                        value !== undefined
                      )
                      .map(([key, value]) => (
                        <Badge key={key} variant="secondary" className="text-xs">
                          {key}: {typeof value === 'number' ? Number(value).toFixed(2) : String(value)}
                        </Badge>
                      ))}
                  </div>
                </div>
              )}

              <Button
                onClick={() => handleDownload(result)}
                disabled={downloadingIds.has(result.name) || !result.url}
                className="w-full"
                size="sm"
              >
                {downloadingIds.has(result.name) ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin border-2 border-current border-t-transparent rounded-full" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}