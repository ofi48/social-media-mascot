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
  hue: RangeValue;
  
  // Efectos Visuales
  vignette: RangeValue;
  noise: RangeValue;
  blur: RangeValue;
  sharpness: RangeValue;
  chromakey: RangeValue;
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
  stabilization: RangeValue;
  motionBlur: RangeValue;
  colorTemperature: RangeValue;
  
  // Audio
  volume: RangeValue;
  audioFade: RangeValue;
  highpass: RangeValue;
  lowpass: RangeValue;
  
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
  gamma?: number;
  hue?: number;
  blur?: number;
  sharpness?: number;
  chromakey?: number;
  stabilization?: number;
  motionBlur?: number;
  colorTemperature?: number;
  speed?: number;
  zoom?: number;
  rotation?: number;
  flipHorizontal?: boolean;
  pixelSize?: string;
  trimStart?: number;
  trimEnd?: number;
  volume?: number;
  audioFade?: number;
  highpass?: number;
  lowpass?: number;
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
  // Calidad de Video
  videoBitrate: { min: 3000, max: 8000, enabled: true },
  audioBitrate: { min: 128, max: 192, enabled: false },
  frameRate: { min: 30, max: 30, enabled: false },
  
  // Ajustes de Color
  saturation: { min: 0.9, max: 1.1, enabled: true },
  contrast: { min: 0.9, max: 1.1, enabled: true },
  brightness: { min: -0.1, max: 0.1, enabled: true },
  gamma: { min: 0.9, max: 1.1, enabled: false },
  hue: { min: -30, max: 30, enabled: false },
  
  // Efectos Visuales
  vignette: { min: 0, max: 0.3, enabled: false },
  noise: { min: 0, max: 0.05, enabled: false },
  blur: { min: 0, max: 5, enabled: false },
  sharpness: { min: 0, max: 2, enabled: false },
  chromakey: { min: 0, max: 0.5, enabled: false },
  waveformShift: { min: 0, max: 2, enabled: false },
  pixelShift: { min: 0, max: 2, enabled: false },
  
  // Transformaciones
  speed: { min: 0.95, max: 1.05, enabled: true },
  zoom: { min: 1, max: 1.05, enabled: false },
  rotation: { min: -2, max: 2, enabled: false },
  flipHorizontal: false,
  
  // Recorte y Tamaño
  pixelSize: "",
  randomPixelSize: false,
  trimStart: { min: 0, max: 1, enabled: true },
  trimEnd: { min: 0, max: 1, enabled: false },
  
  // Características Especiales
  usMetadata: false,
  blurredBorder: { min: 0, max: 30, enabled: false },
  stabilization: { min: 0, max: 1, enabled: false },
  motionBlur: { min: 0, max: 10, enabled: false },
  colorTemperature: { min: 2000, max: 8000, enabled: false },
  
  // Audio
  volume: { min: 0.9, max: 1.1, enabled: false },
  audioFade: { min: 0, max: 3, enabled: false },
  highpass: { min: 100, max: 2000, enabled: false },
  lowpass: { min: 2000, max: 20000, enabled: false },
  
  // Marca de Agua
  watermark: {
    enabled: false,
    size: 100,
    opacity: 0.5,
    x: 0.5,
    y: 0.5
  }
};