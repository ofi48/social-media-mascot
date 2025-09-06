import { useState, useCallback } from 'react';
import { QueueItem, VideoPresetSettings } from '@/types/video-preset';
import { supabase } from '@/integrations/supabase/client';
import { generateProcessingParameters, safeLog } from '@/utils/videoProcessing';
import { validateVideoFile } from '@/utils/videoValidation';
import { useFFmpegPreprocessing, type PreprocessingProgress } from '@/hooks/useFFmpegPreprocessing';
import { toast } from 'sonner';

interface UseVideoQueueReturn {
  queue: QueueItem[];
  isProcessing: boolean;
  currentItem: string | null;
  addVideosToQueue: (files: File[], settings: VideoPresetSettings, numCopies: number) => QueueItem[];
  removeFromQueue: (jobId: string) => void;
  clearQueue: () => void;
  retryJob: (jobId: string) => void;
  processBatch: () => Promise<void>;
  preprocessingProgress: Record<string, PreprocessingProgress>;
}

export const useVideoQueue = (): UseVideoQueueReturn => {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentItem, setCurrentItem] = useState<string | null>(null);
  const [preprocessingProgress, setPreprocessingProgress] = useState<Record<string, PreprocessingProgress>>({});
  const { preprocessVideo } = useFFmpegPreprocessing();

  const addVideosToQueue = useCallback((files: File[], settings: VideoPresetSettings, numCopies: number): QueueItem[] => {
    const newItems: QueueItem[] = files.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      fileName: file.name,
      fileSize: file.size,
      status: 'waiting',
      progress: 0,
      settings: { ...settings },
      numCopies
    }));

    setQueue(prev => [...prev, ...newItems]);
    return newItems;
  }, []);

  const removeFromQueue = useCallback((jobId: string) => {
    setQueue(prev => prev.filter(item => {
      if (item.id === jobId && item.status === 'processing') {
        return true; // Don't remove items currently being processed
      }
      return item.id !== jobId;
    }));
  }, []);

  const clearQueue = useCallback(() => {
    if (isProcessing) {
      toast.error('Cannot clear queue while processing');
      return;
    }
    setQueue([]);
  }, [isProcessing]);

  const retryJob = useCallback((jobId: string) => {
    setQueue(prev => prev.map(item => 
      item.id === jobId 
        ? { ...item, status: 'waiting' as const, progress: 0, error: undefined }
        : item
    ));
  }, []);

  const processBatch = useCallback(async () => {
    if (isProcessing) {
      toast.error('Processing is already in progress');
      return;
    }

    const waitingItems = queue.filter(item => item.status === 'waiting');
    if (waitingItems.length === 0) {
      toast.info('No videos waiting to be processed');
      return;
    }

    setIsProcessing(true);
    safeLog('[VideoQueue] Starting batch processing', { 
      itemCount: waitingItems.length,
      totalQueueSize: queue.length,
      memoryUsage: (performance as any).memory ? {
        used: Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round((performance as any).memory.totalJSHeapSize / 1024 / 1024)
      } : 'unavailable'
    });

    for (const item of waitingItems) {
      try {
        setCurrentItem(item.id);
        
        // Update item status to processing
        setQueue(prev => prev.map(queueItem => 
          queueItem.id === item.id 
            ? { ...queueItem, status: 'processing' as const, progress: 0 }
            : queueItem
        ));

        safeLog(`[VideoQueue] Processing item ${item.id}: ${item.fileName}`, {
          fileSize: `${(item.fileSize / 1024 / 1024).toFixed(2)}MB`,
          numCopies: item.numCopies,
          enabledSettings: Object.keys(item.settings || {}).filter(key => {
            const setting = item.settings?.[key as keyof VideoPresetSettings];
            return typeof setting === 'object' && setting !== null && 'enabled' in setting && setting.enabled;
          })
        });

        // Simulate progress updates
        let progressInterval: NodeJS.Timeout | null = null;
        progressInterval = setInterval(() => {
          setQueue(prev => prev.map(queueItem => 
            queueItem.id === item.id 
              ? { 
                  ...queueItem, 
                  progress: Math.min(queueItem.progress + Math.random() * 20, 90) 
                }
              : queueItem
          ));
        }, 1000);

        // Stage 1: Validation
        setQueue(prev => prev.map(queueItem => 
          queueItem.id === item.id 
            ? { ...queueItem, progress: 5 }
            : queueItem
        ));

        const validation = await validateVideoFile(item.file);
        let fileToProcess = item.file;

        // Stage 2: Conditional Preprocessing
        if (validation.needsPreprocessing) {
          setQueue(prev => prev.map(queueItem => 
            queueItem.id === item.id 
              ? { ...queueItem, progress: 10 }
              : queueItem
          ));

          try {
            fileToProcess = await preprocessVideo(item.file, {}, (progress) => {
              setPreprocessingProgress(prev => ({
                ...prev,
                [item.id]: progress
              }));
              
              // Update queue progress during preprocessing (10-50%)
              const adjustedProgress = 10 + (progress.progress * 0.4);
              setQueue(prev => prev.map(queueItem => 
                queueItem.id === item.id 
                  ? { ...queueItem, progress: adjustedProgress }
                  : queueItem
              ));
            });

            toast.success(`✅ ${item.fileName} compressed successfully`);
          } catch (error) {
            throw new Error(`Preprocessing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }

        // Stage 3: Upload preparation
        setQueue(prev => prev.map(queueItem => 
          queueItem.id === item.id 
            ? { ...queueItem, progress: 55 }
            : queueItem
        ));

        // Create FormData for processing
        const formData = new FormData();
        formData.append('video', fileToProcess);
        formData.append('settings', JSON.stringify(item.settings));
        formData.append('numCopies', (item.numCopies || 3).toString());

        // Stage 4: Server processing with timeout
        setQueue(prev => prev.map(queueItem => 
          queueItem.id === item.id 
            ? { ...queueItem, progress: 60 }
            : queueItem
        ));

        // Call the processing function with timeout
        const response = await Promise.race([
          supabase.functions.invoke('process-video', {
            body: formData
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout (3 minutes)')), 180000)
          )
        ]) as any;

        if (progressInterval) clearInterval(progressInterval);

        safeLog(`[VideoQueue] Edge Function response for ${item.fileName}`, {
          hasError: !!response.error,
          hasData: !!response.data,
          dataSuccess: response.data?.success,
          errorMessage: response.error?.message
        });

        if (response.error) {
          // Show specific error message for Railway failures
          if (response.error.message?.includes('non-2xx')) {
            throw new Error('⚠️ Processing failed. Please try again with a smaller or shorter video.');
          }
          throw new Error(`Edge Function error: ${response.error.message || 'Unknown error'}`);
        }

        if (!response.data?.success) {
          throw new Error(`⚠️ Processing failed. Please try again with a smaller or shorter video.`);
        }

        const results = response.data.results || [];

        // Validate and normalize result URLs
        const processedResults = results.map((result: any) => ({
          name: result.name,
          url: result.url.startsWith('http') 
            ? result.url 
            : `https://social-media-mascot.railway.internal${result.url}`,
          processingDetails: result.processingDetails
        }));

        // Update item as completed
        setQueue(prev => prev.map(queueItem => 
          queueItem.id === item.id 
            ? { 
                ...queueItem, 
                status: 'completed' as const, 
                progress: 100,
                results: processedResults
              }
            : queueItem
        ));

        safeLog(`[VideoQueue] Successfully processed ${item.fileName}`, { 
          resultCount: processedResults.length,
          resultUrls: processedResults.map(r => r.url)
        });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        safeLog(`[VideoQueue] Error processing ${item.fileName}`, { 
          error: errorMessage,
          errorType: error instanceof Error ? error.constructor.name : 'Unknown',
          fileSize: `${(item.fileSize / 1024 / 1024).toFixed(2)}MB`
        });
        
        // Update item as error
        setQueue(prev => prev.map(queueItem => 
          queueItem.id === item.id 
            ? { 
                ...queueItem, 
                status: 'error' as const, 
                progress: 0,
                error: errorMessage
              }
            : queueItem
        ));

        // Show specific error toast with actionable message
        if (errorMessage.includes('⚠️')) {
          toast.error(errorMessage);
        } else {
          toast.error(`Error processing ${item.fileName}: ${errorMessage}`);
        }
        
        // Clean up preprocessing progress
        setPreprocessingProgress(prev => {
          const { [item.id]: removed, ...rest } = prev;
          return rest;
        });
      }

      // Small delay between items
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setCurrentItem(null);
    setIsProcessing(false);

    const completedCount = queue.filter(item => item.status === 'completed').length;
    const errorCount = queue.filter(item => item.status === 'error').length;

    if (completedCount > 0) {
      toast.success(`Batch processing completed! ${completedCount} videos processed successfully.`);
    }
    
    if (errorCount > 0) {
      toast.error(`${errorCount} videos failed to process.`);
    }

    safeLog('[VideoQueue] Batch processing completed', { 
      total: waitingItems.length, 
      completed: completedCount, 
      errors: errorCount,
      finalQueueState: queue.map(item => ({
        id: item.id,
        fileName: item.fileName,
        status: item.status,
        hasResults: !!item.results?.length
      }))
    });
  }, [queue, isProcessing]);

  return {
    queue,
    isProcessing,
    currentItem,
    addVideosToQueue,
    removeFromQueue,
    clearQueue,
    retryJob,
    processBatch,
    preprocessingProgress
  };
};