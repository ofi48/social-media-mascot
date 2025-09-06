import React, { createContext, useContext, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useJobStatus } from '@/hooks/useJobStatus';

interface FFmpegParameter {
  min: number;
  max: number;
  enabled: boolean;
}

interface VideoSpooferSettings {
  // Color adjustments
  saturation: FFmpegParameter;
  contrast: FFmpegParameter;
  brightness: FFmpegParameter;
  hue: FFmpegParameter;
  gamma: FFmpegParameter;
  
  // Visual effects
  blur: FFmpegParameter;
  sharpness: FFmpegParameter;
  noise: FFmpegParameter;
  
  // Transformations
  speed: FFmpegParameter;
  zoom: FFmpegParameter;
  rotation: FFmpegParameter;
  flipHorizontal: boolean;
  
  // Audio
  volume: FFmpegParameter;
  audioFade: FFmpegParameter;
  highpass: FFmpegParameter;
  lowpass: FFmpegParameter;
  
  // Quality
  videoBitrate: FFmpegParameter;
  frameRate: FFmpegParameter;
  
  // Advanced
  stabilization: FFmpegParameter;
  colorTemperature: FFmpegParameter;
}

interface VideoSpooferResult {
  name: string;
  url: string;
  processingDetails: any;
}

interface VideoSpooferContextType {
  settings: VideoSpooferSettings;
  updateSettings: (newSettings: Partial<VideoSpooferSettings>) => void;
  resetSettings: () => void;
  
  selectedFiles: File[];
  setSelectedFiles: (files: File[]) => void;
  
  numVariations: number;
  setNumVariations: (num: number) => void;
  
  isProcessing: boolean;
  processingProgress: number;
  
  results: VideoSpooferResult[];
  
  processVideos: () => Promise<void>;
  
  // Job status tracking
  currentJobId: string | null;
  jobStatus: any;
}

const DEFAULT_SETTINGS: VideoSpooferSettings = {
  // Color adjustments
  saturation: { min: 0.8, max: 1.2, enabled: true },
  contrast: { min: 0.9, max: 1.1, enabled: true },
  brightness: { min: -0.1, max: 0.1, enabled: true },
  hue: { min: -30, max: 30, enabled: false },
  gamma: { min: 0.9, max: 1.1, enabled: false },
  
  // Visual effects
  blur: { min: 0, max: 2, enabled: false },
  sharpness: { min: 0, max: 2, enabled: false },
  noise: { min: 0, max: 0.05, enabled: false },
  
  // Transformations
  speed: { min: 0.95, max: 1.05, enabled: true },
  zoom: { min: 1.0, max: 1.05, enabled: false },
  rotation: { min: -2, max: 2, enabled: false },
  flipHorizontal: false,
  
  // Audio
  volume: { min: 0.9, max: 1.1, enabled: false },
  audioFade: { min: 0, max: 2, enabled: false },
  highpass: { min: 100, max: 1000, enabled: false },
  lowpass: { min: 5000, max: 15000, enabled: false },
  
  // Quality
  videoBitrate: { min: 1000, max: 3000, enabled: true },
  frameRate: { min: 24, max: 30, enabled: false },
  
  // Advanced
  stabilization: { min: 0, max: 1, enabled: false },
  colorTemperature: { min: 3000, max: 7000, enabled: false },
};

const VideoSpooferContext = createContext<VideoSpooferContextType | undefined>(undefined);

export function VideoSpooferProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<VideoSpooferSettings>(DEFAULT_SETTINGS);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [numVariations, setNumVariations] = useState(3);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [results, setResults] = useState<VideoSpooferResult[]>([]);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { jobStatus } = useJobStatus(currentJobId);

  const updateSettings = useCallback((newSettings: Partial<VideoSpooferSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const processVideos = useCallback(async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one video file to process.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);
    setResults([]);

    try {
      // Process each file individually
      const allResults: VideoSpooferResult[] = [];
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        
        // Validate file size (100MB max)
        if (file.size > 100 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} exceeds the 100MB limit.`,
            variant: "destructive",
          });
          continue;
        }

        setProcessingProgress((i / selectedFiles.length) * 50);

        // Call Supabase edge function
        const formData = new FormData();
        formData.append('video', file);
        formData.append('settings', JSON.stringify(settings));
        formData.append('numCopies', numVariations.toString());
        formData.append('operation', 'video-spoofer');

        const { data, error } = await supabase.functions.invoke('process-video', {
          body: formData,
        });

        if (error) {
          throw new Error(error.message);
        }

        if (data.jobId) {
          setCurrentJobId(data.jobId);
          
          // Poll for results
          let attempts = 0;
          const maxAttempts = 60; // 10 minutes max
          
          while (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
            
            const { data: statusData, error: statusError } = await supabase.functions.invoke('check-job-status', {
              body: { jobId: data.jobId }
            });

            if (statusError) {
              console.error('Status check error:', statusError);
              break;
            }

            if (statusData.status === 'completed') {
              allResults.push(...statusData.results);
              break;
            } else if (statusData.status === 'failed') {
              throw new Error(statusData.errorMessage || 'Processing failed');
            }
            
            attempts++;
            setProcessingProgress(50 + (attempts / maxAttempts) * 50);
          }
        }
      }

      setResults(allResults);
      setProcessingProgress(100);

      toast({
        title: "Processing complete",
        description: `Successfully processed ${allResults.length} video variations.`,
      });

    } catch (error) {
      console.error('Processing error:', error);
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setCurrentJobId(null);
    }
  }, [selectedFiles, settings, numVariations, toast]);

  const value: VideoSpooferContextType = {
    settings,
    updateSettings,
    resetSettings,
    selectedFiles,
    setSelectedFiles,
    numVariations,
    setNumVariations,
    isProcessing,
    processingProgress,
    results,
    processVideos,
    currentJobId,
    jobStatus,
  };

  return (
    <VideoSpooferContext.Provider value={value}>
      {children}
    </VideoSpooferContext.Provider>
  );
}

export function useVideoSpoofer() {
  const context = useContext(VideoSpooferContext);
  if (context === undefined) {
    throw new Error('useVideoSpoofer must be used within a VideoSpooferProvider');
  }
  return context;
}