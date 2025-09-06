import { useState, useCallback } from 'react';
import { VideoProcessingJob, VideoPresetSettings } from '@/types/video-preset';
import { generateProcessingParameters, safeLog } from '@/utils/videoProcessing';
import { toast } from 'sonner';

interface UseVideoQueueReturn {
  queue: VideoProcessingJob[];
  isProcessing: boolean;
  addToQueue: (files: File[]) => void;
  removeFromQueue: (jobId: string) => void;
  clearQueue: () => void;
  retryJob: (jobId: string) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  processBatch: (settings: VideoPresetSettings, variationsPerVideo: number) => Promise<void>;
}

export function useVideoQueue(): UseVideoQueueReturn {
  const [queue, setQueue] = useState<VideoProcessingJob[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const addToQueue = useCallback((files: File[]) => {
    const newJobs: VideoProcessingJob[] = files.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      filename: file.name,
      file,
      status: 'waiting',
      progress: 0
    }));

    setQueue(prev => [...prev, ...newJobs]);
    safeLog('Added files to queue', { count: files.length });
    toast.success(`Added ${files.length} video${files.length > 1 ? 's' : ''} to queue`);
  }, []);

  const removeFromQueue = useCallback((jobId: string) => {
    setQueue(prev => {
      const job = prev.find(j => j.id === jobId);
      if (job?.status === 'processing') {
        toast.error('Cannot remove job while processing');
        return prev;
      }
      
      const newQueue = prev.filter(j => j.id !== jobId);
      safeLog('Removed job from queue', { jobId, filename: job?.filename });
      return newQueue;
    });
  }, []);

  const clearQueue = useCallback(() => {
    const processingJobs = queue.filter(job => job.status === 'processing');
    if (processingJobs.length > 0) {
      toast.error('Cannot clear queue while jobs are processing');
      return;
    }

    setQueue([]);
    safeLog('Cleared queue');
    toast.success('Queue cleared');
  }, [queue]);

  const retryJob = useCallback((jobId: string) => {
    setQueue(prev => prev.map(job => 
      job.id === jobId 
        ? { ...job, status: 'waiting', progress: 0, errorMessage: undefined }
        : job
    ));
    safeLog('Retrying job', { jobId });
  }, []);

  const reorderQueue = useCallback((fromIndex: number, toIndex: number) => {
    setQueue(prev => {
      const newQueue = [...prev];
      const [movedJob] = newQueue.splice(fromIndex, 1);
      newQueue.splice(toIndex, 0, movedJob);
      return newQueue;
    });
  }, []);

  const processBatch = useCallback(async (
    settings: VideoPresetSettings, 
    variationsPerVideo: number
  ) => {
    if (isProcessing) {
      toast.error('Batch processing already in progress');
      return;
    }

    const waitingJobs = queue.filter(job => job.status === 'waiting');
    if (waitingJobs.length === 0) {
      toast.error('No videos in queue to process');
      return;
    }

    setIsProcessing(true);
    safeLog('Starting batch processing', { 
      jobCount: waitingJobs.length, 
      variationsPerVideo 
    });

    for (const job of waitingJobs) {
      try {
        // Update job status to processing
        setQueue(prev => prev.map(j => 
          j.id === job.id 
            ? { ...j, status: 'processing', progress: 0 }
            : j
        ));

        // Generate processing parameters
        const parameters = generateProcessingParameters(settings, variationsPerVideo);

        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setQueue(prev => prev.map(j => 
            j.id === job.id 
              ? { ...j, progress: Math.min(j.progress + Math.random() * 20, 90) }
              : j
          ));
        }, 1000);

        // Prepare form data
        const formData = new FormData();
        formData.append('video', job.file);
        formData.append('settings', JSON.stringify(settings));
        formData.append('numCopies', variationsPerVideo.toString());

        // Call processing endpoint
        const response = await fetch('/functions/v1/process-video', {
          method: 'POST',
          body: formData,
        });

        clearInterval(progressInterval);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Processing failed');
        }

        // Map results with generated parameters
        const processedResults = result.results.map((res: any, index: number) => ({
          name: res.name,
          url: res.url,
          processingDetails: parameters[index] || {}
        }));

        // Update job as completed
        setQueue(prev => prev.map(j => 
          j.id === job.id 
            ? { 
                ...j, 
                status: 'completed', 
                progress: 100, 
                results: processedResults,
                processingDetails: parameters 
              }
            : j
        ));

        safeLog('Job completed successfully', { 
          jobId: job.id, 
          resultCount: processedResults.length 
        });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Update job as failed
        setQueue(prev => prev.map(j => 
          j.id === job.id 
            ? { 
                ...j, 
                status: 'error', 
                progress: 0, 
                errorMessage 
              }
            : j
        ));

        safeLog('Job failed', { jobId: job.id, error: errorMessage });
      }

      // Small delay between jobs to prevent overwhelming
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsProcessing(false);
    
    const completedCount = queue.filter(job => job.status === 'completed').length;
    const errorCount = queue.filter(job => job.status === 'error').length;
    
    if (errorCount === 0) {
      toast.success(`Batch processing completed! Processed ${completedCount} videos.`);
    } else {
      toast.warning(`Batch processing finished with ${errorCount} errors. ${completedCount} videos processed successfully.`);
    }

    safeLog('Batch processing completed', { completedCount, errorCount });
  }, [queue, isProcessing]);

  return {
    queue,
    isProcessing,
    addToQueue,
    removeFromQueue,
    clearQueue,
    retryJob,
    reorderQueue,
    processBatch
  };
}