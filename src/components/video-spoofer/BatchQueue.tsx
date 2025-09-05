import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trash2, Play, RefreshCw, Download, X } from "lucide-react";
import { useVideoProcessing } from "./VideoProcessingContext";
import { toast } from "sonner";

interface BatchQueueProps {
  variations: number;
  setVariations: (value: number) => void;
}

export const BatchQueue = ({ variations, setVariations }: BatchQueueProps) => {
  const { 
    queue, 
    removeFromQueue, 
    clearQueue, 
    retryJob, 
    processBatch, 
    isProcessing,
    results,
    downloadAllResults
  } = useVideoProcessing();

  const handleStartBatch = async () => {
    if (queue.filter(job => job.status === 'waiting').length === 0) {
      toast.error("No videos in queue to process");
      return;
    }
    
    toast.success("Starting batch processing...");
    await processBatch(variations);
    toast.success("Batch processing completed!");
  };

  const handleDownloadAll = () => {
    if (results.length === 0) {
      toast.error("No processed videos to download");
      return;
    }
    
    const totalVariations = results.reduce((sum, result) => sum + result.variants.length, 0);
    toast.success(`Starting download of ${totalVariations} video variations...`);
    downloadAllResults();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-muted';
      case 'processing': return 'bg-primary';
      case 'completed': return 'bg-secondary';
      case 'error': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting': return 'Waiting';
      case 'processing': return 'Processing';
      case 'completed': return 'Completed';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
  };

  return (
    <div className="space-y-4">
      {/* Queue Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Variations per video:</span>
            <Badge variant="secondary">{variations}</Badge>
          </div>
          <input
            type="range"
            min="1"
            max="20"
            value={variations}
            onChange={(e) => setVariations(Number(e.target.value))}
            className="w-24"
            disabled={isProcessing}
          />
        </div>
        
        <div className="flex items-center gap-2">
          {results.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadAll}
              disabled={isProcessing}
            >
              <Download className="mr-2 h-4 w-4" />
              Download All ({results.reduce((sum, result) => sum + result.variants.length, 0)})
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={clearQueue}
            disabled={isProcessing || queue.length === 0}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Queue
          </Button>
          <Button
            variant="hero"
            size="sm"
            onClick={handleStartBatch}
            disabled={isProcessing || queue.filter(job => job.status === 'waiting').length === 0}
          >
            <Play className="mr-2 h-4 w-4" />
            {isProcessing ? 'Processing...' : 'Start Batch'}
          </Button>
        </div>
      </div>

      {/* Queue Status */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>Total: {queue.length}</span>
        <span>Waiting: {queue.filter(j => j.status === 'waiting').length}</span>
        <span>Processing: {queue.filter(j => j.status === 'processing').length}</span>
        <span>Completed: {queue.filter(j => j.status === 'completed').length}</span>
        <span>Error: {queue.filter(j => j.status === 'error').length}</span>
      </div>

      {/* Queue Items */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {queue.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <p>No videos in queue. Upload videos to add them to the batch processing queue.</p>
            </CardContent>
          </Card>
        ) : (
          queue.map((job) => (
            <Card key={job.id}>
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <Badge 
                      variant="outline" 
                      className={`${getStatusColor(job.status)} text-white border-none min-w-[80px] justify-center`}
                    >
                      {getStatusText(job.status)}
                    </Badge>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{job.filename}</p>
                      {job.status === 'processing' && (
                        <div className="mt-1">
                          <Progress value={job.progress} className="h-1" />
                        </div>
                      )}
                      {job.status === 'error' && job.errorMessage && (
                        <p className="text-xs text-destructive mt-1">{job.errorMessage}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {job.status === 'error' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => retryJob(job.id)}
                        disabled={isProcessing}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )}
                    {job.status === 'completed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toast.success("Download would start here")}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromQueue(job.id)}
                      disabled={isProcessing && job.status === 'processing'}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};