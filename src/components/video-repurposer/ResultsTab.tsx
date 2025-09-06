import React from 'react';
import { Download, Trash2, Video, FileArchive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VideoCard } from './VideoCard';
import { VideoProcessingResult, QueueItem } from '@/types/video-preset';
import { toast } from 'sonner';

interface ResultsTabProps {
  results: VideoProcessingResult[];
  batchResults?: QueueItem[];
  onPreview: (name: string, url: string) => void;
  onDownload: (name: string, url: string) => void;
  onClearResults: () => void;
}

export const ResultsTab: React.FC<ResultsTabProps> = ({
  results,
  batchResults = [],
  onPreview,
  onDownload,
  onClearResults
}) => {
  const handleDownloadAll = async () => {
    if (results.length === 0) return;
    
    toast.info('Starting download of all videos...');
    
    for (const result of results) {
      try {
        await onDownload(result.name, result.url);
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between downloads
      } catch (error) {
        console.error(`Failed to download ${result.name}:`, error);
      }
    }
    
    toast.success(`Downloaded ${results.length} videos`);
  };

  const handleDownloadBatchJob = async (job: QueueItem) => {
    if (!job.results || job.results.length === 0) return;
    
    toast.info(`Downloading ${job.results.length} videos from ${job.fileName}...`);
    
    for (const result of job.results) {
      try {
        await onDownload(result.name, result.url);
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Failed to download ${result.name}:`, error);
      }
    }
    
    toast.success(`Downloaded ${job.results.length} videos from ${job.fileName}`);
  };

  const totalResults = results.length + batchResults.reduce((sum, job) => sum + (job.results?.length || 0), 0);

  if (totalResults === 0) {
    return (
      <div className="text-center py-12">
        <Video className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Results Yet</h3>
        <p className="text-muted-foreground mb-6">
          Process some videos to see your results here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <FileArchive className="h-5 w-5" />
              Processing Results ({totalResults} videos)
            </CardTitle>
            <div className="flex gap-2">
              {results.length > 0 && (
                <Button onClick={handleDownloadAll} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download All ({results.length})
                </Button>
              )}
              <Button onClick={onClearResults} variant="outline">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Single Processing Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Single Processing Results</h3>
            <Button onClick={handleDownloadAll} size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download All ({results.length})
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {results.map((result, index) => (
              <VideoCard
                key={`${result.name}-${index}`}
                result={result}
                onPreview={onPreview}
                onDownload={onDownload}
              />
            ))}
          </div>
        </div>
      )}

      {/* Batch Processing Results */}
      {batchResults.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Batch Processing Results</h3>
          
          {batchResults.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-base">{job.fileName}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {job.results?.length || 0} variations generated
                    </p>
                  </div>
                  {job.results && job.results.length > 0 && (
                    <Button 
                      onClick={() => handleDownloadBatchJob(job)} 
                      size="sm" 
                      variant="outline"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download All ({job.results.length})
                    </Button>
                  )}
                </div>
              </CardHeader>
              
              {job.results && job.results.length > 0 && (
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {job.results.map((result, index) => (
                      <VideoCard
                        key={`${job.id}-${result.name}-${index}`}
                        result={result}
                        onPreview={onPreview}
                        onDownload={onDownload}
                      />
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};