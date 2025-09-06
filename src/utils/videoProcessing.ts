import { VideoPresetSettings, ProcessingParameters, VideoMetadata } from '@/types/video-preset';

/**
 * Genera parámetros de procesamiento determinísticos basados en configuración y seed
 */
export function generateProcessingParameters(
  settings: VideoPresetSettings,
  numCopies: number,
  seed?: string
): ProcessingParameters[] {
  const parameters: ProcessingParameters[] = [];
  const seedValue = seed ? hashString(seed) : Date.now();
  
  for (let i = 0; i < numCopies; i++) {
    const random = seededRandom(seedValue + i);
    const params: ProcessingParameters = {};
    
    // Video bitrate
    if (settings.videoBitrate.enabled) {
      params.videoBitrate = randomInRange(settings.videoBitrate.min, settings.videoBitrate.max, random);
    }
    if (settings.frameRate.enabled) {
      params.frameRate = Math.round(randomInRange(settings.frameRate.min, settings.frameRate.max, random));
    }
    
    // Color adjustments
    if (settings.saturation.enabled) {
      params.saturation = randomInRange(settings.saturation.min, settings.saturation.max, random);
    }
    if (settings.contrast.enabled) {
      params.contrast = randomInRange(settings.contrast.min, settings.contrast.max, random);
    }
    if (settings.brightness.enabled) {
      params.brightness = randomInRange(settings.brightness.min, settings.brightness.max, random);
    }
    
    // Transformations
    if (settings.speed.enabled) {
      params.speed = randomInRange(settings.speed.min, settings.speed.max, random);
    }
    if (settings.flipHorizontal) {
      params.flipHorizontal = random() > 0.5;
    }
    
    // Size and trimming
    if (settings.pixelSize !== "original") {
      params.pixelSize = settings.pixelSize;
    }
    
    if (settings.trimStart.enabled) {
      params.trimStart = randomInRange(settings.trimStart.min, settings.trimStart.max, random);
    }
    if (settings.trimEnd.enabled) {
      params.trimEnd = randomInRange(settings.trimEnd.min, settings.trimEnd.max, random);
    }
    
    // Audio volume
    if (settings.volume.enabled) {
      params.volume = randomInRange(settings.volume.min, settings.volume.max, random);
    }
    
    parameters.push(params);
  }
  
  return parameters;
}

/**
 * Construye la cadena de filtros FFmpeg basada en parámetros
 */
export function buildFilterGraph(params: ProcessingParameters, metadata: VideoMetadata): string {
  const filters: string[] = [];
  let videoFilter = "[0:v]";
  let audioFilter = "[0:a]";
  
  // Color adjustments (básicos y funcionales)
  if (params.saturation || params.contrast || params.brightness) {
    const eqParams: string[] = [];
    if (params.saturation) eqParams.push(`saturation=${params.saturation}`);
    if (params.contrast) eqParams.push(`contrast=${params.contrast}`);
    if (params.brightness) eqParams.push(`brightness=${params.brightness}`);
    
    if (eqParams.length > 0) {
      filters.push(`${videoFilter}eq=${eqParams.join(':')}[v1]`);
      videoFilter = "[v1]";
    }
  }
  
  // Flip horizontal (funcional)
  if (params.flipHorizontal) {
    filters.push(`${videoFilter}hflip[v2]`);
    videoFilter = "[v2]";
  }
  
  // Pixel size adjustment (funcional)
  if (params.pixelSize && params.pixelSize !== "original") {
    const [width, height] = params.pixelSize.split('x').map(Number);
    filters.push(`${videoFilter}scale=${width}:${height}[v3]`);
    videoFilter = "[v3]";
  }
  
  // Audio volume (funcional)
  if (params.volume && metadata.hasAudio) {
    filters.push(`${audioFilter}volume=${params.volume}[a1]`);
    audioFilter = "[a1]";
  }
  
  // Combine filters
  let filterGraph = "";
  if (filters.length > 0) {
    filterGraph = filters.join(';');
  }
  
  return filterGraph;
}

/**
 * Analiza metadata del video usando HTMLVideoElement
 */
export async function analyzeVideoMetadata(file: File): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    
    video.addEventListener('loadedmetadata', () => {
      const metadata: VideoMetadata = {
        duration: video.duration,
        fps: 30, // Default, será detectado en el servidor
        width: video.videoWidth,
        height: video.videoHeight,
        hasAudio: false, // Will be detected on server side
        size: file.size
      };
      
      URL.revokeObjectURL(url);
      resolve(metadata);
    });
    
    video.addEventListener('error', () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to analyze video metadata'));
    });
    
    video.src = url;
  });
}

/**
 * Formatea bytes en formato legible
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Formatea duración en formato mm:ss
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Logging seguro para debugging
 */
export function safeLog(message: string, data?: any): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[VideoRepurposer] ${message}`, data || '');
  }
}

// Utilidades internas
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

function seededRandom(seed: number): () => number {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function randomInRange(min: number, max: number, random: () => number): number {
  return min + (max - min) * random();
}