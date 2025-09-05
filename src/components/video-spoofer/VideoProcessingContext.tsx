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
  file: File;
  status: 'waiting' | 'processing' | 'completed' | 'error';
  progress: number;
  errorMessage?: string;
  resultUrls?: string[];
  uploadProgress?: number;
}

export interface VideoVariant {
  id: string;
  filename: string;
  blob: Blob;
  originalFile: File;
}

export interface ProcessedResult {
  id: string;
  originalFilename: string;
  variants: VideoVariant[];
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
  downloadAllResults: () => void;
  
  // Configuration Export/Import
  exportConfiguration: () => void;
  importConfiguration: (file: File) => Promise<void>;
  
  // Presets
  presets: Preset[];
  savePreset: (name: string) => void;
  loadPreset: (preset: Preset) => void;
  deletePreset: (id: string) => void;
  
  // UI State
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  processingProgress: number;
  setProcessingProgress: (progress: number) => void;
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
  const [processingProgress, setProcessingProgress] = useState(0);

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
      file: file,
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
      video.crossOrigin = 'anonymous';
      video.muted = true;
      video.preload = 'metadata';
      
      const videoUrl = URL.createObjectURL(file);
      video.src = videoUrl;
      
      video.onloadedmetadata = () => {
        console.log(`Video loaded: ${video.duration}s, ${video.videoWidth}x${video.videoHeight}`);
        
        // Validate video before processing
        if (video.duration === 0 || isNaN(video.duration)) {
          URL.revokeObjectURL(videoUrl);
          reject(new Error('Invalid video file or corrupted video'));
          return;
        }
        
        // Set reasonable limits for processing
        const maxDuration = 60; // 60 seconds max
        if (video.duration > maxDuration) {
          console.warn(`Video too long (${video.duration}s), trimming to ${maxDuration}s`);
        }
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          URL.revokeObjectURL(videoUrl);
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Set canvas dimensions based on parameters
        canvas.width = params.customPixelSize.enabled ? params.customPixelSize.width : video.videoWidth;
        canvas.height = params.customPixelSize.enabled ? params.customPixelSize.height : video.videoHeight;
        
        // Calculate trim timing with validation
        let startTime = 0;
        let endTime = video.duration;
        
        if (params.trimStart.enabled && video.duration > params.trimStart.max) {
          startTime = Math.random() * (params.trimStart.max - params.trimStart.min) + params.trimStart.min;
        }
        
        if (params.trimEnd.enabled && video.duration > params.trimEnd.max) {
          endTime = video.duration - (Math.random() * (params.trimEnd.max - params.trimEnd.min) + params.trimEnd.min);
        }
        
        // Ensure valid time range
        if (startTime >= endTime) {
          startTime = 0;
          endTime = Math.min(video.duration, 5); // Default to 5 seconds max
        }

        // Limit clip length for reliability
        const maxClipSeconds = 3;
        endTime = Math.min(endTime, startTime + maxClipSeconds);
        
        const duration = endTime - startTime;
        if (duration <= 0) {
          URL.revokeObjectURL(videoUrl);
          reject(new Error('Invalid video duration for processing'));
          return;
        }
        
        video.currentTime = startTime;
        
        video.onseeked = () => {
          try {
            // Set up MediaRecorder with MP4 preference
            let mediaRecorder;
            let outputMimeType = 'video/mp4';
            const stream = canvas.captureStream(25);
            
            // Try MP4 first, then fallback to WebM
            if (MediaRecorder.isTypeSupported('video/mp4')) {
              mediaRecorder = new MediaRecorder(stream, { 
                mimeType: 'video/mp4',
                videoBitsPerSecond: 2500000 // 2.5 Mbps for better quality
              });
              outputMimeType = 'video/mp4';
            } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
              mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
              outputMimeType = 'video/webm';
            } else if (MediaRecorder.isTypeSupported('video/webm')) {
              mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
              outputMimeType = 'video/webm';
            } else {
              mediaRecorder = new MediaRecorder(stream);
              outputMimeType = 'video/webm';
            }
            
            const chunks: Blob[] = [];
            let frameCount = 0;
            const maxFrames = Math.ceil(duration * 25); // 25 FPS
            
            mediaRecorder.ondataavailable = (event) => {
              if (event.data.size > 0) {
                chunks.push(event.data);
              }
            };
            
            mediaRecorder.onstop = () => {
              const processedBlob = new Blob(chunks, { type: outputMimeType });
              URL.revokeObjectURL(videoUrl);
              resolve(processedBlob);
            };
            
            mediaRecorder.onerror = (event) => {
              URL.revokeObjectURL(videoUrl);
              reject(new Error('MediaRecorder error: ' + event));
            };
            
            mediaRecorder.start();
            
            const renderFrame = () => {
              frameCount++;
              
              // Stop if we've reached the end time or max frames
              if (video.currentTime >= endTime || frameCount >= maxFrames) {
                mediaRecorder.stop();
                return;
              }
              
              // Apply transformations and draw frame
              ctx.save();
              
              // Clear canvas with black background
              ctx.fillStyle = '#000000';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              
              // Apply transformations
              ctx.translate(canvas.width / 2, canvas.height / 2);
              
              // Apply rotation if enabled
              if (params.rotation.enabled) {
                const rotation = Math.random() * (params.rotation.max - params.rotation.min) + params.rotation.min;
                ctx.rotate((rotation * Math.PI) / 180);
              }
              
              // Apply zoom and flip
              let scaleX = 1, scaleY = 1;
              if (params.zoom.enabled) {
                const zoom = Math.random() * (params.zoom.max - params.zoom.min) + params.zoom.min;
                scaleX = scaleY = zoom;
              }
              
              if (params.flipHorizontal) {
                scaleX *= -1;
              }
              
              ctx.scale(scaleX, scaleY);
              
              // Draw video frame centered
              const drawWidth = canvas.width;
              const drawHeight = canvas.height;
              ctx.drawImage(video, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
              
              ctx.restore();
              
              // Apply post-processing effects (simplified)
              if (params.brightness.enabled || params.contrast.enabled || params.noise.enabled) {
                try {
                  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                  const data = imageData.data;
                  
                  const brightness = params.brightness.enabled ? 
                    Math.random() * (params.brightness.max - params.brightness.min) + params.brightness.min : 0;
                  const contrast = params.contrast.enabled ? 
                    Math.random() * (params.contrast.max - params.contrast.min) + params.contrast.min : 1;
                  const noiseLevel = params.noise.enabled ? 
                    Math.random() * (params.noise.max - params.noise.min) + params.noise.min : 0;
                  
                  for (let i = 0; i < data.length; i += 4) {
                    // Apply brightness and contrast
                    if (params.brightness.enabled || params.contrast.enabled) {
                      data[i] = Math.max(0, Math.min(255, (data[i] - 128) * contrast + 128 + brightness * 255));
                      data[i + 1] = Math.max(0, Math.min(255, (data[i + 1] - 128) * contrast + 128 + brightness * 255));
                      data[i + 2] = Math.max(0, Math.min(255, (data[i + 2] - 128) * contrast + 128 + brightness * 255));
                    }
                    
                    // Apply noise
                    if (params.noise.enabled) {
                      const noise = (Math.random() - 0.5) * noiseLevel * 255;
                      data[i] = Math.max(0, Math.min(255, data[i] + noise));
                      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
                      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
                    }
                  }
                  
                  ctx.putImageData(imageData, 0, 0);
                } catch (error) {
                  console.warn('Error applying post-processing effects:', error);
                }
              }
              
              // Advance to next frame
              const speed = params.speed.enabled ? 
                Math.random() * (params.speed.max - params.speed.min) + params.speed.min : 1;
              video.currentTime += (1/25) * speed; // 25 FPS
              
              // Continue rendering if within bounds
              if (video.currentTime < endTime && frameCount < maxFrames) {
                requestAnimationFrame(renderFrame);
              } else {
                // Ensure MediaRecorder stops properly
                setTimeout(() => {
                  if (mediaRecorder.state === 'recording') {
                    console.log('Stopping MediaRecorder after completion');
                    mediaRecorder.stop();
                  }
                }, 200); // Increased delay for stability
              }
            };
            
            // Start rendering after a small delay
            setTimeout(() => {
              renderFrame();
            }, 100);
            
          } catch (error) {
            URL.revokeObjectURL(videoUrl);
            reject(error);
          }
        };
      };
      
      video.onerror = () => {
        URL.revokeObjectURL(videoUrl);
        reject(new Error('Error loading video'));
      };
      
      // Add timeout to prevent infinite hanging - increased for larger videos
      setTimeout(() => {
        URL.revokeObjectURL(videoUrl);
        reject(new Error('Video processing timeout'));
      }, 30000); // 30 second timeout for better reliability
    });
  };

  const processVideo = async (file: File, variations: number) => {
    setIsProcessing(true);
    setProcessingProgress(0);
    try {
      const variants = [] as any[];
      
      for (let i = 0; i < variations; i++) {
        try {
          const processedBlob = await applyVideoProcessing(file, parameters);
          variants.push({
            id: Math.random().toString(36).substr(2, 9),
            filename: `${file.name.split('.')[0]}_variant_${i + 1}.mp4`,
            blob: processedBlob,
            originalFile: file
          });
        } catch (error) {
          console.error(`Error processing variant ${i + 1}:`, error);
          // Create fallback variant with original file
          const blob = new Blob([file], { type: file.type });
          
          variants.push({
            id: Math.random().toString(36).substr(2, 9),
            filename: `${file.name.split('.')[0]}_variant_${i + 1}_fallback.${file.name.split('.').pop()}`,
            blob: blob,
            originalFile: file
          });
        } finally {
          // Update progress regardless of success/failure
          const pct = Math.round(((i + 1) / variations) * 100);
          setProcessingProgress(pct);
        }
      }
      
      const result: ProcessedResult = {
        id: Math.random().toString(36).substr(2, 9),
        originalFilename: file.name,
        variants: variants,
        timestamp: new Date()
      };
      
      addResult(result);
      setProcessingProgress(100);
    } finally {
      setIsProcessing(false);
    }
  };

  const processBatch = async (variations: number) => {
    setIsProcessing(true);
    try {
      const waitingJobs = queue.filter(j => j.status === 'waiting');
      
      for (const job of waitingJobs) {
        // Update job status to processing
        setQueue(prev => prev.map(j => 
          j.id === job.id ? { ...j, status: 'processing', progress: 0 } : j
        ));
        
        try {
          // Process the actual video file
          const variants: VideoVariant[] = [];
          
          for (let i = 0; i < variations; i++) {
            try {
              // Update progress for this variation
              const progressPercent = Math.round(((i + 1) / variations) * 100);
              setQueue(prev => prev.map(j => 
                j.id === job.id ? { ...j, progress: progressPercent } : j
              ));
              
              const processedBlob = await applyVideoProcessing(job.file, parameters);
              const variant: VideoVariant = {
                id: `${job.id}-var-${i + 1}`,
                filename: `${job.filename.replace(/\.[^/.]+$/, '')}_variation_${i + 1}.mp4`,
                blob: processedBlob,
                originalFile: job.file
              };
              variants.push(variant);
            } catch (error) {
              console.error(`Error processing variation ${i + 1} for ${job.filename}:`, error);
              // Continue with other variations even if one fails
            }
          }
          
          // Create result and add to results
          if (variants.length > 0) {
            const result: ProcessedResult = {
              id: job.id,
              originalFilename: job.filename,
              variants: variants,
              timestamp: new Date()
            };
            addResult(result);
            
            // Mark job as completed
            setQueue(prev => prev.map(j => 
              j.id === job.id ? { ...j, status: 'completed', progress: 100 } : j
            ));
          } else {
            // Mark job as error if no variants were created
            setQueue(prev => prev.map(j => 
              j.id === job.id ? { 
                ...j, 
                status: 'error', 
                progress: 0, 
                errorMessage: 'Failed to process any variations' 
              } : j
            ));
          }
          
        } catch (error) {
          console.error(`Error processing ${job.filename}:`, error);
          setQueue(prev => prev.map(j => 
            j.id === job.id ? { 
              ...j, 
              status: 'error', 
              progress: 0, 
              errorMessage: error instanceof Error ? error.message : 'Processing failed' 
            } : j
          ));
        }
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

  const downloadAllResults = () => {
    if (results.length === 0) {
      console.warn('No results to download');
      return;
    }

    results.forEach((result, resultIndex) => {
      result.variants.forEach((variant, variantIndex) => {
        if (variant.blob) {
          setTimeout(() => {
            const url = URL.createObjectURL(variant.blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = variant.filename || `processed_video_${resultIndex + 1}_${variantIndex + 1}.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, (resultIndex * result.variants.length + variantIndex) * 500); // Stagger downloads
        }
      });
    });
  };

  const exportConfiguration = () => {
    const config = {
      parameters,
      exportDate: new Date().toISOString(),
      version: "1.0"
    };
    
    const dataStr = JSON.stringify(config, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `video-spoofer-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  };

  const importConfiguration = async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const result = e.target?.result as string;
          const config = JSON.parse(result);
          
          // Validate the configuration structure
          if (config.parameters && typeof config.parameters === 'object') {
            // Merge with default parameters to ensure all required fields exist
            const mergedParams = { ...parameters, ...config.parameters };
            setParameters(mergedParams);
            resolve();
          } else {
            reject(new Error('Invalid configuration file format'));
          }
        } catch (error) {
          reject(new Error('Failed to parse configuration file'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read configuration file'));
      };
      
      reader.readAsText(file);
    });
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
      downloadAllResults,
      exportConfiguration,
      importConfiguration,
      presets,
      savePreset,
      loadPreset,
      deletePreset,
      isProcessing,
      setIsProcessing,
      processingProgress,
      setProcessingProgress
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