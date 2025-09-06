import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ImageProcessingParameters {
  // Color Adjustments
  brightness: { min: number; max: number; enabled: boolean };
  contrast: { min: number; max: number; enabled: boolean };
  saturation: { min: number; max: number; enabled: boolean };
  hue: { min: number; max: number; enabled: boolean };
  
  // Visual Effects
  noise: { min: number; max: number; enabled: boolean };
  blur: { min: number; max: number; enabled: boolean };
  
  // Transformations
  rotation: { min: number; max: number; enabled: boolean };
  scale: { min: number; max: number; enabled: boolean };
  flipHorizontal: boolean;
  flipVertical: boolean;
  
  // Size and Cropping
  customSize: { width: number; height: number; enabled: boolean };
  randomCrop: { min: number; max: number; enabled: boolean };
  
  // Output Format
  format: 'jpeg' | 'png' | 'webp';
  quality: { min: number; max: number; enabled: boolean };
  
  // Special Effects
  watermark: {
    enabled: boolean;
    text: string;
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
    originalFile?: Blob;
  }[];
  timestamp: Date;
}

export interface Preset {
  id: string;
  name: string;
  parameters: ImageProcessingParameters;
  createdAt: Date;
}

interface ImageProcessingContextType {
  // Parameters
  parameters: ImageProcessingParameters;
  setParameters: (params: ImageProcessingParameters) => void;
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
  processImage: (file: File, variations: number) => Promise<void>;
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
  processingProgress: number;
  setProcessingProgress: (progress: number) => void;
}

const defaultParameters: ImageProcessingParameters = {
  brightness: { min: -0.3, max: 0.3, enabled: false },
  contrast: { min: 0.5, max: 1.5, enabled: false },
  saturation: { min: 0.5, max: 1.5, enabled: false },
  hue: { min: -30, max: 30, enabled: false },
  noise: { min: 0, max: 0.1, enabled: false },
  blur: { min: 0, max: 2, enabled: false },
  rotation: { min: -15, max: 15, enabled: false },
  scale: { min: 0.9, max: 1.1, enabled: false },
  flipHorizontal: false,
  flipVertical: false,
  customSize: { width: 1920, height: 1080, enabled: false },
  randomCrop: { min: 0.9, max: 1.0, enabled: false },
  format: 'jpeg',
  quality: { min: 80, max: 95, enabled: false },
  watermark: {
    enabled: false,
    text: 'Sample',
    size: 24,
    opacity: 0.5,
    positionX: 0.9,
    positionY: 0.1
  }
};

const ImageProcessingContext = createContext<ImageProcessingContextType | undefined>(undefined);

export const ImageProcessingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [parameters, setParameters] = useState<ImageProcessingParameters>(defaultParameters);
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

  const applyImageProcessing = async (file: File, params: ImageProcessingParameters): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      const imageUrl = URL.createObjectURL(file);
      img.src = imageUrl;
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            URL.revokeObjectURL(imageUrl);
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          // Set canvas dimensions
          let width = img.naturalWidth;
          let height = img.naturalHeight;
          
          if (params.customSize.enabled) {
            width = params.customSize.width;
            height = params.customSize.height;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Clear canvas
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          
          // Apply transformations
          ctx.save();
          
          // Move to center for transformations
          ctx.translate(width / 2, height / 2);
          
          // Apply rotation
          if (params.rotation.enabled) {
            const rotation = Math.random() * (params.rotation.max - params.rotation.min) + params.rotation.min;
            ctx.rotate((rotation * Math.PI) / 180);
          }
          
          // Apply scale
          let scaleX = 1, scaleY = 1;
          if (params.scale.enabled) {
            const scale = Math.random() * (params.scale.max - params.scale.min) + params.scale.min;
            scaleX = scaleY = scale;
          }
          
          // Apply flips
          if (params.flipHorizontal) scaleX *= -1;
          if (params.flipVertical) scaleY *= -1;
          
          ctx.scale(scaleX, scaleY);
          
          // Draw image centered
          ctx.drawImage(img, -width / 2, -height / 2, width, height);
          ctx.restore();
          
          // Apply color adjustments and effects
          const imageData = ctx.getImageData(0, 0, width, height);
          const data = imageData.data;
          
          // Apply brightness, contrast, saturation, hue
          for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];
            
            // Brightness
            if (params.brightness.enabled) {
              const brightness = Math.random() * (params.brightness.max - params.brightness.min) + params.brightness.min;
              r = Math.max(0, Math.min(255, r + brightness * 255));
              g = Math.max(0, Math.min(255, g + brightness * 255));
              b = Math.max(0, Math.min(255, b + brightness * 255));
            }
            
            // Contrast
            if (params.contrast.enabled) {
              const contrast = Math.random() * (params.contrast.max - params.contrast.min) + params.contrast.min;
              r = Math.max(0, Math.min(255, (r - 128) * contrast + 128));
              g = Math.max(0, Math.min(255, (g - 128) * contrast + 128));
              b = Math.max(0, Math.min(255, (b - 128) * contrast + 128));
            }
            
            // Saturation
            if (params.saturation.enabled) {
              const saturation = Math.random() * (params.saturation.max - params.saturation.min) + params.saturation.min;
              const gray = 0.299 * r + 0.587 * g + 0.114 * b;
              r = Math.max(0, Math.min(255, gray + saturation * (r - gray)));
              g = Math.max(0, Math.min(255, gray + saturation * (g - gray)));
              b = Math.max(0, Math.min(255, gray + saturation * (b - gray)));
            }
            
            // Hue shift
            if (params.hue.enabled) {
              const hueShift = Math.random() * (params.hue.max - params.hue.min) + params.hue.min;
              // Convert RGB to HSL, shift hue, convert back to RGB
              const [h, s, l] = rgbToHsl(r, g, b);
              const newH = (h + hueShift / 360) % 1;
              const [newR, newG, newB] = hslToRgb(newH, s, l);
              r = newR;
              g = newG;
              b = newB;
            }
            
            // Noise
            if (params.noise.enabled) {
              const noiseLevel = Math.random() * (params.noise.max - params.noise.min) + params.noise.min;
              const noise = (Math.random() - 0.5) * noiseLevel * 255;
              r = Math.max(0, Math.min(255, r + noise));
              g = Math.max(0, Math.min(255, g + noise));
              b = Math.max(0, Math.min(255, b + noise));
            }
            
            data[i] = r;
            data[i + 1] = g;
            data[i + 2] = b;
          }
          
          ctx.putImageData(imageData, 0, 0);
          
          // Apply blur if enabled
          if (params.blur.enabled) {
            const blurAmount = Math.random() * (params.blur.max - params.blur.min) + params.blur.min;
            ctx.filter = `blur(${blurAmount}px)`;
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            if (tempCtx) {
              tempCanvas.width = width;
              tempCanvas.height = height;
              tempCtx.drawImage(canvas, 0, 0);
              ctx.filter = 'none';
              ctx.clearRect(0, 0, width, height);
              ctx.drawImage(tempCanvas, 0, 0);
            }
          }
          
          // Apply watermark if enabled
          if (params.watermark.enabled && params.watermark.text) {
            ctx.globalAlpha = params.watermark.opacity;
            ctx.fillStyle = '#FFFFFF';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.font = `${params.watermark.size}px Arial`;
            
            const x = width * params.watermark.positionX;
            const y = height * params.watermark.positionY;
            
            ctx.strokeText(params.watermark.text, x, y);
            ctx.fillText(params.watermark.text, x, y);
            ctx.globalAlpha = 1;
          }
          
          // Convert to blob
          canvas.toBlob(
            (blob) => {
              URL.revokeObjectURL(imageUrl);
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to create processed image'));
              }
            },
            `image/${params.format}`,
            params.quality.enabled ? 
              (Math.random() * (params.quality.max - params.quality.min) + params.quality.min) / 100 : 
              0.9
          );
          
        } catch (error) {
          URL.revokeObjectURL(imageUrl);
          reject(error);
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(imageUrl);
        reject(new Error('Error loading image'));
      };
      
      // Add timeout
      setTimeout(() => {
        URL.revokeObjectURL(imageUrl);
        reject(new Error('Image processing timeout'));
      }, 10000);
    });
  };

  // Helper functions for hue shifting
  const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return [h, s, l];
  };

  const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
    let r, g, b;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  };

  const processImage = async (file: File, variations: number) => {
    setIsProcessing(true);
    setProcessingProgress(0);
    try {
      const variants = [] as any[];
      
      for (let i = 0; i < variations; i++) {
        try {
          const processedBlob = await applyImageProcessing(file, parameters);
          const url = URL.createObjectURL(processedBlob);
          
          variants.push({
            id: Math.random().toString(36).substr(2, 9),
            url: url,
            filename: `${file.name.split('.')[0]}_variant_${i + 1}.${parameters.format}`,
            parameters: { ...parameters },
            originalFile: processedBlob
          });
        } catch (error) {
          console.error(`Error processing variant ${i + 1}:`, error);
          // Create fallback variant with original file
          const url = URL.createObjectURL(file);
          
          variants.push({
            id: Math.random().toString(36).substr(2, 9),
            url: url,
            filename: `${file.name.split('.')[0]}_variant_${i + 1}_original.${file.name.split('.').pop()}`,
            parameters: { ...parameters },
            originalFile: file
          });
        } finally {
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
      for (const job of queue.filter(j => j.status === 'waiting')) {
        setQueue(prev => prev.map(j => 
          j.id === job.id ? { ...j, status: 'processing' } : j
        ));
        
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
    <ImageProcessingContext.Provider value={{
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
      processImage,
      processBatch,
      results,
      addResult,
      clearResults,
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
    </ImageProcessingContext.Provider>
  );
};

export const useImageProcessing = () => {
  const context = useContext(ImageProcessingContext);
  if (context === undefined) {
    throw new Error('useImageProcessing must be used within an ImageProcessingProvider');
  }
  return context;
};