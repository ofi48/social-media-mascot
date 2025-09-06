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
  // Calidad básica
  videoBitrate: RangeValue;
  frameRate: RangeValue;
  
  // Color (funcionales con filtros FFmpeg básicos)
  saturation: RangeValue;
  contrast: RangeValue;
  brightness: RangeValue;
  
  // Transformaciones básicas
  speed: RangeValue;
  flipHorizontal: SimpleValue;
  
  // Tamaño y corte
  pixelSize: string; // "1280x720", "1920x1080", etc.
  trimStart: RangeValue; // en segundos
  trimEnd: RangeValue; // en segundos
  
  // Audio
  volume: RangeValue;
  
  // Identificación
  name?: string;
}

export interface ProcessingParameters {
  videoBitrate?: number;
  frameRate?: number;
  saturation?: number;
  contrast?: number;
  brightness?: number;
  speed?: number;
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
  videoBitrate: { min: 1000, max: 3000, enabled: false },
  frameRate: { min: 24, max: 30, enabled: false },
  saturation: { min: 0.8, max: 1.2, enabled: false },
  contrast: { min: 0.9, max: 1.1, enabled: false },
  brightness: { min: -0.1, max: 0.1, enabled: false },
  speed: { min: 0.9, max: 1.1, enabled: false },
  flipHorizontal: { value: 0, enabled: false },
  pixelSize: "original",
  trimStart: { min: 0, max: 5, enabled: false },
  trimEnd: { min: 0, max: 5, enabled: false },
  volume: { min: 0.8, max: 1.2, enabled: false }
};