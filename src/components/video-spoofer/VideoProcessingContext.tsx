import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ProcessingParameters {
  // Video Quality Controls
  videoBitrate: { min: number; max: number; enabled: boolean };
  
  // Color Adjustment Engine
  saturation: { min: number; max: number; enabled: boolean };
  contrast: { min: number; max: number; enabled: boolean };
  brightness: { min: number; max: number; enabled: boolean };
  gamma: { min: number; max: number; enabled: boolean };
  
  // Visual Effects Processing
  vignette: { min: number; max: number; enabled: boolean };
  noise: { min: number; max: number; enabled: boolean };
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
  // Subtle bitrate variation (8500-10500 kbps)
  videoBitrate: { min: 8500, max: 10500, enabled: false },
  
  // Very subtle color adjustments to avoid detection
  saturation: { min: 0.95, max: 1.05, enabled: false },
  contrast: { min: 0.98, max: 1.02, enabled: false },
  brightness: { min: -0.02, max: 0.02, enabled: false },
  gamma: { min: 0.98, max: 1.02, enabled: false },
  
  // Minimal visual effects
  vignette: { min: 0, max: 0.05, enabled: false },
  noise: { min: 0, max: 0.005, enabled: false },
  pixelShift: { min: 0, max: 1, enabled: false },
  
  // Conservative speed adjustments (preserve duration)
  speed: { min: 0.98, max: 1.02, enabled: false },
  zoom: { min: 0.995, max: 1.005, enabled: false },
  rotation: { min: -0.5, max: 0.5, enabled: false },
  flipHorizontal: false,
  
  // Size adjustments (minimal impact)
  customPixelSize: { width: 1280, height: 720, enabled: false },
  randomPixelSize: false,
  
  // Very minimal trimming (preserve most of video)
  trimStart: { min: 0, max: 0.5, enabled: false },
  trimEnd: { min: 0, max: 0.5, enabled: false },
  
  usMetadata: false,
  blurredBorder: { min: 0, max: 5, enabled: false },
  watermark: {
    enabled: false,
    size: 12,
    opacity: 0.1,
    positionX: 0.95,
    positionY: 0.05
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
        let canvasWidth = video.videoWidth;
        let canvasHeight = video.videoHeight;
        
        if (params.customPixelSize.enabled) {
          canvasWidth = params.customPixelSize.width;
          canvasHeight = params.customPixelSize.height;
        } else if (params.randomPixelSize) {
          // Random 9:16 aspect ratio sizes
          const heights = [720, 1080, 1280, 1440];
          const randomHeight = heights[Math.floor(Math.random() * heights.length)];
          canvasHeight = randomHeight;
          canvasWidth = Math.round(randomHeight * (9/16));
        }
        
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        
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

        // Preserve most of the video duration for subtle changes
        const maxClipSeconds = Math.min(video.duration, 30); // Keep up to 30 seconds
        if (endTime > startTime + maxClipSeconds) {
          endTime = startTime + maxClipSeconds;
        }
        
        const duration = endTime - startTime;
        if (duration <= 0) {
          URL.revokeObjectURL(videoUrl);
          reject(new Error('Invalid video duration for processing'));
          return;
        }
        
        video.currentTime = startTime;
        
        video.onseeked = () => {
          try {
            // Set up MediaRecorder with MP4 preference and dynamic bitrate
            let mediaRecorder;
            let outputMimeType = 'video/mp4';
            const stream = canvas.captureStream(25);
            
            // Calculate bitrate for subtle quality variation
            let videoBitrate = 9000000; // Default 9 Mbps (middle of range)
            if (params.videoBitrate.enabled) {
              videoBitrate = (Math.random() * (params.videoBitrate.max - params.videoBitrate.min) + params.videoBitrate.min) * 1000; // Convert to bps
            }
            
            // Try MP4 first, then fallback to WebM with safer bitrate settings
            if (MediaRecorder.isTypeSupported('video/mp4')) {
              try {
                mediaRecorder = new MediaRecorder(stream, { 
                  mimeType: 'video/mp4',
                  videoBitsPerSecond: Math.min(videoBitrate, 5000000) // Cap at 5 Mbps to prevent errors
                });
                outputMimeType = 'video/mp4';
              } catch (error) {
                console.log('MP4 with bitrate failed, trying without bitrate setting');
                mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/mp4' });
                outputMimeType = 'video/mp4';
              }
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
            const targetFPS = 30; // Higher FPS for better quality
            const maxFrames = Math.ceil(duration * targetFPS);
            
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
            
            // Generate constant effect values once for the entire video
            const constantEffects = {
              rotation: params.rotation.enabled ? 
                Math.random() * (params.rotation.max - params.rotation.min) + params.rotation.min : 0,
              zoom: params.zoom.enabled ? 
                Math.random() * (params.zoom.max - params.zoom.min) + params.zoom.min : 1,
              brightness: params.brightness.enabled ? 
                Math.random() * (params.brightness.max - params.brightness.min) + params.brightness.min : 0,
              contrast: params.contrast.enabled ? 
                Math.random() * (params.contrast.max - params.contrast.min) + params.contrast.min : 1,
              noiseLevel: params.noise.enabled ? 
                Math.random() * (params.noise.max - params.noise.min) + params.noise.min : 0,
              saturation: params.saturation.enabled ?
                Math.random() * (params.saturation.max - params.saturation.min) + params.saturation.min : 1,
              gamma: params.gamma.enabled ?
                Math.random() * (params.gamma.max - params.gamma.min) + params.gamma.min : 1,
              vignetteStrength: params.vignette.enabled ?
                Math.random() * (params.vignette.max - params.vignette.min) + params.vignette.min : 0
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
              
              // Apply constant rotation throughout video
              if (params.rotation.enabled) {
                ctx.rotate((constantEffects.rotation * Math.PI) / 180);
              }
              
              // Apply constant zoom and flip
              let scaleX = constantEffects.zoom, scaleY = constantEffects.zoom;
              
              if (params.flipHorizontal) {
                scaleX *= -1;
              }
              
              ctx.scale(scaleX, scaleY);
              
              // Draw video frame centered
              const drawWidth = canvas.width;
              const drawHeight = canvas.height;
              ctx.drawImage(video, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
              
              ctx.restore();
              
              // Apply post-processing effects using constant values
              if (params.brightness.enabled || params.contrast.enabled || params.noise.enabled || 
                  params.saturation.enabled || params.gamma.enabled || params.vignette.enabled) {
                try {
                  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                  const data = imageData.data;
                  
                  for (let i = 0; i < data.length; i += 4) {
                    let r = data[i];
                    let g = data[i + 1];
                    let b = data[i + 2];
                    
                    // Apply brightness and contrast using constant values
                    if (params.brightness.enabled || params.contrast.enabled) {
                      r = Math.max(0, Math.min(255, (r - 128) * constantEffects.contrast + 128 + constantEffects.brightness * 255));
                      g = Math.max(0, Math.min(255, (g - 128) * constantEffects.contrast + 128 + constantEffects.brightness * 255));
                      b = Math.max(0, Math.min(255, (b - 128) * constantEffects.contrast + 128 + constantEffects.brightness * 255));
                    }
                    
                    // Apply saturation using constant value
                    if (params.saturation.enabled) {
                      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                      r = gray + constantEffects.saturation * (r - gray);
                      g = gray + constantEffects.saturation * (g - gray);
                      b = gray + constantEffects.saturation * (b - gray);
                      r = Math.max(0, Math.min(255, r));
                      g = Math.max(0, Math.min(255, g));
                      b = Math.max(0, Math.min(255, b));
                    }
                    
                    // Apply gamma correction using constant value
                    if (params.gamma.enabled) {
                      r = Math.pow(r / 255, constantEffects.gamma) * 255;
                      g = Math.pow(g / 255, constantEffects.gamma) * 255;
                      b = Math.pow(b / 255, constantEffects.gamma) * 255;
                    }
                    
                    // Apply vignette effect using constant value
                    if (params.vignette.enabled) {
                      const x = (i / 4) % canvas.width;
                      const y = Math.floor((i / 4) / canvas.width);
                      const centerX = canvas.width / 2;
                      const centerY = canvas.height / 2;
                      const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
                      const maxDistance = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2));
                      const vignette = 1 - (distance / maxDistance) * constantEffects.vignetteStrength;
                      r *= vignette;
                      g *= vignette;
                      b *= vignette;
                    }
                    
                    // Apply noise using constant value
                    if (params.noise.enabled) {
                      const noise = (Math.random() - 0.5) * constantEffects.noiseLevel * 255;
                      r = Math.max(0, Math.min(255, r + noise));
                      g = Math.max(0, Math.min(255, g + noise));
                      b = Math.max(0, Math.min(255, b + noise));
                    }
                    
                    // Apply pixel shift effects
                    if (params.pixelShift.enabled) {
                      const shiftAmount = Math.random() * (params.pixelShift.max - params.pixelShift.min) + params.pixelShift.min;
                      const shift = Math.floor(shiftAmount);
                      if (shift > 0 && i + shift * 4 < data.length) {
                        r = data[i + shift * 4];
                        g = data[i + shift * 4 + 1];
                        b = data[i + shift * 4 + 2];
                      }
                    }
                    
                    data[i] = r;
                    data[i + 1] = g;
                    data[i + 2] = b;
                  }
                  
                  ctx.putImageData(imageData, 0, 0);
                } catch (error) {
                  console.warn('Error applying post-processing effects:', error);
                }
              }
              
              // Apply blurred border effect
              if (params.blurredBorder.enabled) {
                const borderSize = Math.random() * (params.blurredBorder.max - params.blurredBorder.min) + params.blurredBorder.min;
                ctx.filter = `blur(${borderSize}px)`;
                ctx.strokeStyle = 'transparent';
                ctx.lineWidth = borderSize;
                ctx.strokeRect(0, 0, canvas.width, canvas.height);
                ctx.filter = 'none';
              }
              
              // Apply watermark if enabled
              if (params.watermark.enabled) {
                ctx.globalAlpha = params.watermark.opacity;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.font = `${params.watermark.size}px Arial`;
                const text = params.usMetadata ? 'US_META_' + Date.now() : 'WATERMARK';
                const x = canvas.width * params.watermark.positionX;
                const y = canvas.height * params.watermark.positionY;
                ctx.fillText(text, x, y);
                ctx.globalAlpha = 1;
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
      
      // Add timeout to prevent infinite hanging - increased to 60 seconds
      setTimeout(() => {
        URL.revokeObjectURL(videoUrl);
        reject(new Error('Video processing timeout'));
      }, 60000); // 60 second timeout for better reliability
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
          console.error('Processing error details:', error.message);
          // Skip failed variants instead of creating fallback
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