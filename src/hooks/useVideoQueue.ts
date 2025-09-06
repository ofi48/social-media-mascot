import { useState, useCallback } from 'react';
import { QueueItem, VideoPresetSettings } from '@/types/video-preset';
import { supabase } from '@/integrations/supabase/client';
import { generateProcessingParameters, safeLog } from '@/utils/videoProcessing';
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
}

export const useVideoQueue = (): UseVideoQueueReturn => {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentItem, setCurrentItem] = useState<string | null>(null);

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
    safeLog('Starting batch processing', { itemCount: waitingItems.length });

    for (const item of waitingItems) {
      try {
        setCurrentItem(item.id);
        
        // Update item status to processing
        setQueue(prev => prev.map(queueItem => 
          queueItem.id === item.id 
            ? { ...queueItem, status: 'processing' as const, progress: 0 }
            : queueItem
        ));

        safeLog(`Processing item ${item.id}: ${item.fileName}`);

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

        // Create FormData for processing
        const formData = new FormData();
        formData.append('video', item.file);
        formData.append('settings', JSON.stringify(item.settings));
        formData.append('numCopies', (item.numCopies || 3).toString());

        // Call the processing function
        const response = await supabase.functions.invoke('process-video', {
          body: formData
        });

        if (progressInterval) clearInterval(progressInterval);

        if (response.error) {
          throw new Error(response.error.message || 'Processing failed');
        }

        if (!response.data?.success) {
          throw new Error(response.data?.error || 'Processing failed');
        }

        const results = response.data.results || [];

        // Update item as completed
        setQueue(prev => prev.map(queueItem => 
          queueItem.id === item.id 
            ? { 
                ...queueItem, 
                status: 'completed' as const, 
                progress: 100,
                results: results
              }
            : queueItem
        ));

        safeLog(`Successfully processed ${item.fileName}`, { resultCount: results.length });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
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

        safeLog(`Failed to process ${item.fileName}`, { error: errorMessage });
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

    safeLog('Batch processing completed', { 
      total: waitingItems.length, 
      completed: completedCount, 
      errors: errorCount 
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
    processBatch
  };
};