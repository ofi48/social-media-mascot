import { useState, useCallback } from 'react';
import { VideoProcessingResult, ProcessingParameters, VideoPresetSettings, VideoMetadata } from '@/types/video-preset';
import { generateProcessingParameters, analyzeVideoMetadata, safeLog } from '@/utils/videoProcessing';
import { toast } from 'sonner';

interface UseVideoProcessingReturn {
  isProcessing: boolean;
  progress: number;
  results: VideoProcessingResult[];
  error: string | null;
  metadata: VideoMetadata | null;
  processVideo: (file: File, settings: VideoPresetSettings, numCopies: number) => Promise<void>;
  resetResults: () => void;
  analyzeFile: (file: File) => Promise<void>;
}

export function useVideoProcessing(): UseVideoProcessingReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<VideoProcessingResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);

  const analyzeFile = useCallback(async (file: File) => {
    try {
      safeLog('Analyzing video metadata', { filename: file.name, size: file.size });
      const videoMetadata = await analyzeVideoMetadata(file);
      setMetadata(videoMetadata);
      safeLog('Video metadata analyzed', videoMetadata);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze video';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, []);

  const processVideo = useCallback(async (
    file: File, 
    settings: VideoPresetSettings, 
    numCopies: number
  ) => {
    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setResults([]);

    try {
      safeLog('Starting video processing', { 
        filename: file.name, 
        numCopies, 
        enabledSettings: Object.keys(settings).filter(key => {
          const setting = settings[key as keyof VideoPresetSettings];
          return typeof setting === 'object' && setting !== null && 'enabled' in setting && setting.enabled;
        })
      });

      // Generate processing parameters
      const parameters = generateProcessingParameters(settings, numCopies);
      safeLog('Generated processing parameters', parameters);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          return newProgress > 80 ? 80 : newProgress;
        });
      }, 500);

      // Prepare form data
      const formData = new FormData();
      formData.append('video', file);
      formData.append('settings', JSON.stringify(settings));
      formData.append('numCopies', numCopies.toString());

      // Call Supabase Edge Function with retry logic
      const response = await callWithRetry(async () => {
        const res = await fetch('/functions/v1/process-video', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const contentType = res.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          throw new Error('Server returned non-JSON response');
        }

        return res.json();
      }, 3);

      clearInterval(progressInterval);

      if (!response.success) {
        throw new Error(response.error || 'Processing failed');
      }

      // Map results with generated parameters
      const processedResults: VideoProcessingResult[] = response.results.map(
        (result: any, index: number) => ({
          name: result.name,
          url: result.url,
          processingDetails: parameters[index] || {}
        })
      );

      setResults(processedResults);
      setProgress(100);
      
      safeLog('Video processing completed', { 
        resultCount: processedResults.length 
      });

      toast.success(`Successfully processed ${numCopies} video variation${numCopies > 1 ? 's' : ''}`);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Processing failed';
      setError(errorMessage);
      setProgress(0);
      safeLog('Video processing failed', { error: errorMessage });
      toast.error(`Processing failed: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const resetResults = useCallback(() => {
    setResults([]);
    setError(null);
    setProgress(0);
    setMetadata(null);
  }, []);

  return {
    isProcessing,
    progress,
    results,
    error,
    metadata,
    processVideo,
    resetResults,
    analyzeFile
  };
}

// Utility function for retry logic with exponential backoff
async function callWithRetry<T>(
  fn: () => Promise<T>, 
  retries: number = 3,
  delay: number = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      safeLog(`Retrying request, ${retries} attempts remaining`, { delay });
      await new Promise(resolve => setTimeout(resolve, delay));
      return callWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}