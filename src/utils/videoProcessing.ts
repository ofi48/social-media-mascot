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
    if (settings.gamma.enabled) {
      params.gamma = randomInRange(settings.gamma.min, settings.gamma.max, random);
    }
    if (settings.hue.enabled) {
      params.hue = randomInRange(settings.hue.min, settings.hue.max, random);
    }
    
    // Visual effects
    if (settings.blur.enabled) {
      params.blur = randomInRange(settings.blur.min, settings.blur.max, random);
    }
    if (settings.sharpness.enabled) {
      params.sharpness = randomInRange(settings.sharpness.min, settings.sharpness.max, random);
    }
    if (settings.chromakey.enabled) {
      params.chromakey = randomInRange(settings.chromakey.min, settings.chromakey.max, random);
    }
    if (settings.stabilization.enabled) {
      params.stabilization = randomInRange(settings.stabilization.min, settings.stabilization.max, random);
    }
    if (settings.motionBlur.enabled) {
      params.motionBlur = randomInRange(settings.motionBlur.min, settings.motionBlur.max, random);
    }
    if (settings.colorTemperature.enabled) {
      params.colorTemperature = randomInRange(settings.colorTemperature.min, settings.colorTemperature.max, random);
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
    
    // Audio volume and effects
    if (settings.volume.enabled) {
      params.volume = randomInRange(settings.volume.min, settings.volume.max, random);
    }
    if (settings.audioFade.enabled) {
      params.audioFade = randomInRange(settings.audioFade.min, settings.audioFade.max, random);
    }
    if (settings.highpass.enabled) {
      params.highpass = randomInRange(settings.highpass.min, settings.highpass.max, random);
    }
    if (settings.lowpass.enabled) {
      params.lowpass = randomInRange(settings.lowpass.min, settings.lowpass.max, random);
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
  
  // Color adjustments (enhanced)
  if (params.saturation || params.contrast || params.brightness || params.gamma) {
    const eqParams: string[] = [];
    if (params.saturation) eqParams.push(`saturation=${params.saturation}`);
    if (params.contrast) eqParams.push(`contrast=${params.contrast}`);
    if (params.brightness) eqParams.push(`brightness=${params.brightness}`);
    if (params.gamma) eqParams.push(`gamma=${params.gamma}`);
    
    if (eqParams.length > 0) {
      filters.push(`${videoFilter}eq=${eqParams.join(':')}[v1]`);
      videoFilter = "[v1]";
    }
  }
  
  // Hue adjustment
  if (params.hue) {
    filters.push(`${videoFilter}hue=h=${params.hue}[v2]`);
    videoFilter = "[v2]";
  }
  
  // Visual effects
  if (params.blur) {
    filters.push(`${videoFilter}boxblur=${params.blur}:${params.blur}[v3]`);
    videoFilter = "[v3]";
  }
  
  if (params.sharpness) {
    filters.push(`${videoFilter}unsharp=5:5:${params.sharpness}:5:5:${params.sharpness}[v4]`);
    videoFilter = "[v4]";
  }
  
  if (params.chromakey) {
    filters.push(`${videoFilter}chromakey=0x00ff00:${params.chromakey}:0.1[v5]`);
    videoFilter = "[v5]";
  }
  
  if (params.stabilization) {
    filters.push(`${videoFilter}deshake=edge=mirror:blocksize=8:contrast=125:search=64[v6]`);
    videoFilter = "[v6]";
  }
  
  if (params.motionBlur) {
    filters.push(`${videoFilter}mblur=${params.motionBlur}[v7]`);
    videoFilter = "[v7]";
  }
  
  if (params.colorTemperature) {
    const r = params.colorTemperature > 5000 ? 1 : 1 + (5000 - params.colorTemperature) / 5000;
    const b = params.colorTemperature < 5000 ? 1 : 1 + (params.colorTemperature - 5000) / 3000;
    filters.push(`${videoFilter}colorbalance=rs=${r}:bs=${b}[v8]`);
    videoFilter = "[v8]";
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
  
  // Audio effects (enhanced)
  if (params.volume && metadata.hasAudio) {
    filters.push(`${audioFilter}volume=${params.volume}[a1]`);
    audioFilter = "[a1]";
  }
  
  if (params.audioFade && metadata.hasAudio) {
    filters.push(`${audioFilter}afade=in:st=0:d=${params.audioFade},afade=out:st=${metadata.duration - params.audioFade}:d=${params.audioFade}[a2]`);
    audioFilter = "[a2]";
  }
  
  if (params.highpass && metadata.hasAudio) {
    filters.push(`${audioFilter}highpass=f=${params.highpass}[a3]`);
    audioFilter = "[a3]";
  }
  
  if (params.lowpass && metadata.hasAudio) {
    filters.push(`${audioFilter}lowpass=f=${params.lowpass}[a4]`);
    audioFilter = "[a4]";
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