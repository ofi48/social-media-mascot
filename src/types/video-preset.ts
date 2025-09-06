export interface RangeValue {
  min: number;
  max: number;
  enabled: boolean;
}

export interface SimpleValue {
  value: number;
  enabled: boolean;
}

export interface VideoPresetSettings {
  // Calidad de video/audio
  videoBitrate: RangeValue;
  audioBitrate: RangeValue;
  frameRate: RangeValue;
  
  // Color
  saturation: RangeValue;
  contrast: RangeValue;
  brightness: RangeValue;
  gamma: RangeValue;
  
  // Efectos
  vignette: SimpleValue;
  noise: SimpleValue;
  waveformShift: SimpleValue;
  pixelShift: SimpleValue;
  
  // Transformaciones
  speed: RangeValue;
  zoom: RangeValue;
  rotation: RangeValue;
  flipHorizontal: SimpleValue;
  
  // Tamaño y corte
  pixelSize: string; // "1280x720", "1920x1080", etc.
  randomPixelSize: boolean;
  trimStart: RangeValue; // en segundos
  trimEnd: RangeValue; // en segundos
  
  // Especiales
  usMetadata: boolean;
  blurredBorder: RangeValue;
  
  // Audio
  volume: RangeValue;
  
  // Watermark
  watermark: {
    enabled: boolean;
    size: RangeValue;
    opacity: RangeValue;
    x: RangeValue; // posición x (0-100%)
    y: RangeValue; // posición y (0-100%)
  };
  
  // Identificación
  name?: string;
}

export interface ProcessingParameters {
  videoBitrate?: number;
  audioBitrate?: number;
  frameRate?: number;
  saturation?: number;
  contrast?: number;
  brightness?: number;
  gamma?: number;
  vignette?: number;
  noise?: number;
  waveformShift?: number;
  pixelShift?: number;
  speed?: number;
  zoom?: number;
  rotation?: number;
  flipHorizontal?: boolean;
  pixelSize?: string;
  trimStart?: number;
  trimEnd?: number;
  usMetadata?: boolean;
  blurredBorder?: number;
  volume?: number;
  watermark?: {
    size: number;
    opacity: number;
    x: number;
    y: number;
  };
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
  videoBitrate: { min: 500, max: 3000, enabled: false },
  audioBitrate: { min: 128, max: 320, enabled: false },
  frameRate: { min: 24, max: 60, enabled: false },
  saturation: { min: 0.8, max: 1.2, enabled: false },
  contrast: { min: 0.9, max: 1.1, enabled: false },
  brightness: { min: -0.1, max: 0.1, enabled: false },
  gamma: { min: 0.9, max: 1.1, enabled: false },
  vignette: { value: 0.3, enabled: false },
  noise: { value: 0.02, enabled: false },
  waveformShift: { value: 0.1, enabled: false },
  pixelShift: { value: 1, enabled: false },
  speed: { min: 0.9, max: 1.1, enabled: false },
  zoom: { min: 1.0, max: 1.05, enabled: false },
  rotation: { min: -2, max: 2, enabled: false },
  flipHorizontal: { value: 0, enabled: false },
  pixelSize: "original",
  randomPixelSize: false,
  trimStart: { min: 0, max: 5, enabled: false },
  trimEnd: { min: 0, max: 5, enabled: false },
  usMetadata: false,
  blurredBorder: { min: 10, max: 30, enabled: false },
  volume: { min: 0.8, max: 1.2, enabled: false },
  watermark: {
    enabled: false,
    size: { min: 5, max: 15, enabled: true },
    opacity: { min: 0.3, max: 0.7, enabled: true },
    x: { min: 5, max: 95, enabled: true },
    y: { min: 5, max: 95, enabled: true }
  }
};