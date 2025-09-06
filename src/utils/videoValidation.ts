import { toast } from 'sonner';

export interface VideoValidationResult {
  isValid: boolean;
  errors: string[];
  duration?: number;
  needsPreprocessing: boolean;
}

export const validateVideoFile = async (file: File): Promise<VideoValidationResult> => {
  const errors: string[] = [];
  const maxSize = 50 * 1024 * 1024; // 50MB
  const maxDuration = 180; // 3 minutes
  const acceptedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];

  // Size validation
  if (file.size > maxSize) {
    errors.push(`File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds 50MB limit`);
  }

  // Type validation
  if (!acceptedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} not supported. Use MP4, WebM, or QuickTime`);
  }

  // Duration validation
  let duration = 0;
  try {
    duration = await getVideoDuration(file);
    if (duration > maxDuration) {
      errors.push(`Duration ${Math.round(duration)}s exceeds 3 minutes limit`);
    }
  } catch (error) {
    errors.push('Could not read video duration');
  }

  // Determine if preprocessing is needed
  const needsPreprocessing = file.size > 25 * 1024 * 1024 || duration > 90; // 25MB or 90s

  return {
    isValid: errors.length === 0,
    errors,
    duration,
    needsPreprocessing
  };
};

export const getVideoDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    
    video.onerror = () => {
      window.URL.revokeObjectURL(video.src);
      reject(new Error('Failed to load video metadata'));
    };
    
    video.src = URL.createObjectURL(file);
  });
};

export const validateAndShowErrors = async (files: File[]): Promise<File[]> => {
  const validFiles: File[] = [];
  
  for (const file of files) {
    const validation = await validateVideoFile(file);
    
    if (!validation.isValid) {
      toast.error(`❌ ${file.name}: ${validation.errors.join(', ')}`);
    } else {
      validFiles.push(file);
      
      if (validation.needsPreprocessing) {
        toast.info(`⚡ ${file.name} will be compressed before processing`);
      }
    }
  }
  
  return validFiles;
};