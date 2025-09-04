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

  const applyVideoProcessing = async (file: File, params: ProcessingParameters): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      video.crossOrigin = 'anonymous';
      video.muted = true;
      
      const videoUrl = URL.createObjectURL(file);
      video.src = videoUrl;
      
      video.onloadedmetadata = () => {
        // Set canvas dimensions
        canvas.width = params.customPixelSize.enabled ? params.customPixelSize.width : video.videoWidth;
        canvas.height = params.customPixelSize.enabled ? params.customPixelSize.height : video.videoHeight;
        
        // Calculate trim timing
        const startTime = params.trimStart.enabled ? 
          Math.random() * (params.trimStart.max - params.trimStart.min) + params.trimStart.min : 0;
        const endTime = params.trimEnd.enabled ? 
          video.duration - (Math.random() * (params.trimEnd.max - params.trimEnd.min) + params.trimEnd.min) : video.duration;
        
        video.currentTime = startTime;
        
        video.onseeked = () => {
          const mediaRecorder = new MediaRecorder(canvas.captureStream(25), {
            mimeType: 'video/webm;codecs=vp9'
          });
          
          const chunks: Blob[] = [];
          
          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              chunks.push(event.data);
            }
          };
          
          mediaRecorder.onstop = () => {
            const processedBlob = new Blob(chunks, { type: 'video/webm' });
            URL.revokeObjectURL(videoUrl);
            resolve(processedBlob);
          };
          
          mediaRecorder.start();
          
          const renderFrame = () => {
            if (video.currentTime >= endTime) {
              mediaRecorder.stop();
              return;
            }
            
            if (ctx) {
              // Apply transformations and effects
              ctx.save();
              
              // Clear canvas
              ctx.fillStyle = '#000';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              
              // Apply rotation if enabled
              if (params.rotation.enabled) {
                const rotation = Math.random() * (params.rotation.max - params.rotation.min) + params.rotation.min;
                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.rotate((rotation * Math.PI) / 180);
                ctx.translate(-canvas.width / 2, -canvas.height / 2);
              }
              
              // Apply zoom if enabled
              let scaleX = 1, scaleY = 1;
              if (params.zoom.enabled) {
                const zoom = Math.random() * (params.zoom.max - params.zoom.min) + params.zoom.min;
                scaleX = scaleY = zoom;
              }
              
              // Apply horizontal flip if enabled
              if (params.flipHorizontal) {
                scaleX *= -1;
                ctx.translate(canvas.width, 0);
              }
              
              ctx.scale(scaleX, scaleY);
              
              // Draw video frame
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              
              // Apply color adjustments
              if (params.brightness.enabled || params.contrast.enabled || params.saturation.enabled) {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                
                const brightness = params.brightness.enabled ? 
                  Math.random() * (params.brightness.max - params.brightness.min) + params.brightness.min : 0;
                const contrast = params.contrast.enabled ? 
                  Math.random() * (params.contrast.max - params.contrast.min) + params.contrast.min : 1;
                
                for (let i = 0; i < data.length; i += 4) {
                  // Apply brightness and contrast
                  data[i] = Math.max(0, Math.min(255, (data[i] - 128) * contrast + 128 + brightness * 255));
                  data[i + 1] = Math.max(0, Math.min(255, (data[i + 1] - 128) * contrast + 128 + brightness * 255));
                  data[i + 2] = Math.max(0, Math.min(255, (data[i + 2] - 128) * contrast + 128 + brightness * 255));
                }
                
                ctx.putImageData(imageData, 0, 0);
              }
              
              // Apply noise if enabled
              if (params.noise.enabled) {
                const noiseLevel = Math.random() * (params.noise.max - params.noise.min) + params.noise.min;
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                
                for (let i = 0; i < data.length; i += 4) {
                  const noise = (Math.random() - 0.5) * noiseLevel * 255;
                  data[i] = Math.max(0, Math.min(255, data[i] + noise));
                  data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
                  data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
                }
                
                ctx.putImageData(imageData, 0, 0);
              }
              
              ctx.restore();
            }
            
            // Advance to next frame
            const speed = params.speed.enabled ? 
              Math.random() * (params.speed.max - params.speed.min) + params.speed.min : 1;
            video.currentTime += (1/25) * speed; // 25 FPS
            
            if (video.currentTime < endTime) {
              requestAnimationFrame(renderFrame);
            } else {
              mediaRecorder.stop();
            }
          };
          
          // Start rendering
          renderFrame();
        };
      };
      
      video.onerror = () => {
        URL.revokeObjectURL(videoUrl);
        reject(new Error('Error loading video'));
      };
    });
  };

  const processVideo = async (file: File, variations: number) => {
    setIsProcessing(true);
    try {
      const variants = [];
      
      for (let i = 0; i < variations; i++) {
        try {
          const processedBlob = await applyVideoProcessing(file, parameters);
          const url = URL.createObjectURL(processedBlob);
          
          variants.push({
            id: Math.random().toString(36).substr(2, 9),
            url: url,
            filename: `${file.name.split('.')[0]}_variant_${i + 1}.webm`,
            parameters: { ...parameters },
            originalFile: processedBlob
          });
        } catch (error) {
          console.error(`Error processing variant ${i + 1}:`, error);
          // Create fallback variant with original file
          const blob = new Blob([file], { type: file.type });
          const url = URL.createObjectURL(blob);
          
          variants.push({
            id: Math.random().toString(36).substr(2, 9),
            url: url,
            filename: `${file.name.split('.')[0]}_variant_${i + 1}_fallback.${file.name.split('.').pop()}`,
            parameters: { ...parameters },
            originalFile: file
          });
        }
      }
      
      const result: ProcessedResult = {
        id: Math.random().toString(36).substr(2, 9),
        originalFilename: file.name,
        variants: variants,
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