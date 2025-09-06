import { useState, useCallback } from 'react';
import { VideoProcessingResult, VideoPresetSettings, VideoMetadata } from '@/types/video-preset';
import { supabase } from '@/integrations/supabase/client';
import { generateProcessingParameters, analyzeVideoMetadata, safeLog } from '@/utils/videoProcessing';
import { toast } from 'sonner';

interface UseVideoProcessingReturn {
  uploadedFile: File | null;
  uploadedFileUrl: string;
  isProcessing: boolean;
  progress: number;
  results: VideoProcessingResult[];
  error: string | null;
  metadata: VideoMetadata | null;
  handleFileSelect: (file: File) => void;
  processVideo: (numCopies: number, settings: VideoPresetSettings) => Promise<void>;
  resetResults: () => void;
  analyzeFile: (file: File) => Promise<void>;
}

export const useVideoProcessing = (): UseVideoProcessingReturn => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<VideoProcessingResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    try {
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setUploadedFileUrl(url);
      
      await analyzeFile(file);
      
      toast.success(`File selected: ${file.name}`);
    } catch (error) {
      toast.error('Failed to load video file');
    }
  }, []);

  const analyzeFile = useCallback(async (file: File) => {
    try {
      safeLog('Analyzing video metadata', { filename: file.name, size: file.size });
      const videoMetadata = await analyzeVideoMetadata(file);
      setMetadata(videoMetadata);
      safeLog('Video metadata analyzed', videoMetadata);
    } catch (error) {
      console.error('Error analyzing file:', error);
      setError('Failed to analyze video file');
    }
  }, []);

  const processVideo = useCallback(async (numCopies: number, settings: VideoPresetSettings) => {
    if (!uploadedFile) {
      setError('No file provided');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setResults([]);

    try {
      safeLog('Starting video processing', {
        filename: uploadedFile.name,
        numCopies,
        enabledSettings: Object.keys(settings).filter(key => {
          const setting = settings[key as keyof VideoPresetSettings];
          return setting && typeof setting === 'object' && 'enabled' in setting && setting.enabled;
        })
      });

      // Generate processing parameters for each copy
      const processingParams = Array.from({ length: numCopies }, (_, index) => 
        generateProcessingParameters(settings, numCopies, index.toString())
      );

      safeLog('Generated processing parameters', processingParams);

      // Simulate progress updates
      let progressInterval: NodeJS.Timeout | null = null;
      progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 1000);

      // Create FormData for the request
      const formData = new FormData();
      formData.append('video', uploadedFile);
      formData.append('settings', JSON.stringify(settings));
      formData.append('numCopies', numCopies.toString());

      // Call the edge function with retry logic
      const response = await callWithRetry(async () => {
        return await supabase.functions.invoke('process-video', {
          body: formData
        });
      }, 3);

      if (progressInterval) clearInterval(progressInterval);

      if (response.error) {
        throw new Error(response.error.message || 'Edge Function returned an error');
      }

      if (!response.data) {
        throw new Error('No data returned from processing');
      }

      if (!response.data.success) {
        throw new Error(response.data.error || 'Processing failed');
      }

      const processedResults = response.data.results || [];

      // If background mode (initial URLs empty), start polling for real results
      const first = processedResults[0];
      const jobId = first?.processingDetails?.jobId as string | undefined;

      if (jobId) {
        // Poll check-job-status until completed or timeout
        const start = Date.now();
        const timeoutMs = 12 * 60 * 1000; // 12 minutes safety window
        let lastStatus = 'processing';

        while (Date.now() - start < timeoutMs) {
          const { data, error } = await supabase.functions.invoke('check-job-status', {
            body: { jobId }
          });
          if (error) throw new Error(error.message);
          if ((data as any)?.status === 'completed') {
            const realResults = (data as any).results as VideoProcessingResult[];
            setResults(realResults);
            setProgress(100);
            toast.success(`Processing completed with ${realResults.length} videos`);
            return;
          }
          lastStatus = (data as any)?.status || lastStatus;
          await new Promise(r => setTimeout(r, 8000));
        }
        throw new Error('Processing timed out. Please try a smaller or shorter video.');
      }

      // Fallback (synchronous results)
      setResults(processedResults);
      setProgress(100);

      safeLog('Video processing completed', {
        resultCount: processedResults.length,
        results: processedResults
      });

      toast.success(`Successfully generated ${processedResults.length} video variants`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      safeLog('Video processing failed', { error: errorMessage });
      toast.error(`Processing failed: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  }, [uploadedFile]);

  const resetResults = useCallback(() => {
    setResults([]);
    setProgress(0);
    setError(null);
    setMetadata(null);
    setUploadedFile(null);
    setUploadedFileUrl("");
  }, []);

  return {
    uploadedFile,
    uploadedFileUrl,
    isProcessing,
    progress,
    results,
    error,
    metadata,
    handleFileSelect,
    processVideo,
    resetResults,
    analyzeFile
  };
};

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