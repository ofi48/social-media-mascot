export interface RangeValue {
  min: number;
  max: number;
  enabled: boolean;
}

export interface VideoPresetSettings {
  // Calidad de Video
  videoBitrate: RangeValue;
  audioBitrate: RangeValue;
  frameRate: RangeValue;
  
  // Ajustes de Color
  saturation: RangeValue;
  contrast: RangeValue;
  brightness: RangeValue;
  gamma: RangeValue;
  
  // Efectos Visuales
  vignette: RangeValue;
  noise: RangeValue;
  waveformShift: RangeValue;
  pixelShift: RangeValue;
  
  // Transformaciones
  speed: RangeValue;
  zoom: RangeValue;
  rotation: RangeValue;
  flipHorizontal: boolean;
  
  // Tamaño y Recorte
  pixelSize: string;
  randomPixelSize: boolean;
  trimStart: RangeValue;
  trimEnd: RangeValue;
  
  // Características Especiales
  usMetadata: boolean;
  blurredBorder: RangeValue;
  
  // Audio
  volume: RangeValue;
  
  // Marca de Agua
  watermark: {
    enabled: boolean;
    size: number;
    opacity: number;
    x: number;
    y: number;
  };
  
  // Identificación
  name?: string;
}

export interface QueueItem {
  id: string;
  file: File;
  fileName: string;
  fileSize: number;
  status: 'waiting' | 'processing' | 'completed' | 'error';
  progress: number;
  results?: VideoProcessingResult[];
  error?: string;
  settings?: VideoPresetSettings;
  numCopies?: number;
}

export interface ProcessingParameters {
  videoBitrate?: number;
  frameRate?: number;
  saturation?: number;
  contrast?: number;
  brightness?: number;
  speed?: number;
  zoom?: number;
  rotation?: number;
  flipHorizontal?: boolean;
  pixelSize?: string;
  trimStart?: number;
  trimEnd?: number;
  volume?: number;
}

export interface VideoProcessingJob {
  id: string;
  filename: string;
  file: File;
  status: 'waiting' | 'processing' | 'completed' | 'error';
  progress: number;
  errorMessage?: string;
  results?: VideoProcessingResult[];
  processingDetails?: ProcessingParameters[];
}

export interface VideoProcessingResult {
  name: string;
  url: string;
  processingDetails: ProcessingParameters;
}

export interface VideoMetadata {
  duration: number;
  fps: number;
  width: number;
  height: number;
  hasAudio: boolean;
  size: number;
}

export const DEFAULT_PRESET: VideoPresetSettings = {
  // Calidad
  videoBitrate: { min: 500, max: 2000, enabled: true },
  audioBitrate: { min: 128, max: 320, enabled: true },
  frameRate: { min: 24, max: 30, enabled: false },
  
  // Color
  saturation: { min: 0.8, max: 1.2, enabled: true },
  contrast: { min: 0.9, max: 1.1, enabled: true },
  brightness: { min: -0.1, max: 0.1, enabled: true },
  gamma: { min: 0.8, max: 1.2, enabled: false },
  
  // Efectos
  vignette: { min: 0, max: 0.3, enabled: false },
  noise: { min: 0, max: 10, enabled: false },
  waveformShift: { min: 0, max: 5, enabled: false },
  pixelShift: { min: 0, max: 2, enabled: false },
  
  // Transformaciones
  speed: { min: 0.95, max: 1.05, enabled: true },
  zoom: { min: 1.0, max: 1.02, enabled: true },
  rotation: { min: -1, max: 1, enabled: false },
  flipHorizontal: false,
  
  // Tamaño y recorte
  pixelSize: "original",
  randomPixelSize: false,
  trimStart: { min: 0, max: 2, enabled: false },
  trimEnd: { min: 0, max: 2, enabled: false },
  
  // Especiales
  usMetadata: false,
  blurredBorder: { min: 0, max: 10, enabled: false },
  
  // Audio
  volume: { min: 0.9, max: 1.1, enabled: true },
  
  // Marca de agua
  watermark: {
    enabled: false,
    size: 50,
    opacity: 0.5,
    x: 10,
    y: 10
  }
};