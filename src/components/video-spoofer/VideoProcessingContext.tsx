import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ProcessingParameters {
  // Video Quality Controls
  videoBitrate: { min: number; max: number; enabled: boolean };
  audioBitrate: { min: number; max: number; enabled: boolean };
  frameRate: { min: number; max: number; enabled: boolean };
  
  // Color Adjustment Engine
  saturation: { min: number; max: number; enabled: boolean };
  contrast: { min: number; max: number; enabled: boolean };
  brightness: { min: number; max: number; enabled: boolean };
  gamma: { min: number; max: number; enabled: boolean };
  
  // Visual Effects Processing
  vignette: { min: number; max: number; enabled: boolean };
  noise: { min: number; max: number; enabled: boolean };
  waveformShift: { min: number; max: number; enabled: boolean };
  pixelShift: { min: number; max: number; enabled: boolean };
  
  // Transformation Controls
  speed: { min: number; max: number; enabled: boolean };
  zoom: { min: number; max: number; enabled: boolean };
  rotation: { min: number; max: number; enabled: boolean };
  flipHorizontal: boolean;
  
  // Size and Trimming
  customPixelSize: { width: number; height: number; enabled: boolean };
  randomPixelSize: boolean;
  trimStart: { min: number; max: number; enabled: boolean };
  trimEnd: { min: number; max: number; enabled: boolean };
  
  // Audio Processing
  volume: { min: number; max: number; enabled: boolean };
  
  // Special Features
  usMetadata: boolean;
  blurredBorder: { min: number; max: number; enabled: boolean };
  
  // Watermark System
  watermark: {
    enabled: boolean;
    size: number;
    opacity: number;
    positionX: number;
    positionY: number;
  };
}

export interface ProcessingJob {
  id: string;
  filename: string;
  status: 'waiting' | 'processing' | 'completed' | 'error';
  progress: number;
  errorMessage?: string;
  resultUrls?: string[];
  uploadProgress?: number;
}

export interface ProcessedResult {
  id: string;
  originalFilename: string;
  variants: {
    id: string;
    url: string;
    filename: string;
    parameters: any;
  }[];
  timestamp: Date;
}

export interface Preset {
  id: string;
  name: string;
  parameters: ProcessingParameters;
  createdAt: Date;
}

interface VideoProcessingContextType {
  // Parameters
  parameters: ProcessingParameters;
  setParameters: (params: ProcessingParameters) => void;
  updateParameter: (key: string, value: any) => void;
  
  // Processing Mode
  processingMode: 'single' | 'batch';
  setProcessingMode: (mode: 'single' | 'batch') => void;
  
  // Queue Management
  queue: ProcessingJob[];
  addToQueue: (files: File[]) => void;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;
  retryJob: (id: string) => void;
  
  // Processing
  processVideo: (file: File, variations: number) => Promise<void>;
  processBatch: (variations: number) => Promise<void>;
  
  // Results
  results: ProcessedResult[];
  addResult: (result: ProcessedResult) => void;
  clearResults: () => void;
  
  // Presets
  presets: Preset[];
  savePreset: (name: string) => void;
  loadPreset: (preset: Preset) => void;
  deletePreset: (id: string) => void;
  
  // UI State
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

const defaultParameters: ProcessingParameters = {
  videoBitrate: { min: 1000, max: 15000, enabled: false },
  audioBitrate: { min: 64, max: 320, enabled: false },
  frameRate: { min: 24, max: 60, enabled: false },
  saturation: { min: 0.5, max: 1.5, enabled: false },
  contrast: { min: 0.5, max: 1.5, enabled: false },
  brightness: { min: -0.3, max: 0.3, enabled: false },
  gamma: { min: 0.7, max: 1.3, enabled: false },
  vignette: { min: 0, max: 0.8, enabled: false },
  noise: { min: 0, max: 0.1, enabled: false },
  waveformShift: { min: 0, max: 5, enabled: false },
  pixelShift: { min: 0, max: 5, enabled: false },
  speed: { min: 0.5, max: 2.0, enabled: false },
  zoom: { min: 0.9, max: 1.2, enabled: false },
  rotation: { min: -10, max: 10, enabled: false },
  flipHorizontal: false,
  customPixelSize: { width: 1280, height: 720, enabled: false },
  randomPixelSize: false,
  trimStart: { min: 0, max: 10, enabled: false },
  trimEnd: { min: 0, max: 10, enabled: false },
  volume: { min: 0.5, max: 1.5, enabled: false },
  usMetadata: false,
  blurredBorder: { min: 0, max: 100, enabled: false },
  watermark: {
    enabled: false,
    size: 100,
    opacity: 0.5,
    positionX: 0.9,
    positionY: 0.1
  }
};

const VideoProcessingContext = createContext<VideoProcessingContextType | undefined>(undefined);

export const VideoProcessingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [parameters, setParameters] = useState<ProcessingParameters>(defaultParameters);
  const [processingMode, setProcessingMode] = useState<'single' | 'batch'>('single');
  const [queue, setQueue] = useState<ProcessingJob[]>([]);
  const [results, setResults] = useState<ProcessedResult[]>([]);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const updateParameter = (key: string, value: any) => {
    setParameters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const addToQueue = (files: File[]) => {
    const newJobs = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      filename: file.name,
      status: 'waiting' as const,
      progress: 0
    }));
    setQueue(prev => [...prev, ...newJobs]);
  };

  const removeFromQueue = (id: string) => {
    setQueue(prev => prev.filter(job => job.id !== id));
  };

  const clearQueue = () => {
    setQueue([]);
  };

  const retryJob = (id: string) => {
    setQueue(prev => prev.map(job => 
      job.id === id ? { ...job, status: 'waiting', progress: 0, errorMessage: undefined } : job
    ));
  };

  const processVideo = async (file: File, variations: number) => {
    // Mock processing implementation
    setIsProcessing(true);
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const result: ProcessedResult = {
        id: Math.random().toString(36).substr(2, 9),
        originalFilename: file.name,
        variants: Array.from({ length: variations }, (_, i) => {
          // Create a blob URL for each variant using the original file
          const blob = new Blob([file], { type: file.type });
          const url = URL.createObjectURL(blob);
          
          return {
            id: Math.random().toString(36).substr(2, 9),
            url: url,
            filename: `${file.name.split('.')[0]}_variant_${i + 1}.mp4`,
            parameters: { /* processed parameters */ },
            originalFile: file // Store reference to original file for downloads
          };
        }),
        timestamp: new Date()
      };
      
      addResult(result);
    } finally {
      setIsProcessing(false);
    }
  };

  const processBatch = async (variations: number) => {
    setIsProcessing(true);
    try {
      for (const job of queue.filter(j => j.status === 'waiting')) {
        setQueue(prev => prev.map(j => 
          j.id === job.id ? { ...j, status: 'processing' } : j
        ));
        
        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setQueue(prev => prev.map(j => 
          j.id === job.id ? { ...j, status: 'completed', progress: 100 } : j
        ));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const addResult = (result: ProcessedResult) => {
    setResults(prev => [result, ...prev]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const savePreset = (name: string) => {
    const preset: Preset = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      parameters: { ...parameters },
      createdAt: new Date()
    };
    setPresets(prev => [preset, ...prev]);
  };

  const loadPreset = (preset: Preset) => {
    setParameters(preset.parameters);
  };

  const deletePreset = (id: string) => {
    setPresets(prev => prev.filter(p => p.id !== id));
  };

  return (
    <VideoProcessingContext.Provider value={{
      parameters,
      setParameters,
      updateParameter,
      processingMode,
      setProcessingMode,
      queue,
      addToQueue,
      removeFromQueue,
      clearQueue,
      retryJob,
      processVideo,
      processBatch,
      results,
      addResult,
      clearResults,
      presets,
      savePreset,
      loadPreset,
      deletePreset,
      isProcessing,
      setIsProcessing
    }}>
      {children}
    </VideoProcessingContext.Provider>
  );
};

export const useVideoProcessing = () => {
  const context = useContext(VideoProcessingContext);
  if (context === undefined) {
    throw new Error('useVideoProcessing must be used within a VideoProcessingProvider');
  }
  return context;
};